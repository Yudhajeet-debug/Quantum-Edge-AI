import React, { useState } from 'react';
import Card from './common/Card';
import { Image, Wand2 } from 'lucide-react';
import { generateImage } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';
import { AspectRatio } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const imageUrl = await generateImage(prompt, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (err) {
      setError("Failed to generate image. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Imagine Images 🎨" icon={<Image size={24} color="white" />}>
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A majestic lion wearing a crown, cinematic lighting"
          className="w-full p-2 bg-slate-700 rounded-md focus:outline-none ring-1 ring-slate-600 focus:ring-2 focus:ring-indigo-500 transition-shadow"
          rows={3}
        />
        <div className="flex flex-col sm:flex-row gap-2">
            <label className="text-sm font-medium text-slate-300 self-center">Aspect Ratio:</label>
            <div className="flex flex-wrap gap-2">
            {aspectRatios.map(ar => (
                <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 transform hover:scale-105 ${
                    aspectRatio === ar ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-600 hover:bg-slate-500'
                }`}
                >
                {ar}
                </button>
            ))}
            </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <LoadingSpinner size={20} /> : <Wand2 size={20} />}
          <span>{isLoading ? 'Generating...' : 'Generate'}</span>
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        
        {generatedImage && (
          <div className="mt-4 border border-slate-700 rounded-lg p-1">
            <img src={generatedImage} alt="Generated" className="rounded-lg w-full" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default ImageGenerator;