import React, { useState, useRef } from 'react';
import Card from './common/Card';
import { Edit, UploadCloud } from 'lucide-react';
import { editImage } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';
import { fileToBase64 } from '../utils/fileUtils';

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string } | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImage({ file, url: URL.createObjectURL(file) });
      setEditedImage(null);
      setError(null);
    }
  };

  const handleEdit = async () => {
    if (!prompt.trim() || !originalImage) {
      setError("Please upload an image and enter an edit prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const base64Image = await fileToBase64(originalImage.file);
      const newImageUrl = await editImage(prompt, base64Image, originalImage.file.type);
      setEditedImage(newImageUrl);
    } catch (err) {
      setError("Failed to edit image. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card title="Edit Image 🖌️" icon={<Edit size={24} color="white" />}>
      <div className="space-y-4">
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors"
        >
          <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-sm text-slate-400">{originalImage ? 'Change Image' : 'Click to upload image'}</span>
        </button>

        {originalImage && (
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <h4 className="text-sm text-center mb-1 text-slate-400">Original</h4>
                    <img src={originalImage.url} alt="Original" className="rounded-lg w-full border border-slate-700" />
                </div>
                 <div>
                    <h4 className="text-sm text-center mb-1 text-slate-400">Edited</h4>
                    <div className="w-full h-full bg-slate-700 rounded-lg flex items-center justify-center border border-slate-600">
                        {isLoading && <LoadingSpinner />}
                        {editedImage && !isLoading && <img src={editedImage} alt="Edited" className="rounded-lg w-full" />}
                        {!editedImage && !isLoading && <div className="text-slate-500 text-sm p-2 text-center">Your edited image will appear here</div>}
                    </div>
                </div>
            </div>
        )}

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Add a retro filter, make it black and white"
          className="w-full p-2 bg-slate-700 rounded-md focus:outline-none ring-1 ring-slate-600 focus:ring-2 focus:ring-indigo-500 transition-shadow"
          rows={2}
          disabled={!originalImage}
        />
        
        <button
          onClick={handleEdit}
          disabled={isLoading || !prompt.trim() || !originalImage}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLoading ? 'Editing...' : 'Apply Edit'}</span>
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </Card>
  );
};

export default ImageEditor;