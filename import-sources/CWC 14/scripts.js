function getImagePath(recipe){
  // Use filename from recipe.image and map to local image folder
  const p = recipe.image || '';
  const filename = p.split('/').pop();
  return filename ? `image/${filename}` : 'image/sssss.jpeg';
}

function el(tag, cls, text){ const e = document.createElement(tag); if(cls) e.className = cls; if(text!==undefined) e.textContent = text; return e; }

function renderCard(r){
  const card = el('article','card');
  card.setAttribute('data-slug', r.slug);
  const img = document.createElement('img'); img.className='thumb'; img.src = getImagePath(r); img.alt = r.title;
  const body = el('div','card-body');
  const title = el('div','title', r.title);
  const meta = el('div','meta', r.category + (r.volume ? ` • Vol ${r.volume}` : ''));
  const tags = el('div','tags');
  (r.tags||[]).slice(0,3).forEach(t=> tags.appendChild(el('span','tag', t)));
  body.appendChild(title); body.appendChild(meta); body.appendChild(tags);
  card.appendChild(img); card.appendChild(body);
  card.addEventListener('click', ()=> openModal(r));
  return card;
}

function buildFilters(recipes){
  const sel = document.getElementById('category');
  const cats = Array.from(new Set(recipes.map(r=>r.category))).sort();
  cats.forEach(c=>{ const o = document.createElement('option'); o.value=c; o.textContent=c; sel.appendChild(o); });
}

function renderGrid(recipes){
  const grid = document.getElementById('grid'); grid.innerHTML='';
  recipes.forEach(r=> grid.appendChild(renderCard(r)));
}

function openModal(r){
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  content.innerHTML='';
  
  // Hero section (video or image)
  const hero = document.createElement('div'); hero.className='modal-hero';
  const videoUrl = (r.videoUrl||'').trim();
  if(videoUrl){
    let embed = null;
    try{
      const u = new URL(videoUrl);
      if(u.hostname.includes('youtu.be')){
        const id = u.pathname.slice(1);
        embed = `https://www.youtube.com/embed/${id}`;
      } else if(u.hostname.includes('youtube.com')){
        const params = new URLSearchParams(u.search);
        const v = params.get('v');
        if(v) embed = `https://www.youtube.com/embed/${v}`;
      }
    }catch(e){/* ignore */}
    if(embed){
      const wrap = document.createElement('div'); wrap.className='video-embed';
      const iframe = document.createElement('iframe');
      iframe.src = embed;
      iframe.setAttribute('frameborder','0');
      iframe.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen','');
      wrap.appendChild(iframe);
      hero.appendChild(wrap);
    } else {
      const a = document.createElement('a'); a.href = videoUrl; a.target='_blank'; a.textContent='Watch video'; a.style.display='inline-block'; a.style.marginBottom='8px'; hero.appendChild(a);
      const img = document.createElement('img'); img.src = getImagePath(r); img.alt = r.title; hero.appendChild(img);
    }
  } else {
    const img = document.createElement('img'); img.src = getImagePath(r); img.alt = r.title; hero.appendChild(img);
  }
  content.appendChild(hero);
  
  // Title and meta
  const header = document.createElement('div'); header.className='modal-header';
  const h = el('h2',null,r.title); header.appendChild(h);
  const meta = document.createElement('div'); meta.className='meta-info';
  meta.appendChild(el('span','meta','Category: '+(r.category||'—')));
  meta.appendChild(el('span','meta','Tags: '+((r.tags||[]).join(', ')||'—')));
  header.appendChild(meta);
  content.appendChild(header);
  
  // Tabs
  const tabNav = document.createElement('div'); tabNav.className='tab-nav';
  const tabIngredients = document.createElement('button'); tabIngredients.className='tab-btn active'; tabIngredients.textContent='Ingredients'; tabIngredients.setAttribute('data-tab','ingredients');
  const tabSteps = document.createElement('button'); tabSteps.className='tab-btn'; tabSteps.textContent='Steps'; tabSteps.setAttribute('data-tab','steps');
  const tabNotes = document.createElement('button'); tabNotes.className='tab-btn'; tabNotes.textContent='Notes'; tabNotes.setAttribute('data-tab','notes');
  tabNav.appendChild(tabIngredients); tabNav.appendChild(tabSteps); tabNav.appendChild(tabNotes);
  content.appendChild(tabNav);
  
  // Tab content container
  const tabContent = document.createElement('div'); tabContent.className='tab-content';
  
  // Ingredients tab
  const ingrTab = document.createElement('div'); ingrTab.className='tab-panel active'; ingrTab.setAttribute('data-tab','ingredients');
  const ingrContainer = document.createElement('div'); ingrContainer.className='ingredients';
  (r.ingredients||[]).forEach(i=>{
    const text = (i||'').trim();
    const isHeader = text.endsWith(':') || (text.match(/^[A-Z][a-z]+ [A-Z][a-z]+/) && !text.match(/\d/));
    if(isHeader){
      const h = el('div','ingr-header', text);
      ingrContainer.appendChild(h);
    } else {
      const li = el('li',null, text);
      ingrContainer.appendChild(li);
    }
  });
  ingrTab.appendChild(ingrContainer);
  tabContent.appendChild(ingrTab);
  
  // Steps tab
  const stepsTab = document.createElement('div'); stepsTab.className='tab-panel'; stepsTab.setAttribute('data-tab','steps');
  const stepsOl = document.createElement('ol'); stepsOl.className='steps';
  (r.steps||[]).forEach(s=>{
    const text = (s||'').trim();
    const isHeader = text.endsWith(':') || (text.match(/^[A-Z][a-z]+ [A-Z][a-z]+/) && !text.match(/\d/));
    if(isHeader){
      const h = el('div','step-header', text);
      stepsOl.appendChild(h);
    } else {
      const li = document.createElement('li');
      li.textContent = text;
      stepsOl.appendChild(li);
    }
  });
  stepsTab.appendChild(stepsOl);
  tabContent.appendChild(stepsTab);
  
  // Notes tab
  const notesTab = document.createElement('div'); notesTab.className='tab-panel'; notesTab.setAttribute('data-tab','notes');
  const noteText = (r.notes||'').trim();
  if(noteText){
    const notePara = document.createElement('p');
    notePara.textContent = noteText;
    notePara.style.whiteSpace = 'pre-wrap';
    notePara.style.lineHeight = '1.6';
    notesTab.appendChild(notePara);
  } else {
    notesTab.textContent = 'No notes for this recipe.';
  }
  tabContent.appendChild(notesTab);
  
  content.appendChild(tabContent);
  
  // Tab switching
  tabNav.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const tabName = btn.getAttribute('data-tab');
      tabNav.querySelectorAll('.tab-btn').forEach(b=> b.classList.remove('active'));
      tabContent.querySelectorAll('.tab-panel').forEach(p=> p.classList.remove('active'));
      btn.classList.add('active');
      tabContent.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    });
  });
  
  modal.setAttribute('aria-hidden','false');
}

function closeModal(){ document.getElementById('modal').setAttribute('aria-hidden','true'); }

document.addEventListener('DOMContentLoaded', ()=>{
  const search = document.getElementById('search');
  const category = document.getElementById('category');

  fetch('recipes.json').then(r=>r.json()).then(recipes=>{
    window.__RECIPES = recipes;
    buildFilters(recipes);
    renderGrid(recipes);

    function applyFilter(){
      const q = search.value.trim().toLowerCase();
      const cat = category.value;
      const out = recipes.filter(r=>{
        if(cat!=='all' && r.category !== cat) return false;
        if(!q) return true;
        // search title, tags, ingredients and steps
        const inTitle = (r.title||'').toLowerCase().includes(q);
        const inTags = (r.tags||[]).join(' ').toLowerCase().includes(q);
        const inIngredients = (r.ingredients||[]).join(' ').toLowerCase().includes(q);
        const inSteps = (r.steps||[]).join(' ').toLowerCase().includes(q);
        return inTitle || inTags || inIngredients || inSteps;
      });
      renderGrid(out);
    }

    search.addEventListener('input', applyFilter);
    category.addEventListener('change', applyFilter);
  }).catch(err=>{
    const grid = document.getElementById('grid');
    grid.innerHTML = '<p style="padding:20px;color:#900">Could not load recipes.json. Try running a local server (eg. <code>python -m http.server</code>) and reload the page.</p>';
    console.error(err);
  });

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', (e)=>{ if(e.target.id==='modal') closeModal(); });
});
