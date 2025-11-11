
import React from 'react';
import { ArrowLeft, Search, Clock } from 'lucide-react';
import { GoogleState } from '../../../types';

interface GoogleAppProps {
    onBack: () => void;
    googleState: GoogleState;
}

const GoogleApp: React.FC<GoogleAppProps> = ({ onBack, googleState }) => {
    return (
        <div className="bg-white text-black h-full flex flex-col">
            <header className="flex items-center p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
                <button onClick={onBack}><ArrowLeft size={24} /></button>
            </header>
            <div className="p-4">
                <h1 className="text-5xl font-bold text-center mb-6">
                    <span className="text-blue-500">G</span>
                    <span className="text-red-500">o</span>
                    <span className="text-yellow-500">o</span>
                    <span className="text-blue-500">g</span>
                    <span className="text-green-500">l</span>
                    <span className="text-red-500">e</span>
                </h1>
                <div className="flex items-center border border-gray-300 rounded-full p-2 shadow-sm">
                    <Search size={20} className="text-gray-500 ml-2" />
                    <input 
                        type="text" 
                        className="w-full bg-transparent outline-none ml-2" 
                        placeholder="Tìm kiếm hoặc nhập một URL"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
                <h2 className="text-sm font-semibold text-gray-600 mb-2">Lịch sử tìm kiếm</h2>
                <ul className="space-y-3">
                    {googleState.history.map((item, index) => (
                        <li key={index} className="flex items-center text-gray-700 hover:text-blue-600 cursor-pointer">
                            <Clock size={16} className="mr-3 text-gray-400"/>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default GoogleApp;
