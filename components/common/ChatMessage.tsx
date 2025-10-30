import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import { Bot, User } from 'lucide-react';
import SourceLink from './SourceLink';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage: React.FC<{ message: ChatMessageType }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 my-4 items-start ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
      )}
      <div className={`max-w-xl p-4 rounded-xl shadow-md ${isUser ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.text}
          </ReactMarkdown>
        </div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-600">
             <h4 className="text-sm font-semibold mb-2 text-slate-300">Sources:</h4>
             <div className="flex flex-wrap gap-2">
                {message.sources.map((source, index) => (
                    <SourceLink key={index} source={source} />
                ))}
             </div>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center shadow-lg">
          <User className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;