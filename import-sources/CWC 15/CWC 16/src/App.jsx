import React, { useState } from 'react';
import Home from './components/Home';
import RecipeDetail from './components/RecipeDetail';

export default function App() {
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    return (
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden md:max-w-full md:shadow-none">
            {selectedRecipe ? (
                <RecipeDetail
                    recipe={selectedRecipe}
                    onBack={() => setSelectedRecipe(null)}
                />
            ) : (
                <Home onRecipeSelect={setSelectedRecipe} />
            )}
        </div>
    );
}
