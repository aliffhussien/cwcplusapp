export const toStepText = (s: any) => (typeof s === 'string' ? s : s?.instruction || '');

export const normalizeSteps = (steps: any[]) => (steps || []).map(toStepText);

export const normalizeNotes = (notes: any) => {
    if (!notes) return [];
    if (Array.isArray(notes)) return notes.filter(Boolean);
    try { 
        const p = JSON.parse(notes); 
        return Array.isArray(p) ? p.filter(Boolean) : []; 
    } catch { 
        return [notes]; 
    }
};
