import { useState, useEffect } from 'react';

/**
 * Senior Performance Engineer Implementation: Adaptive UI Controller
 * Detects device capabilities to enforce the 1GB RAM Rule.
 */
export function useDevicePerformance() {
    const [performanceMode, setPerformanceMode] = useState('high'); // 'high' | 'economy'

    useEffect(() => {
        const checkHardware = () => {
            // Navigator.deviceMemory returns RAM in GB. 
            // Budget devices usually report <= 2GB.
            const ram = navigator.deviceMemory || 4; 
            const cores = navigator.hardwareConcurrency || 4;
            
            // Economy mode triggers on:
            // 1. Devices with <= 2GB RAM
            // 2. Devices with <= 2 CPU cores
            // 3. User preference for reduced motion
            const motionPref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const isLowEnd = ram <= 2 || cores <= 2;

            if (isLowEnd || motionPref) {
                setPerformanceMode('economy');
                document.documentElement.setAttribute('data-performance', 'economy');
            } else {
                setPerformanceMode('high');
                document.documentElement.setAttribute('data-performance', 'high');
            }
        };

        checkHardware();
    }, []);

    return {
        isLowEnd: performanceMode === 'economy',
        performanceMode,
        // Utility for inline conditional styles
        adaptive: (highValue, economyValue) => 
            performanceMode === 'economy' ? economyValue : highValue
    };
}
