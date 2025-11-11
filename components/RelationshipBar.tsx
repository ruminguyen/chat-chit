
import React from 'react';

interface RelationshipBarProps {
    score: number;
}

const RelationshipBar: React.FC<RelationshipBarProps> = ({ score }) => {
    const levels = [
        { name: 'Đang cháy', min: -Infinity, max: -100, color: 'bg-red-800' },
        { name: 'Khó chịu', min: -99, max: -20, color: 'bg-red-600' },
        { name: 'Xa cách', min: -19, max: -1, color: 'bg-orange-500' },
        { name: 'Người lạ', min: 0, max: 19, color: 'bg-gray-500' },
        { name: 'Quen biết', min: 20, max: 99, color: 'bg-yellow-500' },
        { name: 'Bạn bè', min: 100, max: 999, color: 'bg-green-500' },
        { name: 'Cảm nắng', min: 1000, max: 1999, color: 'bg-teal-500' },
        { name: 'Người yêu', min: 2000, max: 4999, color: 'bg-blue-500' },
        { name: 'Đối tác', min: 5000, max: Infinity, color: 'bg-purple-500' },
    ];

    const currentLevel = levels.find(l => score >= l.min && score <= l.max) || levels[3];
    const nextLevel = levels[levels.indexOf(currentLevel) + 1];
    
    let percentage = 0;
    if (nextLevel && score >= currentLevel.min && nextLevel.min !== Infinity) {
        const range = nextLevel.min - currentLevel.min;
        const progress = score - currentLevel.min;
        percentage = Math.min(100, (progress / range) * 100);
    } else if (score >= 5000) {
        percentage = 100;
    } else if (score < 0) {
         percentage = 100; // For negative levels, just fill the bar
    }

    return (
        <div className="px-4 py-2 bg-gray-900/30">
            <div className="flex justify-between items-center mb-1 text-xs text-gray-300">
                <span>{currentLevel.name}</span>
                <span className="font-mono">{score} điểm</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                    className={`${currentLevel.color} h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default RelationshipBar;
