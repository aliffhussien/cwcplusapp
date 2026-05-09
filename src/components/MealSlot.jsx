import { Link } from 'react-router-dom';
import { Plus, Trash2, ChefHat, ChevronRight } from 'lucide-react';
import { getMediaAssetUrl } from '../lib/mediaUtils';

export default function MealSlot({ type, meal, onAdd, onRemove, mediaList }) {
    const cardImage = getMediaAssetUrl(meal?.cover_image_id, mediaList, meal?.image);

    return (
        <div className="bg-[#0F172A]/40 border border-white/5 rounded-3xl p-5 group hover:border-white/10 transition-all">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{type}</span>
                {!meal ? (
                    <button onClick={onAdd} className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-indigo-600 transition-all flex items-center justify-center">
                        <Plus size={16} />
                    </button>
                ) : (
                    <button onClick={onRemove} className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-rose-500 transition-all flex items-center justify-center">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {meal ? (
                <Link to={`/recipe/${meal.id}`} className="flex items-center gap-4 group/link">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                        {cardImage ? (
                            <img src={cardImage} alt={meal.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                <ChefHat className="text-slate-700" size={24} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-white truncate group-hover/link:text-indigo-400 transition-colors uppercase tracking-tight">{meal.title}</h4>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{meal.time || '30 mins'} · {meal.difficulty || 'Expert'}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-700 group-hover/link:text-white transition-colors" />
                </Link>
            ) : (
                <div onClick={onAdd} className="h-16 flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02] cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all group/empty">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover/empty:text-slate-400">Initialize Dish</span>
                </div>
            )}
        </div>
    );
}
