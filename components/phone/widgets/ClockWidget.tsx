import React, { useState, useEffect } from 'react';

const ClockWidget: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat('vi-VN', options).format(date);
    };

    return (
        <div className="w-full h-24 bg-black/30 backdrop-blur-md rounded-xl p-3 flex flex-col justify-center items-center text-white col-span-2">
            <p className="text-4xl font-bold tracking-tighter">
                {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </p>
            <p className="text-xs uppercase tracking-wider opacity-80">
                {formatDate(time)}
            </p>
        </div>
    );
};

export default ClockWidget;
