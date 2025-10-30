import React, { useState } from 'react';
import { User, Check } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: (name: string, gender: string) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && gender) {
      onComplete(name.trim(), gender);
    }
  };

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="dopamine-border w-full max-w-md m-4 bg-slate-900/80 backdrop-blur-xl p-8 rounded-lg shadow-2xl text-center">
        <div className="flex justify-center mb-4">
             <div className="p-3 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-lg">
                <User size={32} className="text-white"/>
            </div>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-slate-100">Welcome to Quantum Edge AI!</h2>
        <p className="text-slate-400 mb-6">Let's get acquainted. This will help us personalize your experience.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should we call you?"
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            required
          />
          
          <div>
            <p className="text-slate-400 mb-2 text-sm">Please select your gender:</p>
            <div className="grid grid-cols-2 gap-2">
                {genderOptions.map(option => (
                    <button
                        type="button"
                        key={option}
                        onClick={() => setGender(option)}
                        className={`p-2 rounded-lg text-sm transition-all duration-200 ${
                            gender === option 
                            ? 'bg-indigo-600 text-white font-semibold ring-2 ring-indigo-400' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !gender}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={20} />
            Let's Get Started
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;