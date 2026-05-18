import React from 'react';

interface IngredientLineProps {
    name: string;
    amount?: number | string;
    unit?: string;
    ratio: number;
}

function parseFraction(str: string): number {
    if (!str) return 0;
    let val = str.trim();
    
    const unicodeMap: { [key: string]: number } = {
        '½': 0.5,
        '¼': 0.25,
        '¾': 0.75,
        '⅓': 0.33,
        '⅔': 0.67,
        '⅛': 0.125
    };
    
    let total = 0;
    // Extract unicode fraction characters
    for (const char of Array.from(val)) {
        if (unicodeMap[char] !== undefined) {
            total += unicodeMap[char];
            val = val.replace(char, '').trim();
        }
    }
    
    if (val) {
        if (val.includes('/')) {
            const parts = val.split('/');
            if (parts.length === 2) {
                const num = parseFloat(parts[0]);
                const den = parseFloat(parts[1]);
                if (!isNaN(num) && !isNaN(den) && den !== 0) {
                    total += num / den;
                }
            }
        } else {
            const parsed = parseFloat(val);
            if (!isNaN(parsed)) {
                total += parsed;
            }
        }
    }
    return total;
}

function formatFraction(num: number): string {
    const integerPart = Math.floor(num);
    const decimalPart = num - integerPart;
    const eps = 0.05;
    let fractionStr = '';
    
    if (Math.abs(decimalPart - 0.5) < eps) fractionStr = '½';
    else if (Math.abs(decimalPart - 0.25) < eps) fractionStr = '¼';
    else if (Math.abs(decimalPart - 0.75) < eps) fractionStr = '¾';
    else if (Math.abs(decimalPart - 0.33) < eps) fractionStr = '⅓';
    else if (Math.abs(decimalPart - 0.67) < eps) fractionStr = '⅔';
    else if (Math.abs(decimalPart - 0.125) < eps) fractionStr = '⅛';
    else if (decimalPart > 0) {
        return num.toFixed(1).replace(/\.0$/, '');
    }
    
    if (integerPart > 0) {
        return fractionStr ? `${integerPart}${fractionStr}` : `${integerPart}`;
    }
    return fractionStr || '';
}

function scaleAmount(amount: number | string | undefined, ratio: number): string {
    if (amount === undefined || amount === null || amount === '') return '';
    const amountStr = String(amount).trim();
    
    // Check if it's a range like "1-2" or "⅓-½"
    const rangeParts = amountStr.split(/[\-–—]/);
    if (rangeParts.length === 2) {
        const p1 = parseFraction(rangeParts[0]);
        const p2 = parseFraction(rangeParts[1]);
        if (p1 > 0 && p2 > 0) {
            return `${formatFraction(p1 * ratio)}–${formatFraction(p2 * ratio)}`;
        }
    }
    
    const parsed = parseFraction(amountStr);
    if (parsed > 0) {
        return formatFraction(parsed * ratio);
    }
    
    return amountStr;
}

export default function IngredientLine({ name, amount, unit, ratio }: IngredientLineProps) {
    const calcAmount = scaleAmount(amount, ratio);
    const hasAmount = calcAmount && calcAmount !== '0';

    return (
        <div className="flex justify-between items-center py-3 border-b border-glass-border last:border-0 hover:bg-glass-bg/10 px-2 transition-all duration-300 rounded-lg">
            <span className="text-sm font-medium text-text-1 capitalize tracking-wide leading-relaxed">{name}</span>
            <div className="flex items-baseline gap-1 shrink-0 ml-4 bg-glass-bg/30 px-2.5 py-1 rounded-lg border border-glass-border/30 shadow-sm">
                {hasAmount && <span className="text-xs font-black text-accent">{calcAmount}</span>}
                {unit && <span className="text-[9px] font-black uppercase tracking-widest text-text-3">{unit}</span>}
            </div>
        </div>
    );
}
