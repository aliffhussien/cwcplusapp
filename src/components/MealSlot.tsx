import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, ChefHat, ChevronRight } from 'lucide-react';
import { getMediaAssetUrl } from '../lib/mediaUtils';

interface MealSlotProps {
    type: string;
    meal?: any;
    onAdd: () => void;
    onRemove: () => void;
    mediaList: any[];
}

export default function MealSlot({ type, meal, onAdd, onRemove, mediaList }: MealSlotProps) {
    const cardImage = getMediaAssetUrl(meal?.cover_image_id, mediaList, meal?.image);

    return (
        <div className="bg-surface border border-glass-border rounded-3xl p-5 group hover:border-border transition-all">
            <div className="flex justify-between items-center mb-4">
                <span className="section-label">{type}</span>
                {!meal ? (
                    <button onClick={onAdd} className="w-8 h-8 rounded-xl bg-glass-bg border border-glass-border text-text-3 hover:text-text-1 hover:bg-accent transition-all flex items-center justify-center">
                        <Plus size={16} />
                    </button>
                ) : (
                    <button onClick={onRemove} className="w-8 h-8 rounded-xl bg-glass-bg border border-glass-border text-text-3 hover:text-danger transition-all flex items-center justify-center">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {meal ? (
                <Link to={`/recipe/${meal.id}`} className="flex items-center gap-4 group/link">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-glass-border">
                        {cardImage ? (
                            <img src={cardImage} alt={meal.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                            <div className="w-full h-full bg-glass-bg flex items-center justify-center">
                                <ChefHat className="text-text-3" size={24} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-text-1 truncate group-hover/link:text-accent transition-colors uppercase tracking-tight">{meal.title}</h4>
                        <p className="section-label mt-1.5">{meal.time || '30 mins'} · {meal.difficulty || 'Expert'}</p>
                    </div>
                    <ChevronRight size={16} className="text-text-3 group-hover/link:text-text-1 transition-colors" />
                </Link>
            ) : (
                <div onClick={onAdd} className="h-16 flex items-center justify-center border border-dashed border-glass-border rounded-2xl bg-glass-bg cursor-pointer hover:bg-elevated hover:border-border transition-all group/empty">
                    <span className="section-label group-hover/empty:text-text-1">Initialize Dish</span>
                </div>
            )}
        </div>
    );
}
