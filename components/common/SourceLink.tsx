import { GroundingChunk } from '@google/genai';
import { Globe, MapPin } from 'lucide-react';
import React from 'react';

const SourceLink: React.FC<{ source: GroundingChunk }> = ({ source }) => {
  if (source.web) {
    return (
      <a
        href={source.web.uri}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 bg-slate-600 hover:bg-slate-500 text-cyan-300 text-xs px-2 py-1 rounded-full transition-colors"
      >
        <Globe size={12} />
        <span>{source.web.title || new URL(source.web.uri).hostname}</span>
      </a>
    );
  }
  if (source.maps) {
    return (
      <a
        href={source.maps.uri}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 bg-slate-600 hover:bg-slate-500 text-cyan-300 text-xs px-2 py-1 rounded-full transition-colors"
      >
        <MapPin size={12} />
        <span>{source.maps.title}</span>
      </a>
    );
  }
  return null;
};

export default SourceLink;