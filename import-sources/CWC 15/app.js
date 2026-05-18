// Recipe App - Main JavaScript
let allRecipes = [];
let filteredRecipes = [];
let currentFilter = 'all';
let currentSearchTerm = '';

// DOM Elements
const recipeGrid = document.getElementById('recipeGrid');
const recipeCount = document.getElementById('recipeCount');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const filterBtns = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('recipeModal');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.modal-overlay');

// Initialize App
async function init() {
    try {
        await loadRecipes();
        setupEventListeners();
        displayRecipes(allRecipes);
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError();
    }
}

// Load Recipes from JSON
async function loadRecipes() {
    try {
        // For local file access, we'll load the JSON via script tag
        // First, check if recipes are already loaded via data.js
        if (window.recipesData) {
            allRecipes = window.recipesData;
            filteredRecipes = [...allRecipes];
            return;
        }

        // Try to fetch (works with web server)
        const response = await fetch('CWC 15.json');
        if (!response.ok) throw new Error('Failed to load recipes');
        allRecipes = await response.json();
        filteredRecipes = [...allRecipes];
    } catch (error) {
        console.error('Error loading recipes:', error);
        // Show helpful error message
        showCORSError();
        throw error;
    }
}

// Show CORS Error with instructions
function showCORSError() {
    recipeGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--color-text-secondary);">
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--color-accent-coral);">Unable to Load Recipes</h3>
            <p style="margin-bottom: 1rem;">To view the recipes, please run a local web server:</p>
            <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-md); max-width: 600px; margin: 0 auto; text-align: left;">
                <p style="margin-bottom: 0.5rem; font-weight: 600;">Option 1: Using Python</p>
                <code style="background: rgba(0,0,0,0.3); padding: 0.5rem; display: block; border-radius: 4px; margin-bottom: 1rem;">python -m http.server 8000</code>
                
                <p style="margin-bottom: 0.5rem; font-weight: 600;">Option 2: Using Node.js</p>
                <code style="background: rgba(0,0,0,0.3); padding: 0.5rem; display: block; border-radius: 4px; margin-bottom: 1rem;">npx http-server</code>
                
                <p style="margin-top: 1rem; font-size: 0.875rem;">Then open: <strong>http://localhost:8000</strong></p>
            </div>
        </div>
    `;
}

// Setup Event Listeners
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);

    // Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });

    // Modal
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', handleTabClick);
    });
}

// Handle Search
function handleSearch(e) {
    currentSearchTerm = e.target.value.toLowerCase().trim();

    // Show/hide clear button
    if (currentSearchTerm) {
        clearSearchBtn.classList.add('visible');
    } else {
        clearSearchBtn.classList.remove('visible');
    }

    applyFilters();
}

// Clear Search
function clearSearch() {
    searchInput.value = '';
    currentSearchTerm = '';
    clearSearchBtn.classList.remove('visible');
    applyFilters();
}

// Handle Filter Click
function handleFilterClick(e) {
    const filterValue = e.target.dataset.filter;

    // Update active state
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    currentFilter = filterValue;
    applyFilters();
}

// Apply Filters and Search
function applyFilters() {
    filteredRecipes = allRecipes.filter(recipe => {
        // Search filter
        const matchesSearch = currentSearchTerm === '' ||
            recipe.title.toLowerCase().includes(currentSearchTerm) ||
            recipe.category.toLowerCase().includes(currentSearchTerm) ||
            recipe.ingredients.some(ing => ing.toLowerCase().includes(currentSearchTerm)) ||
            recipe.tags.some(tag => tag.toLowerCase().includes(currentSearchTerm));

        // Category/Tag filter
        const matchesFilter = currentFilter === 'all' ||
            recipe.category === currentFilter ||
            recipe.tags.includes(currentFilter);

        return matchesSearch && matchesFilter;
    });

    displayRecipes(filteredRecipes);
}

// Display Recipes
function displayRecipes(recipes) {
    recipeGrid.innerHTML = '';
    recipeCount.textContent = recipes.length;

    if (recipes.length === 0) {
        noResults.classList.remove('hidden');
        recipeGrid.classList.add('hidden');
        return;
    }

    noResults.classList.add('hidden');
    recipeGrid.classList.remove('hidden');

    recipes.forEach((recipe, index) => {
        const card = createRecipeCard(recipe, index);
        recipeGrid.appendChild(card);
    });
}

// Create Recipe Card
function createRecipeCard(recipe, index) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.style.animationDelay = `${index * 0.05}s`;
    card.onclick = () => openRecipeDetail(recipe);

    // Create image element
    const imageDiv = document.createElement('div');
    imageDiv.className = 'recipe-card-image';

    if (recipe.image) {
        const img = document.createElement('img');
        img.src = recipe.image;
        img.alt = recipe.title;
        img.onerror = () => {
            imageDiv.innerHTML = `<span>No image available</span>`;
        };
        imageDiv.appendChild(img);
    } else {
        imageDiv.innerHTML = `<span>No image available</span>`;
    }

    // Create content
    const content = document.createElement('div');
    content.className = 'recipe-card-content';

    const title = document.createElement('h3');
    title.className = 'recipe-card-title';
    title.textContent = recipe.title;

    const meta = document.createElement('div');
    meta.className = 'recipe-card-meta';

    const categoryTag = document.createElement('span');
    categoryTag.className = 'category-tag';
    categoryTag.dataset.category = recipe.category;
    categoryTag.textContent = recipe.category;
    meta.appendChild(categoryTag);

    // Add tags (limit to 2 on card)
    recipe.tags.slice(0, 2).forEach(tag => {
        if (tag !== recipe.category) {
            const tagBadge = document.createElement('span');
            tagBadge.className = 'tag-badge';
            tagBadge.textContent = tag;
            meta.appendChild(tagBadge);
        }
    });

    content.appendChild(title);
    content.appendChild(meta);

    card.appendChild(imageDiv);
    card.appendChild(content);

    return card;
}

// Open Recipe Detail Modal
function openRecipeDetail(recipe) {
    // Set title
    document.getElementById('recipeTitle').textContent = recipe.title;

    // Set media (video or image)
    const mediaContainer = document.getElementById('recipeMedia');
    mediaContainer.innerHTML = '';

    if (recipe.videoUrl) {
        // Convert YouTube URL to embed format
        let embedUrl = recipe.videoUrl;

        // Handle youtu.be format
        if (embedUrl.includes('youtu.be/')) {
            const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        // Handle youtube.com/watch format
        else if (embedUrl.includes('youtube.com/watch')) {
            const videoId = embedUrl.split('v=')[1].split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }


        // Create iframe for YouTube video
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        mediaContainer.appendChild(iframe);
    } else if (recipe.image) {
        // Show image if no video
        const img = document.createElement('img');
        img.src = recipe.image;
        img.alt = recipe.title;
        img.onerror = () => {
            mediaContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--color-text-muted);">No media available</div>';
        };
        mediaContainer.appendChild(img);
    } else {
        mediaContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--color-text-muted);">No media available</div>';
    }

    // Set category and tags
    const categoryTag = document.getElementById('recipeCategory');
    categoryTag.className = 'category-tag';
    categoryTag.dataset.category = recipe.category;
    categoryTag.textContent = recipe.category;

    const tagsContainer = document.getElementById('recipeTags');
    tagsContainer.innerHTML = '';
    recipe.tags.forEach(tag => {
        if (tag !== recipe.category) {
            const tagBadge = document.createElement('span');
            tagBadge.className = 'tag-badge';
            tagBadge.textContent = tag;
            tagsContainer.appendChild(tagBadge);
        }
    });

    // Set ingredients with sub-heading support
    const ingredientsList = document.getElementById('ingredientsList');
    ingredientsList.innerHTML = '';
    recipe.ingredients.forEach(ingredient => {
        // Check if this is a sub-heading
        const isHeading = ingredient.match(/^(Bahan|Untuk|Bahagian|Ingredients?|For)\s*[A-Z\d\s–-]*:/i) ||
            (ingredient.endsWith(':') && ingredient.split(' ').length <= 6);

        if (isHeading) {
            // Create a sub-heading
            const heading = document.createElement('li');
            heading.style.cssText = 'font-weight: 700; color: var(--color-accent-coral); margin-top: 1rem; margin-bottom: 0.5rem; list-style: none; margin-left: -1.5rem;';
            heading.textContent = ingredient;
            ingredientsList.appendChild(heading);
        } else {
            // Regular ingredient
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientsList.appendChild(li);
        }
    });

    // Set steps with sub-heading support
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';

    let currentOl = null;

    recipe.steps.forEach(step => {
        // Remove numbering if it exists in the step text
        const cleanStep = step.replace(/^\d+\.\s*/, '');

        // Check if this is a sub-heading
        const isHeading = cleanStep.match(/^(Bahagian|Cara|Step|Part|Section)\s*[A-Z\d\s–-]*:/i) ||
            (cleanStep.endsWith(':') && cleanStep.split(' ').length <= 6 && !cleanStep.includes(','));

        if (isHeading) {
            // Create a sub-heading
            const heading = document.createElement('div');
            heading.style.cssText = 'font-weight: 700; color: var(--color-accent-coral); margin-top: 1.5rem; margin-bottom: 0.5rem; font-size: 1.1em;';
            heading.textContent = cleanStep;
            stepsList.appendChild(heading);
            currentOl = null;
        } else {
            // Regular step
            if (!currentOl) {
                currentOl = document.createElement('ol');
                currentOl.className = 'steps-list';
                stepsList.appendChild(currentOl);
            }
            const li = document.createElement('li');
            li.textContent = cleanStep;
            currentOl.appendChild(li);
        }
    });

    // Set notes
    const notesContent = document.getElementById('notesContent');
    notesContent.textContent = recipe.notes || '';

    // Reset to first tab
    switchTab('ingredients');

    // Show modal
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Close Modal
function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 350);
}

// Handle Tab Click
function handleTabClick(e) {
    const tabName = e.currentTarget.dataset.tab;
    switchTab(tabName);
}

// Switch Tab
function switchTab(tabName) {
    // Update tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update tab panes
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
    });

    const activePane = document.getElementById(`${tabName}Tab`);
    if (activePane) {
        activePane.classList.add('active');
    }
}

// Show Error
function showError() {
    recipeGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--color-text-secondary);">
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Failed to load recipes</h3>
            <p>Please make sure the CWC 15.json file is in the same directory as this HTML file.</p>
        </div>
    `;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
