import React, { useState, useEffect } from 'react';
import { updateThingSpeakField } from '../api';
import { Power } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const SwitchControl = ({ label, initialState = '0', fieldNumber, onUpdate }) => {
    // initialState represents '1' for ON, '0' for OFF
    const [isOn, setIsOn] = useState(() => String(initialState) === '1');
    const [isLoading, setIsLoading] = useState(false);
    const [lastActionTime, setLastActionTime] = useState(0);

    // Sync with external polling updates
    useEffect(() => {
        // Ignore ThingSpeak polling data if we just pushed an update locally 
        // to prevent UI jittering back to '0' during the queue period.
        if (Date.now() - lastActionTime > 20000) {
            setIsOn(String(initialState) === '1');
        }
    }, [initialState, lastActionTime]);

    const handleToggle = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setLastActionTime(Date.now());
        const newState = !isOn;
        setIsOn(newState); // Optimistic UI update

        try {
            await updateThingSpeakField(fieldNumber, newState ? '1' : '0');
            // Notify parent if needed
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(`Failed to flip switch ${fieldNumber}`, error);
            setIsOn(!newState); // Revert gracefully
            alert(`ThingSpeak Update Failed: ${error.message || "Wait 15s before another update."}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            onClick={handleToggle}
            className={cn(
                "relative group overflow-hidden rounded-[28px] p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44",
                isOn
                    ? "bg-gradient-to-br from-green-500 to-green-600 shadow-xl shadow-green-500/30 text-white"
                    : "bg-white border-2 border-slate-100 shadow-sm hover:shadow-md text-slate-800"
            )}
        >
            <div className="flex justify-between items-start z-10">
                <div className={cn(
                    "p-3.5 rounded-[20px] transition-colors",
                    isOn ? "bg-white/20 text-white border border-white/20" : "bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-slate-100"
                )}>
                    <Power className="w-7 h-7" strokeWidth={2.5} />
                </div>
                {isLoading && (
                    <div className={cn(
                        "w-5 h-5 rounded-full border-[3px] border-t-transparent animate-spin",
                        isOn ? "border-white/50" : "border-slate-300"
                    )} />
                )}
            </div>

            <div className="mt-4 z-10">
                <h3 className={cn("font-bold text-lg tracking-wide", isOn ? "text-white" : "text-slate-700")}>
                    {label}
                </h3>
                <p className={cn("text-[11px] font-bold mt-1.5 uppercase tracking-widest", isOn ? "text-green-100" : "text-slate-400")}>
                    {isOn ? 'ON - ACTIVE' : 'OFF - STANDBY'}
                </p>
            </div>

            {/* Blynk-style shiny effect background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Soft background blob */}
            {isOn && (
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            )}
        </div>
    );
};

export default SwitchControl;
