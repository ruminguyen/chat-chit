

import React, { useRef, useEffect } from 'react';
import { Message, ThemeSettings } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessageAreaProps {
    messages: Message[];
    isLoading: boolean;
    userAvatar: string;
    aiAvatar: string;
    onEdit: (message: {id: string, text: string}) => void;
    onDelete: (id: string) => void;
    editingMessage: {id: string, text: string} | null;
    onSaveEdit: (id: string, newText: string) => void;
    onCancelEdit: () => void;
    onPlayAudio: (text: string) => void;
    onOpenGiftModal: (messageId: string) => void;
    onAddReaction: (messageId: string, emoji: string) => Promise<void>;
    themeSettings: ThemeSettings;
}

const MessageArea: React.FC<MessageAreaProps> = ({ messages, isLoading, onEdit, onDelete, editingMessage, onSaveEdit, onCancelEdit, onPlayAudio, onOpenGiftModal, onAddReaction, themeSettings }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const visibleMessages = messages.filter(msg => !msg.isHidden);
    const lastVisibleMessage = visibleMessages[visibleMessages.length - 1];

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {visibleMessages.map((msg) => (
                <MessageBubble
                    key={msg.id}
                    message={msg}
                    isEditing={editingMessage?.id === msg.id}
                    onEdit={() => onEdit({id: msg.id, text: msg.text})}
                    onDelete={onDelete}
                    onSaveEdit={onSaveEdit}
                    onCancelEdit={onCancelEdit}
                    onPlayAudio={onPlayAudio}
                    onOpenGiftModal={onOpenGiftModal}
                    onAddReaction={onAddReaction}
                    themeSettings={themeSettings}
                />
            ))}
            {isLoading && lastVisibleMessage?.sender === 'user' && <TypingIndicator />}
            <div ref={endOfMessagesRef} />
        </div>
    );
};

export default MessageArea;