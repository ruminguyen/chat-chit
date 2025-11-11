

import React, { useState, useRef, useEffect } from 'react';
import HomeScreen from './HomeScreen';
import InstagramApp from './apps/InstagramApp';
import MessagesApp from './apps/MessagesApp';
import NotesApp from './apps/NotesApp';
import BankApp from './apps/BankApp';
import GoogleApp from './apps/GoogleApp';
import YoutubeApp from './apps/YoutubeApp';
import UmeEatsApp from './apps/UmeEatsApp';
import CallLogApp from './apps/CallLogApp';
import ElysianVaultApp from './apps/ElysianVaultApp';
import ShadowNetApp from './apps/ShadowNetApp';
import CerberusApp from './apps/CerberusApp';
import { CharacterState } from '../../types';
import { GoogleGenAI } from '@google/genai';

interface PhoneFrameProps {
    characterState: CharacterState;
    setCharacterState: React.Dispatch<React.SetStateAction<CharacterState>>;
    ai: GoogleGenAI;
}

type AppName = 'HOME' | 'INSTAGRAM' | 'MESSAGES' | 'NOTES' | 'BANK' | 'GOOGLE' | 'YOUTUBE' | 'UME_EATS' | 'CALL_LOG' | 'ELYSIAN_VAULT' | 'SHADOW_NET' | 'CERBERUS';
type AnimationState = 'idle' | 'opening' | 'closing';

const PhoneFrame: React.FC<PhoneFrameProps> = ({ characterState, setCharacterState, ai }) => {
    const [activeApp, setActiveApp] = useState<AppName>('HOME');
    const [animationState, setAnimationState] = useState<AnimationState>('idle');
    const [wallpaper, setWallpaper] = useState('https://images.unsplash.com/photo-1533069102717-393c04831019?q=80&w=800');
    
    const wallpaperInputRef = React.useRef<HTMLInputElement>(null);
    const appContainerRef = useRef<HTMLDivElement>(null);

    const handleWallpaperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => setWallpaper(event.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleOpenApp = (appName: AppName) => {
        if (appName !== 'HOME') {
            setActiveApp(appName);
            setAnimationState('opening');
        }
    };

    const handleCloseApp = () => {
        setAnimationState('closing');
    };

    useEffect(() => {
        const node = appContainerRef.current;
        if (!node || animationState === 'idle') return;

        const handleAnimationEnd = (event: AnimationEvent) => {
            if (event.target !== node) return; // Chỉ xử lý sự kiện từ chính container
            
            if (animationState === 'closing') {
                setActiveApp('HOME');
            }
            setAnimationState('idle'); // Reset trạng thái sau khi hiệu ứng kết thúc
        };
        
        node.addEventListener('animationend', handleAnimationEnd);

        return () => {
            node.removeEventListener('animationend', handleAnimationEnd);
        };
    }, [animationState]);


    const getAnimationClass = () => {
        if (animationState === 'opening') return 'animate-zoom-in';
        if (animationState === 'closing') return 'animate-zoom-out';
        return '';
    };

    const renderApp = () => {
        if (activeApp === 'HOME') return null;
        
        let AppToRender;

        switch (activeApp) {
            case 'INSTAGRAM':
                AppToRender = <InstagramApp onBack={handleCloseApp} characterState={characterState} setCharacterState={setCharacterState} ai={ai} />;
                break;
            case 'MESSAGES':
                AppToRender = <MessagesApp onBack={handleCloseApp} characterState={characterState} setCharacterState={setCharacterState} />;
                break;
            case 'NOTES':
                AppToRender = <NotesApp onBack={handleCloseApp} notes={characterState.apps.notes} setCharacterState={setCharacterState} />;
                break;
            case 'BANK':
                AppToRender = <BankApp onBack={handleCloseApp} bankState={characterState.apps.bank} />;
                break;
            case 'GOOGLE':
                AppToRender = <GoogleApp onBack={handleCloseApp} googleState={characterState.apps.google} />;
                break;
            case 'YOUTUBE':
                AppToRender = <YoutubeApp onBack={handleCloseApp} characterState={characterState} />;
                break;
            case 'UME_EATS':
                AppToRender = <UmeEatsApp onBack={handleCloseApp} characterState={characterState} setCharacterState={setCharacterState} />;
                break;
             case 'CALL_LOG':
                AppToRender = <CallLogApp onBack={handleCloseApp} callLogState={characterState.apps.callLog} />;
                break;
            case 'ELYSIAN_VAULT':
                AppToRender = <ElysianVaultApp onBack={handleCloseApp} vaultState={characterState.apps.elysianVault} />;
                break;
            case 'SHADOW_NET':
                AppToRender = <ShadowNetApp onBack={handleCloseApp} shadowNetState={characterState.apps.shadowNet} />;
                break;
            case 'CERBERUS':
                AppToRender = <CerberusApp onBack={handleCloseApp} cerberusState={characterState.apps.cerberus} />;
                break;
            default:
                return null;
        }

        return (
             <div ref={appContainerRef} className={`absolute inset-0 z-20 ${getAnimationClass()}`}>
                {AppToRender}
            </div>
        );
    };

    return (
        <div className="w-[300px] h-[600px] md:w-[320px] md:h-[650px] bg-black rounded-[40px] p-2.5 shadow-2xl border-4 border-gray-800 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-b-xl z-20 flex justify-center items-center">
                 <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-gray-700 rounded-full ml-3"></div>
            </div>
            <div className="w-full h-full rounded-[30px] overflow-hidden relative bg-blue-400"
                style={{ backgroundImage: `url(${wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                {/* Luôn render HomeScreen nhưng ẩn nó đi khi một ứng dụng khác đang hoạt động */}
                <div style={{ visibility: activeApp !== 'HOME' ? 'hidden' : 'visible' }}>
                    <HomeScreen setActiveApp={handleOpenApp} characterState={characterState} setCharacterState={setCharacterState} />
                </div>
                
                {renderApp()}
                
                {activeApp === 'HOME' && (
                    <>
                    <button onClick={() => wallpaperInputRef.current?.click()} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full z-10">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16"><path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z"/><path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/></svg>
                    </button>
                     <input type="file" accept="image/*" ref={wallpaperInputRef} onChange={handleWallpaperChange} className="hidden" />
                     </>
                )}
            </div>
        </div>
    );
};

export default PhoneFrame;