
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageRole, AppMode } from '../types';
import { Icons } from '../constants';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isLoading: boolean;
  mode: AppMode;
  onRefresh?: (category?: string) => void;
  onMenuToggle?: () => void;
  onUserIconChange?: (icon: string) => void;
  userIcon?: string;
}

const NEWS_CATEGORIES = [
  { id: 'world', label: 'Global', icon: '🌍' },
  { id: 'technology', label: 'Tech', icon: '💻' },
  { id: 'science', label: 'Science', icon: '🧪' },
  { id: 'business', label: 'Business', icon: '📈' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'health', label: 'Health', icon: '❤️' },
  { id: 'entertainment', label: 'Culture', icon: '🎬' },
];

const ASPECT_RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9'];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSend, 
  isLoading, 
  mode, 
  onRefresh,
  onMenuToggle,
  onUserIconChange,
  userIcon
}) => {
  const [input, setInput] = useState('');
  const [activeNewsTab, setActiveNewsTab] = useState('world');
  const [expandedResponses, setExpandedResponses] = useState<Record<string, boolean>>({});
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleImageSynthesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (imagePrompt.trim() && !isLoading) {
      const fullPrompt = `Generate a high-quality image of: ${imagePrompt}. Use the aspect ratio ${selectedRatio}.`;
      onSend(fullPrompt);
      setImagePrompt('');
      setIsImageModalOpen(false);
    }
  };

  const toggleResponse = (id: string) => {
    setExpandedResponses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNewsTabClick = (category: string) => {
    setActiveNewsTab(category);
    if (onRefresh) onRefresh(category);
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUserIconChange) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUserIconChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getModeColor = (m: AppMode) => {
    switch (m) {
      case AppMode.NEWS: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case AppMode.LEARNING: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case AppMode.DEVELOPER: return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
    }
  };

  const getLoadingText = (m: AppMode) => {
    switch (m) {
      case AppMode.NEWS: return 'Syncing global feeds...';
      case AppMode.LEARNING: return 'Accessing knowledge graph...';
      case AppMode.DEVELOPER: return 'Tracing logical circuits...';
      case AppMode.GENERAL:
        return 'Bridging neural pathways...';
      default: return 'Nexus is contemplating...';
    }
  };

  const renderComplexityIndicator = (report: any) => {
    const rating = report.complexity_rating;
    let color = 'bg-slate-700';
    let glow = '';
    let width = 'w-0';
    let textColor = 'text-slate-400';
    let label = 'Unknown';
    let icon = '⚪';

    if (rating === 'Low') {
      color = 'bg-emerald-500';
      width = 'w-1/3';
      textColor = 'text-emerald-400';
      label = 'Optimized';
      icon = '✅';
    } else if (rating === 'Medium') {
      color = 'bg-amber-500';
      width = 'w-2/3';
      textColor = 'text-amber-400';
      label = 'Moderate';
      icon = '⚠️';
    } else if (rating === 'High') {
      color = 'bg-rose-600';
      glow = 'shadow-[0_0_15px_rgba(225,29,72,0.6)]';
      width = 'w-full';
      textColor = 'text-rose-400';
      label = 'High Complexity';
      icon = '🔥';
    }

    return (
      <div className="mt-4 p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 shadow-xl ring-1 ring-white/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Icons.Code />
        </div>
        
        <div className="flex justify-between items-end mb-3">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Structural Integrity</span>
            <div className="flex items-center gap-2">
              <span className="text-base">{icon}</span>
              <span className={`text-sm font-black uppercase tracking-tight ${textColor}`}>{label}</span>
            </div>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{report.detected_language} • {report.line_count} Lines</span>
          </div>
        </div>

        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden mb-4 border border-white/5">
          <div className={`h-full ${color} ${width} ${glow} transition-all duration-1000 ease-out relative`}>
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {report.features && Object.entries(report.features).map(([feature, enabled]) => (
            <div 
              key={feature} 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-all ${
                enabled 
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-600 opacity-50'
              }`}
            >
              <div className={`w-1 h-1 rounded-full ${enabled ? 'bg-indigo-400 shadow-[0_0_5px_rgba(129,140,248,0.8)]' : 'bg-slate-700'}`} />
              {feature.replace('_', ' ')}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-x border-slate-800 shadow-2xl overflow-hidden relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleIconUpload} 
        className="hidden" 
        accept="image/*"
      />

      {/* Image Synthesis Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsImageModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 ring-1 ring-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                <Icons.Sparkles />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Visual Synthesis</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Image Generation</p>
              </div>
            </div>

            <form onSubmit={handleImageSynthesis} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Describe the Vision</label>
                <textarea 
                  autoFocus
                  placeholder="A cinematic drone shot of a futuristic neon city in the clouds, cyberpunk style..."
                  value={imagePrompt}
                  onChange={e => setImagePrompt(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-slate-800 focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-sm font-medium outline-none transition-all min-h-[120px] resize-none text-white"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Aspect Ratio</label>
                <div className="flex flex-wrap gap-2">
                  {ASPECT_RATIOS.map(ratio => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setSelectedRatio(ratio)}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                        selectedRatio === ratio 
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!imagePrompt.trim()}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
                >
                  Synthesize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0">
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={onMenuToggle}
              className="lg:hidden p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
              title="Open Navigation"
            >
              <Icons.Menu />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                <Icons.Robot />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight text-white leading-none">AI Nexus</h1>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${getModeColor(mode).split(' ')[0]}`}>
                  {mode}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
               <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{isLoading ? 'Busy' : 'Online'}</span>
             </div>
          </div>
        </div>

        {/* Mode Specific Toolbar */}
        {mode === AppMode.NEWS && (
          <div className="px-4 py-3 overflow-x-auto scrollbar-hide bg-slate-950/20">
            <div className="flex gap-3 min-w-max pb-1">
              {NEWS_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleNewsTabClick(cat.id)}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all relative overflow-hidden group border-2 ${
                    activeNewsTab === cat.id
                      ? 'bg-amber-400/5 border-amber-400/40 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)] ring-1 ring-amber-400/20'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`text-sm transition-transform duration-300 ${activeNewsTab === cat.id ? 'scale-125' : 'group-hover:scale-110'}`}>{cat.icon}</span>
                  <span className="uppercase tracking-[0.15em]">{cat.label}</span>
                  {activeNewsTab === cat.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-in slide-in-from-bottom-1 duration-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-6 text-center px-8">
            <div className="p-8 bg-slate-900/50 rounded-[2rem] border border-slate-800/50 animate-pulse shadow-2xl relative">
               <Icons.Robot />
               <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] -z-10 rounded-full" />
            </div>
            <div className="max-w-md">
              <p className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Nexus Initialized</p>
              <p className="text-[10px] leading-relaxed text-slate-500 font-bold uppercase tracking-[0.3em] opacity-60">
                Awaiting input on <span className="text-indigo-400">{mode}</span> frequencies
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-end gap-3 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            {/* Message Avatar */}
            <div className="flex-shrink-0 mb-1">
              {msg.role === MessageRole.USER ? (
                msg.userIcon || userIcon ? (
                  <img src={msg.userIcon || userIcon} className="w-8 h-8 rounded-full border border-indigo-500/50 shadow-lg object-cover" alt="User" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black border border-indigo-400 shadow-lg text-white">U</div>
                )
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 border border-slate-700 shadow-lg scale-90">
                  <Icons.Robot />
                </div>
              )}
            </div>

            <div className={`max-w-[85%] rounded-[1.75rem] p-5 shadow-2xl border transition-all ${
              msg.role === MessageRole.USER 
                ? 'bg-indigo-600 text-white border-indigo-500 rounded-br-none' 
                : 'bg-slate-800/80 backdrop-blur-md text-slate-100 border-slate-700/50 rounded-bl-none'
            }`}>
              {/* Thinking / Reasoning Layer */}
              {msg.thinking && (
                <div className="mb-4 p-4 bg-black/50 rounded-2xl border border-slate-700/50 text-[11px] text-slate-300 font-mono overflow-hidden shadow-inner ring-1 ring-white/5">
                  <div className="flex items-center gap-2 mb-3 text-indigo-400 border-b border-slate-800/80 pb-2">
                    <Icons.Terminal />
                    <span className="uppercase tracking-tighter font-black text-[10px]">Cognitive Trace</span>
                  </div>
                  <div className="opacity-80 italic leading-relaxed">
                    {msg.thinking}
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className="whitespace-pre-wrap text-[15px] leading-relaxed mb-1 font-medium tracking-tight">
                {msg.text}
              </div>

              {/* Tool Execution Logs */}
              {(msg.functionCalls && msg.functionCalls.length > 0) && (
                <div className="mt-5 pt-4 border-t border-slate-700/50 space-y-3">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Tooling</p>
                  {msg.functionCalls.map((fc, i) => {
                    const callId = `${msg.id}-${fc.id || i}`;
                    const response = msg.toolResponses?.find(tr => tr.name === fc.name || tr.id === fc.id)?.response;
                    const report = response?.analysis_report;
                    const imageUrl = response?.image_url;
                    const isExpanded = expandedResponses[callId];

                    return (
                      <div key={i} className="space-y-3">
                        <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-cyan-400 bg-cyan-950/30 p-3 rounded-2xl border border-cyan-500/20">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                            <span className="font-bold">{fc.name}</span>
                          </div>
                          {response && (
                            <button 
                              onClick={() => toggleResponse(callId)}
                              className="text-[9px] px-2 py-0.5 bg-cyan-900/50 hover:bg-cyan-800/50 rounded-lg transition-colors border border-cyan-500/20 uppercase font-black tracking-widest"
                            >
                              {isExpanded ? 'Collapse' : 'Inspect'}
                            </button>
                          )}
                        </div>

                        {imageUrl && (
                          <div className="mt-4 p-2 bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-700 overflow-hidden group">
                             <img 
                                src={imageUrl} 
                                alt="Nexus Synthesis" 
                                className="w-full h-auto rounded-2xl shadow-lg hover:scale-[1.01] transition-transform duration-500 cursor-zoom-in"
                                onClick={() => window.open(imageUrl)}
                             />
                             <div className="mt-2 px-3 flex justify-between items-center opacity-50">
                                <span className="text-[8px] font-bold uppercase tracking-widest">Neural Asset v3.1</span>
                                <Icons.Sparkles />
                             </div>
                          </div>
                        )}

                        {isExpanded && response && (
                          <div className="animate-in slide-in-from-top-2 duration-300">
                             <div className="bg-black/40 border border-cyan-900/30 rounded-2xl p-4 font-mono text-[10px] text-cyan-200/80 overflow-x-auto">
                               {JSON.stringify(
                                 {...response, image_url: imageUrl ? "[BINARY_STREAM]" : response.image_url}, 
                                 null, 2
                               )}
                             </div>
                          </div>
                        )}

                        {fc.name === 'analyze_code_structure' && report && (
                          <div className="animate-in fade-in duration-500">
                             {renderComplexityIndicator(report)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Grounding & Sources citations */}
              {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Icons.Search />
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Verified Intelligence</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.groundingLinks.map((link, i) => (
                      <a 
                        key={i}
                        href={link.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-900/90 border border-slate-700/50 hover:border-indigo-500/50 rounded-xl group transition-all"
                      >
                        <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-500/10 transition-colors">
                          <Icons.External />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[11px] font-black text-indigo-300 uppercase truncate tracking-tight">{link.title}</p>
                           <p className="text-[8px] text-slate-500 truncate font-mono">{new URL(link.uri).hostname}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-500">
            <div className="bg-slate-800/90 backdrop-blur-2xl border border-slate-700/50 rounded-[1.75rem] rounded-tl-none p-5 flex gap-4 items-center shadow-2xl ring-1 ring-white/5">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
                  {getLoadingText(mode)}
                </span>
                <span className="text-[7px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                  Neural Bridge Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Terminal */}
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900/95 border-t border-slate-800 backdrop-blur-3xl z-20">
        <div className="relative group max-w-4xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? "Neural synthesis in progress..." : `Terminal Command [${mode}]...`}
              disabled={isLoading}
              className="w-full bg-slate-950 border-2 border-slate-800 focus:border-indigo-500/50 rounded-2xl px-6 py-5 pr-20 text-[15px] transition-all outline-none disabled:opacity-50 shadow-2xl font-bold placeholder:text-slate-800 text-white"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 items-center">
               <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors rounded-lg hover:bg-indigo-500/10"
                  title="Synthesize Image"
                >
                  <Icons.Sparkles />
                </button>
               <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-600 hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-800"
                  title="Upload User Signature"
                >
                  <Icons.Image />
                </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-2xl transition-all shadow-xl shadow-indigo-600/30 active:scale-95 flex items-center justify-center min-w-[64px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </form>
    </div>
  );
};
