
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Conversation, CharacterState } from '../../../types';

interface MessagesAppProps {
    onBack: () => void;
    characterState: CharacterState;
    setCharacterState: React.Dispatch<React.SetStateAction<CharacterState>>;
}

const ConversationView = ({ 
    conversation, 
    onBack, 
    onSendMessage 
}: { 
    conversation: Conversation, 
    onBack: () => void, 
    onSendMessage: (conversationId: string, text: string) => void 
}) => {
    const [text, setText] = useState('');
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation.messages]);

    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(conversation.id, text.trim());
            setText('');
        }
    };

    return (
        <div className="bg-white text-black h-full flex flex-col">
            <header className="flex items-center p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
                <button onClick={onBack}><ArrowLeft size={24} /></button>
                 <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600 ml-4">
                    {conversation.contactName.charAt(0)}
                </div>
                <h2 className="font-bold ml-2">{conversation.contactName}</h2>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-100">
                {conversation.messages.map((msg, index) => (
                     <div key={index} className={`flex items-end gap-2 ${msg.sender === 'self' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender !== 'self' && <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0"></div>}
                        <p className={`max-w-[70%] py-2 px-3 rounded-2xl ${msg.sender === 'self' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-black rounded-bl-none'}`}>
                            {msg.text}
                        </p>
                    </div>
                ))}
                <div ref={endOfMessagesRef} />
            </div>
             <div className="p-2 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Nhắn tin..."
                        className="flex-1 bg-gray-100 rounded-full py-2 px-4 outline-none"
                    />
                    <button onClick={handleSend} className="bg-blue-500 text-white rounded-full p-2">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}


const MessagesApp: React.FC<MessagesAppProps> = ({ onBack, characterState, setCharacterState }) => {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const conversations = characterState.apps.messages.conversations;

    const handleSendMessage = (conversationId: string, text: string) => {
        setCharacterState(prev => {
            const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
            const convs: Conversation[] = newState.apps.messages.conversations;
            const targetConversation = convs.find(c => c.id === conversationId);
            
            if (targetConversation) {
                targetConversation.messages.push({ sender: 'self', text: text });
                targetConversation.lastMessage = text;
                targetConversation.timestamp = "Bây giờ";
            }

            return newState;
        });
    };

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

    if (selectedConversation) {
        return <ConversationView 
            conversation={selectedConversation} 
            onBack={() => setSelectedConversationId(null)} 
            onSendMessage={handleSendMessage}
        />
    }

    return (
        <div className="bg-white text-black h-full flex flex-col">
            <header className="flex items-center p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
                <button onClick={onBack}><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-bold ml-4">Tin nhắn</h1>
            </header>
            <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => (
                    <div key={conv.id} onClick={() => setSelectedConversationId(conv.id)} className="flex items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
                            {conv.contactName.charAt(0)}
                        </div>
                        <div className="flex-1 ml-3 overflow-hidden">
                            <div className="flex justify-between items-center">
                                <p className="font-bold truncate">{conv.contactName}</p>
                                <p className="text-xs text-gray-500 flex-shrink-0 ml-2">{conv.timestamp}</p>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessagesApp;
