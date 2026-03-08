import React from 'react';
import { Sun, Activity } from 'lucide-react';

const SensorCard = ({ title, value, type, suffix = '' }) => {
    // Determine visuals based on type
    const isLDR = type === 'ldr';
    const Icon = isLDR ? Sun : Activity;
    const colorTheme = isLDR ? 'text-yellow-500' : 'text-blue-500';
    const bgTheme = isLDR ? 'bg-yellow-50' : 'bg-blue-50';
    const borderColor = isLDR ? 'border-yellow-200' : 'border-blue-200';

    return (
        <div className={`rounded-3xl p-6 border ${borderColor} ${bgTheme} transition-all hover:shadow-md flex flex-col justify-between h-48`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-slate-600 font-semibold mb-1">{title}</h3>
                    <p className="text-slate-400 text-sm">Live Monitoring</p>
                </div>
                <div className={`p-3 rounded-2xl bg-white shadow-sm ${colorTheme}`}>
                    <Icon className="w-8 h-8" />
                </div>
            </div>

            <div className="mt-4 flex items-end">
                <span className={`text-5xl font-extrabold ${colorTheme}`}>
                    {value !== null && value !== undefined && value !== '' ? value : '--'}
                </span>
                {suffix && (
                    <span className="text-xl font-semibold text-slate-500 mb-1 ml-2">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
};

export default SensorCard;
