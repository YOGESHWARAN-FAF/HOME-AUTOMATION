import React, { useState, useEffect } from 'react';
import { updateMultipleFields } from '../api';
import { Settings2, Activity, Percent } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const DimmerControl = ({ field4, field5, onUpdate }) => {
    // Convert incoming states
    const [mode, setMode] = useState(() => {
        if (field4 === '1') return 'Automatic';
        if (field4 === '0') return 'Manual';
        return 'Automatic';
    });

    const [dimmerValue, setDimmerValue] = useState(() => {
        const val = parseInt(field5);
        return isNaN(val) ? 0 : val;
    });

    const [isLoading, setIsLoading] = useState(false);
    const [sliderValue, setSliderValue] = useState(dimmerValue);

    // Sync external props correctly
    useEffect(() => {
        if (field4 === '1') setMode('Automatic');
        else if (field4 === '0') setMode('Manual');

        const val = parseInt(field5);
        if (!isNaN(val)) {
            setDimmerValue(val);
            setSliderValue(val);
        }
    }, [field4, field5]);

    const handleModeChange = async (newMode) => {
        if (isLoading || newMode === mode) return;
        setIsLoading(true);
        const previousMode = mode;
        setMode(newMode);

        try {
            const apiMode = newMode === 'Automatic' ? '1' : '0';
            await updateMultipleFields({ field4: apiMode });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update Mode", error);
            setMode(previousMode);
            alert(`ThingSpeak Update Failed: ${error.message || "Wait 15s between updates."}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSliderChange = (e) => {
        setSliderValue(e.target.value);
    };

    const handleSliderRelease = async () => {
        const val = parseInt(sliderValue);
        if (isLoading || mode !== 'Manual' || val === dimmerValue) return;

        setIsLoading(true);
        const prevValue = dimmerValue;
        setDimmerValue(val);

        try {
            await updateMultipleFields({ field5: val.toString() });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update Dimmer Value", error);
            setDimmerValue(prevValue);
            setSliderValue(prevValue);
            alert(`ThingSpeak Update Failed: ${error.message || "Wait 15s between updates."}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-sm border-2 border-slate-100 h-full flex flex-col justify-between col-span-1 lg:col-span-2 relative overflow-hidden transition-shadow hover:shadow-lg">

            {/* Header Configuration Panel */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 z-10 relative">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-4 rounded-2xl shadow-lg shadow-yellow-500/20 text-white">
                        <Settings2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-slate-800 font-bold text-2xl tracking-wide">Dimmer</h3>
                        <p className="text-slate-400 text-sm font-semibold mt-0.5 tracking-wide uppercase">{mode} Active</p>
                    </div>
                </div>

                {/* Switch Toggle Tab Group Style */}
                <div className="flex bg-slate-100/80 p-[5px] rounded-2xl self-stretch">
                    <button
                        onClick={() => handleModeChange('Automatic')}
                        className={cn(
                            "px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 tracking-wider",
                            mode === 'Automatic'
                                ? "bg-white text-yellow-600 shadow-sm shadow-slate-200"
                                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                        )}
                    >
                        AUTO
                    </button>
                    <button
                        onClick={() => handleModeChange('Manual')}
                        className={cn(
                            "px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 tracking-wider",
                            mode === 'Manual'
                                ? "bg-white text-yellow-600 shadow-sm shadow-slate-200"
                                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                        )}
                    >
                        MANUAL
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow flex flex-col justify-center z-10 relative mt-2 pt-4 px-2">
                {mode === 'Manual' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex justify-between items-end mb-6">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Intensity Level</span>
                            <div className="text-6xl font-black text-yellow-500 flex items-start -mr-2 drop-shadow-sm">
                                {sliderValue}
                                <span className="text-2xl mt-2 text-yellow-500/80">%</span>
                            </div>
                        </div>

                        {/* Native Range Slider - Styled like Blynk Big Controls */}
                        <div className="relative w-full py-6 group flex items-center">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={sliderValue}
                                onChange={handleSliderChange}
                                onMouseUp={handleSliderRelease}
                                onTouchEnd={handleSliderRelease}
                                className={cn(
                                    "w-full h-8 rounded-[16px] appearance-none cursor-pointer outline-none transition-all duration-300",
                                    "focus:ring-[6px] focus:ring-yellow-400/20 active:scale-[0.99] active:shadow-inner",
                                    "slider-thumb-blynk"
                                )}
                                style={{
                                    background: `linear-gradient(to right, #facc15 ${sliderValue}%, #f1f5f9 ${sliderValue}%)`,
                                    boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
                                }}
                            />
                        </div>
                    </div>
                )}

                {mode === 'Automatic' && (
                    <div className="py-10 flex flex-col items-center justify-center animate-in fade-in duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-slate-200/50 rounded-full animate-ping opacity-70"></div>
                            <div className="bg-slate-50 p-6 rounded-full border-4 border-slate-100 relative">
                                <Activity className="w-10 h-10 text-slate-400" />
                            </div>
                        </div>
                        <p className="text-slate-500 mt-6 font-semibold tracking-wide text-center">
                            Dimmer bounded to Automatic Sensor Engine.
                        </p>
                        <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-bold">Manual override disabled</p>
                    </div>
                )}
            </div>

            {/* Background Blob Effect */}
            <div className="absolute -bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-yellow-400/[0.03] rounded-full blur-3xl pointer-events-none" />
        </div>
    );
};

export default DimmerControl;
