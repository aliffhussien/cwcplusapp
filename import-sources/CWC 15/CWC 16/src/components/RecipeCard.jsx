import React from 'react';

const RecipeCard = ({ recipe, onClick }) => (
    <div
        onClick={() => onClick(recipe)}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:shadow-md group"
    >
        <div className="relative h-48 overflow-hidden">
            <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Title Overlay on Image */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                <h3 className="font-bold text-white text-lg leading-tight shadow-black drop-shadow-md">
                    {recipe.title}
                </h3>
            </div>
        </div>
    </div>
);

export default RecipeCard;
