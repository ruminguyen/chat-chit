
import React from 'react';

const TypingIndicator: React.FC = () => {
    return (
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex-shrink-0"></div>
            <div className="flex items-center space-x-1 p-3 bg-gray-800 rounded-2xl rounded-bl-none">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
        </div>
    );
};

export default TypingIndicator;
