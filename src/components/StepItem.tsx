import React from 'react';
import { motion } from 'framer-motion';
import { toStepText } from '../lib/recipeUtils';

interface StepItemProps {
    step: any;
    index: number;
    stepNumber?: number;
    active: boolean;
    onClick: () => void;
}

export default function StepItem({ step, index, stepNumber, active, onClick }: StepItemProps) {
    const text = toStepText(step);
    const isSection = text.startsWith('──') && text.endsWith('──');

    if (isSection) {
        const cleanTitle = text.replace(/^──\s*|\s*──$/g, '');
        return (
            <div className="pt-6 pb-2 first:pt-2 px-1">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-accent italic">
                    {cleanTitle}
                </h4>
            </div>
        );
    }

    const displayNum = stepNumber !== undefined ? stepNumber : index + 1;

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
                    {displayNum}
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
