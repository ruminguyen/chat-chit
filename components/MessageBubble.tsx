import React, { useState, useRef, useEffect } from 'react';
import { Message, ThemeSettings } from '../types';
import { Edit3, Trash2, Save, X, Volume2, ThumbsUp, ThumbsDown, RefreshCw, Gift, SmilePlus } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
    isEditing: boolean;
    onEdit: () => void;
    onDelete: (id: string) => void;
    onSaveEdit: (id: string, newText: string) => void;
    onCancelEdit: () => void;
    onPlayAudio: (text: string) => void;
    onOpenGiftModal: (messageId: string) => void;
    onAddReaction: (messageId: string, emoji: string) => Promise<void>;
    themeSettings: ThemeSettings;
}

const renderFormattedText = (text: string) => {
    // This regex splits the string by the action delimiters (*...*) and keeps them in the result array.
    const parts = text.split(/(\*.*?\*)/g).filter(part => part);

    return parts.map((part, index) => {
        // Check if the part is an action (e.g., *walks away*)
        if (part.startsWith('*') && part.endsWith('*')) {
            const actionText = part.slice(1, -1);
            return (
                <em key={index} className="opacity-80">
                    {actionText}
                </em>
            );
        } else {
            // Otherwise, it's treated as dialogue.
            return (
                <span key={index}>
                    {part}
                </span>
            );
        }
    });
};


const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isEditing, onEdit, onDelete, onSaveEdit, onCancelEdit, onPlayAudio, onOpenGiftModal, onAddReaction, themeSettings }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [editedText, setEditedText] = useState(message.text);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const editInputRef = useRef<HTMLTextAreaElement>(null);

    const isUser = message.sender === 'user';
    const commonReactions = ['❤️', '👍', '😂', '😢', '😮', '😠'];
    const theme = isUser ? themeSettings.userBubble : themeSettings.aiBubble;


    useEffect(() => {
        if (isEditing) {
            editInputRef.current?.focus();
            editInputRef.current?.select();
        }
    }, [isEditing]);
    
    const handleSave = () => {
        if (editedText.trim()) {
            onSaveEdit(message.id, editedText);
        }
    };
    
    return (
        <div 
            className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false)
                setShowReactionPicker(false)
            }}
        >
            {!isUser && <img src={message.avatar} alt="avatar" className="w-8 h-8 rounded-full" />}
            
            <div className="flex flex-col" style={{ alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                <div 
                    className={`max-w-md lg:max-w-2xl px-4 py-2 rounded-2xl border ${isUser ? 'rounded-br-none' : 'rounded-bl-none'}`}
                    style={{
                        backgroundColor: theme.backgroundColor,
                        color: theme.textColor,
                        borderColor: theme.borderColor
                    }}
                >
                    {isEditing ? (
                        <div>
                            <textarea
                                ref={editInputRef}
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                className="w-full bg-black/20 text-inherit p-1 border rounded"
                                style={{ borderColor: theme.borderColor }}
                                rows={3}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={handleSave} className="text-green-500"><Save size={16} /></button>
                                <button onClick={onCancelEdit} className="text-red-500"><X size={16} /></button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm whitespace-pre-wrap break-words">
                            {message.imageUrl && (
                                <img
                                    src={message.imageUrl}
                                    alt="Hình ảnh đã gửi"
                                    className="max-w-xs max-h-64 rounded-lg mb-2 cursor-pointer"
                                    onClick={() => window.open(message.imageUrl, '_blank')}
                                />
                            )}
                            {renderFormattedText(message.text)}
                            {message.innerThought && (
                                <div className="mt-2" style={{ color: '#FF6B81', fontStyle: 'italic', opacity: 0.8 }}>
                                    -{message.innerThought}-
                                </div>
                            )}
                            {message.groundingSources && message.groundingSources.length > 0 && (
                                <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.borderColor + '80' }}>
                                    <h4 className="text-xs font-semibold mb-1 opacity-70">Nguồn:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {message.groundingSources.map((source, index) => source.web && (
                                            <li key={index} className="text-xs">
                                                <a 
                                                    href={source.web.uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="opacity-80 hover:opacity-100 hover:underline"
                                                    style={{ color: theme.textColor }}
                                                >
                                                    {source.web.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className="flex gap-1 mt-1.5 px-2">
                        {Object.entries(message.reactions).map(([emoji, count]) => (
                            <div 
                                key={emoji} 
                                onClick={() => onAddReaction(message.id, emoji)}
                                className="bg-gray-700/80 border border-pink-500 rounded-full px-2 py-0.5 text-xs flex items-center gap-1 cursor-pointer hover:bg-gray-600 transition-colors"
                            >
                                <span>{emoji}</span>
                                <span className="text-white font-semibold">{count}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="h-6 flex items-center gap-2 mt-1 px-1 relative">
                    {isHovered && !isEditing && (
                        <div className="flex items-center gap-2 text-gray-500">
                             {!isUser && (
                                <>
                                {showReactionPicker && (
                                    <div className="absolute bottom-full mb-2 bg-gray-700 rounded-full shadow-lg p-1 flex gap-1 z-10 animate-fade-in-fast">
                                        {commonReactions.map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={async () => {
                                                    await onAddReaction(message.id, emoji);
                                                    setShowReactionPicker(false);
                                                }}
                                                className="text-xl p-1 rounded-full hover:bg-gray-600 transition-transform transform hover:scale-125"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <button onClick={() => setShowReactionPicker(prev => !prev)} title="Thêm cảm xúc" className="hover:text-white transition-colors"><SmilePlus size={14} /></button>
                                <button onClick={() => onPlayAudio(message.text)} title="Nghe" className="hover:text-white transition-colors"><Volume2 size={14} /></button>
                                <button title="Phản hồi tốt" className="hover:text-white transition-colors"><ThumbsUp size={14} /></button>
                                <button title="Phản hồi không tốt" className="hover:text-white transition-colors"><ThumbsDown size={14} /></button>
                                <button title="Tạo phản hồi mới" className="hover:text-white transition-colors"><RefreshCw size={14} /></button>
                                <button onClick={() => onOpenGiftModal(message.id)} title="Tặng quà" className="hover:text-white transition-colors"><Gift size={14} /></button>
                                </>
                            )}
                            <button onClick={onEdit} title="Sửa" className="hover:text-white transition-colors"><Edit3 size={14} /></button>
                            <button onClick={() => onDelete(message.id)} title="Xóa" className="hover:text-white transition-colors"><Trash2 size={14} /></button>
                        </div>
                    )}
                </div>
            </div>
             {isUser && <img src={message.avatar} alt="avatar" className="w-8 h-8 rounded-full" />}
        </div>
    );
};

export default MessageBubble;