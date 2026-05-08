export const recipesData = [
    {
        id: 1,
        title: "Mastering A5 Wagyu Ribeye",
        author: "Chef Gordon Ramsay",
        time: "25 mins",
        baseServings: 2,
        difficulty: "Advanced",
        category: "Mains",
        image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=1200",
        video: "https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=164&oauth2_token_id=57447761",
        ingredients: [
            { name: "A5 Wagyu Ribeye", amount: "16 oz" },
            { name: "Flaky Sea Salt", amount: "2 tbsp" },
            { name: "Fresh Rosemary", amount: "2 sprigs" },
            { name: "Garlic Cloves (Crushed)", amount: "3 whole" },
            { name: "Unsalted Butter", amount: "3 tbsp" }
        ],
        steps: [
            "Remove the Wagyu from the refrigerator at least 30 minutes before cooking to bring it to room temperature. This ensures even cooking.",
            "Season generously with flaky sea salt. Do not use oil in the pan; the natural marbling will render enough fat.",
            "Heat a cast-iron skillet over high heat until smoking. Place the steak in the pan and sear for exactly 90 seconds to build a crust.",
            "Flip the steak, add butter, garlic, and rosemary. Baste the steak continuously with the foaming butter for another 90 seconds.",
            "Remove from heat and let it rest on a cutting board for at least 5 minutes before slicing against the grain."
        ],
        notes: "Wagyu fat melts at a lower temperature than regular beef. Ensure your pan is screaming hot to achieve a crust before the center overcooks. If using a thinner cut, reduce sear time to 60 seconds per side.",
        rating: "5.0"
    },
    {
        id: 2,
        title: "Artisan Sourdough Crumb",
        author: "Chef Chad Robertson",
        time: "24 hrs",
        baseServings: 1,
        difficulty: "Intermediate",
        category: "Breakfast",
        image: "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&q=80&w=1200",
        video: null,
        ingredients: [
            { name: "Bread Flour", amount: "500g" },
            { name: "Water", amount: "350g" },
            { name: "Active Sourdough Starter", amount: "100g" },
            { name: "Fine Sea Salt", amount: "10g" }
        ],
        steps: [
            "Mix flour and water and let rest for 1 hour (autolyse).",
            "Add starter and salt. Dimple in and fold until incorporated.",
            "Perform stretch and folds every 30 minutes for 2 hours.",
            "Bulk ferment until doubled in size (usually 4-6 hours depending on temp).",
            "Shape the dough, place in a banneton, and retard in the fridge overnight.",
            "Score and bake in a preheated Dutch oven at 450°F (230°C) for 20 mins with lid on, then 20 mins lid off."
        ],
        notes: "A vigorous, active starter is key to an open crumb. Ensure your starter more than doubles after feeding before using it in the dough.",
        rating: "4.9"
    },
    {
        id: 3,
        title: "Truffle Mushroom Risotto",
        author: "Chef Massimo Bottura",
        time: "45 mins",
        baseServings: 4,
        difficulty: "Intermediate",
        category: "Mains",
        image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=1200",
        video: null,
        ingredients: [
            { name: "Arborio Rice", amount: "1.5 cups" },
            { name: "Chicken or Vegetable Broth (Warm)", amount: "4 cups" },
            { name: "Mixed Mushrooms (Cremini, Shiitake)", amount: "8 oz" },
            { name: "Truffle Oil", amount: "1 tbsp" },
            { name: "Parmesan Cheese", amount: "1/2 cup" },
            { name: "Dry White Wine", amount: "1/2 cup" }
        ],
        steps: [
            "Sauté mushrooms in a bit of olive oil until browned. Set aside.",
            "Toast the rice in the same pan for 2 minutes until translucent at the edges.",
            "Deglaze with white wine and stir until evaporated.",
            "Add warm broth one ladle at a time, stirring constantly until absorbed before adding the next.",
            "Once rice is al dente, stir in mushrooms, parmesan, and truffle oil. Serve immediately."
        ],
        notes: "Stirring constantly releases the starches from the Arborio rice, creating the creamy texture without adding heavy cream.",
        rating: "4.9"
    },
    {
        id: 4,
        title: "Matcha Souffle Pancakes",
        author: "Chef Dominique Ansel",
        time: "30 mins",
        baseServings: 2,
        difficulty: "Advanced",
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1598214886806-c87b84b7078b?auto=format&fit=crop&q=80&w=1200",
        video: null,
        ingredients: [
            { name: "Eggs (Separated)", amount: "2 large" },
            { name: "Whole Milk", amount: "1.5 tbsp" },
            { name: "Cake Flour", amount: "1/4 cup" },
            { name: "Matcha Powder", amount: "1 tbsp" },
            { name: "Sugar", amount: "2 tbsp" },
            { name: "Baking Powder", amount: "1/2 tsp" }
        ],
        steps: [
            "Whisk egg yolks, milk, matcha, sifted cake flour, and baking powder until smooth.",
            "In a separate clean bowl, whip egg whites while slowly adding sugar until stiff peaks form.",
            "Gently fold the egg whites into the yolk mixture in three batches. Do not deflate.",
            "Heat a non-stick pan on very low heat. Pipe or scoop the batter to form tall mounds.",
            "Add a few drops of water to the pan, cover with a lid, and cook for 4-5 minutes per side until fluffy and cooked through."
        ],
        notes: "The key to tall, fluffy pancakes is the meringue (egg whites). Make sure there is zero yolk mixed into the whites, and whip to stiff, glossy peaks.",
        rating: "4.8"
    },
    {
        id: 5,
        title: "Chocolate Cupcakes (Tanpa Telur)",
        author: "CWC+",
        time: "40 mins",
        baseServings: 12,
        difficulty: "Intermediate",
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=1200",
        video: null,
        ingredients: [
            { name: "Tepung gandum", amount: "1.5 cawan (200g)" },
            { name: "Gula", amount: "1 cawan (200g)" },
            { name: "Serbuk koko", amount: "0.5 cawan (50g)" },
            { name: "Baking powder", amount: "1 sudu kecil" },
            { name: "Baking soda", amount: "0.25 sudu kecil" },
            { name: "Garam", amount: "0.25 sudu kecil" },
            { name: "Minyak masak", amount: "0.5 cawan (125ml)" },
            { name: "Esen vanila", amount: "0.5 sudu kecil" },
            { name: "Serbuk kopi", amount: "1 sudu kecil" },
            { name: "Air panas mendidih", amount: "2 sudu besar" },
            { name: "Buttermilk (atau susu + cuka)", amount: "1 cawan (250ml)" }
        ],
        steps: [
            "Panaskan oven pada suhu 170°C-180°C. Set oven api atas bawah. Off kipas jika boleh.",
            "Sediakan loyang cupcake dengan paper liner.",
            "Dalam satu mangkuk, ayak dan gaul tepung, serbuk koko, baking powder, baking soda dan garam.",
            "Dalam mangkuk lain, campurkan minyak, gula, esen vanila dan buttermilk. Gaul sehingga gula larut.",
            "Jika guna kopi, larutkan serbuk kopi dengan air panas, kemudian masukkan ke bahan basah.",
            "Satukan bahan basah ke dalam bahan kering. Gaul perlahan hingga sebati (jangan overmix).",
            "Tuang adunan ke dalam paper liner sehingga ¾ penuh.",
            "Bakar di rak tengah selama 18–25 minit atau sehingga lidi keluar bersih.",
            "Sejukkan sebelum dihias atau dihidang."
        ],
        notes: "Nota: Serbuk kopi hanya untuk menaikkan rasa coklat, tidak beri rasa kopi pada cupcake.\n\nEASY CHOCOLATE WHIPPED CREAM\nBahan: 1 cup whipping cream sejuk, 1/3-1/2 cup powdered sugar, 2 sudu besar cocoa powder.\nCara: Ayak gula+koko. Pukul cream hingga mula pekat. Masukkan campuran koko sikit-sikit. Pukul hingga stiff peaks.",
        rating: "4.9"
    },
    {
        id: 6,
        title: "Crispy Cheese Scallion Pancake",
        author: "CWC+",
        time: "30 mins",
        baseServings: 4,
        difficulty: "Intermediate",
        category: "Breakfast",
        image: "https://images.unsplash.com/photo-1627308595186-b10884d6ab3f?auto=format&fit=crop&q=80&w=1200",
        video: null,
        ingredients: [
            { name: "Tepung gandum (Doh)", amount: "150g" },
            { name: "Garam (Doh)", amount: "1.5g (1/4 tsp)" },
            { name: "Air (Doh)", amount: "95 ml" },
            { name: "Daun bawang (Inti)", amount: "30g" },
            { name: "Cheese parut (Inti)", amount: "50g" },
            { name: "Baking soda (Inti)", amount: "Secubit" },
            { name: "Butter cair (Sapu)", amount: "20g" }
        ],
        steps: [
            "Doh: Masukkan tepung gandum dan garam dalam mangkuk. Tuang air sedikit demi sedikit sambil uli sehingga jadi doh lembut & tidak melekat di tangan. Rehatkan 10 minit.",
            "Inti: Campurkan daun bawang dan baking soda. Parut cheese dan ketepikan.",
            "Sediakan lapisan tepung: Gaul 1/2 cawan gandum & 1/2 cawan tepung jagung untuk ditabur semasa roll.",
            "Bahagi doh kepada 4 bebola. Canai nipis (25-28cm diameter).",
            "Sapu butter cair, tabur filling daun bawang dan cheese rata-rata.",
            "Lipat doh seperti martabak. Sapu butter sebelum lipat lagi sehingga kemas. Ulang untuk semua doh.",
            "Goreng pancake dengan api sederhana (minyak sedikit) hingga keemasan & rangup (2 minit setiap sisi)."
        ],
        notes: "Tabur bancuhan tepung jagung+gandum di permukaan kerja dan atas doh semasa mencanai supaya tidak melekat.",
        rating: "5.0"
    }
];
