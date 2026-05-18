import React from 'react';
import { Plus, X } from 'lucide-react';

interface RecipeEditorStepsProps {
    steps: string[];
    updateStep: (idx: number, val: string) => void;
    addStep: () => void;
    removeStep: (idx: number) => void;
}

const inputCls = "bg-glass-bg border border-glass-border rounded-xl px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent/60 transition-colors w-full";

export default function RecipeEditorSteps({ steps, updateStep, addStep, removeStep }: RecipeEditorStepsProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-3">Steps</label>
                <button type="button" onClick={addStep} className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-1 hover:text-text-1 transition-colors">
                    <Plus size={11} /> Add Step
                </button>
            </div>
            <div className="space-y-2">
                {(steps || []).map((step, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                        <div className="w-7 h-7 rounded-full bg-glass-bg flex items-center justify-center text-[10px] font-black text-text-3 shrink-0 mt-2">{idx + 1}</div>
                        <textarea
                            value={step}
                            onChange={e => updateStep(idx, e.target.value)}
                            rows={2}
                            className={`${inputCls} flex-1 resize-none`}
                            placeholder="Describe this step…"
                        />
                        <button type="button" onClick={() => removeStep(idx)} className="w-9 flex items-center justify-center bg-danger/10 text-danger hover:bg-danger hover:text-text-1 rounded-xl transition-colors shrink-0 self-start mt-1" style={{height: '42px'}}>
                            <X size={13} />
                        </button>
                    </div>
                ))}
                {(steps || []).length === 0 && (
                    <p className="text-[10px] text-text-3 text-center py-3 border border-dashed border-glass-border rounded-xl">No steps yet</p>
                )}
            </div>
        </div>
    );
}
