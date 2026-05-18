const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix duplicates caused by sequential regex replacements
html = html.replace(/dark:text-gray-200 dark:text-gray-700/g, 'dark:text-gray-200');
html = html.replace(/dark:text-gray-300 dark:text-gray-600/g, 'dark:text-gray-300');
html = html.replace(/dark:bg-gray-900\/90 dark:bg-gray-900\/90/g, 'dark:bg-gray-900/90');
html = html.replace(/dark:bg-gray-900 dark:bg-gray-900/g, 'dark:bg-gray-900');

// Fix tab-btn string assignments
html = html.replace(
    'btn.className = btn.dataset.tab === activeTab\n                        ? "tab-btn flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 tab-active"\n                        : "tab-btn flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 text-gray-400";',
    'btn.className = btn.dataset.tab === activeTab\n                        ? "tab-btn flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 tab-active"\n                        : "tab-btn flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500";'
);

// One missed replacement: bg-white to dark:bg-gray-900 if it was inside a string variable but not class=""
// e.g. card.innerHTML = `... bg-white ...` might not have class="" if formatted differently? No, the regex was fine for that.
// Let's check empty state bg-white:
html = html.replace('id="empty-state"\n            class="hidden text-center py-32 bg-white', 'id="empty-state"\n            class="hidden text-center py-32 bg-white dark:bg-gray-900');

// Clean up background-color in CSS properly:
// The first script removed 'background-color: #fafafa;' but body tag now has bg-[#fafafa]. We can also add dark mode to search input
html = html.replace('bg-gray-100/80 border-2 border-transparent focus:border-sky-400 focus:bg-white', 'bg-gray-100/80 dark:bg-gray-800/80 border-2 border-transparent focus:border-sky-400 focus:bg-white dark:focus:bg-gray-900');

fs.writeFileSync('index.html', html);
console.log('Cleanup done');
