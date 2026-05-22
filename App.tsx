
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { SidebarNavigation } from './components/SidebarNavigation';
import { AboutPage } from './components/AboutPage';
import { ChatMessage, MessageRole, AppMode, CustomTool } from './types';
import { GeminiService } from './services/geminiService';
import { Icons } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.GENERAL);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [userIcon, setUserIcon] = useState<string | undefined>(() => {
    return localStorage.getItem('nexus_user_icon') || undefined;
  });
  
  const [customTools, setCustomTools] = useState<CustomTool[]>(() => {
    const saved = localStorage.getItem('nexus_custom_tools');
    return saved ? JSON.parse(saved) : [];
  });
  
  const gemini = useMemo(() => new GeminiService(), []);

  useEffect(() => {
    localStorage.setItem('nexus_custom_tools', JSON.stringify(customTools));
  }, [customTools]);

  useEffect(() => {
    if (userIcon) {
      localStorage.setItem('nexus_user_icon', userIcon);
    }
  }, [userIcon]);

  const handleSend = useCallback(async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text,
      timestamp: Date.now(),
      userIcon: userIcon
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await gemini.sendMessage(text, history, mode, customTools);
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: response.text || "I'm sorry, I couldn't process that.",
        timestamp: Date.now(),
        functionCalls: response.functionCalls,
        toolResponses: response.toolResponses,
        groundingLinks: response.groundingLinks,
        thinking: response.thinking
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: 'error',
        role: MessageRole.MODEL,
        text: "Error: I encountered a problem connecting to the brain center.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, mode, gemini, customTools, userIcon]);

  const handleRefreshNews = useCallback((category?: string) => {
    const topic = category ? `${category} news` : "global news stories across technology, world politics, and science";
    handleSend(`Perform a deep real-time scan of ${topic}. Provide a fresh briefing on the most important stories from the last 24 hours.`);
  }, [handleSend]);

  const changeMode = (newMode: AppMode) => {
    setMode(newMode);
    setIsSidebarOpen(false);
    setIsAboutOpen(false);
    const systemMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      role: MessageRole.MODEL,
      text: `Switching to ${newMode.toUpperCase()} mode. How can I help you in this context?`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, systemMsg]);
  };

  const addCustomTool = (tool: CustomTool) => {
    setCustomTools(prev => [...prev, tool]);
  };

  const removeCustomTool = (id: string) => {
    setCustomTools(prev => prev.filter(t => t.id !== id));
  };

  const onUserIconChange = (newIcon: string) => {
    setUserIcon(newIcon);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative z-10 h-full animate-in slide-in-from-left duration-300">
            <SidebarNavigation 
              currentMode={mode}
              onModeChange={changeMode}
              onSend={(text) => {
                handleSend(text);
                setIsSidebarOpen(false);
              }}
              customTools={customTools}
              onAddTool={addCustomTool}
              onRemoveTool={removeCustomTool}
              onOpenAbout={() => { setIsAboutOpen(true); setIsSidebarOpen(false); }}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar - Always Visible */}
      <div className="hidden lg:flex shrink-0">
        <SidebarNavigation 
          currentMode={mode}
          onModeChange={changeMode}
          onSend={handleSend}
          customTools={customTools}
          onAddTool={addCustomTool}
          onRemoveTool={removeCustomTool}
          onOpenAbout={() => setIsAboutOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full relative">
          {isAboutOpen ? (
            <AboutPage onClose={() => setIsAboutOpen(false)} />
          ) : (
            <ChatInterface 
              messages={messages} 
              onSend={handleSend} 
              isLoading={isLoading} 
              mode={mode} 
              onRefresh={mode === AppMode.NEWS ? handleRefreshNews : undefined}
              onMenuToggle={() => setIsSidebarOpen(true)}
              onUserIconChange={onUserIconChange}
              userIcon={userIcon}
            />
          )}
        </div>
      </main>

      {/* Developer Panel - Only shown in DEV mode and large screens */}
      {mode === AppMode.DEVELOPER && !isAboutOpen && (
        <aside className="w-80 border-l border-slate-800 bg-slate-950/50 backdrop-blur-md p-6 overflow-y-auto hidden 2xl:block animate-in slide-in-from-right duration-500">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Execution Log</h2>
          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-indigo-400">
                <Icons.Code /> Live Environment
              </h3>
              <div className="space-y-2">
                {['get_random_joke', 'get_weather', 'get_learning_resource', 'analyze_code_structure'].map(t => (
                  <div key={t} className="flex items-center gap-2 px-2 py-1 bg-slate-900/50 rounded font-mono text-[9px] text-slate-400 border border-slate-800/50">
                    <div className="w-1 h-1 bg-green-500/50 rounded-full" />
                    {t}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </aside>
      )}
    </div>
  );
};

export default App;
