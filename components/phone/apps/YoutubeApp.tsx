import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CharacterState } from '../../../types';

interface YoutubeAppProps {
    onBack: () => void;
    characterState: CharacterState;
}

const YoutubeApp: React.FC<YoutubeAppProps> = ({ onBack, characterState }) => {
    const { videos } = characterState.apps.youtube;

    return (
        <div className="bg-[#212121] text-white h-full flex flex-col">
            <header className="flex items-center p-3 sticky top-0 bg-[#212121] z-10">
                <button onClick={onBack}><ArrowLeft size={24} /></button>
                <div className="flex items-center ml-4">
                    <svg height="20" viewBox="0 0 28.9 20.2" className="mr-2">
                         <path fill="#FF0000" d="M28.3 3.1c-.4-1.5-1.6-2.6-3.1-3C22.7 0 14.5 0 14.5 0S6.2 0 3.7 0.6c-1.5.4-2.6 1.6-3 3.1C0 5.4 0 10.1 0 10.1s0 4.7 0.6 6.9c.4 1.5 1.6 2.6 3.1 3C6.2 20.2 14.5 20.2 14.5 20.2s8.2 0 10.7-.6c1.5-.4 2.6-1.6 3-3.1 0.6-2.3.6-6.9.6-6.9S28.9 5.4 28.3 3.1z"></path>
                         <path fill="#FFFFFF" d="M11.5 14.5V5.7l8 4.4-8 4.4z"></path>
                    </svg>
                    <h1 className="text-xl font-bold tracking-tighter">YouTube</h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                {videos.map(video => (
                    <div key={video.id} className="mb-4 cursor-pointer">
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-auto" />
                        <div className="p-3 flex items-start">
                            <div className="w-9 h-9 bg-gray-500 rounded-full flex-shrink-0 mr-3" style={{backgroundImage: `url(https://i.pravatar.cc/40?u=${video.channelName})`, backgroundSize: 'cover'}}></div>
                            <div>
                                <p className="font-semibold text-sm line-clamp-2">{video.title}</p>
                                <p className="text-xs text-gray-400 mt-1">{video.channelName} · {video.views} · {video.uploaded}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default YoutubeApp;
