import React from 'react';
import { X, Clock, Sun, Calendar } from 'lucide-react';
import { WidgetType } from '../../types';

interface WidgetSelectionModalProps {
    onClose: () => void;
    onAddWidget: (widgetType: WidgetType) => void;
}

const WidgetOption = ({ icon, name, onClick }: { icon: React.ReactNode, name: string, onClick: () => void }) => (
    <div onClick={onClick} className="bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-transform hover:scale-105 hover:bg-gray-600">
        <div className="mb-2">{icon}</div>
        <h3 className="font-semibold text-sm text-white">{name}</h3>
    </div>
);


const WidgetSelectionModal: React.FC<WidgetSelectionModalProps> = ({ onClose, onAddWidget }) => {
    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-fast">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-xs relative flex flex-col">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white z-10">
                    <X size={20} />
                </button>
                <h2 className="text-lg font-bold mb-4 text-center text-white">Thêm Widget</h2>

                <div className="grid grid-cols-2 gap-4">
                    <WidgetOption 
                        icon={<Clock size={32} className="text-cyan-400" />}
                        name="Đồng hồ"
                        onClick={() => onAddWidget('clock')}
                    />
                     <WidgetOption 
                        icon={<Sun size={32} className="text-yellow-400" />}
                        name="Thời tiết"
                        onClick={() => onAddWidget('weather')}
                    />
                     <WidgetOption 
                        icon={<Calendar size={32} className="text-red-400" />}
                        name="Lịch"
                        onClick={() => onAddWidget('calendar')}
                    />
                </div>
            </div>
        </div>
    );
};

export default WidgetSelectionModal;
