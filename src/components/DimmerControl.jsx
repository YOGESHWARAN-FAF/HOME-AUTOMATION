import React, { useState } from 'react';
import { updateMultipleFields } from '../api';
import { Settings2, Zap, Leaf, Activity } from 'lucide-react';

const DimmerControl = ({ field4, field5, onUpdate }) => {
    // field4 -> DIMMER MODE ('Automatic' or 'Manual')
    // field5 -> DIMMER VALUE ('ECO', 'STANDARD', 'PERFORMANCE')
    const [mode, setMode] = useState(field4 || 'Automatic');
    const [performanceMode, setPerformanceMode] = useState(field5 || 'STANDARD');
    const [isLoading, setIsLoading] = useState(false);

    const handleModeChange = async (newMode) => {
        if (isLoading || newMode === mode) return;
        setIsLoading(true);
        // Optimistic UI Update
        const previousMode = mode;
        setMode(newMode);

        try {
            await updateMultipleFields({ field4: newMode });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update Mode", error);
            setMode(previousMode);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePerformanceChange = async (newPerfMode) => {
        if (isLoading || mode !== 'Manual' || newPerfMode === performanceMode) return;
        setIsLoading(true);
        // Optimistic UI Update
        const previousPerfMode = performanceMode;
        setPerformanceMode(newPerfMode);

        try {
            // Update only Field 5 as Mode is already "Manual"
            await updateMultipleFields({ field5: newPerfMode });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update Performance Mode", error);
            setPerformanceMode(previousPerfMode);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md h-full">
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

            {/* Performance Modes - Only visible when in Manual */}
            {mode === 'Manual' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <p className="text-sm font-medium text-slate-500 mb-2">Select Performance Mode</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <ModernButton
                            icon={<Leaf className="w-5 h-5 text-green-700" />}
                            label="ECO"
                            isActive={performanceMode === 'ECO'}
                            onClick={() => handlePerformanceChange('ECO')}
                        />
                        <ModernButton
                            icon={<Activity className="w-5 h-5 text-blue-700" />}
                            label="STANDARD"
                            isActive={performanceMode === 'STANDARD'}
                            onClick={() => handlePerformanceChange('STANDARD')}
                        />
                        <ModernButton
                            icon={<Zap className="w-5 h-5 text-yellow-700" />}
                            label="PERFORMANCE"
                            isActive={performanceMode === 'PERFORMANCE'}
                            onClick={() => handlePerformanceChange('PERFORMANCE')}
                        />
                    </div>
                </div>
            )}
            {mode === 'Automatic' && (
                <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100 animate-in fade-in duration-300">
                    <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500">System is managing AC Light Dimmer automatically based on sensors.</p>
                </div>
            )}
        </div>
    );
};

const ModernButton = ({ icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all ${isActive
                    ? 'border-yellow-400 bg-yellow-50 shadow-sm'
                    : 'border-slate-100 bg-white hover:border-yellow-200 hover:bg-slate-50 text-slate-400'
                }`}
        >
            <div className={`p-2 rounded-full mb-2 ${isActive ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                {icon}
            </div>
            <span className={`text-xs font-bold leading-none uppercase tracking-wider ${isActive ? 'text-slate-800' : 'text-slate-500'
                }`}>{label}</span>
        </button>
    );
};

export default DimmerControl;
