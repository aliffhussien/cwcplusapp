import React from 'react';

interface IngredientLineProps {
    name: string;
    amount?: number | string;
    unit?: string;
    ratio: number;
}

export default function IngredientLine({ name, amount, unit, ratio }: IngredientLineProps) {
    const calcAmount = amount ? (Number(amount) * ratio).toFixed(1).replace(/\.0$/, '') : '';
    return (
        <div className="flex justify-between items-center py-3 border-b border-glass-border last:border-0 px-1">
            <span className="text-sm font-medium text-text-1 capitalize">{name}</span>
            <div className="flex items-center gap-1.5 shrink-0 ml-4">
                <span className="text-sm font-black text-accent">{calcAmount}</span>
                {unit && <span className="text-[9px] font-bold uppercase tracking-widest text-text-3">{unit}</span>}
            </div>
        </div>
    );
}
