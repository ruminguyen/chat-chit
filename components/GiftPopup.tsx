import React, { useState } from 'react';
import { Gift } from '../types';
import { X } from 'lucide-react';

interface GiftPopupProps {
    gift: Gift;
    onClose: () => void;
}

const GiftPopup: React.FC<GiftPopupProps> = ({ gift, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl p-6 w-full max-w-sm relative text-center">
                 <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
                {!isOpen ? (
                    <div>
                        <h3 className="text-xl font-bold text-yellow-300 mb-4">Bạn có một món quà!</h3>
                        <div className="relative w-48 h-48 mx-auto cursor-pointer group" onClick={() => setIsOpen(true)}>
                            <div className="absolute bottom-0 w-full h-3/4 bg-pink-600 rounded-md"></div>
                            <div className="absolute bottom-0 w-full h-3/4 bg-pink-500 rounded-md transform group-hover:scale-105 transition-transform"></div>
                            <div className="absolute top-1/4 w-full h-1/2 flex justify-center items-center">
                                <div className="w-6 h-full bg-yellow-300"></div>
                            </div>
                             <div className="absolute top-0 w-52 h-12 bg-pink-600 rounded-md left-1/2 -translate-x-1/2 transition-transform duration-500 group-hover:-translate-y-2"></div>
                             <div className="absolute top-0 w-52 h-10 bg-pink-500 rounded-md left-1/2 -translate-x-1/2 transition-transform duration-500 group-hover:-translate-y-2"></div>
                             <div className="absolute -top-4 w-12 h-12 left-1/2 -translate-x-1/2">
                                 <div className="absolute w-6 h-10 bg-yellow-300 left-1/2 -translate-x-1/2 rounded-t-full"></div>
                             </div>
                        </div>
                         <p className="mt-4 text-gray-300">Bấm vào để mở</p>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <h3 className="text-2xl font-bold text-yellow-300 mb-2">Chúc mừng!</h3>
                        <p className="text-gray-200 mb-4">Bạn đã nhận được:</p>
                        <img src={gift.imageUrl} alt={gift.name} className="w-48 h-48 rounded-lg mx-auto object-cover border-4 border-yellow-400 shadow-lg"/>
                        <p className="text-xl font-semibold mt-4">{gift.name}</p>
                        <p className="text-gray-400">{gift.description}</p>
                    </div>
                )}
            </div>
            {/* FIX: Removed invalid `jsx` prop from style tag. This is not Next.js. */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default GiftPopup;