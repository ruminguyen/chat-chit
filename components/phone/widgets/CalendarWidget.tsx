import React from 'react';
import { CalendarWidgetData } from '../../../types';

interface CalendarWidgetProps {
    data: CalendarWidgetData;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ data }) => {
    const today = new Date();
    const day = today.getDate();
    const weekday = today.toLocaleDateString('vi-VN', { weekday: 'short' }).toUpperCase();

    return (
        <div className="w-full h-24 bg-black/30 backdrop-blur-md rounded-xl p-3 flex text-white">
            <div className="flex flex-col items-center justify-center mr-3">
                <p className="text-xs text-red-400 font-bold">{weekday}</p>
                <p className="text-3xl font-bold">{day}</p>
            </div>
            <div className="flex-1 border-l border-white/20 pl-3 flex flex-col justify-center overflow-hidden">
                {data.events.length > 0 ? (
                    data.events.slice(0, 2).map((event, index) => (
                        <div key={index} className="flex items-center mb-1 last:mb-0">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2 flex-shrink-0"></div>
                            <p className="text-xs truncate">
                                <span className="font-semibold">{event.time}</span> - {event.title}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-gray-400">Không có sự kiện nào sắp tới.</p>
                )}
            </div>
        </div>
    );
};

export default CalendarWidget;
