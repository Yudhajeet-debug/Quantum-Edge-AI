import React, { useState, useRef } from 'react';
import Card from './common/Card';
import { PenSquare, Mic, MicOff, Send } from 'lucide-react';
import { generateCreativeText, transcribeAudio } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';
import { fileToBase64 } from '../utils/fileUtils';

const CreativeWriter: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult('');
        try {
            const text = await generateCreativeText(`Write a short piece based on this: "${prompt}"`);
            setResult(text);
        } catch (err) {
            setError("Failed to generate text.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                audioChunksRef.current = [];
                setIsLoading(true);
                setError(null);
                try {
                    const audioFile = new File([audioBlob], "recording.webm", { type: audioBlob.type });
                    const base64Audio = await fileToBase64(audioFile);
                    const transcribedText = await transcribeAudio(base64Audio, 'audio/webm');
                    setPrompt(transcribedText);
                } catch (err) {
                    setError("Transcription failed.");
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            setError("Microphone access denied or not available.");
            console.error(err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleMicClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <Card title="Creative Writer ✍️" icon={<PenSquare size={24} color="white" />}>
            <div className="space-y-4">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Type a topic or use the mic to transcribe..."
                        className="w-full p-2 pr-12 bg-slate-700 rounded-md focus:outline-none ring-1 ring-slate-600 focus:ring-2 focus:ring-indigo-500 transition-shadow"
                        rows={3}
                    />
                    <button
                        onClick={handleMicClick}
                        className={`absolute top-1/2 -translate-y-1/2 right-2 p-2 rounded-full transition-all duration-300 ${
                            isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-600 hover:bg-slate-500'
                        }`}
                        title={isRecording ? 'Stop Recording' : 'Start Recording'}
                    >
                        {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={18} />
                    <span>{isLoading ? 'Writing...' : 'Write with AI'}</span>
                </button>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                
                <div className="p-3 bg-slate-700/50 rounded-md text-sm whitespace-pre-wrap min-h-[50px] max-h-40 overflow-y-auto border border-slate-700">
                    {isLoading && !result ? <LoadingSpinner /> : result ? result : <span className="text-slate-500">Your creative text will appear here...</span>}
                </div>
            </div>
        </Card>
    );
};

export default CreativeWriter;