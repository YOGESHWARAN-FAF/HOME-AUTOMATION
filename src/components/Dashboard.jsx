import React, { useEffect, useState, useCallback } from 'react';
import { fetchThingSpeakData } from '../api';
import SwitchControl from './SwitchControl';
import DimmerControl from './DimmerControl';
import SensorCard from './SensorCard';
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadData = useCallback(async () => {
        try {
            setError(null);
            const feed = await fetchThingSpeakData();
            if (feed) {
                setData(feed);
                setLastUpdated(new Date());
            } else {
                setError("No data received from ThingSpeak");
            }
        } catch (err) {
            setError("Connection to ThingSpeak failed");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initial load
        loadData();

        // Polling every 10 seconds
        const intervalId = setInterval(loadData, 10000);
        return () => clearInterval(intervalId);
    }, [loadData]);

    const handleManualRefresh = () => {
        setLoading(true);
        loadData();
    };

    const isConnected = !error && data !== null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            {/* Header Section */}
            <header className="bg-white sticky top-0 z-10 shadow-sm border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
                            SmartIoT Dashboard
                        </h1>
                        <p className="text-sm text-slate-500 hidden sm:block">Home Automation Control Center</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 text-sm font-medium px-3 py-1.5 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                            <span className="hidden sm:inline">{isConnected ? 'Connected' : 'Offline'}</span>
                        </div>
                        <button
                            onClick={handleManualRefresh}
                            className={`p-2 rounded-full hover:bg-slate-100 transition-all ${loading ? 'animate-spin text-green-600' : 'text-slate-500'}`}
                            aria-label="Refresh Data"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start space-x-3 mb-6">
                        <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-red-800 font-medium">Connection Error</h3>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Dashboard grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Switches & Dimmer */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Device Controls - Switches */}
                        <section aria-label="Switch Controls">
                            <div className="flex items-center justify-between mb-4 mt-2">
                                <h2 className="text-xl font-bold text-slate-800">Device Controls</h2>
                                {lastUpdated && (
                                    <span className="text-xs text-slate-400">
                                        Last sync: {lastUpdated.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <SwitchControl
                                    id="switch-1"
                                    fieldNumber={1}
                                    label="Switch 1"
                                    initialState={data?.field1}
                                    onUpdate={handleManualRefresh}
                                />
                                <SwitchControl
                                    id="switch-2"
                                    fieldNumber={2}
                                    label="Switch 2"
                                    initialState={data?.field2}
                                    onUpdate={handleManualRefresh}
                                />
                                <SwitchControl
                                    id="switch-3"
                                    fieldNumber={3}
                                    label="Switch 3"
                                    initialState={data?.field3}
                                    onUpdate={handleManualRefresh}
                                />
                            </div>
                        </section>

                        {/* Dimmer Control */}
                        <section aria-label="Dimmer Controls">
                            <DimmerControl
                                field4={data?.field4}
                                field5={data?.field5}
                                onUpdate={handleManualRefresh}
                            />
                        </section>
                    </div>

                    {/* Right Column: Sensors */}
                    <div className="space-y-8">
                        <section aria-label="Sensor Monitoring">
                            <h2 className="text-xl font-bold text-slate-800 mb-4 mt-2">Environment Sensors</h2>
                            <div className="flex flex-col space-y-4">
                                <SensorCard
                                    title="LDR Sensor"
                                    type="ldr"
                                    value={data?.field6}
                                    suffix="lux"
                                />
                                <SensorCard
                                    title="Motion Sensor"
                                    type="motion"
                                    value={data?.field7}
                                    suffix="count"
                                />
                            </div>
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;
