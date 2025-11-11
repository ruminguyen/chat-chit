

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { UserProfile, CharacterProfile, ThemeSettings, BubbleTheme } from '../types';
import { X, Camera, Sparkles } from 'lucide-react';
import AvatarGeneratorModal from './AvatarGeneratorModal';

// --- Start of CharacterBioEditor component ---
interface CharacterBioEditorProps {
    initialBio: string;
    onBioChange: (newBio: string) => void;
}

const TABS = ['Tổng quan', 'Tâm lý', 'Mối quan hệ', 'Bối cảnh'];
const MARKERS = {
    'Tâm lý': 'Đặc điểm tâm lý',
    'Mối quan hệ': 'Mối quan hệ',
    'Bối cảnh': 'Bối cảnh',
};

const parseBioToSections = (bio: string) => {
    const parsed = { 'Tổng quan': '', 'Tâm lý': '', 'Mối quan hệ': '', 'Bối cảnh': '' };
    if (!bio) { return parsed; }

    let bioCopy = bio;

    const bgIndex = bioCopy.lastIndexOf(MARKERS['Bối cảnh']);
    if (bgIndex !== -1) {
        parsed['Bối cảnh'] = bioCopy.substring(bgIndex).trim();
        bioCopy = bioCopy.substring(0, bgIndex);
    }

    const relIndex = bioCopy.lastIndexOf(MARKERS['Mối quan hệ']);
    if (relIndex !== -1) {
        parsed['Mối quan hệ'] = bioCopy.substring(relIndex).trim();
        bioCopy = bioCopy.substring(0, relIndex);
    }

    const psyIndex = bioCopy.lastIndexOf(MARKERS['Tâm lý']);
    if (psyIndex !== -1) {
        parsed['Tâm lý'] = bioCopy.substring(psyIndex).trim();
        bioCopy = bioCopy.substring(0, psyIndex);
    }

    parsed['Tổng quan'] = bioCopy.trim();
    
    return parsed;
};


const CharacterBioEditor: React.FC<CharacterBioEditorProps> = ({ initialBio, onBioChange }) => {
    const [activeTab, setActiveTab] = useState(TABS[0]);
    // Initialize state from the `initialBio` prop once.
    // This prevents re-parsing the bio on every keystroke, fixing the editing bug.
    const [sections, setSections] = useState(() => parseBioToSections(initialBio));

    const handleSectionChange = (tab: string, content: string) => {
        const newSections = { ...sections, [tab]: content };
        setSections(newSections);

        const newBio = [
            newSections['Tổng quan'],
            newSections['Tâm lý'],
            newSections['Mối quan hệ'],
            newSections['Bối cảnh']
        ].map(s => s.trim()).filter(Boolean).join('\n\n');
        
        onBioChange(newBio);
    };

    return (
        <div>
            <div className="flex border-b border-gray-600 mb-4">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'border-b-2 border-teal-400 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div>
                <textarea
                    value={sections[activeTab as keyof typeof sections]}
                    onChange={(e) => handleSectionChange(activeTab, e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 h-64 font-mono text-xs"
                    placeholder={`Nhập thông tin cho mục ${activeTab}...`}
                />
            </div>
        </div>
    );
};
// --- End of CharacterBioEditor component ---

const ColorPicker = ({ label, value, onChange }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">{label}</label>
        <div className="relative">
            <input
                type="color"
                value={value}
                onChange={onChange}
                className="w-8 h-8 p-0 border-none rounded-md cursor-pointer appearance-none bg-transparent"
                style={{'--color-swatch': value} as React.CSSProperties}
            />
            <span className="absolute inset-0 rounded-md pointer-events-none border border-gray-500" style={{backgroundColor: value}}></span>
        </div>
    </div>
);


interface SettingsModalProps {
    onClose: () => void;
    userProfile: UserProfile;
    onUserProfileChange: (profile: UserProfile) => void;
    characterProfile: CharacterProfile;
    onCharacterProfileChange: (profile: CharacterProfile) => void;
    characterBio: string;
    onCharacterBioChange: (bio: string) => void;
    themeSettings: ThemeSettings;
    onThemeSettingsChange: (theme: ThemeSettings) => void;
    ai: GoogleGenAI;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, userProfile, onUserProfileChange, characterProfile, onCharacterProfileChange, characterBio, onCharacterBioChange, themeSettings, onThemeSettingsChange, ai }) => {
    const [currentName, setCurrentName] = useState(userProfile.name);
    const [currentCharName, setCharName] = useState(characterProfile.name);
    const [currentBio, setCurrentBio] = useState(characterBio);
    const [currentTheme, setCurrentTheme] = useState(themeSettings);

    const userAvatarInputRef = useRef<HTMLInputElement>(null);
    const charAvatarInputRef = useRef<HTMLInputElement>(null);
    const [generatorState, setGeneratorState] = useState({
        isOpen: false,
        target: null as 'user' | 'character' | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'user' | 'character') => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if(type === 'user') {
                    onUserProfileChange({ ...userProfile, avatar: event.target?.result as string, name: currentName });
                } else {
                    onCharacterProfileChange({ ...characterProfile, avatar: event.target?.result as string, name: currentCharName });
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSave = () => {
        onUserProfileChange({...userProfile, name: currentName});
        onCharacterProfileChange({...characterProfile, name: currentCharName});
        onCharacterBioChange(currentBio);
        onThemeSettingsChange(currentTheme);
        onClose();
    }
    
    const handleThemeChange = (bubbleType: 'userBubble' | 'aiBubble', property: keyof BubbleTheme, value: string) => {
        setCurrentTheme(prev => ({
            ...prev,
            [bubbleType]: {
                ...prev[bubbleType],
                [property]: value
            }
        }));
    };

    const handleOpenGenerator = (target: 'user' | 'character') => {
        setGeneratorState({ isOpen: true, target });
    };

    const handleCloseGenerator = () => {
        setGeneratorState({ isOpen: false, target: null });
    };

    const handleImageGenerated = (base64Image: string) => {
        if (generatorState.target === 'user') {
            onUserProfileChange({ ...userProfile, avatar: base64Image, name: currentName });
        } else if (generatorState.target === 'character') {
            onCharacterProfileChange({ ...characterProfile, avatar: base64Image, name: currentCharName });
        }
        handleCloseGenerator();
    };


    return (
        <>
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold mb-6 text-center">Cài đặt</h2>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        {/* User Profile */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-pink-400">Hồ sơ của bạn</h3>
                            <div className="flex items-center gap-4">
                                <div className="relative group w-20 h-20">
                                    <img src={userProfile.avatar} alt="User Avatar" className="w-20 h-20 rounded-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                        <button onClick={() => userAvatarInputRef.current?.click()} title="Tải ảnh lên">
                                            <Camera size={24} />
                                        </button>
                                        <button onClick={() => handleOpenGenerator('user')} title="Tạo bằng AI">
                                            <Sparkles size={24} />
                                        </button>
                                    </div>
                                    <input type="file" accept="image/*" ref={userAvatarInputRef} onChange={(e) => handleFileChange(e, 'user')} className="hidden" />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-1">Tên</label>
                                    <input
                                        id="userName"
                                        type="text"
                                        value={currentName}
                                        onChange={(e) => setCurrentName(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Character Profile */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-teal-400">Hồ sơ nhân vật</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative group w-20 h-20">
                                    <img src={characterProfile.avatar} alt="Character Avatar" className="w-20 h-20 rounded-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                        <button onClick={() => charAvatarInputRef.current?.click()} title="Tải ảnh lên">
                                            <Camera size={24} />
                                        </button>
                                        <button onClick={() => handleOpenGenerator('character')} title="Tạo bằng AI">
                                            <Sparkles size={24} />
                                        </button>
                                    </div>
                                    <input type="file" accept="image/*" ref={charAvatarInputRef} onChange={(e) => handleFileChange(e, 'character')} className="hidden" />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="charName" className="block text-sm font-medium text-gray-300 mb-1">Tên nhân vật</label>
                                    <input
                                        id="charName"
                                        type="text"
                                        value={currentCharName}
                                        onChange={(e) => setCharName(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Thông tin nhân vật (Bio)</label>
                                <CharacterBioEditor initialBio={currentBio} onBioChange={setCurrentBio} />
                            </div>
                        </div>

                        {/* Theme Settings */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-yellow-400">Giao diện Trò chuyện</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3 p-4 bg-gray-700/50 rounded-lg">
                                    <h4 className="font-semibold text-center text-gray-200">Bong bóng của bạn</h4>
                                    <ColorPicker label="Màu nền" value={currentTheme.userBubble.backgroundColor} onChange={(e) => handleThemeChange('userBubble', 'backgroundColor', e.target.value)} />
                                    <ColorPicker label="Màu chữ" value={currentTheme.userBubble.textColor} onChange={(e) => handleThemeChange('userBubble', 'textColor', e.target.value)} />
                                    <ColorPicker label="Màu viền" value={currentTheme.userBubble.borderColor} onChange={(e) => handleThemeChange('userBubble', 'borderColor', e.target.value)} />
                                </div>
                                 <div className="space-y-3 p-4 bg-gray-700/50 rounded-lg">
                                    <h4 className="font-semibold text-center text-gray-200">Bong bóng của AI</h4>
                                    <ColorPicker label="Màu nền" value={currentTheme.aiBubble.backgroundColor} onChange={(e) => handleThemeChange('aiBubble', 'backgroundColor', e.target.value)} />
                                    <ColorPicker label="Màu chữ" value={currentTheme.aiBubble.textColor} onChange={(e) => handleThemeChange('aiBubble', 'textColor', e.target.value)} />
                                    <ColorPicker label="Màu viền" value={currentTheme.aiBubble.borderColor} onChange={(e) => handleThemeChange('aiBubble', 'borderColor', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end border-t border-gray-700 pt-4">
                        <button onClick={handleSave} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            </div>
            <AvatarGeneratorModal
                isOpen={generatorState.isOpen}
                onClose={handleCloseGenerator}
                onSelectImage={handleImageGenerated}
                ai={ai}
            />
        </>
    );
};

export default SettingsModal;