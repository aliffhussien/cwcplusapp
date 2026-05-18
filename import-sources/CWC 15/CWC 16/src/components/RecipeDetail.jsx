import React, { useState } from 'react';
import { ChevronLeft, Utensils, ChefHat, StickyNote, PlayCircle, Cat } from 'lucide-react';

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-4 text-base font-medium flex items-center justify-center gap-2 border-b-2 transition-colors duration-200 ${active
            ? 'border-orange-500 text-orange-600 bg-orange-50/50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
    >
        <Icon size={18} />
        {label}
    </button>
);

const RecipeDetail = ({ recipe, onBack }) => {
    const [activeTab, setActiveTab] = useState('ingredients');
    const [showVideo, setShowVideo] = useState(false);

    // Placeholder Video Logic:
    // If recipe.videoId is present, use it.
    // Otherwise, use a default placeholders.
    // Generic Cooking Placeholder: l1n5h1G_V5U (Gordon Ramsay Scrambled Eggs - valid & educational)
    const placeHolderVideoId = "l1n5h1G_V5U";
    const videoId = recipe.videoId || placeHolderVideoId;
    const hasVideo = true; // Always true now since we have a placeholder

    const renderSectionedList = (items, type) => {
        const sections = [];
        let currentSection = { header: null, items: [] };

        items.forEach((item) => {
            if (item.startsWith('**')) {
                if (currentSection.items.length > 0 || currentSection.header) {
                    sections.push(currentSection);
                }
                currentSection = { header: item.replace(/\*\*/g, '').replace(/:$/, ''), items: [] };
            } else {
                currentSection.items.push(item);
            }
        });
        if (currentSection.items.length > 0 || currentSection.header) {
            sections.push(currentSection);
        }

        return sections.map((section, secIdx) => (
            <div key={secIdx} className="mb-6 last:mb-0">
                {section.header && (
                    <h4 className="font-bold text-orange-800 text-lg uppercase tracking-wide border-b border-orange-100 pb-1 mb-3 mt-2">
                        {section.header}
                    </h4>
                )}

                {section.items.length > 0 && (
                    <ul className="space-y-3">
                        {section.items.map((item, itemIdx) => (
                            <li key={itemIdx} className={`flex items-start text-base md:text-lg ${type === 'tips' ? 'bg-yellow-50 p-3 rounded-lg border border-yellow-100' : 'bg-white p-3 rounded-lg shadow-sm border border-gray-100'}`}>
                                {type === 'ingredients' && (
                                    <span className="w-2 h-2 mt-2 mr-3 bg-orange-400 rounded-full shrink-0" />
                                )}
                                {type === 'steps' && (
                                    <div className="flex-shrink-0 w-6 h-6 mt-0.5 mr-3 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs">
                                        {itemIdx + 1}
                                    </div>
                                )}
                                {type === 'tips' && (
                                    <StickyNote size={18} className="shrink-0 mt-0.5 mr-3 text-yellow-600 opacity-70" />
                                )}
                                <span className={`${type === 'tips' ? 'text-yellow-900' : 'text-gray-700'}`}>{item}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        ));
    };

    return (
        <div className="flex flex-col min-h-screen bg-white animate-in slide-in-from-right duration-300">
            {/* Navbar Overlay / Back Button */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none">
                <button
                    onClick={onBack}
                    className="pointer-events-auto bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg text-gray-700 hover:bg-white transition-all active:scale-95"
                >
                    <ChevronLeft size={24} />
                </button>
            </div>

            {/* Hero Section */}
            <div className="relative w-full aspect-video bg-gray-900 shrink-0">
                {hasVideo && showVideo ? (
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        title={recipe.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <>
                        <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="w-full h-full object-cover opacity-90"
                        />
                        {/* Play Button Overlay */}
                        <button
                            onClick={() => setShowVideo(true)}
                            className="absolute inset-0 flex items-center justify-center bg-black/20 group hover:bg-black/30 transition-all"
                        >
                            <div className="bg-white/90 p-4 rounded-full shadow-xl group-hover:scale-110 transition-transform">
                                <PlayCircle size={48} className="text-orange-600 ml-1" />
                            </div>
                        </button>

                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                            <h1 className="text-white text-2xl font-bold leading-tight shadow-black drop-shadow-md">
                                {recipe.title}
                            </h1>
                        </div>
                    </>
                )}
            </div>

            {/* Tabs */}
            <div className="sticky top-0 bg-white z-10 shadow-sm flex">
                <TabButton
                    active={activeTab === 'ingredients'}
                    onClick={() => setActiveTab('ingredients')}
                    icon={Utensils}
                    label="Ingredients"
                />
                <TabButton
                    active={activeTab === 'steps'}
                    onClick={() => setActiveTab('steps')}
                    icon={ChefHat}
                    label="Steps"
                />
                <TabButton
                    active={activeTab === 'tips'}
                    onClick={() => setActiveTab('tips')}
                    icon={StickyNote}
                    label="Tips"
                />
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
                {activeTab === 'ingredients' && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                        {renderSectionedList(recipe.ingredients, 'ingredients')}
                    </div>
                )}

                {activeTab === 'steps' && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                        {renderSectionedList(recipe.steps, 'steps')}
                    </div>
                )}

                {activeTab === 'tips' && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                        {recipe.tips.length > 0 ? (
                            renderSectionedList(recipe.tips, 'tips')
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Cat size={32} className="mb-2 opacity-50" />
                                <p className="text-sm italic">No special notes for this recipe.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeDetail;
