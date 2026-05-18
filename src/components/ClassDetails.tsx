import React from 'react';
import { motion } from 'framer-motion';
import { Star, Info, FileText, Download, ChevronRight, ShoppingBag, ListChecks } from 'lucide-react';
import { APP_COPY } from '../config/appCopy';

interface ClassDetailsProps {
    selectedClass: any;
    userHasAccess: boolean;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function ClassDetails({ selectedClass, userHasAccess, activeTab, setActiveTab }: ClassDetailsProps) {
    return (
        <div className="relative z-30 max-w-[1400px] w-full mx-auto px-6 md:px-12 -mt-16 md:-mt-24 pb-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-black uppercase text-accent-sec tracking-widest bg-accent/10 px-2 py-1 rounded-sm border border-accent/20">{selectedClass.category || APP_COPY.classesPage.badge}</span>
                        <span className="section-label">{selectedClass.duration || 'Join Us'}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-text-1 italic tracking-tighter mb-4 leading-none uppercase drop-shadow-2xl">{selectedClass.title}</h1>
                    <p className="text-text-2 text-sm md:text-base leading-relaxed font-medium">
                        Join <span className="text-text-1 font-bold">{selectedClass.instructor}</span> in this fun cooking class as we learn simple skills to make delicious meals at home.
                    </p>
                </div>
                <div className="flex shrink-0">
                    <button className="w-12 h-12 bg-glass-bg hover:bg-elevated rounded-full flex items-center justify-center border border-glass-border transition-all group">
                        <Star size={20} className="text-text-1 group-hover:text-warning transition-colors" />
                    </button>
                </div>
            </div>

            {userHasAccess && (
                <div className="border-b border-glass-border mb-8 flex gap-8 overflow-x-auto custom-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {[
                        { id: 'video', label: APP_COPY.recipeView.tabs.intel || 'Class Tips' },
                        { id: 'ingredients', label: APP_COPY.recipeView.tabs.sourcing || 'Ingredients' },
                        { id: 'steps', label: APP_COPY.recipeView.tabs.execution || 'Recipe Steps' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-colors relative ${activeTab === tab.id ? 'text-text-1' : 'text-text-3 hover:text-text-1'}`}
                        >
                            {tab.label}
                            {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-1 bg-accent rounded-t-full" />}
                        </button>
                    ))}
                </div>
            )}

            {userHasAccess && (
                <div className="min-h-[400px]">
                    {activeTab === 'video' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
                            <div className="lg:col-span-2 space-y-6">
                                <h3 className="text-xl font-black text-text-1 italic tracking-tight uppercase mb-4">Kitchen Tips</h3>
                                {selectedClass.notes ? (
                                    <div className="space-y-4">
                                        {(() => {
                                            let notes = [];
                                            try { notes = typeof selectedClass.notes === 'string' ? JSON.parse(selectedClass.notes) : selectedClass.notes; } 
                                            catch (e) { notes = [selectedClass.notes]; }
                                            return Array.isArray(notes) ? notes.map((note, i) => (
                                                <div key={i} className="p-6 rounded-xl bg-surface border border-glass-border flex gap-4">
                                                    <Info size={24} className="text-text-3 shrink-0" />
                                                    <p className="text-sm text-text-2 leading-relaxed">{note}</p>
                                                </div>
                                            )) : null;
                                        })()}
                                    </div>
                                ) : <p className="text-text-3 text-sm">No class notes available.</p>}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-text-1 italic tracking-tight uppercase mb-4">Attachments</h3>
                                <div className="space-y-3">
                                    {(selectedClass.attachments || []).map((att: any, i: number) => (
                                        <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-surface rounded-xl border border-glass-border hover:border-accent/50 hover:bg-glass-bg transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-accent/20 rounded-full text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-text-1 transition-colors">
                                                    {att.url.toLowerCase().endsWith('.pdf') ? <FileText size={18} /> : <Download size={18} />}
                                                </div>
                                                <span className="text-sm font-bold text-text-1 tracking-tight">{att.title}</span>
                                            </div>
                                            <ChevronRight size={18} className="text-text-3 group-hover:text-text-1 group-hover:translate-x-1 transition-all" />
                                        </a>
                                    ))}
                                    {(!selectedClass.attachments || selectedClass.attachments.length === 0) && (
                                        <div className="p-8 text-center bg-glass-bg border border-glass-border rounded-xl">
                                            <p className="section-label">No Digital Resources</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'ingredients' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {selectedClass.ingredients && selectedClass.ingredients.length > 0 ? selectedClass.ingredients.map((ing: any, i: number) => (
                                <div key={i} className="bg-surface p-5 rounded-xl border border-glass-border flex flex-col justify-between group hover:border-accent/30 transition-all h-24">
                                    <span className="text-xs font-black text-accent-sec px-2 py-1 bg-accent/10 rounded-md self-start">{ing.amount}</span>
                                    <span className="text-sm font-bold text-text-1 tracking-tight mt-auto">{ing.name}</span>
                                </div>
                            )) : (
                                <div className="col-span-full py-12 text-center flex flex-col items-center justify-center border border-glass-border bg-glass-bg rounded-xl">
                                    <ShoppingBag size={32} className="text-text-3/60 mb-3" />
                                    <p className="section-label">No Ingredients Documented</p>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'steps' && (
                        <div className="max-w-4xl space-y-4">
                            {selectedClass.steps && selectedClass.steps.length > 0 ? selectedClass.steps.map((step: any, i: number) => (
                                <div key={i} className="flex gap-6 p-6 bg-surface rounded-xl border border-glass-border group hover:border-border transition-colors">
                                    <div className="text-3xl font-black text-text-3 italic group-hover:text-accent transition-colors shrink-0 leading-none">{(i + 1).toString().padStart(2, '0')}</div>
                                    <p className="text-base text-text-2 leading-relaxed font-medium">{step}</p>
                                </div>
                            )) : (
                                <div className="py-12 text-center flex flex-col items-center justify-center border border-glass-border bg-glass-bg rounded-xl">
                                    <ListChecks size={32} className="text-text-3/60 mb-3" />
                                    <p className="section-label">Recipe Pending</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
