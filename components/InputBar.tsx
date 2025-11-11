import React, { useState, useRef } from 'react';
import { Send, ImagePlus } from 'lucide-react';
import { playKeypressSound } from '../utils/audioEffects';

interface InputBarProps {
    onSendMessage: (text: string) => void;
    onSendImage: (imageUrl: string) => void;
    isLoading: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, onSendImage, isLoading }) => {
    const [text, setText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() && !isLoading) {
            onSendMessage(text);
            setText('');
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                onSendImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
        if (e.target) {
            e.target.value = '';
        }
    };

    return (
        <div className="p-4 bg-gray-900/50 backdrop-blur-sm border-t border-gray-700">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-white transition-colors p-2"
                    title="Gửi ảnh"
                >
                    <ImagePlus size={22} />
                </button>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                />
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={playKeypressSound}
                    placeholder="Nhập tin nhắn..."
                    disabled={isLoading}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-full py-2 px-4 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                    type="submit"
                    disabled={isLoading || !text.trim()}
                    className="bg-pink-600 text-white rounded-full p-3 disabled:bg-gray-600 disabled:cursor-not-allowed transition-transform duration-300"
                >
                    <Send size={20} className={`transition-transform duration-300 ${text ? 'transform -rotate-45' : ''}`} />
                </button>
            </form>
        </div>
    );
};

export default InputBar;