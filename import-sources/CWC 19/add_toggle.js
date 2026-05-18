const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<div class="max-w-6xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-4">\s*<div class="flex items-center gap-3">\s*<div class="w-12 h-12 flex items-center justify-center">\s*<img id="main-logo" src="CWC.svg" alt="CWC" class="w-full h-full object-contain"\s*onerror="this\.outerHTML='<div class=\\'w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold\\'>CWC<\/div>'"\s*>\s*<\/div>\s*<h1\s*class="text-xl md:text-2xl font-black bg-gradient-to-br from-sky-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">\s*Cooking With Cattitude 19\s*<\/h1>\s*<\/div>/;

const replacement = `<div class="max-w-6xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 flex items-center justify-center">
                        <img id="main-logo" src="CWC.svg" alt="CWC" class="w-full h-full object-contain"
                            onerror="this.outerHTML='<div class=\\'w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold\\'>CWC</div>'">
                    </div>
                    <h1
                        class="text-xl md:text-2xl font-black bg-gradient-to-br from-sky-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                        Cooking With Cattitude 19
                    </h1>
                </div>
                <button id="theme-toggle" class="p-2.5 rounded-full bg-sky-50 dark:bg-gray-800 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors shadow-sm">
                    <i data-lucide="moon" class="w-5 h-5 dark:hidden"></i>
                    <i data-lucide="sun" class="w-5 h-5 hidden dark:block"></i>
                </button>
            </div>`;

html = html.replace(regex, replacement);

fs.writeFileSync('index.html', html);
console.log('Toggle added');
