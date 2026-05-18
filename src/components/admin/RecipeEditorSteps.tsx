import React from 'react';
import { Plus, X, Heading2 } from 'lucide-react';

interface RecipeEditorStepsProps {
    steps: string[];
    updateStep: (idx: number, val: string) => void;
    addStep: () => void;
    addSubtitle: () => void;
    removeStep: (idx: number) => void;
}

const SUBTITLE_RE = /^──\s*.+\s*──$/;

function isSubtitle(s: string) {
    return SUBTITLE_RE.test(s.trim());
}

function getSubtitleText(s: string) {
    return s.trim().replace(/^──\s*|\s*──$/g, '');
}

const inputCls = "bg-glass-bg border border-glass-border rounded-xl px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent/60 transition-colors w-full";

export default function RecipeEditorSteps({ steps, updateStep, addStep, addSubtitle, removeStep }: RecipeEditorStepsProps) {
    // Sequential numbering — subtitles don't count
    let stepCounter = 0;
    const numbered = (steps || []).map(s => {
        const sub = isSubtitle(s);
        if (!sub) stepCounter++;
        return { text: s, isSub: sub, num: sub ? null : stepCounter };
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-3">Langkah</label>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={addSubtitle}
                        className="text-[9px] font-black uppercase tracking-widest text-accent-sec flex items-center gap-1 hover:text-text-1 transition-colors"
                    >
                        <Heading2 size={11} /> Add Subtitle
                    </button>
                    <span className="text-glass-border">|</span>
                    <button
                        type="button"
                        onClick={addStep}
                        className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-1 hover:text-text-1 transition-colors"
                    >
                        <Plus size={11} /> Add Step
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {numbered.map(({ text, isSub, num }, idx) =>
                    isSub ? (
                        // ── Subtitle row ──
                        <div key={idx} className="flex gap-2 items-center">
                            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center shrink-0">
                                <Heading2 size={11} className="text-accent" />
                            </div>
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/50 text-sm font-black pointer-events-none select-none">──</span>
                                <input
                                    type="text"
                                    value={getSubtitleText(text)}
                                    onChange={e => updateStep(idx, `── ${e.target.value} ──`)}
                                    className="bg-accent/5 border border-accent/25 rounded-xl pl-10 pr-10 py-2.5 text-sm font-black text-accent italic outline-none focus:border-accent/60 transition-colors w-full tracking-wide"
                                    placeholder="Nama seksyen…"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-accent/50 text-sm font-black pointer-events-none select-none">──</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeStep(idx)}
                                className="w-9 flex items-center justify-center bg-danger/10 text-danger hover:bg-danger hover:text-text-1 rounded-xl transition-colors shrink-0"
                                style={{ height: '42px' }}
                            >
                                <X size={13} />
                            </button>
                        </div>
                    ) : (
                        // Regular step row
                        <div key={idx} className="flex gap-2 items-start">
                            <div className="w-7 h-7 rounded-full bg-glass-bg flex items-center justify-center text-[10px] font-black text-text-3 shrink-0 mt-2">
                                {num}
                            </div>
                            <textarea
                                value={text}
                                onChange={e => updateStep(idx, e.target.value)}
                                rows={2}
                                className={`${inputCls} flex-1 resize-none`}
                                placeholder="Terangkan langkah ini…"
                            />
                            <button
                                type="button"
                                onClick={() => removeStep(idx)}
                                className="w-9 flex items-center justify-center bg-danger/10 text-danger hover:bg-danger hover:text-text-1 rounded-xl transition-colors shrink-0 self-start mt-1"
                                style={{ height: '42px' }}
                            >
                                <X size={13} />
                            </button>
                        </div>
                    )
                )}

                {(steps || []).length === 0 && (
                    <p className="text-[10px] text-text-3 text-center py-3 border border-dashed border-glass-border rounded-xl">
                        Tiada langkah lagi
                    </p>
                )}
            </div>
        </div>
    );
}
