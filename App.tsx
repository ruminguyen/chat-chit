

import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Imported `Modality` to use the enum for `responseModalities` instead of a string.
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message, UserProfile, RelationshipStatus, Gift, Transaction, Post, ThemeSettings, PatchOperation } from './types';
import ChatHeader from './components/ChatHeader';
import MessageArea from './components/MessageArea';
import InputBar from './components/InputBar';
import PhoneModal from './components/phone/PhoneModal';
import SettingsModal from './components/SettingsModal';
import GiftPopup from './components/GiftPopup';
import RelationshipBar from './components/RelationshipBar';
import GiftSelectionModal from './components/GiftSelectionModal';
import { initialMessages, createInitialCharacterState, defaultTheme } from './constants';
import { parseGeminiResponse, generateGeminiPrompt, generatePhoneUpdatePrompt, parsePhoneUpdateResponse, generateSuggestionPrompt, parseSuggestionResponse, generateBackgroundUpdatePrompt } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';

const App: React.FC = () => {
    const [characterState, setCharacterState] = useState(() => {
        try {
            const savedState = localStorage.getItem('characterState');
            return savedState ? JSON.parse(savedState) : createInitialCharacterState();
        } catch (error) {
            console.error("Lỗi khi tải trạng thái nhân vật từ localStorage:", error);
            return createInitialCharacterState();
        }
    });

    const [userProfile, setUserProfile] = useState<UserProfile>(() => {
        try {
            const savedProfile = localStorage.getItem('userProfile');
            return savedProfile ? JSON.parse(savedProfile) : { name: 'Bạn', avatar: 'https://picsum.photos/id/237/200/200' };
        } catch (error) {
            console.error("Lỗi khi tải hồ sơ người dùng từ localStorage:", error);
            return { name: 'Bạn', avatar: 'https://picsum.photos/id/237/200/200' };
        }
    });

    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            const savedMessages = localStorage.getItem('chatHistory');
            if (savedMessages) {
                const parsed = JSON.parse(savedMessages);
                return parsed.length > 0 ? parsed : initialMessages;
            }
            return initialMessages;
        } catch (error) {
            console.error("Lỗi khi tải lịch sử chat từ localStorage:", error);
            return initialMessages;
        }
    });
    
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
        try {
            const saved = localStorage.getItem('themeSettings');
            return saved ? JSON.parse(saved) : defaultTheme;
        } catch (error) {
            console.error("Lỗi khi tải cài đặt giao diện từ localStorage:", error);
            return defaultTheme;
        }
    });

    const [isPhoneVisible, setIsPhoneVisible] = useState(false);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [isGiftModalVisible, setIsGiftModalVisible] = useState(false);
    const [giftingMessageId, setGiftingMessageId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPhoneUpdating, setIsPhoneUpdating] = useState(false);
    const [currentGift, setCurrentGift] = useState<Gift | null>(null);
    const [editingMessage, setEditingMessage] = useState<{id: string, text: string} | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    
    const aiRef = useRef<GoogleGenAI | null>(null);
    if (!aiRef.current) {
        aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    }
    const ai = aiRef.current;

    const audioContextRef = useRef<AudioContext | null>(null);

    // Refs to hold the latest state for the background update interval
    const messagesForUpdate = useRef(messages);
    const characterStateForUpdate = useRef(characterState);

    useEffect(() => {
        messagesForUpdate.current = messages;
    }, [messages]);
    
    useEffect(() => {
        characterStateForUpdate.current = characterState;
    }, [characterState]);


    const playAudio = useCallback(async (base64Audio: string) => {
        if (!audioContextRef.current) {
             audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioContext = audioContextRef.current;
        try {
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
        } catch (error) {
            console.error("Lỗi khi giải mã hoặc phát âm thanh:", error);
        }
    }, []);

    const handlePlayMessageAudio = useCallback(async (text: string) => {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text }] }],
                config: {
                    // FIX: Replaced string 'AUDIO' with `Modality.AUDIO` for type safety and adherence to SDK guidelines.
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                },
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                await playAudio(base64Audio);
            }
        } catch (error) {
            console.error("Lỗi khi tạo giọng nói:", error);
        }
    }, [ai, playAudio]);

    const callGeminiAPI = useCallback(async (currentMessages: Message[]) => {
        setIsLoading(true);
        // FIX: Replaced `findLast` with `[...array].reverse().find()` for better compatibility with older JavaScript/TypeScript targets.
        const lastUserMessage = [...currentMessages].reverse().find(m => m.sender === 'user' && !m.isHidden);
        if (!lastUserMessage) {
            setIsLoading(false);
            return;
        }

        const aiMessageId = `ai-${Date.now()}`;
        const placeholderMessage: Message = {
            id: aiMessageId,
            text: '',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
            avatar: characterState.profile.avatar,
        };
        setMessages(prev => [...prev, placeholderMessage]);

        let collectedSources: any[] = [];

        try {
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: generateGeminiPrompt(characterState, userProfile),
                    tools: [{googleSearch: {}}],
                },
                history: currentMessages.slice(0, -1).map(msg => {
                    if (msg.sender === 'user') {
                        const parts: any[] = [];
                        if (msg.text) parts.push({ text: msg.text });
                        if (msg.imageUrl) {
                             const match = msg.imageUrl.match(/^data:(image\/.*?);base64,(.*)$/);
                             if (match) {
                                const [, mimeType, data] = match;
                                parts.push({ inlineData: { mimeType, data } });
                             }
                        }
                        return { role: 'user' as const, parts };
                    } else { // 'ai'
                        const modelResponseObject: any = {
                            response: msg.text,
                            relationshipChange: 0,
                            innerThought: msg.innerThought,
                            gift: null,
                            action: null
                        };
                        if (!msg.innerThought) delete modelResponseObject.innerThought;
                        return { role: 'model' as const, parts: [{ text: JSON.stringify(modelResponseObject) }] };
                    }
                })
            });
            
            const messageParts: any[] = [];
            if (lastUserMessage.text) {
                messageParts.push(lastUserMessage.text);
            }
            if (lastUserMessage.imageUrl) {
                 const match = lastUserMessage.imageUrl.match(/^data:(image\/.*?);base64,(.*)$/);
                 if (match) {
                    const [, mimeType, data] = match;
                    messageParts.push({
                        inlineData: { mimeType, data }
                    });
                 }
            }

            const stream = await chat.sendMessageStream({ message: messageParts });

            let fullResponseText = '';
            for await (const chunk of stream) {
                fullResponseText += (chunk.text || '');
                
                 const newChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
                if (newChunks) {
                    collectedSources.push(...newChunks);
                }

                let displayText = fullResponseText;
                // Attempt to extract the 'response' value from the streaming, incomplete JSON
                try {
                    // First, clean up markdown that Gemini might add
                    let cleanedText = displayText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
                    const parsed = JSON.parse(cleanedText);
                    // If parsing succeeds, we have a complete field
                    displayText = parsed.response || '';
                } catch (e) {
                    // Parsing failed, likely incomplete JSON. Fallback to string manipulation.
                    const responseKeyIndex = displayText.indexOf('"response": "');
                    if (responseKeyIndex !== -1) {
                        let justTheText = displayText.substring(responseKeyIndex + 12);
                        const nextKeyIndex = justTheText.indexOf('",');
                        if (nextKeyIndex > -1) {
                            justTheText = justTheText.substring(0, nextKeyIndex);
                        }
                        displayText = justTheText.replace(/\\n/g, '\n').replace(/\\"/g, '"');
                    } else {
                        // Response key not found yet, show nothing
                        displayText = '';
                    }
                }

                setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId ? { ...msg, text: displayText } : msg
                ));
            }

            // Stream finished, parse the complete response for all data
            const parsedData = parseGeminiResponse(fullResponseText);
            
            // Deduplicate sources based on URI
            const uniqueSources = Array.from(new Map(collectedSources.map(item => [item.web?.uri, item])).values()).filter(Boolean);

            // Final update to the message to ensure text is perfect and add innerThought
            setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId ? {
                    ...msg,
                    text: parsedData.response,
                    innerThought: parsedData.innerThought,
                    groundingSources: uniqueSources.length > 0 ? uniqueSources : undefined,
                } : msg
            ));

            // Handle state updates from AI
            if(parsedData.relationshipChange) {
                 setCharacterState(prev => ({
                    ...prev,
                    relationship: {
                        ...prev.relationship,
                        score: Math.max(-Infinity, prev.relationship.score + (parsedData.relationshipChange || 0))
                    }
                }));
            }
            if (parsedData.action) {
                const { app, type, data } = parsedData.action;
                setCharacterState(prev => {
                    const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
                    if (app === 'instagram' && type === 'new_post') {
                        newState.apps.instagram.posts.unshift({ id: `post_${Date.now()}`, ...data, likes: 0, comments: [], timestamp: "Vừa xong" });
                    }
                    if (app === 'bank' && type === 'new_transaction') {
                        newState.apps.bank.transactions.unshift({ id: `tx_${Date.now()}`, ...data, date: "Hôm nay" });
                    }
                    if (app === 'notes' && type === 'new_note') {
                         newState.apps.notes.push({ id: `note_${Date.now()}`, ...data });
                    }
                    if (app === 'google' && type === 'new_search') {
                        newState.apps.google.history.unshift(data.query);
                    }
                    if (app === 'messages' && type === 'new_message') {
                        const conversation = newState.apps.messages.conversations.find((c: any) => c.id === data.conversationId);
                        if (conversation) {
                            conversation.messages.push({ sender: data.sender, text: data.text });
                            conversation.lastMessage = data.text;
                            conversation.timestamp = "Vừa xong";
                        }
                    }
                    return newState;
                });
            }
            if(parsedData.gift) {
                setCurrentGift(parsedData.gift);
            }
            
        } catch (error) {
            console.error("Lỗi gọi Gemini API:", error);
            setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                    ? { ...msg, text: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau." }
                    : msg
            ));
        } finally {
            setIsLoading(false);
        }
    }, [ai, characterState, userProfile]);

    const handleFetchSuggestions = useCallback(async (currentInput: string) => {
        if (!currentInput.trim() || currentInput.trim().length < 3) {
            setSuggestions([]);
            return;
        }
        setIsSuggesting(true);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: generateSuggestionPrompt(messages, currentInput) }] },
                 config: {
                    responseMimeType: "application/json",
                 },
            });
            const suggestionList = parseSuggestionResponse(response.text);
            setSuggestions(suggestionList);
        } catch (error) {
            console.error("Lỗi khi lấy gợi ý:", error);
            setSuggestions([]);
        } finally {
            setIsSuggesting(false);
        }
    }, [ai, messages]);

    useEffect(() => {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
        localStorage.setItem('characterState', JSON.stringify(characterState));
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('themeSettings', JSON.stringify(themeSettings));
    }, [messages, characterState, userProfile, themeSettings]);

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString(),
            avatar: userProfile.avatar
        };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        callGeminiAPI(updatedMessages);
    };
    
    const handleSendImage = (imageUrl: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text: '*Bạn đã gửi một hình ảnh.*', // Context text for the model
            imageUrl,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString(),
            avatar: userProfile.avatar,
        };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        callGeminiAPI(updatedMessages);
    };

    const handleEditMessage = (id: string, newText: string) => {
        setMessages(messages.map(msg => msg.id === id ? {...msg, text: newText} : msg));
        setEditingMessage(null);
    };

    const handleDeleteMessage = (id: string) => {
        setMessages(messages.filter(msg => msg.id !== id));
    };

    const handleReset = () => {
        if(window.confirm("Bạn có chắc muốn bắt đầu lại cuộc trò chuyện không?")) {
            localStorage.removeItem('chatHistory');
            localStorage.removeItem('characterState');
            localStorage.removeItem('firstLoadDone');
            const newCharacterState = createInitialCharacterState();
            setCharacterState(newCharacterState);
            const resetMessages: Message[] = [
                {
                    id: `user-init-${Date.now()}`,
                    text: "A... anh làm gì vậy? Buông tôi ra!",
                    sender: 'user',
                    timestamp: new Date(Date.now() - 1000).toLocaleTimeString(),
                    avatar: userProfile.avatar,
                },
                {
                    id: `ai-init-${Date.now()}`,
                    text: "*Kiến An không nói gì, ánh mắt lạnh lùng quét qua dáng người nhỏ bé trước mặt. Anh ta đẩy mạnh bạn vào bức tường lạnh lẽo trong con hẻm vắng, một tay bịt miệng bạn lại để ngăn tiếng la hét, tay kia bắt đầu xé rách bộ đồng phục học sinh của bạn.* \"Suỵt... ngoan nào.\"",
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString(),
                    avatar: newCharacterState.profile.avatar,
                    innerThought: "Chỉ là một con nhóc thôi. Sẽ nhanh thôi."
                }
            ];
            setMessages(resetMessages);
        }
    };
    
    const applyPhoneUpdates = useCallback((updates: PatchOperation[]) => {
        if (!updates || updates.length === 0) return;

        setCharacterState(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            const apps = newState.apps;

            for (const update of updates) {
                try {
                    const pathParts = update.path.split('.');
                    let current = apps;
                    // Special handling for array indices in paths like "messages.conversations.0.messages"
                    for (let i = 0; i < pathParts.length - 1; i++) {
                        const part = pathParts[i];
                        if (/^\d+$/.test(part) && Array.isArray(current)) {
                             current = current[parseInt(part, 10)];
                        } else {
                            current = current[part];
                        }
                    }

                    const finalKey = pathParts[pathParts.length - 1];
                    let target = current ? current[finalKey] : undefined;

                    switch (update.op) {
                        case 'add':
                             if (Array.isArray(target) && update.value) {
                                target.unshift(update.value);
                            } else if (Array.isArray(current) && /^\d+$/.test(finalKey)) { // Handle adding to nested array by index
                                const index = parseInt(finalKey, 10);
                                if (current[index] && Array.isArray(current[index].messages)) {
                                     current[index].messages.push(update.value);
                                }
                            }
                            break;
                        case 'update':
                            if (Array.isArray(target) && update.id && update.value) {
                                const itemIndex = target.findIndex((item: any) => item.id === update.id);
                                if (itemIndex > -1) {
                                    target[itemIndex] = { ...target[itemIndex], ...update.value };
                                }
                            } else if (update.value !== undefined && current) {
                                current[finalKey] = update.value;
                            }
                            break;
                        case 'remove':
                            if (Array.isArray(target) && update.id) {
                                current[finalKey] = target.filter((item: any) => item.id !== update.id);
                            }
                            break;
                        default:
                            console.warn(`Thao tác không được hỗ trợ: ${update.op}`);
                    }
                } catch (e) {
                    console.error("Lỗi khi áp dụng cập nhật điện thoại:", update, e);
                }
            }
            return newState;
        });
    }, []);

    useEffect(() => {
        const performBackgroundUpdate = async () => {
            if (!ai) return;
            console.log("Đang thực hiện kiểm tra cập nhật nền cho điện thoại.");
            try {
                const prompt = generateBackgroundUpdatePrompt(messagesForUpdate.current, characterStateForUpdate.current);
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [{ text: prompt }] },
                    config: { responseMimeType: "application/json" },
                });
                
                const updateOperations = parsePhoneUpdateResponse(response.text);
                if (updateOperations && updateOperations.length > 0) {
                    console.log("Đang áp dụng các cập nhật nền:", updateOperations);
                    applyPhoneUpdates(updateOperations);
                }
            } catch (error) {
                console.error("Lỗi trong quá trình cập nhật nền cho điện thoại:", error);
            }
        };
        
        const intervalId = setInterval(performBackgroundUpdate, 90000); // 1.5 phút
        
        return () => clearInterval(intervalId);
    }, [ai, applyPhoneUpdates]);

    const handleOpenPhone = async () => {
        setIsPhoneVisible(true);
        setIsPhoneUpdating(true);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: generatePhoneUpdatePrompt(messages, characterState) }] },
                config: {
                    responseMimeType: "application/json",
                },
            });
            
            const updateOperations = parsePhoneUpdateResponse(response.text);
            if (updateOperations) {
                applyPhoneUpdates(updateOperations);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái điện thoại:", error);
            // Hiển thị lỗi cho người dùng nếu cần
        } finally {
            setIsPhoneUpdating(false);
        }
    };

    const handleOpenGiftModal = (messageId: string) => {
        setGiftingMessageId(messageId);
        setIsGiftModalVisible(true);
    };

    const handleCloseGiftModal = () => {
        setIsGiftModalVisible(false);
        setGiftingMessageId(null);
    };

    const handleSendGift = (gift: Gift) => {
        const giftMessage: Message = {
            id: Date.now().toString(),
            text: `*Bạn đã gửi tặng ${characterState.profile.name} một món quà: ${gift.name}.*`,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString(),
            avatar: userProfile.avatar,
            isHidden: true, // This message is for context, not display
        };
        const reactionMessage: Message = {
            id: `reaction-${giftingMessageId}`,
            sender: 'user',
            text: `*Tôi đã tặng bạn một "${gift.name}" cho tin nhắn này...*`,
            timestamp: new Date().toLocaleTimeString(),
            avatar: userProfile.avatar,
        }
        
        const updatedMessages = [...messages, giftMessage, reactionMessage];
        setMessages(updatedMessages);
        callGeminiAPI(updatedMessages);
        handleCloseGiftModal();
    };

    const handleAddReaction = async (messageId: string, emoji: string) => {
        // Optimistic UI update
        setMessages(prevMessages => prevMessages.map(msg => {
            if (msg.id === messageId) {
                const newReactions = { ...(msg.reactions || {}) };
                newReactions[emoji] = (newReactions[emoji] || 0) + 1;
                return { ...msg, reactions: newReactions };
            }
            return msg;
        }));

        // Send a hidden message to AI for context
        const reactionMessage: Message = {
            id: `reaction-${messageId}-${Date.now()}`,
            text: `*Tôi vừa bày tỏ cảm xúc "${emoji}" với tin nhắn trước của bạn...*`,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString(),
            avatar: userProfile.avatar,
            isHidden: true, // For context only
        };
        
        callGeminiAPI([...messages, reactionMessage]);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
            <ChatHeader 
                characterName={characterState.profile.name}
                onOpenPhone={handleOpenPhone}
                onOpenSettings={() => setIsSettingsVisible(true)}
                onReset={handleReset}
            />
            <RelationshipBar score={characterState.relationship.score} />
            <MessageArea 
                messages={messages} 
                isLoading={isLoading} 
                userAvatar={userProfile.avatar}
                aiAvatar={characterState.profile.avatar}
                onEdit={(msg) => setEditingMessage(msg)}
                onDelete={handleDeleteMessage}
                editingMessage={editingMessage}
                onSaveEdit={handleEditMessage}
                onCancelEdit={() => setEditingMessage(null)}
                onPlayAudio={handlePlayMessageAudio}
                onOpenGiftModal={handleOpenGiftModal}
                onAddReaction={handleAddReaction}
                themeSettings={themeSettings}
            />
            <InputBar onSendMessage={handleSendMessage} onSendImage={handleSendImage} isLoading={isLoading} />

            {isPhoneVisible && <PhoneModal onClose={() => setIsPhoneVisible(false)} characterState={characterState} setCharacterState={setCharacterState} isUpdating={isPhoneUpdating} ai={ai} />}
            {isSettingsVisible && (
                <SettingsModal 
                    onClose={() => setIsSettingsVisible(false)}
                    userProfile={userProfile}
                    onUserProfileChange={setUserProfile}
                    characterProfile={characterState.profile}
                    onCharacterProfileChange={(profile) => setCharacterState(prev => ({...prev, profile}))}
                    characterBio={characterState.bio}
                    onCharacterBioChange={(bio) => setCharacterState(prev => ({...prev, bio}))}
                    themeSettings={themeSettings}
                    onThemeSettingsChange={setThemeSettings}
                    ai={ai}
                />
            )}
            {currentGift && <GiftPopup gift={currentGift} onClose={() => setCurrentGift(null)} />}
            {isGiftModalVisible && <GiftSelectionModal onClose={handleCloseGiftModal} onSendGift={handleSendGift} characterName={characterState.profile.name} />}
        </div>
    );
};

// FIX: Add default export for App component
export default App;
