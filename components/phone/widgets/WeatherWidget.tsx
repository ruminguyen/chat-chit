import React from 'react';
import { Sun, Cloud, CloudRain, Zap } from 'lucide-react';
import { WeatherWidgetData } from '../../../types';

interface WeatherWidgetProps {
    data: WeatherWidgetData;
}

const WeatherIcon = ({ condition }: { condition: WeatherWidgetData['condition'] }) => {
    switch (condition) {
        case 'Sunny':
            return <Sun className="text-yellow-300" size={32} />;
        case 'Cloudy':
            return <Cloud className="text-gray-300" size={32} />;
        case 'Rainy':
            return <CloudRain className="text-blue-300" size={32} />;
        case 'Stormy':
            return <Zap className="text-yellow-200" size={32} />;
        default:
            return <Cloud className="text-gray-300" size={32} />;
    }
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ data }) => {
    return (
        <div className="w-full h-24 bg-black/30 backdrop-blur-md rounded-xl p-3 flex justify-between items-center text-white">
            <div className="flex flex-col">
                <p className="font-bold text-lg">{data.location}</p>
                <p className="text-sm opacity-80">{data.condition}</p>
            </div>
            <div className="flex flex-col items-center">
                 <WeatherIcon condition={data.condition} />
                <p className="text-2xl font-bold">{data.temperature}°</p>
            </div>
        </div>
    );
};

export default WeatherWidget;
