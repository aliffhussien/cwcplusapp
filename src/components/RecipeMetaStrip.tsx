import { Clock, Star } from 'lucide-react';

interface RecipeMetaStripProps {
    recipe: any;
    tags: string[];
}

export default function RecipeMetaStrip({ recipe, tags }: RecipeMetaStripProps) {
    return (
        <div className="px-5 pt-4 pb-5 border-b border-glass-border">
            <div className="flex items-center gap-3 flex-wrap mb-3">
                {recipe.time && (
                    <div className="flex items-center gap-1.5"><Clock size={13} className="text-accent" /><span className="text-[11px] font-black text-text-1">{recipe.time}</span></div>
                )}
                {recipe.time && <div className="w-1 h-1 bg-glass-border rounded-full" />}
                {recipe.rating && <div className="flex items-center gap-1.5"><Star size={13} className="text-accent fill-accent" /><span className="text-[11px] font-black text-text-1">{recipe.rating}</span></div>}
                {recipe.author && <><div className="w-1 h-1 bg-glass-border rounded-full" /><span className="text-[11px] font-bold text-text-3">by {recipe.author}</span></>}
            </div>
            {recipe.description && <p className="text-sm text-text-3 leading-relaxed mb-3">{recipe.description}</p>}
            {tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                    {tags.map((tag: string) => <span key={tag} className="px-2 py-1 bg-glass-bg rounded-lg text-[9px] font-bold uppercase tracking-widest text-text-3">{tag}</span>)}
                </div>
            )}
        </div>
    );
}
