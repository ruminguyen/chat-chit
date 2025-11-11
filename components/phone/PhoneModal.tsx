

import React, { useEffect } from 'react';
import PhoneFrame from './PhoneFrame';
import { CharacterState } from '../../types';
import { Loader } from 'lucide-react';
import { playNotificationSound } from '../../utils/audioEffects';
import { GoogleGenAI } from '@google/genai';

interface PhoneModalProps {
    onClose: () => void;
    characterState: CharacterState;
    setCharacterState: React.Dispatch<React.SetStateAction<CharacterState>>;
    isUpdating: boolean;
    ai: GoogleGenAI;
}

const PhoneModal: React.FC<PhoneModalProps> = ({ onClose, characterState, setCharacterState, isUpdating, ai }) => {
    useEffect(() => {
        // Play a notification sound when the phone is opened to simulate activity
        playNotificationSound();
    }, []); // Only run once when the modal mounts

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40"
            onClick={onClose}
        >
            <div 
                className="animate-slide-up relative"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the phone
            >
                {isUpdating && (
                    <div className="absolute inset-0 bg-black/70 rounded-[40px] z-30 flex flex-col items-center justify-center">
                        <Loader className="animate-spin text-white mb-2" size={32} />
                        <p className="text-white text-sm">Đang cập nhật...</p>
                    </div>
                )}
                <PhoneFrame characterState={characterState} setCharacterState={setCharacterState} ai={ai} />
            </div>
            {/* FIX: Removed invalid `jsx` prop from style tag. This is not Next.js. */}
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
            `}</style>
        </div>
    );
};

export default PhoneModal;