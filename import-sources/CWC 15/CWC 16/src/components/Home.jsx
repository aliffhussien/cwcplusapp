import React, { useState, useMemo } from 'react';
import { Search, Cat } from 'lucide-react';
import RecipeCard from './RecipeCard';
import recipeData from '../data/recipes.json';

const Home = ({ onRecipeSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRecipes = useMemo(() => {
        return recipeData.filter(r =>
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.ingredients.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm]);

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            {/* Hero Header */}
            <div className="bg-orange-600 text-white px-6 pt-12 pb-16 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm mb-4">
                        <Cat size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">Cooking With Cattitude 16</h1>
                    <p className="text-orange-100 text-base font-medium">Pawsitively delicious recipes</p>
                </div>
            </div>

            {/* Search Bar Container */}
            <div className="px-6 -mt-7 mb-6 relative z-20">
                <div className="bg-white rounded-2xl shadow-lg p-2 flex items-center">
                    <Search className="text-gray-400 ml-3" size={20} />
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        className="w-full p-3 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Recipe List */}
            <div className="px-6 space-y-4">
                <h2 className="font-bold text-gray-800 text-xl pl-1">Recipe Collection</h2>

                {filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {filteredRecipes.map(recipe => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                onClick={onRecipeSelect}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <Cat size={48} className="mx-auto mb-3 opacity-20" />
                        <p>No recipes found. Try searching for "daging"!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
