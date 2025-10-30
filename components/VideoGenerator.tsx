import React, { useState, useRef, useEffect, useCallback } from 'react';
import Card from './common/Card';
import { Video, UploadCloud, Film } from 'lucide-react';
import { generateVideo } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';
import { fileToBase64 } from '../utils/fileUtils';
import { VideoAspectRatio } from '../types';

const loadingMessages = [
    "Warming up the digital cameras...",
    "Choreographing the pixels...",
    "Rendering the first few frames...",
    "This can take a few minutes, hang tight!",
    "Adding some cinematic magic...",
    "Finalizing the motion picture...",
];

const VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<{ file: File; url: string } | null>(null);
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageIntervalRef = useRef<number | null>(null);

    const checkApiKey = useCallback(async () => {
        try {
            if ((window as any).aistudio && await (window as any).aistudio.hasSelectedApiKey()) {
                setApiKeySelected(true);
            } else {
                setApiKeySelected(false);
            }
        } catch (e) {
            console.error("aistudio not available", e);
            setApiKeySelected(false); // Assume not available if check fails
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    useEffect(() => {
        if (isLoading) {
            messageIntervalRef.current = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 5000);
        } else if (messageIntervalRef.current) {
            clearInterval(messageIntervalRef.current);
        }
        return () => {
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
        };
    }, [isLoading]);

    const handleSelectKey = async () => {
        try {
            await (window as any).aistudio.openSelectKey();
            // Assume success and optimistically update UI
            setApiKeySelected(true);
        } catch (e) {
            setError("Could not open API key selection. Please check your environment.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage({ file, url: URL.createObjectURL(file) });
            setGeneratedVideo(null);
            setError(null);
        }
    };

    const handleGenerate = async () => {
        if (!image) {
            setError("Please upload an image to start.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedVideo(null);

        try {
            const base64Image = await fileToBase64(image.file);
            const videoUrl = await generateVideo(prompt, base64Image, image.file.type, aspectRatio);
            setGeneratedVideo(videoUrl);
        } catch (err: any) {
             if (err.message?.includes("Requested entity was not found.")) {
                setError("API key not valid. Please select a valid key.");
                setApiKeySelected(false); // Reset key state
            } else {
                setError("Failed to generate video. Please try again.");
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!apiKeySelected) {
        return (
            <Card title="Generate Video 🎬" icon={<Video size={24} color="white" />}>
                <div className="p-4 text-center space-y-3 bg-slate-700/50 rounded-lg">
                    <p>To use video generation, you need to select an API key.</p>
                    <p className="text-xs text-slate-400">
                      Please note that charges may apply. For more details, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">billing documentation</a>.
                    </p>
                    <button onClick={handleSelectKey} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        Select API Key
                    </button>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>
            </Card>
        );
    }
  
    return (
        <Card title="Generate Video 🎬" icon={<Video size={24} color="white" />}>
            <div className="space-y-4">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center p-4 border-2 border-dashed border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                    {image ? 
                        <img src={image.url} alt="Uploaded for video" className="max-h-32 rounded-lg"/> :
                        <>
                            <UploadCloud className="w-8 h-8 text-slate-400 mr-2" />
                            <span className="text-sm text-slate-400">Upload starting image</span>
                        </>
                    }
                </button>
                
                {generatedVideo && !isLoading && (
                    <video src={generatedVideo} controls className="w-full rounded-lg border border-slate-700" />
                )}

                {isLoading && (
                     <div className="p-4 bg-slate-700/50 rounded-lg text-center space-y-3 border border-slate-700">
                        <LoadingSpinner />
                        <p className="text-sm text-slate-300">{loadingMessage}</p>
                    </div>
                )}
                
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Optional: Describe the motion (e.g., zoom in slowly)"
                    className="w-full p-2 bg-slate-700 rounded-md focus:outline-none ring-1 ring-slate-600 focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    rows={2}
                    disabled={!image}
                />
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-slate-300">Aspect Ratio:</label>
                    <div className="flex gap-2">
                        {(['16:9', '9:16'] as VideoAspectRatio[]).map(ar => (
                            <button
                                key={ar}
                                onClick={() => setAspectRatio(ar)}
                                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 transform hover:scale-105 ${
                                    aspectRatio === ar ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-600 hover:bg-slate-500'
                                }`}
                            >
                                {ar === '16:9' ? 'Landscape' : 'Portrait'}
                            </button>
                        ))}
                    </div>
                </div>
                
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !image}
                    className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Film size={20} />
                    <span>{isLoading ? 'Generating Video...' : 'Generate Video'}</span>
                </button>
                {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
        </Card>
    );
};

export default VideoGenerator;