import React from 'react';
import ImageGenerator from './ImageGenerator';
import ImageEditor from './ImageEditor';
import VideoGenerator from './VideoGenerator';
import EscapeSuggester from './EscapeSuggester';
import CreativeWriter from './CreativeWriter';
import SongWriter from './MusicBox';
import MusicLibrary from './MusicLibrary';
import { ChatMessage } from '../types';

interface RefreshmentCornerProps {
    user: { name: string; gender: string } | null;
    chatHistory: ChatMessage[];
    setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    onReset: () => void;
}

const RefreshmentCorner: React.FC<RefreshmentCornerProps> = ({ user, chatHistory, setChatHistory, onReset }) => {
  return (
    <div className="space-y-8">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-cyan-300">Welcome to the Refreshment Corner ☕</h2>
            <p className="text-slate-400">Unwind, relax, and explore your creativity with these AI-powered tools.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageGenerator />
            <ImageEditor />
            <VideoGenerator />
            <CreativeWriter />
            <SongWriter className="md:col-span-2" />
            <MusicLibrary className="md:col-span-2" />
        </div>
        <div className="mt-8">
            <EscapeSuggester
                user={user}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
                onReset={onReset}
            />
        </div>
    </div>
  );
};

export default RefreshmentCorner;