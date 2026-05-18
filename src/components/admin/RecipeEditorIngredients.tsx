import React from 'react';
import { Plus, X } from 'lucide-react';

interface RecipeEditorIngredientsProps {
    ingredients: any[];
    updateIngredient: (idx: number, field: string, val: string) => void;
    addIngredient: () => void;
    removeIngredient: (idx: number) => void;
}

const inputCls = "bg-glass-bg border border-glass-border rounded-xl px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent/60 transition-colors w-full";

export default function RecipeEditorIngredients({ ingredients, updateIngredient, addIngredient, removeIngredient }: RecipeEditorIngredientsProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-3">Ingredients</label>
                <button type="button" onClick={addIngredient} className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-1 hover:text-text-1 transition-colors">
                    <Plus size={11} /> Add
                </button>
            </div>
            <div className="space-y-2">
                {(ingredients || []).map((ing, idx) => (
                    <div key={idx} className="flex gap-2">
                        <input
                            value={ing.name || ''}
                            onChange={e => updateIngredient(idx, 'name', e.target.value)}
                            className={`${inputCls} flex-1`}
                            placeholder="Ingredient"
                        />
                        <input
                            value={ing.amount || ''}
                            onChange={e => updateIngredient(idx, 'amount', e.target.value)}
                            className={`${inputCls} w-20`}
                            placeholder="Qty"
                        />
                        <input
                            value={ing.unit || ''}
                            onChange={e => updateIngredient(idx, 'unit', e.target.value)}
                            className={`${inputCls} w-14`}
                            placeholder="Unit"
                        />
                        <button type="button" onClick={() => removeIngredient(idx)} className="w-9 flex items-center justify-center bg-danger/10 text-danger hover:bg-danger hover:text-text-1 rounded-xl transition-colors shrink-0">
                            <X size={13} />
                        </button>
                    </div>
                ))}
                {(ingredients || []).length === 0 && (
                    <p className="text-[10px] text-text-3 text-center py-3 border border-dashed border-glass-border rounded-xl">No ingredients yet</p>
                )}
            </div>
        </div>
    );
}
