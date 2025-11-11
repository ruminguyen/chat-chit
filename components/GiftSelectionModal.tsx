import React from 'react';
import { Gift } from '../types';
import { giftOptions } from '../constants';
import { X } from 'lucide-react';

interface GiftSelectionModalProps {
    onClose: () => void;
    onSendGift: (gift: Gift) => void;
    characterName: string;
}

const GiftSelectionModal: React.FC<GiftSelectionModalProps> = ({ onClose, onSendGift, characterName }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center">Tặng quà cho {characterName}</h2>

                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {giftOptions.map((gift) => (
                        <div key={gift.name} className="bg-gray-700 rounded-lg p-4 flex flex-col items-center text-center transition-transform hover:scale-105">
                            <img src={gift.imageUrl} alt={gift.name} className="w-28 h-28 object-cover rounded-md mb-3" />
                            <h3 className="font-semibold text-lg">{gift.name}</h3>
                            <p className="text-sm text-gray-400 mt-1 flex-grow">{gift.description}</p>
                            <button
                                onClick={() => onSendGift(gift)}
                                className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg transition-colors w-full"
                            >
                                Gửi
                            </button>
                        </div>
                    ))}
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default GiftSelectionModal;
