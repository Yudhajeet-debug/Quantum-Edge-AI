import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`
      bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl shadow-lg 
      transform hover:scale-[1.02] transition-all duration-300 ease-in-out 
      hover:shadow-xl hover:shadow-indigo-500/20 hover:border-slate-600
      ${className}
    `}>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-indigo-500 to-cyan-400 p-2 rounded-lg shadow-md">{icon}</div>
          <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Card;