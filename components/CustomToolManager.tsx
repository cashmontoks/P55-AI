
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CustomTool } from '../types';
import { Icons } from '../constants';

interface CustomToolManagerProps {
  tools: CustomTool[];
  onAdd: (tool: CustomTool) => void;
  onRemove: (id: string) => void;
  onDesignRequest: (description: string) => void;
}

interface ValidationResult {
  message: string;
  isError: boolean;
  line?: number;
  path?: string;
  suggestion?: string;
}

export const CustomToolManager: React.FC<CustomToolManagerProps> = ({ 
  tools, 
  onAdd, 
  onRemove,
  onDesignRequest 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [designInput, setDesignInput] = useState('');
  const [quickParamDesc, setQuickParamDesc] = useState('');
  const [validationStatus, setValidationStatus] = useState<ValidationResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const DEFAULT_PARAMS = '{\n  "type": "OBJECT",\n  "properties": {\n    "query": {\n      "type": "STRING",\n      "description": "The search term or topic to explore"\n    }\n  },\n  "required": ["query"]\n}';

  const [form, setForm] = useState({
    name: '',
    description: '',
    parameters: DEFAULT_PARAMS
  });

  const inferTypeFromDescription = (desc: string): string => {
    const d = desc.toLowerCase();
    const map: Record<string, string[]> = {
      BOOLEAN: ['is', 'has', 'should', 'enabled', 'active', 'valid', 'check', 'toggle', 'flag', 'status', 'allow', 'can'],
      NUMBER: ['amount', 'count', 'price', 'age', 'index', 'score', 'value', 'quantity', 'rating', 'limit', 'offset', 'size', 'height', 'width', 'total', 'num'],
      ARRAY: ['list', 'items', 'collection', 'tags', 'ids', 'set', 'results', 'array', 'multiple', 'group'],
    };

    for (const [type, keywords] of Object.entries(map)) {
      if (keywords.some(k => d.includes(k))) return type;
    }
    return 'STRING';
  };

  const findLineForPath = (json: string, path: string): number => {
    if (path === 'root') return 1;
    const parts = path.split('.');
    // Get the most specific property name
    const targetKey = parts[parts.length - 1];
    const lines = json.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`"${targetKey}"`)) return i + 1;
    }
    return 1;
  };

  const validateSchema = (schema: any, path: string = 'root'): { message: string; path: string; suggestion?: string } | null => {
    if (!schema || typeof schema !== 'object') return { message: "Must be a valid JSON object", path };
    
    const validTypes = ['STRING', 'NUMBER', 'INTEGER', 'BOOLEAN', 'ARRAY', 'OBJECT', 'NULL'];
    if (!schema.type) return { 
      message: "Missing 'type' field", 
      path, 
      suggestion: "Every schema part needs a type (e.g., 'STRING', 'OBJECT')" 
    };
    
    if (!validTypes.includes(schema.type)) return { 
      message: `Invalid type '${schema.type}'`, 
      path, 
      suggestion: `Supported types: ${validTypes.join(', ')}` 
    };

    if (path !== 'root' && (!schema.description || schema.description.trim().length < 5)) {
      return { 
        message: "Property description too short or missing", 
        path, 
        suggestion: "Gemini needs clear descriptions to know when and how to use this parameter." 
      };
    }

    if (schema.type === 'OBJECT') {
      if (!schema.properties || typeof schema.properties !== 'object' || Object.keys(schema.properties).length === 0) {
        return { 
          message: "'OBJECT' must contain 'properties'", 
          path, 
          suggestion: "Define at least one property inside the 'properties' map." 
        };
      }
      for (const [key, value] of Object.entries(schema.properties)) {
        const error = validateSchema(value, `${path}.${key}`);
        if (error) return error;
      }
    }

    if (schema.type === 'ARRAY') {
      if (!schema.items) return { 
        message: "'ARRAY' type must have 'items'", 
        path, 
        suggestion: "Specify the type of items inside the array using an 'items' object." 
      };
      const error = validateSchema(schema.items, `${path}.items`);
      if (error) return error;
    }

    return null;
  };

  useEffect(() => {
    if (!form.parameters.trim()) {
      setValidationStatus({ message: 'Parameters cannot be empty', isError: true, line: 1 });
      return;
    }

    try {
      const parsed = JSON.parse(form.parameters);
      const schemaError = validateSchema(parsed);
      
      if (schemaError) {
        const line = findLineForPath(form.parameters, schemaError.path);
        setValidationStatus({ 
          message: `${schemaError.message} at ${schemaError.path}`, 
          isError: true, 
          line,
          path: schemaError.path,
          suggestion: schemaError.suggestion
        });
      } else {
        setValidationStatus({ message: 'Schema structure is valid and Gemini-compatible', isError: false });
      }
    } catch (e: any) {
      // Try to extract line info from standard JSON.parse error message
      const lineMatch = e.message.match(/line (\d+)/i) || e.message.match(/position (\d+)/i);
      let line = 1;
      if (lineMatch) {
        if (e.message.includes('position')) {
          const pos = parseInt(lineMatch[1]);
          line = form.parameters.substring(0, pos).split('\n').length;
        } else {
          line = parseInt(lineMatch[1]);
        }
      }
      setValidationStatus({ 
        message: `Syntax Error: ${e.message}`, 
        isError: true, 
        line,
        suggestion: "Check for missing commas, mismatched braces, or unquoted keys."
      });
    }
  }, [form.parameters]);

  const suggestedType = useMemo(() => {
    if (!quickParamDesc.trim()) return null;
    return inferTypeFromDescription(quickParamDesc);
  }, [quickParamDesc]);

  const addQuickParam = () => {
    if (!quickParamDesc.trim()) return;
    const type = suggestedType || 'STRING';
    const key = quickParamDesc.toLowerCase().replace(/\s+/g, '_').slice(0, 20);
    injectSpecificParam(key, type, quickParamDesc);
    setQuickParamDesc('');
  };

  const injectSpecificParam = (key: string, type: string, description: string) => {
    try {
      const current = JSON.parse(form.parameters);
      if (!current.properties) current.properties = {};
      
      let newProp: any = { type, description };
      if (type === 'ARRAY') {
        newProp.items = { type: 'STRING', description: 'Item definition' };
      } else if (type === 'OBJECT') {
        newProp.properties = { sub_param: { type: 'STRING', description: 'Sub-parameter' } };
      }
      
      current.properties[key] = newProp;
      setForm({ ...form, parameters: JSON.stringify(current, null, 2) });
    } catch (e) {
      setValidationStatus({ message: "Fix current JSON syntax before adding parameters", isError: true });
    }
  };

  const handleSave = () => {
    if (validationStatus?.isError) return;

    onAdd({
      id: Date.now().toString(),
      name: form.name.trim() || 'unnamed_tool',
      description: form.description.trim() || 'No description provided',
      parameters: JSON.parse(form.parameters)
    });
    setIsAdding(false);
    setForm({ name: '', description: '', parameters: DEFAULT_PARAMS });
    setDesignInput('');
  };

  const prettify = () => {
    try {
      const obj = JSON.parse(form.parameters);
      setForm({ ...form, parameters: JSON.stringify(obj, null, 2) });
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-indigo-400">
          <Icons.Code /> Custom Workshop
        </h3>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if (!isAdding) setForm({ ...form, parameters: DEFAULT_PARAMS });
          }}
          className={`text-[10px] px-2 py-1 rounded-md transition-all uppercase font-bold border ${
            isAdding 
              ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white' 
              : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
          }`}
        >
          {isAdding ? 'Cancel' : 'New Tool'}
        </button>
      </div>

      {isAdding ? (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4 animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 flex justify-between">
              <span>Smart Tool Design</span>
              <span className="text-indigo-400/50">NEXUS AI</span>
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Briefly describe tool (e.g. 'Calculate BMI')"
                value={designInput}
                onChange={(e) => setDesignInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700 font-medium"
              />
              <button 
                onClick={() => onDesignRequest(designInput)}
                disabled={!designInput.trim()}
                className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 text-indigo-400 disabled:opacity-30 disabled:grayscale transition-all active:scale-90"
              >
                <Icons.Robot />
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-500">Identifier</label>
                <input 
                  placeholder="e.g. mortgage_calc" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value.replace(/\s/g, '_')})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-indigo-300 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-500">System State</label>
                <div className="h-9 flex items-center px-3 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-indigo-500/80 font-black uppercase tracking-widest">
                  Alpha Phase
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-500">Model Prompting Description</label>
              <textarea 
                placeholder="Explain to the AI when to use this tool..." 
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs min-h-[60px] outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
              />
            </div>

            <div className="space-y-3 p-3 bg-slate-950 rounded-xl border border-slate-800/50">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase font-bold text-slate-500">Quick Parameter (Inference Engine)</label>
                {suggestedType && (
                  <span className="text-[8px] font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 animate-in fade-in slide-in-from-right-1">
                    SUGGESTED: {suggestedType}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. 'Enter the user age'"
                  value={quickParamDesc}
                  onChange={(e) => setQuickParamDesc(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700"
                />
                <button 
                  onClick={addQuickParam}
                  disabled={!quickParamDesc.trim()}
                  className="px-3 bg-indigo-600 rounded-lg text-[10px] font-bold hover:bg-indigo-500 disabled:opacity-30 transition-all active:scale-90"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase font-bold text-slate-500">Schema JSON (OpenAPI 3.0)</label>
                <div className="flex gap-2">
                   <button onClick={prettify} className="text-[8px] px-2 py-1 bg-slate-800 rounded text-slate-400 hover:text-white uppercase font-black transition-colors">Format</button>
                </div>
              </div>

              <div className="relative">
                {/* Error Line Highlight */}
                {validationStatus?.isError && validationStatus.line && (
                  <div 
                    className="absolute left-0 w-full bg-red-500/10 border-l-2 border-red-500 pointer-events-none"
                    style={{ 
                      top: `${(validationStatus.line - 1) * 1.5}rem`, // Approximate line height
                      height: '1.5rem',
                      marginTop: '0.625rem' 
                    }}
                  />
                )}
                
                <textarea 
                  ref={textareaRef}
                  value={form.parameters}
                  onChange={e => setForm({...form, parameters: e.target.value})}
                  className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-[10px] font-mono min-h-[180px] outline-none transition-all leading-6 ${
                    validationStatus?.isError 
                      ? 'border-red-500/30 text-slate-300 focus:border-red-500/50' 
                      : 'border-slate-800 text-cyan-400/90 focus:border-indigo-500/50'
                  }`}
                  spellCheck={false}
                />
              </div>

              {validationStatus && (
                <div className={`p-3 rounded-xl border animate-in slide-in-from-top-1 duration-300 ${
                  validationStatus.isError 
                    ? 'bg-red-500/5 border-red-500/20 text-red-200' 
                    : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${validationStatus.isError ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {validationStatus.isError ? `Validation Error (Line ${validationStatus.line})` : 'Status: Ready'}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed mb-2">{validationStatus.message}</p>
                  {validationStatus.suggestion && (
                    <div className="pt-2 border-t border-white/5 flex gap-2">
                       <span className="text-[9px] font-black text-indigo-400 uppercase">Pro Tip:</span>
                       <p className="text-[9px] text-slate-400 font-bold italic">{validationStatus.suggestion}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button 
              onClick={handleSave}
              disabled={validationStatus?.isError}
              className="w-full py-3 bg-indigo-600 rounded-xl font-black text-[11px] uppercase tracking-[0.1em] hover:bg-indigo-500 disabled:opacity-40 disabled:bg-slate-800 shadow-xl shadow-indigo-600/10 active:scale-[0.98] transition-all"
            >
              Authorize Tool Logic
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 scrollbar-hide">
          {tools.length === 0 ? (
            <div className="p-10 border border-slate-800 border-dashed rounded-2xl text-center bg-slate-900/20">
              <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                <Icons.Code />
              </div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Logic Hub Empty</p>
              <p className="text-[9px] text-slate-600 mt-2 leading-relaxed">Design custom schemas to give Nexus specialized powers.</p>
            </div>
          ) : (
            tools.map(tool => (
              <div key={tool.id} className="group p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl hover:border-indigo-500/40 transition-all shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20" />
                <div className="flex justify-between items-start mb-2 pl-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse" />
                    <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-tighter">{tool.name}</span>
                  </div>
                  <button 
                    onClick={() => onRemove(tool.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition-all hover:bg-red-400/10 rounded-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed px-2 mb-3 font-medium">{tool.description}</p>
                <div className="px-2 flex flex-wrap gap-1.5">
                  {Object.keys(tool.parameters?.properties || {}).map(p => (
                    <span key={p} className="text-[8px] font-mono px-2 py-0.5 bg-slate-800/80 border border-slate-700/50 rounded text-slate-400 group-hover:border-indigo-500/20 transition-colors uppercase tracking-widest">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
