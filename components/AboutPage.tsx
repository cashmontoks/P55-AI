
import React from 'react';
import { Icons } from '../constants';

interface AboutPageProps {
  onClose: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onClose }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 border-x border-slate-800 animate-in fade-in zoom-in-95 duration-500 relative scrollbar-hide">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-500/10 to-transparent blur-[120px] -z-10" />

      {/* Header */}
      <div className="sticky top-0 z-20 p-6 flex justify-between items-center backdrop-blur-md border-b border-slate-800/50 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
            <Icons.Robot />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white">Project: AI NEXUS</h1>
        </div>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-slate-700"
        >
          Back to Terminal
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-8 space-y-16 pb-24">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            The Future of <span className="text-indigo-500">Intelligent</span> Interaction.
          </h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            AI Nexus is a sophisticated multi-turn AI companion designed to bridge the gap between human curiosity and complex machine intelligence.
          </p>
        </section>

        {/* Features Grid */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-800" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Core Capabilities</h3>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { 
                title: 'Global Briefing', 
                desc: 'Real-time multi-source data synthesis for up-to-the-minute news coverage.', 
                icon: <Icons.News />,
                color: 'amber' 
              },
              { 
                title: 'AI/ML Academy', 
                desc: 'Structured interactive learning modules for mastering generative AI concepts.', 
                icon: <Icons.Search />,
                color: 'emerald' 
              },
              { 
                title: 'Logic Workshop', 
                desc: 'User-defined function calling interface to create custom logic pipelines.', 
                icon: <Icons.Code />,
                color: 'purple' 
              },
              { 
                title: 'Code Synthesis', 
                desc: 'Structural code analysis with complexity metrics and modular breakdown.', 
                icon: <Icons.Terminal />,
                color: 'cyan' 
              }
            ].map((f, i) => (
              <div key={i} className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-3xl hover:border-indigo-500/30 transition-all group">
                <div className={`w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{f.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Deep Dive */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-800" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Technical Architecture</h3>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
          
          <div className="space-y-10">
            <div className="space-y-4">
              <h4 className="text-xl font-black text-white flex items-center gap-3">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                Google Gemini Infrastructure
              </h4>
              <p className="text-slate-400 leading-relaxed font-medium">
                AI Nexus leverages the Gemini 2.5 and 3 series models. <strong>Gemini 3 Flash</strong> provides near-instantaneous low-latency responses for general queries and news briefings, while <strong>Gemini 3 Pro</strong> powers our advanced reasoning tasks in the Learning and Developer modes.
              </p>
            </div>

            <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-3xl space-y-6">
              <h4 className="text-xl font-black text-indigo-400">Understanding Function Calling</h4>
              <p className="text-slate-300 leading-relaxed font-medium">
                The most powerful feature of AI Nexus is <strong>Gemini's Function Calling</strong>. Unlike standard chatbots that only process text, function calling allows the AI to:
              </p>
              <ul className="grid gap-4">
                {[
                  'Dynamically generate structured parameters for API calls.',
                  'Interact with real-world tools like weather systems or custom code execution.',
                  'Bridge the gap between model reasoning and reliable external computations.',
                  'Maintain strict type safety using OpenAPI 3.0 schema definitions.'
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-400 font-medium italic">
                    <span className="text-indigo-500">●</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-4 flex justify-center">
                <div className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20">
                  State-of-the-Art Agency
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-16 border-t border-slate-800 space-y-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">
            AI Nexus • Flash-Lite v3.14159
          </p>
          <div className="flex justify-center gap-4">
            <div className="w-2 h-2 rounded-full bg-slate-800" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <div className="w-2 h-2 rounded-full bg-slate-800" />
          </div>
        </footer>
      </div>
    </div>
  );
};
