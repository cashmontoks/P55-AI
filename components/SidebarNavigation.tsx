
import React, { useState } from 'react';
import { AppMode, Lesson, CustomTool } from '../types';
import { Icons, LESSONS } from '../constants';
import { CustomToolManager } from './CustomToolManager';

interface SidebarNavigationProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onSend: (text: string) => void;
  customTools: CustomTool[];
  onAddTool: (tool: CustomTool) => void;
  onRemoveTool: (id: string) => void;
  onOpenAbout?: () => void;
}

type SidebarTab = 'menu' | 'academy' | 'workshop';

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  currentMode,
  onModeChange,
  onSend,
  customTools,
  onAddTool,
  onRemoveTool,
  onOpenAbout
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('menu');
  const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(true);

  const tabs: { id: SidebarTab; label: string; icon: React.FC }[] = [
    { id: 'menu', label: 'Menu', icon: Icons.Menu },
    { id: 'academy', label: 'Academy', icon: Icons.Search },
    { id: 'workshop', label: 'Workshop', icon: Icons.Code },
  ];

  const navigationLinks = [
    { label: 'Gemini Documentation', url: 'https://ai.google.dev/docs', description: 'Official API guides' },
    { label: 'Google AI Studio', url: 'https://aistudio.google.com/', description: 'Model prototyping' },
    { label: 'Billing & Quotas', url: 'https://ai.google.dev/gemini-api/docs/billing', description: 'Usage management' },
    { label: 'ML Glossary', url: 'https://developers.google.com/machine-learning/glossary', description: 'Key terms defined' },
  ];

  const quickLinks = [
    { label: 'Gemini API Reference', url: 'https://ai.google.dev/api/rest', icon: Icons.External },
    { label: 'Model Playground', url: 'https://aistudio.google.com/app/prompts/new_chat', icon: Icons.Code },
    { label: 'Pricing', url: 'https://ai.google.dev/pricing', icon: Icons.Link },
  ];

  return (
    <aside className="w-[340px] h-full bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl overflow-hidden">
      {/* Tab Header */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-5 px-2 gap-1.5 transition-all relative ${
              activeTab === tab.id
                ? 'text-indigo-400 bg-indigo-500/5'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <tab.icon />
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 animate-in fade-in slide-in-from-bottom-1" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-8">
        {activeTab === 'menu' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
            {/* Mode Switching Buttons */}
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Command Center</h2>
              <nav className="space-y-2">
                {[
                  { id: AppMode.GENERAL, icon: Icons.Robot, label: 'General Nexus' },
                  { id: AppMode.NEWS, icon: Icons.News, label: 'Global Briefing' },
                  { id: AppMode.LEARNING, icon: Icons.Search, label: 'AI/ML Academy' },
                  { id: AppMode.DEVELOPER, icon: Icons.Code, label: 'Tool Lab' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onModeChange(item.id)}
                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                      currentMode === item.id
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 border border-indigo-500/30'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <item.icon />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Navigation & Resources Links */}
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Resources</h2>
              <div className="space-y-2">
                {navigationLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 transition-all group"
                  >
                    <div className="p-2.5 bg-slate-800 rounded-xl group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                      <Icons.Link />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-300 truncate group-hover:text-white">{link.label}</p>
                      <p className="text-[10px] text-slate-500 truncate font-medium">{link.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Collapsible Quick Links Section */}
            <div>
              <button 
                onClick={() => setIsQuickLinksOpen(!isQuickLinksOpen)}
                className="w-full flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 hover:text-slate-300 transition-colors group"
              >
                <span>Quick Links</span>
                <svg 
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${isQuickLinksOpen ? 'rotate-180' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isQuickLinksOpen && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  {quickLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-800/60 transition-all group"
                    >
                      <div className="text-slate-500 group-hover:text-indigo-400 scale-75 transition-transform group-hover:scale-90">
                        <link.icon />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight">{link.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'academy' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Guided Learning</h2>
            <div className="space-y-4">
              {LESSONS.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => onSend(`Tell me about ${lesson.title}`)}
                  className="group p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold group-hover:text-indigo-400 leading-tight">{lesson.title}</h3>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-black uppercase ${
                      lesson.difficulty === 'Beginner' ? 'border-green-500/30 text-green-500 bg-green-500/5' :
                      lesson.difficulty === 'Intermediate' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5' :
                      'border-red-500/30 text-red-500 bg-red-500/5'
                    }`}>
                      {lesson.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{lesson.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {lesson.tags.map(tag => (
                      <span key={tag} className="text-[8px] px-2 py-0.5 bg-slate-950 rounded-lg text-slate-500 uppercase tracking-widest font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'workshop' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
             <CustomToolManager 
              tools={customTools} 
              onAdd={onAddTool} 
              onRemove={onRemoveTool}
              onDesignRequest={(desc) => onSend(`Use the tool designer to generate a schema for: ${desc}`)}
            />
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-800 bg-slate-900/50 space-y-4">
        <button 
          onClick={onOpenAbout}
          className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/30 rounded-lg transition-all"
        >
          About AI Nexus
        </button>
        <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
          <p className="text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest">System Architecture</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-[15%] animate-pulse" />
          </div>
          <p className="text-[9px] text-slate-500 mt-2 font-bold italic">Connection Stable: 1.2ms latency</p>
        </div>
      </div>
    </aside>
  );
};
