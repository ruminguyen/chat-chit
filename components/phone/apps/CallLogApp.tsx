import React from 'react';
import { ArrowLeft, Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing } from 'lucide-react';
import { CallLogState, CallLogEntry } from '../../../types';

interface CallLogAppProps {
    onBack: () => void;
    callLogState: CallLogState;
}

const CallIcon = ({ type }: { type: CallLogEntry['type'] }) => {
    switch(type) {
        case 'missed':
            return <PhoneMissed size={16} className="text-red-500" />;
        case 'incoming':
            return <PhoneIncoming size={16} className="text-green-500" />;
        case 'outgoing':
            return <PhoneOutgoing size={16} className="text-blue-500" />;
        default:
            return <Phone size={16} className="text-gray-400" />;
    }
};

const CallLogApp: React.FC<CallLogAppProps> = ({ onBack, callLogState }) => {
    const { entries } = callLogState;

    return (
        <div className="bg-gray-900 text-white h-full flex flex-col">
            <header className="flex items-center p-3 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
                <button onClick={onBack}><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-bold ml-4">Nhật ký cuộc gọi</h1>
            </header>

            <div className="flex-1 overflow-y-auto">
                {entries.map(entry => (
                    <div key={entry.id} className="flex items-center p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            {entry.contactName.charAt(0)}
                        </div>
                        <div className="flex-1 ml-3 overflow-hidden">
                            <p className={`font-semibold truncate ${entry.type === 'missed' ? 'text-red-400' : 'text-white'}`}>
                                {entry.contactName}
                            </p>
                             <div className="flex items-center gap-1.5">
                                <CallIcon type={entry.type}/>
                                <p className="text-sm text-gray-400 truncate">{entry.timestamp}</p>
                            </div>
                        </div>
                         <button className="p-2 text-blue-400 hover:bg-gray-700 rounded-full">
                            <Phone size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CallLogApp;
