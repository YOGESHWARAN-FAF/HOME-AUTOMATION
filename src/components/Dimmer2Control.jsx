import React, { useState } from 'react';
import { updateMultipleFields } from '../api';
import { Leaf, Gauge, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Field6 values: ECO=1, STANDARD=2, PERFORMANCE=3
const MODES = [
    {
        key: 'ECO',
        label: 'ECO',
        value: '1',
        icon: Leaf,
        description: 'Low energy, gentle lighting',
        accentColor: '#10b981',          // emerald-500
        activeClass: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
        hoverClass: 'hover:bg-emerald-50 hover:text-emerald-600',
        ringClass: 'focus:ring-emerald-400/20',
        gradientFrom: '#10b981',
        gradientTo: '#34d399',
    },
    {
        key: 'STANDARD',
        label: 'STANDARD',
        value: '2',
        icon: Gauge,
        description: 'Balanced brightness & efficiency',
        accentColor: '#f59e0b',          // amber-500
        activeClass: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30',
        hoverClass: 'hover:bg-amber-50 hover:text-amber-600',
        ringClass: 'focus:ring-amber-400/20',
        gradientFrom: '#f59e0b',
        gradientTo: '#fbbf24',
    },
    {
        key: 'PERFORMANCE',
        label: 'PERFORMANCE',
        value: '3',
        icon: Zap,
        description: 'Full power output',
        accentColor: '#f97316',          // orange-500
        activeClass: 'bg-orange-500 text-white shadow-lg shadow-orange-500/30',
        hoverClass: 'hover:bg-orange-50 hover:text-orange-500',
        ringClass: 'focus:ring-orange-400/20',
        gradientFrom: '#f97316',
        gradientTo: '#fb923c',
    },
];

const Dimmer2Control = ({ onUpdate }) => {
    const [activeMode, setActiveMode] = useState('STANDARD');
    const [isLoading, setIsLoading] = useState(false);

    const currentMode = MODES.find(m => m.key === activeMode) || MODES[1];
    const Icon = currentMode.icon;

    const handleModeChange = async (modeKey) => {
        if (isLoading || modeKey === activeMode) return;
        const modeConfig = MODES.find(m => m.key === modeKey);
        if (!modeConfig) return;

        setIsLoading(true);
        const previousMode = activeMode;
        setActiveMode(modeKey);

        try {
            // Write 1 / 2 / 3 to field6
            await updateMultipleFields({ field6: modeConfig.value });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to update Dimmer 2 Mode', error);
            setActiveMode(previousMode);
            alert(`ThingSpeak Update Failed: ${error.message || 'Wait 15s between updates.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="bg-white rounded-[32px] p-6 shadow-sm border-2 border-slate-100 h-full flex flex-col relative overflow-hidden transition-shadow hover:shadow-lg"
            style={{ borderColor: `${currentMode.accentColor}22` }}
        >
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6 z-10 relative">
                <div
                    className="p-4 rounded-2xl shadow-lg text-white transition-all duration-500"
                    style={{
                        background: `linear-gradient(135deg, ${currentMode.gradientFrom}, ${currentMode.gradientTo})`,
                        boxShadow: `0 8px 20px ${currentMode.accentColor}30`,
                    }}
                >
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-slate-800 font-bold text-2xl tracking-wide">Dimmer 2</h3>
                    <p
                        className="text-sm font-semibold mt-0.5 tracking-wide uppercase transition-colors duration-500"
                        style={{ color: currentMode.accentColor }}
                    >
                        {activeMode} Mode
                    </p>
                </div>
            </div>

            {/* Mode Description Badge */}
            <div className="flex items-center gap-3 mb-6 z-10 relative">
                <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-500"
                    style={{
                        backgroundColor: `${currentMode.accentColor}15`,
                        color: currentMode.accentColor,
                    }}
                >
                    {currentMode.description}
                </span>
                {isLoading && (
                    <span className="text-xs text-slate-400 animate-pulse font-medium">Updating…</span>
                )}
            </div>

            {/* Mode Selector Buttons */}
            <div className="flex flex-col gap-3 z-10 relative flex-grow justify-center">
                {MODES.map((m) => {
                    const ModeIcon = m.icon;
                    const isActive = activeMode === m.key;
                    return (
                        <button
                            key={m.key}
                            id={`dimmer2-mode-${m.key.toLowerCase()}`}
                            onClick={() => handleModeChange(m.key)}
                            disabled={isLoading}
                            title={m.description}
                            className={cn(
                                'flex items-center gap-3 w-full px-5 py-4 rounded-2xl text-sm font-bold tracking-wider transition-all duration-300',
                                isActive
                                    ? m.activeClass
                                    : `bg-slate-50 text-slate-400 border-2 border-slate-100 ${m.hoverClass}`,
                                isLoading && !isActive && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <ModeIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-grow text-left">{m.label}</span>
                            {isActive && (
                                <span className="text-[10px] font-black tracking-widest opacity-80 bg-white/20 px-2 py-0.5 rounded-full">
                                    ACTIVE
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Field label note */}
            <p className="text-[10px] text-slate-300 font-medium mt-4 z-10 relative tracking-wide text-right">
                field6 · manual only
            </p>

            {/* Background Blob */}
            <div
                className="absolute -bottom-[20%] right-[-10%] w-[350px] h-[350px] rounded-full blur-3xl pointer-events-none transition-all duration-700"
                style={{ backgroundColor: `${currentMode.accentColor}08` }}
            />
        </div>
    );
};

export default Dimmer2Control;
