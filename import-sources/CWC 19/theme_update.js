const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace emerald and teal with sky and cyan
html = html.replace(/emerald/g, 'sky');
html = html.replace(/teal/g, 'cyan');

// Custom CSS tweaks
html = html.replace('background-color: #fafafa;', '');
html = html.replace('color: #059669;', 'color: #0ea5e9; /* sky-500 */');
html = html.replace('border-bottom: 3px solid #059669;', 'border-bottom: 3px solid #0ea5e9;');

// Body tag
html = html.replace('<body class="text-gray-900">', '<body class="text-gray-900 bg-[#fafafa] dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">');

// Tailwind Config & Dark mode toggle script
const tailwindConfig = `    <script>
        tailwind.config = {
            darkMode: 'class',
        }
    </script>`;
html = html.replace('<script src="https://cdn.tailwindcss.com"></script>', '<script src="https://cdn.tailwindcss.com"></script>\n' + tailwindConfig);

// Header layout for dark mode toggle
const headerOld = `<div class="flex items-center gap-3">
                <div class="w-12 h-12 flex items-center justify-center">`;
const headerNew = `<div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 flex items-center justify-center">`;
html = html.replace(headerOld, headerNew);

const headerTitleOld = `Cooking With Cattitude 19
                </h1>
            </div>`;
const headerTitleNew = `Cooking With Cattitude 19
                    </h1>
                </div>
                <button id="theme-toggle" class="p-2.5 rounded-full bg-sky-50 dark:bg-gray-800 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors">
                    <i data-lucide="moon" class="w-5 h-5 dark:hidden"></i>
                    <i data-lucide="sun" class="w-5 h-5 hidden dark:block"></i>
                </button>
            </div>`;
html = html.replace(headerTitleOld, headerTitleNew);

// Add dark mode classes safely
html = html.replace(/bg-white\/90/g, 'bg-white/90 dark:bg-gray-900/90');
html = html.replace(/class="([^"]*)bg-white([^"]*)"/g, 'class="$1bg-white dark:bg-gray-900$2"');
html = html.replace(/class="([^"]*)border-gray-100([^"]*)"/g, 'class="$1border-gray-100 dark:border-gray-800$2"');
html = html.replace(/class="([^"]*)bg-gray-100\/80([^"]*)"/g, 'class="$1bg-gray-100/80 dark:bg-gray-800/80$2"');
html = html.replace(/class="([^"]*)bg-gray-100([^"]*)"/g, 'class="$1bg-gray-100 dark:bg-gray-800$2"');
html = html.replace(/class="([^"]*)text-gray-700([^"]*)"/g, 'class="$1text-gray-700 dark:text-gray-300$2"');
html = html.replace(/class="([^"]*)text-gray-800([^"]*)"/g, 'class="$1text-gray-800 dark:text-gray-200$2"');
html = html.replace(/class="([^"]*)text-gray-900([^"]*)"/g, 'class="$1text-gray-900 dark:text-gray-100$2"');
html = html.replace(/class="([^"]*)text-gray-400([^"]*)"/g, 'class="$1text-gray-400 dark:text-gray-500$2"');
html = html.replace(/class="([^"]*)bg-gray-50([^"]*)"/g, 'class="$1bg-gray-50 dark:bg-gray-800/50$2"');
html = html.replace(/class="([^"]*)border-gray-50([^"]*)"/g, 'class="$1border-gray-50 dark:border-gray-700/50$2"');
html = html.replace(/class="([^"]*)text-gray-200([^"]*)"/g, 'class="$1text-gray-200 dark:text-gray-700$2"');
html = html.replace(/class="([^"]*)text-gray-300([^"]*)"/g, 'class="$1text-gray-300 dark:text-gray-600$2"');

// Specifically handle any missed bg-white in specific elements
html = html.replace(/class="fixed inset-0 z-50 bg-white/g, 'class="fixed inset-0 z-50 bg-white dark:bg-gray-950');

// Fix specific modal cases
html = html.replace('bg-white dark:bg-gray-900 overflow-y-auto', 'bg-white dark:bg-gray-950 overflow-y-auto');

// Inject Dark Mode Script before </body>
const darkModeScript = `
    <script>
        const themeToggle = document.getElementById('theme-toggle');
        const root = document.documentElement;
        
        // Check saved theme or system preference
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        themeToggle.addEventListener('click', () => {
            root.classList.toggle('dark');
            if (root.classList.contains('dark')) {
                localStorage.theme = 'dark';
            } else {
                localStorage.theme = 'light';
            }
        });
    </script>
</body>`;
html = html.replace('</body>', darkModeScript);

// Write back
fs.writeFileSync('index.html', html);
console.log('Successfully updated index.html for pastel blue theme and dark mode!');
