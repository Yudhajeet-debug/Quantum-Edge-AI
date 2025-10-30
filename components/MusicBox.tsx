import React, { useState, useEffect, useRef } from 'react';
import Card from './common/Card';
import { MicVocal, Play, Square, Loader } from 'lucide-react';
import { generateSong, textToSpeech } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';
// FIX: Import ReactMarkdown and remarkGfm to render markdown content.
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Audio decoding utility functions
const decodeBase64 = (base64: string) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
};

const SongWriter: React.FC<{ className?: string }> = ({ className = '' }) => {
    const [prompt, setPrompt] = useState('');
    const [songLyrics, setSongLyrics] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        return () => {
            sourceNodeRef.current?.stop();
            audioContextRef.current?.close();
        };
    }, []);

    const handlePlay = async () => {
        if (!songLyrics || isAudioLoading) return;
        if (isPlaying && sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            setIsPlaying(false);
            return;
        }

        setIsAudioLoading(true);
        setError(null);
        try {
            const base64Audio = await textToSpeech(songLyrics);
            const audioData = decodeBase64(base64Audio);
            if (!audioContextRef.current) return;
            
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }
            
            const audioBuffer = await decodeAudioData(audioData, audioContextRef.current);
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setIsPlaying(false);
            source.start();
            sourceNodeRef.current = source;
            setIsPlaying(true);
        } catch (err) {
            setError("Could not play audio.");
            console.error(err);
        } finally {
            setIsAudioLoading(false);
        }
    };
    
    const handleGenerateSong = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setSongLyrics('');
        if (isPlaying && sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            setIsPlaying(false);
        }

        try {
            const text = await generateSong(prompt);
            setSongLyrics(text);
        } catch (err) {
            setError("Failed to write a song.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="AI Songwriter 🎙️" icon={<MicVocal size={24} color="white" />} className={className}>
            <div className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A rainy night in a cyberpunk city"
                    className="w-full p-2 bg-slate-700 rounded-md focus:outline-none ring-1 ring-slate-600 focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    rows={2}
                />
                 <button
                    onClick={handleGenerateSong}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>{isLoading ? 'Writing Song...' : 'Write a Song'}</span>
                </button>
                
                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="p-3 bg-slate-700/50 rounded-md text-sm relative min-h-[50px] border border-slate-700 max-h-40 overflow-y-auto">
                    {isLoading ? <LoadingSpinner /> : 
                        songLyrics ? <div className="markdown-content pr-10"><ReactMarkdown remarkPlugins={[remarkGfm]}>{songLyrics}</ReactMarkdown></div> : <span className="text-slate-500">Your song lyrics will appear here...</span>
                    }
                    {songLyrics && !isLoading && (
                       <button 
                            onClick={handlePlay} 
                            disabled={isAudioLoading}
                            className="absolute top-2 right-2 p-2 rounded-full bg-cyan-500 hover:bg-cyan-600 text-black transition-colors disabled:bg-slate-500"
                            title={isPlaying ? "Stop" : "Play"}
                        >
                            {isAudioLoading ? <Loader size={16} className="animate-spin" /> : isPlaying ? <Square size={16} /> : <Play size={16} />}
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default SongWriter;