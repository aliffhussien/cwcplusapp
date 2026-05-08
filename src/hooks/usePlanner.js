import { useState, useEffect } from 'react';

export function usePlanner() {
    const [plan, setPlan] = useState({});

    useEffect(() => {
        try {
            const stored = localStorage.getItem('cwc_planner');
            if (stored) {
                setPlan(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Error reading planner", e);
        }
    }, []);

    const updatePlan = (dateStr, type, recipeId) => {
        setPlan(prev => {
            const newPlan = { ...prev };
            if (!newPlan[dateStr]) newPlan[dateStr] = {};
            newPlan[dateStr] = { ...newPlan[dateStr], [type]: recipeId };
            localStorage.setItem('cwc_planner', JSON.stringify(newPlan));
            return newPlan;
        });
    };

    const autoGenerate = (weekDates, recipes) => {
        if (!recipes || recipes.length === 0) return;
        setPlan(prev => {
            const newPlan = { ...prev };
            weekDates.forEach(dateStr => {
                if (!newPlan[dateStr]) newPlan[dateStr] = {};
                ['Breakfast', 'Lunch', 'Dinner'].forEach(type => {
                    if (!newPlan[dateStr][type]) {
                        const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
                        newPlan[dateStr][type] = randomRecipe.id;
                    }
                });
            });
            localStorage.setItem('cwc_planner', JSON.stringify(newPlan));
            return newPlan;
        });
    };

    const clearPlan = (dateStr, type) => {
        setPlan(prev => {
            const newPlan = { ...prev };
            if (newPlan[dateStr]) {
                delete newPlan[dateStr][type];
            }
            localStorage.setItem('cwc_planner', JSON.stringify(newPlan));
            return newPlan;
        });
    };

    return { plan, updatePlan, autoGenerate, clearPlan };
}
