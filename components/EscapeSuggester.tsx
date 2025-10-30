import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, MapPinned, Compass, RotateCcw } from 'lucide-react';
import { getTravelSuggestion } from '../services/geminiService';
import { ChatMessage as ChatMessageType } from '../types';
import ChatMessage from './common/ChatMessage';
import { useGeolocation } from '../hooks/useGeolocation';

interface EscapeSuggesterProps {
    user: { name: string; gender: string } | null;
    chatHistory: ChatMessageType[];
    setChatHistory: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
    onReset: () => void;
}

const EscapeSuggester: React.FC<EscapeSuggesterProps> = ({ user, chatHistory, setChatHistory, onReset }) => {
  const location = useGeolocation();
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: ChatMessageType = { role: 'user', text: userInput };
    setChatHistory((prev) => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const geminiHistory = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      
      const locationCoords = (location.latitude && location.longitude) ? { latitude: location.latitude, longitude: location.longitude } : null;
      const response = await getTravelSuggestion(userInput, geminiHistory, locationCoords, user);
      const modelResponse: ChatMessageType = { 
        role: 'model', 
        text: response.text,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      };
      setChatHistory((prev) => [...prev, modelResponse]);
    } catch (error) {
      console.error("Error fetching travel suggestion:", error);
      const errorMessage: ChatMessageType = {
        role: 'model',
        text: "Sorry, I couldn't find any suggestions right now. Please try again.",
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, chatHistory, location, user, setChatHistory]);

  return (
    <div className="dopamine-border flex flex-col h-[70vh] bg-slate-900/70 backdrop-blur-sm shadow-2xl shadow-indigo-900/20">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
            <MapPinned className="text-cyan-400" size={24} />
            <h2 className="text-xl font-bold">Escape Suggester ✈️</h2>
        </div>
        <button
          onClick={onReset}
          disabled={isLoading}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
          title="Reset Chat"
        >
          <RotateCcw size={18} />
        </button>
      </div>
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
        {chatHistory.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
         {isLoading && (
          <div className="flex justify-start">
              <div className="flex items-center gap-3 p-4 bg-slate-700 rounded-xl">
                <Compass className="animate-spin text-cyan-400" />
                <span className="text-slate-300">Searching...</span>
              </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center bg-slate-800 rounded-lg input-glow-container">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="e.g., Quiet beaches near me, best cities for foodies..."
            className="w-full bg-transparent p-3 focus:outline-none text-slate-200"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            className="p-3 m-1 bg-indigo-600 text-white rounded-md disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105"
          >
            <Send />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EscapeSuggester;