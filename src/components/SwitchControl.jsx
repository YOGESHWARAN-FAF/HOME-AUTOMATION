import React, { useState } from 'react';
import { updateThingSpeakField } from '../api';
import { Power } from 'lucide-react';

const SwitchControl = ({ label, initialState = '0', fieldNumber, onUpdate }) => {
    // initialState represents '1' for ON, '0' for OFF or whatever standard you use.
    // '1' or 1 -> true, '0' or 0 -> false
    const [isOn, setIsOn] = useState(() => String(initialState) === '1');
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        const newState = !isOn;
        // Optimistic UI update
        setIsOn(newState);

        try {
            await updateThingSpeakField(fieldNumber, newState ? '1' : '0');
            // If we want to notify parent or trigger a local refresh
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(`Failed to flip switch ${fieldNumber}`, error);
            // Revert state if failed
            setIsOn(!newState);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
            <div>
                <h3 className="text-slate-800 font-semibold text-lg">{label}</h3>
                <p className="text-slate-400 text-sm mt-1">{isOn ? 'Currently ON' : 'Currently OFF'}</p>
            </div>
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`relative inline-flex h-12 w-24 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${isOn ? 'bg-green-500' : 'bg-slate-300'
                    } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                role="switch"
                aria-checked={isOn}
            >
                <span className="sr-only">Toggle {label}</span>
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-flex h-11 w-11 items-center justify-center transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${isOn ? 'translate-x-12' : 'translate-x-0'
                        }`}
                >
                    <Power className={`w-6 h-6 ${isOn ? 'text-green-500' : 'text-slate-400'}`} />
                </span>
            </button>
        </div>
    );
};

export default SwitchControl;
