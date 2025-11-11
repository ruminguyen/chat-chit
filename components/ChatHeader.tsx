import React, { useState } from 'react';
import { RefreshCw, Smartphone, Settings, Save, Check } from 'lucide-react';

interface ChatHeaderProps {
    characterName: string;
    onOpenPhone: () => void;
    onOpenSettings: () => void;
    onReset: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ characterName, onOpenPhone, onOpenSettings, onReset }) => {
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }
    
    return (
        <header className="bg-gray-900/50 backdrop-blur-sm p-3 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center gap-4">
                <button onClick={onReset} title="Bắt đầu lại" className="text-gray-400 hover:text-white transition-colors">
                    <RefreshCw size={20} />
                </button>
                <button onClick={handleSave} title="Lưu cuộc trò chuyện (tự động)" className="text-gray-400 hover:text-white transition-colors">
                    {saved ? <Check size={20} className="text-green-500" /> : <Save size={20} />}
                </button>
                <button onClick={onOpenPhone} title="Mở điện thoại" className="text-gray-400 hover:text-white transition-colors">
                    <Smartphone size={22} />
                </button>
                <button onClick={onOpenSettings} title="Cài đặt" className="text-gray-400 hover:text-white transition-colors">
                    <Settings size={22} />
                </button>
            </div>
            <h1 className="text-lg font-bold">{characterName}</h1>
        </header>
    );
};

export default ChatHeader;
