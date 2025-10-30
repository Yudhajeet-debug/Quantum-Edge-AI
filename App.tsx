import React, { useState, useEffect, useCallback } from 'react';
import InvestmentAssistant from './components/InvestmentAssistant';
import RefreshmentCorner from './components/RefreshmentCorner';
import OnboardingModal from './components/OnboardingModal';
import { Bot, Coffee, BarChart2 } from 'lucide-react';
import { ChatMessage } from './types';

type ActiveTab = 'invest' | 'refresh';
type User = { name: string; gender: string };

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('invest');
  const [user, setUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Lifted state for persistent chat histories
  const [investmentChatHistory, setInvestmentChatHistory] = useState<ChatMessage[]>([]);
  const [escapeSuggesterChatHistory, setEscapeSuggesterChatHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('quantum_edge_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      setShowOnboarding(true);
    }
  }, []);

  // Effect to initialize chat histories when user is available
  useEffect(() => {
    if (user) {
      const userName = user.name ? `, ${user.name}` : '';
      if (investmentChatHistory.length === 0) {
        setInvestmentChatHistory([
          {
            role: 'model',
            text: `Hello${userName}! I'm your AI Investment Assistant, powered by advanced AI.\n\nHow can I help you with your financial questions today? Please remember, I'm an **AI** and **not** a certified financial advisor.`,
          },
        ]);
      }
      if (escapeSuggesterChatHistory.length === 0) {
         setEscapeSuggesterChatHistory([
          {
            role: 'model',
            text: `Hello${userName}! I'm your Escape Suggester! ✈️\n\nWhere are you dreaming of going? I can find nearby places or destinations around the world.`,
          },
        ]);
      }
    }
  }, [user]);

  const handleOnboardingComplete = (name: string, gender: string) => {
    const newUser = { name, gender };
    localStorage.setItem('quantum_edge_user', JSON.stringify(newUser));
    setUser(newUser);
    setShowOnboarding(false);
  };

  const handleResetInvestmentChat = useCallback(() => {
    if (user) {
        const userName = user.name ? `, ${user.name}` : '';
        setInvestmentChatHistory([
            {
                role: 'model',
                text: `Hello${userName}! I'm your AI Investment Assistant, powered by advanced AI.\n\nHow can I help you with your financial questions today? Please remember, I'm an **AI** and **not** a certified financial advisor.`,
            },
        ]);
    }
  }, [user]);

  const handleResetEscapeSuggesterChat = useCallback(() => {
    if (user) {
      const userName = user.name ? `, ${user.name}` : '';
      setEscapeSuggesterChatHistory([
        {
          role: 'model',
          text: `Hello${userName}! I'm your Escape Suggester! ✈️\n\nWhere are you dreaming of going? I can find nearby places or destinations around the world.`
        },
      ]);
    }
  }, [user]);

  const navButtonClasses = (tabName: ActiveTab) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
      activeTab === tabName
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
    }`;
    
  return (
    <>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      <div className={`min-h-screen bg-slate-950 text-slate-200 font-sans transition-filter duration-500 ${showOnboarding ? 'blur-lg brightness-50' : ''}`}>
        <div className="container mx-auto p-4 max-w-7xl">
          <header className="flex flex-col sm:flex-row justify-between items-center py-4">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
               <div className="p-2 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-lg">
                  <BarChart2 size={24} className="text-white"/>
               </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                Quantum Edge AI
              </h1>
               <span className="text-xl text-slate-400 font-light hidden md:inline-block">
                / {activeTab === 'invest' ? 'Investment Assistant' : 'Refreshment Corner'}
              </span>
            </div>
            <nav className="flex gap-2 p-1 bg-slate-800 rounded-xl shadow-inner">
              <button onClick={() => setActiveTab('invest')} className={navButtonClasses('invest')}>
                <Bot size={20} />
                <span className="hidden sm:inline">Investment</span>
              </button>
              <button onClick={() => setActiveTab('refresh')} className={navButtonClasses('refresh')}>
                <Coffee size={20} />
                <span className="hidden sm:inline">Refreshments</span>
              </button>
            </nav>
          </header>

          <main className="mt-6">
            {activeTab === 'invest' && user && (
                <InvestmentAssistant 
                    user={user}
                    chatHistory={investmentChatHistory}
                    setChatHistory={setInvestmentChatHistory}
                    onReset={handleResetInvestmentChat}
                />
            )}
            {activeTab === 'refresh' && user && (
                <RefreshmentCorner 
                    user={user}
                    chatHistory={escapeSuggesterChatHistory}
                    setChatHistory={setEscapeSuggesterChatHistory}
                    onReset={handleResetEscapeSuggesterChat}
                />
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default App;