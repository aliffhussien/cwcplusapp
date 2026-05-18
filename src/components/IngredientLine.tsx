import React from 'react';

interface IngredientLineProps {
    name: string;
    amount?: number | string;
    unit?: string;
    ratio: number;
    isSection?: boolean;
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

// Detect legacy section headers stored as regular ingredients (pre-engine imports).
// These are ALL CAPS names with no digits, no unit, and a non-numeric amount
// e.g. { name: "BAHAN UTAMA", amount: "secukupnya", unit: "" }
const NON_NUMERIC_AMOUNTS = /^(secukupnya|secukup\s+rasa|ikut\s+(?:citarasa|selera)|sedikit|pilihan|optional)$/i;

function isLegacySection(name: string, amount: number | string | undefined, unit: string | undefined): boolean {
    if (unit) return false;                              // real ingredients have units
    if (!/[A-Z]/.test(name)) return false;              // must have uppercase
    if (name !== name.toUpperCase()) return false;       // must be ALL CAPS
    if (/\d/.test(name)) return false;                  // no digits in section names
    if (name.trim().length < 3) return false;
    // Amount must be absent or a non-numeric qualifier
    const amtStr = String(amount ?? '').trim();
    if (amtStr && !NON_NUMERIC_AMOUNTS.test(amtStr)) return false;
    return true;
}

export default function IngredientLine({ name, amount, unit, ratio, isSection }: IngredientLineProps) {
    // Explicit section flag (new engine data) OR legacy ALL-CAPS section (old data)
    if (isSection || isLegacySection(name, amount, unit)) {
        return (
            <div className="pt-4 pb-1 first:pt-0">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-3">{name}</p>
            </div>
        );
    }

    const calcAmount = scaleAmount(amount, ratio);
    const hasAmount  = calcAmount && calcAmount !== '0';
    const showBadge  = hasAmount || !!unit;

    return (
        <div className="flex justify-between items-center py-3 border-b border-glass-border last:border-0 hover:bg-glass-bg/10 px-2 transition-all duration-300 rounded-lg">
            <span className="text-sm font-medium text-text-1 capitalize tracking-wide leading-relaxed">{name}</span>
            {showBadge && (
                <div className="flex items-baseline gap-1 shrink-0 ml-4 bg-glass-bg/30 px-2.5 py-1 rounded-lg border border-glass-border/30 shadow-sm">
                    {hasAmount && <span className="text-xs font-black text-accent">{calcAmount}</span>}
                    {unit && <span className="text-[9px] font-black uppercase tracking-widest text-text-3">{unit}</span>}
                </div>
            )}
        </div>
    );
}
