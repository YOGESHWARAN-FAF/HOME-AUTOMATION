import React, { useState, useEffect } from 'react';
import { updateMultipleFields } from '../api';
import { Settings2, Activity, Percent } from 'lucide-react';

const DimmerControl = ({ field4, field5, onUpdate }) => {
    // field4 -> DIMMER MODE ('1' for Automatic, '0' for Manual)
    // field5 -> DIMMER VALUE (0% to 100%)

    // Convert incoming states
    const [mode, setMode] = useState(() => {
        if (field4 === '1') return 'Automatic';
        if (field4 === '0') return 'Manual';
        return 'Automatic';
    });

    // Value could be string '0' to '100'
    const [dimmerValue, setDimmerValue] = useState(() => {
        const val = parseInt(field5);
        return isNaN(val) ? 0 : val;
    });

    const [isLoading, setIsLoading] = useState(false);

    // For debouncing slider
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
        // Optimistic UI Update
        const previousMode = mode;
        setMode(newMode);

        try {
            const apiMode = newMode === 'Automatic' ? '1' : '0';
            await updateMultipleFields({ field4: apiMode });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update Mode", error);
            setMode(previousMode);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSliderChange = (e) => {
        setSliderValue(e.target.value);
    };

    const handleSliderRelease = async () => {
        if (isLoading || mode !== 'Manual' || sliderValue === dimmerValue) return;

        setIsLoading(true);
        const prevValue = dimmerValue;
        setDimmerValue(sliderValue);

        try {
            await updateMultipleFields({ field5: sliderValue.toString() });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update Dimmer Value", error);
            setDimmerValue(prevValue);
            setSliderValue(prevValue);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md h-full flex flex-col justify-between">
            <div className="flex items-center space-x-3 mb-6">
                <div className="bg-yellow-100 p-2 rounded-lg">
                    <Settings2 className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                    <h3 className="text-slate-800 font-semibold text-xl">AC Light Dimmer</h3>
                    <p className="text-slate-400 text-sm">Operation Mode</p>
                </div>
            </div>

            {/* Mode Selection */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                <button
                    onClick={() => handleModeChange('Automatic')}
                    className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${mode === 'Automatic'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Automatic
                </button>
                <button
                    onClick={() => handleModeChange('Manual')}
                    className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${mode === 'Manual'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Manual
                </button>
            </div>

            {/* Slider Control Container */}
            <div className="flex-grow flex flex-col justify-end">
                {mode === 'Manual' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-medium text-slate-500">Dimmer Level</p>
                            <div className="flex items-center text-yellow-600 font-bold bg-yellow-100 px-3 py-1 rounded-full">
                                <span>{sliderValue}</span>
                                <Percent className="w-3 h-3 ml-0.5" />
                            </div>
                        </div>

                        <div className="relative pt-2 pb-2">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={sliderValue}
                                onChange={handleSliderChange}
                                onMouseUp={handleSliderRelease}
                                onTouchEnd={handleSliderRelease}
                                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-2">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    </div>
                )}

                {mode === 'Automatic' && (
                    <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 animate-in fade-in duration-300">
                        <Activity className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">Dimmer is being managed automatically</p>
                        <p className="text-xs text-slate-400 mt-1">Manual controls are disabled</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DimmerControl;
