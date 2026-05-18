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
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                active ? 'bg-glass-bg border-accent/50 shadow-lg' : 'bg-transparent border-glass-border hover:border-border'
            }`}
        >
            <div className="flex gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-black mt-0.5 ${
                    active ? 'bg-accent text-text-1' : 'bg-glass-bg text-text-3'
                }`}>
                    {index + 1}
                </div>
                <p className={`text-sm leading-relaxed ${active ? 'text-text-1 font-semibold' : 'text-text-3'}`}>
                    {text}
                </p>
            </div>
        </motion.div>
    );
}
