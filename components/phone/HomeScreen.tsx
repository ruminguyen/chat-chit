


import React, { useState, useRef } from 'react';
import { MessageCircle, Image, StickyNote, Landmark, Search, Utensils, PlaySquare, Plus, X, PhoneMissed, Briefcase, Newspaper, Shield } from 'lucide-react';
import { playAppOpenSound } from '../../utils/audioEffects';
import { CharacterState, Widget, WidgetType } from '../../types';
import ClockWidget from './widgets/ClockWidget';
import WeatherWidget from './widgets/WeatherWidget';
import CalendarWidget from './widgets/CalendarWidget';
import WidgetSelectionModal from './WidgetSelectionModal';


interface HomeScreenProps {
    setActiveApp: (app: 'INSTAGRAM' | 'MESSAGES' | 'NOTES' | 'BANK' | 'GOOGLE' | 'YOUTUBE' | 'UME_EATS' | 'CALL_LOG' | 'ELYSIAN_VAULT' | 'SHADOW_NET' | 'CERBERUS') => void;
    characterState: CharacterState;
    setCharacterState: React.Dispatch<React.SetStateAction<CharacterState>>;
}

// FIX: Changed component definition to use React.FC and a separate props interface
// to resolve an issue where TypeScript wasn't treating `key` as a special prop.
interface AppIconProps {
    icon: React.ReactNode;
    name: string;
    onClick: () => void;
    isEditing: boolean;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

const AppIcon: React.FC<AppIconProps> = ({ icon, name, onClick, isEditing, onDragStart, onDragOver, onDrop, onDragEnd }) => {
    const handleClick = () => {
        if (isEditing) return;
        playAppOpenSound();
        onClick();
    };
    return (
        <div 
            onClick={handleClick}
            draggable={isEditing}
            onDragStart={isEditing ? onDragStart : undefined}
            onDragOver={isEditing ? onDragOver : undefined}
            onDrop={isEditing ? onDrop : undefined}
            onDragEnd={isEditing ? onDragEnd : undefined}
            className={`flex flex-col items-center gap-1.5 group ${isEditing ? 'cursor-grab animate-wobble' : 'cursor-pointer'}`}
        >
            <div className="w-14 h-14 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-xs text-white font-medium drop-shadow-md">{name}</span>
        </div>
    );
};

const DockIcon = ({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) => {
    const handleClick = () => {
        playAppOpenSound();
        onClick();
    };
    return (
        <div onClick={handleClick} className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
            {icon}
        </div>
    );
}

const renderWidget = (widget: Widget) => {
    switch (widget.type) {
        case 'clock':
            return <ClockWidget key={widget.id} />;
        case 'weather':
            return <WeatherWidget key={widget.id} data={widget} />;
        case 'calendar':
            return <CalendarWidget key={widget.id} data={widget} />;
        default:
            return null;
    }
}

const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveApp, characterState, setCharacterState }) => {
    const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const draggedItemIndex = useRef<number | null>(null);
    const dragOverItemIndex = useRef<number | null>(null);

    const handleAddWidget = (widgetType: WidgetType) => {
        const newWidget: Widget = {
            id: `widget_${widgetType}_${Date.now()}`,
            type: widgetType,
            ...(widgetType === 'weather' && { location: 'New York', temperature: 18, condition: 'Cloudy' }),
            ...(widgetType === 'calendar' && { events: [] }),
        } as Widget;

        setCharacterState(prev => ({
            ...prev,
            apps: {
                ...prev.apps,
                homeScreen: {
                    ...prev.apps.homeScreen,
                    widgets: [...prev.apps.homeScreen.widgets, newWidget]
                }
            }
        }));
        setIsWidgetModalOpen(false);
    };
    
    const handleRemoveWidget = (widgetId: string) => {
         setCharacterState(prev => ({
            ...prev,
            apps: {
                ...prev.apps,
                homeScreen: {
                    ...prev.apps.homeScreen,
                    widgets: prev.apps.homeScreen.widgets.filter(w => w.id !== widgetId)
                }
            }
        }));
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        draggedItemIndex.current = index;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        dragOverItemIndex.current = index;
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (draggedItemIndex.current === null || dragOverItemIndex.current === null) return;
        
        setCharacterState(prev => {
            const newAppOrder = [...prev.apps.homeScreen.appOrder];
            const draggedItem = newAppOrder.splice(draggedItemIndex.current!, 1)[0];
            newAppOrder.splice(dragOverItemIndex.current!, 0, draggedItem);
            
            return {
                ...prev,
                apps: {
                    ...prev.apps,
                    homeScreen: {
                        ...prev.apps.homeScreen,
                        appOrder: newAppOrder
                    }
                }
            };
        });
        
        draggedItemIndex.current = null;
        dragOverItemIndex.current = null;
    };

// FIX: Updated handleDragEnd to accept the event argument to match the expected prop type.
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        draggedItemIndex.current = null;
        dragOverItemIndex.current = null;
    };


    const widgets = characterState.apps.homeScreen.widgets;
    const appOrder = characterState.apps.homeScreen.appOrder;

// FIX: Changed `JSX.Element` to `React.ReactNode` to resolve "Cannot find namespace 'JSX'" error.
    const appConfig: { [key: string]: { icon: React.ReactNode; name: string; onClick: () => void; } } = {
        'INSTAGRAM': { icon: <Image size={30} className="text-pink-500" />, name: "Instagram", onClick: () => setActiveApp('INSTAGRAM') },
        'MESSAGES': { icon: <MessageCircle size={30} className="text-green-500" />, name: "Tin nhắn", onClick: () => setActiveApp('MESSAGES') },
        'NOTES': { icon: <StickyNote size={30} className="text-yellow-500" />, name: "Ghi chú", onClick: () => setActiveApp('NOTES') },
        'GOOGLE': { icon: <Search size={30} className="text-blue-500" />, name: "Google", onClick: () => setActiveApp('GOOGLE') },
        'BANK': { icon: <Landmark size={30} className="text-yellow-700" />, name: "Ngân hàng", onClick: () => setActiveApp('BANK') },
        'YOUTUBE': { icon: <PlaySquare size={30} className="text-red-600" />, name: "YouTube", onClick: () => setActiveApp('YOUTUBE') },
        'UME_EATS': { icon: <Utensils size={30} className="text-orange-500" />, name: "Ume Eats", onClick: () => setActiveApp('UME_EATS') },
        'CALL_LOG': { icon: <PhoneMissed size={30} className="text-red-500" />, name: "Cuộc gọi", onClick: () => setActiveApp('CALL_LOG') },
        'ELYSIAN_VAULT': { icon: <Briefcase size={30} className="text-amber-400" />, name: "Elysian Vault", onClick: () => setActiveApp('ELYSIAN_VAULT') },
        'SHADOW_NET': { icon: <Newspaper size={30} className="text-gray-400" />, name: "ShadowNet", onClick: () => setActiveApp('SHADOW_NET') },
        'CERBERUS': { icon: <Shield size={30} className="text-cyan-400" />, name: "Cerberus", onClick: () => setActiveApp('CERBERUS') },
        'ADD_WIDGET': { icon: <Plus size={30} className="text-gray-400" />, name: "Thêm", onClick: () => setIsWidgetModalOpen(true) },
    };


    return (
        <>
        <style>{`
            @keyframes wobble {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-2deg); }
                75% { transform: rotate(2deg); }
            }
            .animate-wobble {
                animation: wobble 0.3s ease-in-out infinite;
            }
        `}</style>
        <div 
            className="w-full h-full flex flex-col justify-between p-4 text-white"
            onContextMenu={(e) => { e.preventDefault(); setIsEditMode(p => !p); }}
            onMouseLeave={() => isEditMode && setIsEditMode(false)}
        >
            {/* Widgets Area */}
            <div className="grid grid-cols-2 gap-2">
                {widgets.map(widget => (
                    <div key={widget.id} className="relative">
                        {renderWidget(widget)}
                        {isEditMode && (
                             <button 
                                onClick={() => handleRemoveWidget(widget.id)}
                                className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white z-10 animate-fade-in-fast"
                            >
                                <X size={12} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Apps Area */}
            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                 {appOrder.map((appKey, index) => {
                    const app = appConfig[appKey];
                    if (!app) return null;
                    return (
                        <AppIcon 
                            key={appKey} 
                            icon={app.icon} 
                            name={app.name} 
                            onClick={app.onClick}
                            isEditing={isEditMode}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={handleDrop}
                            onDragEnd={handleDragEnd}
                        />
                    );
                 })}
            </div>

            {/* Dock Area */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2">
                 <div className="flex justify-around items-center">
                    <DockIcon icon={<Search size={30} className="text-white" />} onClick={() => setActiveApp('GOOGLE')} />
                    <DockIcon icon={<Image size={30} className="text-white" />} onClick={() => setActiveApp('INSTAGRAM')} />
                    <DockIcon icon={<StickyNote size={30} className="text-white" />} onClick={() => setActiveApp('NOTES')} />
                    <DockIcon icon={<Landmark size={30} className="text-white" />} onClick={() => setActiveApp('BANK')} />
                 </div>
            </div>
        </div>
        {isWidgetModalOpen && (
            <WidgetSelectionModal 
                onClose={() => setIsWidgetModalOpen(false)}
                onAddWidget={handleAddWidget}
            />
        )}
        </>
    );
};

export default HomeScreen;