import React from 'react';
import { motion } from 'framer-motion';
import { toStepText } from '../lib/recipeUtils';

interface StepItemProps {
    step: any;
    index: number;
    active: boolean;
    onClick: () => void;
}

export default function StepItem({ step, index, active, onClick }: StepItemProps) {
    const text = toStepText(step);
    return (
        <motion.div
            layout
            onClick={onClick}
            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                active 
                    ? 'bg-glass-bg border-accent/50 shadow-2xl scale-[1.01]' 
                    : 'bg-glass-bg/10 border-glass-border hover:bg-glass-bg/25 hover:border-glass-border-hover'
            }`}
        >
            <div className="flex gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black transition-all duration-300 shadow-md ${
                    active ? 'bg-accent text-text-1 scale-110' : 'bg-glass-bg border border-glass-border text-text-3'
                }`}>
                    {index + 1}
                </div>
                <p className={`text-sm leading-relaxed transition-colors duration-300 mt-1 ${
                    active ? 'text-text-1 font-semibold' : 'text-text-2'
                }`}>
                    {text}
                </p>
            </div>
        </motion.div>
    );
}
