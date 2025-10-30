import React, { useState } from 'react';
import Card from './common/Card';
import { Library } from 'lucide-react';

type Tab = 'music' | 'songs';

const musicTracks = [
    { title: "Weightless", artist: "Marconi Union", videoId: "UfcAVejslrU" },
    { title: "Clair de Lune", artist: "Claude Debussy", videoId: "CvFH_6DNRCY" },
    { title: "lofi hip hop radio - beats to relax/study to", artist: "Lofi Girl", videoId: "5qap5aO4i9A" },
    { title: "Time", artist: "Hans Zimmer", videoId: "RxabLA7UQ9k" },
    { title: "One More Time", artist: "Daft Punk", videoId: "A_gI-6Y_AMw" },
    { title: "Comptine d'un autre été", artist: "Yann Tiersen", videoId: "H2-1u8xvk54" },
    { title: "Nuvole Bianche", artist: "Ludovico Einaudi", videoId: "kcihcYEOeic" },
];

const songTracks = [
    { title: "Everybody (Backstreet's Back)", artist: "Backstreet Boys", videoId: "O6XE1XRiLeY" },
    { title: "Livin' On A Prayer", artist: "Bon Jovi", videoId: "lDK9gVbbemc" },
    { title: "Don't Stop Me Now", artist: "Queen", videoId: "HgzGwKwLmgM" },
    { title: "Don't Stop Believin'", artist: "Journey", videoId: "VcjzPHKF3p4" },
    { title: "Walking on Sunshine", artist: "Katrina & The Waves", videoId: "iPUmE-tne5U" },
    { title: "Happy", artist: "Pharrell Williams", videoId: "y6Sxv-sUYtM" },
    { title: "Here Comes The Sun", artist: "The Beatles", videoId: "-6G73aPLaVw" },
    { title: "Lovely Day", artist: "Bill Withers", videoId: "-c9-poC5HGw" },
    { title: "Three Little Birds", artist: "Bob Marley & The Wailers", videoId: "zaGUr6wS_DE" },
    { title: "Never Gonna Give You Up", artist: "Rick Astley", videoId: "dQw4w9WgXcQ" },
];

const MusicLibrary: React.FC<{ className?: string }> = ({ className = '' }) => {
    const [activeTab, setActiveTab] = useState<Tab>('music');
    const [nowPlaying, setNowPlaying] = useState<{title: string; videoId: string; key: number} | null>(null);

    const tracks = activeTab === 'music' ? musicTracks : songTracks;

    const handlePlayTrack = (track: { title: string; videoId: string }) => {
        setNowPlaying({
            title: track.title,
            videoId: track.videoId,
            key: Date.now(), // Use a unique timestamp to force re-render
        });
    };

    const tabButtonClasses = (tabName: Tab) =>
    `px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 font-semibold w-1/2 ${
      activeTab === tabName
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
    }`;

    return (
        <Card title="Music & Song Library 🎵" icon={<Library size={24} color="white" />} className={className}>
            <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl shadow-inner w-full justify-center">
                    <button onClick={() => {setActiveTab('music'); setNowPlaying(null);}} className={tabButtonClasses('music')}>
                        Relaxing Music
                    </button>
                    <button onClick={() => {setActiveTab('songs'); setNowPlaying(null);}} className={tabButtonClasses('songs')}>
                        Refreshing Songs
                    </button>
                </div>

                {nowPlaying && (
                    <div key={nowPlaying.key} className="aspect-video rounded-lg overflow-hidden border-2 border-indigo-500 shadow-xl shadow-indigo-500/20">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${nowPlaying.videoId}?autoplay=1`}
                            title={nowPlaying.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {tracks.map(track => (
                        <button 
                            key={track.videoId}
                            onClick={() => handlePlayTrack(track)}
                            className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold text-slate-200">{track.title}</p>
                                <p className="text-sm text-slate-400">{track.artist}</p>
                            </div>
                            {nowPlaying?.videoId === track.videoId && (
                                <div className="flex items-center gap-1.5 text-cyan-400">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-semibold">Now Playing</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default MusicLibrary;