import { useState, useEffect } from 'react';

export function useDevicePerformance() {
    const [performanceMode, setPerformanceMode] = useState<'high' | 'economy'>('high');

    useEffect(() => {
        const checkHardware = () => {
            const nav = navigator as any;
            const ram = nav.deviceMemory || 4; 
            const cores = navigator.hardwareConcurrency || 4;
            
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
        adaptive: <T>(highValue: T, economyValue: T): T => 
            performanceMode === 'economy' ? economyValue : highValue
    };
}
