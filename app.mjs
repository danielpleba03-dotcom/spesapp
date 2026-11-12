import {catalogo72} from './catalogo-72.mjs?v=84';
import {catalogo71} from './catalogo-71.mjs?v=84';
import {defaultCookingPreferences,recipeEffort,updateCookingPreferences} from './cooking-domain.mjs?v=84';
import {effortBadge,favoriteButton} from './cooking-ui.mjs?v=84';
import {recipeAdditions} from './recipe-additions.mjs?v=84';
import {calorieBadge} from './recipe-calories.mjs?v=84';

import {classicRecipes} from './classic-recipes.mjs?v=84';

import {createWeekUI} from './week-ui.mjs?v=85';

import {enhanceSuggestions} from './suggestions.mjs?v=84';

enhanceSuggestions();

import {enhanceSelects} from './select-menu.mjs?v=84';

enhanceSelects();

import {householdSuggestions,preparationAlternatives,recipeMatchesSearch,normalize,createUnitLookup,step,low,stockView,recipeStatus,validateRecipe,LIMITS,preparationStatus,round,productUnit,recipeShoppingPlan,mealTypes,mealForRecipe,dishTypes,recipeDishTypes,formatQuantity} from './domain.mjs?v=84';

import {createStore} from './cloud.mjs?v=85';

import {reconcile,readPreference,writePreference} from './ui.mjs?v=84';

const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const phoneAgent=/iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent);

const mobile=()=>phoneAgent||matchMedia('(max-width:650px)').matches;

function phonePresentation(){

 const phone=mobile(),orientation=screen.orientation;

 const landscape=phoneAgent&&typeof window.orientation==='number'?Math.abs(window.orientation)===90:phoneAgent&&orientation?.type?orientation.type.startsWith('landscape'):matchMedia('(orientation:landscape)').matches;

 document.body.classList.toggle('is-phone',phone);document.body.classList.remove('phone-landscape');

}

phonePresentation();addEventListener('orientationchange',phonePresentation);screen.orientation?.addEventListener('change',phonePresentation);addEventListener('resize',phonePresentation);

document.addEventListener('pointerdown',()=>{if(mobile()&&matchMedia('(display-mode:standalone)').matches)try{screen.orientation?.lock?.('portrait').catch(()=>{});}catch{}},{once:true});

const seed=await fetch('./seed.json',{signal:AbortSignal.timeout(15000)}).then(r=>{if(!r.ok)throw Error('Impossibile caricare le ricette.');return r.json();});

const editingBaselines=new Map();

const getCookingPreferences=()=>weekUI?.getPreferences()||defaultCookingPreferences();
let weekUI=null,recipesView='week';const catalogMaintenance=new URLSearchParams(location.search).get('aggiornaRicette')==='1';

let store,state,meta={},page=mobile()?'shopping':'recipes',search='',pantryFilter='Disponibili',recipeFilter='Fattibili adesso',addOpen=readPreference('spesapp-add-open')==='1',pantryAddOpen=readPreference('spesapp-pantry-add-open')==='1',openRecipes=new Set(),grace=new Map(),order=[],draftIngredients=[],editingRecipe=null,preparation=null,noticeTimer;

let bulkOperation=null;const leaving=new Map();let mealFilter='Tutti i pasti', dishFilter='Tutti i tipi';


function notify(message,error=false){

 const dialog=$('#editor');

 if(error&&dialog?.open){let area=dialog.querySelector('#editor-error,#preparation-error,.dialog-notice');if(!area){area=document.createElement('p');area.className='sync-error dialog-notice';area.setAttribute('role','alert');dialog.querySelector('.dialog-head')?.after(area);}area.textContent=message;return;}

 const el=$('#notice');el.textContent=message;el.classList.toggle('error',error);el.style.display='block';clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.style.display='none',error?6500:3000);

}


function action(type,payload){try{store.dispatch({id:crypto.randomUUID(),type,payload,at:Date.now()});return true;}catch(e){notify(e.message,true);renderList();return false;}}

function nav(target){clearTimeout(noticeTimer);$('#notice').style.display='none';if(target==='recipes'){recipesView='week';weekUI?.openToday();}page=target;search='';grace.clear();order=[];renderShell();}

const defaultQuantity=unit=>unit==='g'?100:1;



function catalog(){const map=new Map();for(const p of state.pantry)if(page!=='pantry'||p.category==='Alimentari')map.set(p.name,p);return [...map.values()].sort((a,b)=>a.category===b.category?a.name.localeCompare(b.name,'it'):a.category==='Alimentari'?-1:1);}

const unitLabel=unit=>unit==='pz'?'P':unit.toUpperCase();

function filterButtons(values,current,group){return values.map(v=>`<button class="filter ${current===v?'active':''}" data-filter="${group}" data-value="${esc(v)}" aria-pressed="${current===v}">${esc(v)}</button>`).join('');}

const isAddOpen=()=>page==='pantry'?pantryAddOpen:addOpen;

function addForm(){return `<form id="add-form" class="addform" ${mobile()&&!isAddOpen()?'hidden style="display:none"':''}><label class="product-field">Prodotto<input name="name" list="product-options" placeholder="SCRIVI O SCEGLI UN PRODOTTO" autocomplete="off" maxlength="120" required></label><datalist id="product-options">${catalog().map(p=>`<option value="${esc(p.name)}">${esc(p.category)}</option>`).join('')}</datalist><label class="category-field">Categoria<select name="category"><option>Alimentari</option>${page==='shopping'?'<option>Altro</option>':''}</select></label><label class="qty-field" for="add-qty">Quantità<span class="add-stepper"><button type="button" data-command="add-decrease" aria-label="Riduci quantità da aggiungere">−</button><input type="number" id="add-qty" aria-label="Quantità da aggiungere" name="qty" value="100" step="any" min="0.000001" max="1000000000" required inputmode="decimal"><button type="button" data-command="add-increase" aria-label="Aumenta quantità da aggiungere">＋</button></span></label><label class="unit-field">Unità<select name="unit"><option value="g">G</option><option value="l">L</option><option value="pz">P</option></select></label><button class="primary submit-add">＋ Aggiungi</button><p id="add-unit-error" class="add-unit-error" role="alert" hidden></p></form>`;}

const trashIcon='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 10v7m4-7v7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function bulkButton(){const label=page==='shopping'?'Svuota lista della spesa':pantryFilter==='Esauriti'?'Elimina tutti gli esauriti':'Segna tutti i prodotti come esauriti';return `<button class="bulk-trash" data-command="bulk-open" aria-label="${label}" title="${label}">${trashIcon}</button>`;}

function updateBulkButton(){const buyAll=$('[data-command="buy-all"]');if(buyAll)buyAll.disabled=!state.shopping.length;const b=$('[data-command="bulk-open"]');if(!b)return;const items=page==='shopping'?state.shopping:state.pantry.filter(p=>p.category==='Alimentari').filter(p=>pantryFilter==='Esauriti'?p.qty<=0:pantryFilter==='Da rifornire'?low(p):p.qty>0);b.disabled=!items.length;const label=page==='shopping'?'Svuota lista della spesa':pantryFilter==='Esauriti'?'Elimina tutti gli esauriti':'Segna tutti i prodotti come esauriti';b.setAttribute('aria-label',label);b.title=label;}

function showBulkOperation(){const items=page==='shopping'?state.shopping:state.pantry.filter(p=>p.category==='Alimentari').filter(p=>pantryFilter==='Esauriti'?p.qty<=0:pantryFilter==='Da rifornire'?low(p):p.qty>0);if(!items.length)return;const type=page==='shopping'?'removeShopping':pantryFilter==='Esauriti'?'deletePantry':'exhaust';bulkOperation={type,ids:items.map(p=>p.id)};const deleting=type!=='exhaust',title=type==='removeShopping'?'Svuotare la lista?':deleting?'Eliminare gli esauriti?':'Segnare tutto come esaurito?';$('#editor').innerHTML=editorHead(title)+`<p class="bulk-description">${items.length} ${items.length===1?'prodotto':'prodotti'}. ${deleting?'La rimozione è definitiva.':'I prodotti resteranno nella sezione Esauriti.'}</p><div class="editor-footer"><button data-command="close-dialog">Annulla</button><button class="${deleting?'danger':'primary'}" data-command="bulk-confirm">${deleting?'Elimina tutti':'Segna tutti esauriti'}</button></div>`;openDialog();}

const workspaceSections = {
 pantry: {title:'Dispensa', description:'Le tue scorte, a colpo d’occhio.', icon:'<path d="M4 8h16M6 8v12h12V8M9 12h6M5 4h14l1 4H4z"/>'},
 recipes: {title:'Piano', description:'Organizza i pasti dei prossimi giorni.', icon:'<rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7.5 3.5v4m9-4v4M4 10h16m-12 5h2m4 0h2"/>'},
 shopping: {title:'Spesa', description:'Tutto quello che ti serve al prossimo giro.', icon:'<path d="M3 8h18l-2 11H5L3 8Zm4 0 3-5m7 5-3-5m-5 9v3m6-3v3"/>'},
};
function workspaceIcon(section){
 return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${section.icon}</svg>`;
}
function workspaceNav(){
 return Object.entries(workspaceSections).map(([key,section])=>
  `<button data-nav="${key}" class="${page===key?'active':''}" ${page===key?'aria-current="page"':''}>${workspaceIcon(section)}<span>${section.title}</span></button>`
 ).join('');
}
function workspaceHeading(){
 const section=workspaceSections[page], catalog=page==='recipes'&&recipesView==='catalog';
 return `<header class="workspace-heading">
  <div class="workspace-heading-copy"><div class="workspace-kicker">Spesapp <span></span> ${section.title}</div>
   <h1>${catalog?'Ricettario':page==='recipes'?'Piano settimanale':section.title}</h1>
   <p>${catalog?'Cerca un piatto e scopri cosa puoi preparare.':section.description}</p>
  </div>
  <div class="workspace-metric" id="workspace-metric" ${page==='recipes'&&!catalog?'hidden':''}></div>
 </header>`;
}
function updateWorkspaceMetric(){
 const target=$('#workspace-metric');
 if(!target||target.hidden)return;
 const count=page==='shopping'?state.shopping.length:page==='pantry'?state.pantry.filter(item=>item.qty>0).length:state.recipes.length;
 const label=page==='shopping'?'in lista':page==='pantry'?'in dispensa':count===1?'ricetta':'ricette';
 target.innerHTML=`<strong>${count.toLocaleString('it-IT')}</strong><span>${label}</span>`;
}

function renderShell(){

 if(!state)return;

 document.body.dataset.page=page;

 $('#app').innerHTML=`<header class="topbar"><span class="brand"><span class="brand-symbol" aria-hidden="true">S</span>Spesapp</span><nav class="nav" aria-label="Sezioni">${workspaceNav()}</nav>${page!=='recipes'?`<button class="mobile-add ${isAddOpen()?'active':''}" data-command="toggle-add" aria-expanded="${isAddOpen()}">${isAddOpen()?'−':'＋'} Prodotto</button>`:'<span class="mobile-add mobile-add-placeholder" aria-hidden="true">＋ Prodotto</span>'}</header><main class="shell"><p id="sync-error" class="sync-error" role="alert" hidden></p>${workspaceHeading()}${page==='recipes'?`<div class="recipe-view-tabs"><button data-command="recipe-catalog" aria-pressed="${recipesView==='catalog'}">Ricettario</button><button data-command="recipe-week" aria-pressed="${recipesView==='week'}">Settimana</button><button class="recipe-history-tool" data-command="preparation-history" aria-label="Ultime ricette preparate" title="Ultime ricette preparate"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6m3-3v5l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="recipe-history-tool ready-tool" data-week="ready-list" aria-label="Porzioni già pronte" title="Porzioni già pronte"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 18h18M5 18v-2a7 7 0 0 1 14 0v2M12 9V6m-1 0h2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span id="ready-count" aria-hidden="true"></span></button><button class="recipe-history-tool" data-week="prepared-calories" aria-label="Calorie delle ricette preparate" title="Calorie preparate nella settimana"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M13 3c1 5 5 6 5 11a6 6 0 0 1-12 0c0-3 2-5 4-7 0 3 1 4 2 4 2-2 1-5 1-8Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></button></div>${catalogMaintenance?'<button data-command="catalog-review">Aggiorna ricettario</button>':''}${recipesView==='week'?'':`<div class="toolbar"><input id="search" type="search" aria-label="Cerca ricetta o più ingredienti separati da virgole" placeholder="CERCA RICETTA O INGREDIENTI: POLLO, PATATE…" value="${esc(search)}" maxlength="120"><button data-command="new-recipe">＋ Nuova ricetta</button></div><div class="recipe-filterbar"><div class="filters">${filterButtons(['Fattibili adesso','Non fattibili','Preferite'],recipeFilter,'recipe')}</div><label class="meal-filter"><span class="sr-only">Filtra per pasto</span><select id="meal-filter" aria-label="Filtra per pasto">${['Tutti i pasti',...mealTypes,...(state.recipes.some(r=>mealForRecipe(r)==='Da classificare')?['Da classificare']:[])].map(m=>`<option ${mealFilter===m?'selected':''}>${m}</option>`).join('')}</select></label><label class="meal-filter"><span class="sr-only">Filtra per tipo di piatto</span><select id="dish-filter" aria-label="Filtra per tipo di piatto">${['Tutti i tipi',...dishTypes].map(type=>`<option ${dishFilter===type?'selected':''}>${type}</option>`).join('')}</select></label></div>`}`:page==='pantry'?`${addForm()}<div class="toolbar"><input id="search" type="search" aria-label="Cerca in dispensa" placeholder="CERCA IN DISPENSA…" value="${esc(search)}" maxlength="120"></div><div class="stock-toolbar"><div class="filters pantry-filters">${filterButtons(['Disponibili','Da rifornire','Esauriti'],pantryFilter,'stock')}</div>${bulkButton()}</div>`:`${addForm()}<div class="shopping-list-tools"><button class="bulk-trash" data-command="buy-all" aria-label="Comprato tutto" title="Comprato tutto" ${state.shopping.length?'':'disabled'}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m4 12 4 4L20 4M4 20h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>${bulkButton()}</div>`}<section id="list" class="${page==='recipes'&&recipesView==='catalog'?'catalog-layout':''}" aria-label="${page==='shopping'?'Prodotti da comprare':page==='pantry'?'Prodotti in dispensa':'Ricette'}"></section></main>`;

 renderList();updateAddUnitError();

}

function quantityControl(p,kind,buttonsOnly=false){return `<div class="stepper ${buttonsOnly?'buttons-only':''}"><button ${kind==='pantry'&&p.qty<=0?'disabled':''} data-command="decrease" data-kind="${kind}" data-id="${esc(p.id)}" aria-label="Riduci ${esc(p.name)} di ${step(p.unit)} ${p.unit}">−</button>${buttonsOnly?`<output class="quantity-value" aria-label="Quantità ${esc(p.name)}">${formatQuantity(p.qty,p.unit)}</output>`:`<input type="number" min="${kind==='shopping'?(p.unit==='pz'?1:.000001):0}" max="1000000000" step="${p.unit==='pz'?1:'any'}" value="${p.qty}" data-quantity="${kind}" data-id="${esc(p.id)}" aria-label="Quantità ${esc(p.name)} in ${p.unit}" inputmode="decimal">`}<button data-command="increase" data-kind="${kind}" data-id="${esc(p.id)}" aria-label="Aumenta ${esc(p.name)} di ${step(p.unit)} ${p.unit}">＋</button></div>`;}

function householdSuggestionsHTML(){
 const suggestions=householdSuggestions(state);
 if(!suggestions.length)return '';
 return '<section class="household-suggestions" aria-label="Da ricomprare"><h2>Da ricomprare?</h2><p>In base ai tuoi acquisti, potrebbero essere quasi finiti.</p><div>'+suggestions.map(item=>'<button type="button" data-command="household-add" data-name="'+esc(item.name)+'">＋ '+esc(item.name)+' <span>'+item.qty+' P</span></button>').join('')+'</div></section>';
}

function renderList(){

 if(!$('#list')||!state)return;updateWorkspaceMetric();updateBulkButton();const query=normalize(search),terms=query.split(' ').filter(Boolean);

 if(page==='recipes'&&recipesView==='week'){if(weekUI)weekUI.render();else $('#list').innerHTML='<p class="empty">Caricamento delle settimane…</p>';return;}

 if(page==='recipes'){

  const unitLookup=createUnitLookup(state);

  let recipes=state.recipes.filter(r=>(mealFilter==='Tutti i pasti'||mealForRecipe(r)===mealFilter)&&(dishFilter==='Tutti i tipi'||recipeDishTypes(r).includes(dishFilter))&&recipeMatchesSearch(r,search)).map(r=>({r,status:recipeStatus(state,r,unitLookup)}));

  recipes=recipes.filter(({r,status})=>recipeFilter==='Preferite'?!!r.favorite:status.possible===(recipeFilter==='Fattibili adesso')).sort((a,b)=>((mealTypes.indexOf(mealForRecipe(a.r))+1||99)-(mealTypes.indexOf(mealForRecipe(b.r))+1||99))||(Number(b.status.possible)-Number(a.status.possible))||((state.counts[b.r.id]||0)-(state.counts[a.r.id]||0))||a.r.name.localeCompare(b.r.name,'it'));

  reconcile($('#list'),recipes.map(({r,status},index)=>`${index===0||mealForRecipe(recipes[index-1].r)!==mealForRecipe(r)?`<h2 class="group-title meal-heading" data-key="meal-${esc(mealForRecipe(r))}">${esc(mealForRecipe(r))}</h2>`:''}<details class="recipe" name="recipe-accordion" data-recipe="${esc(r.id)}" ${openRecipes.has(r.id)?'open':''}><summary><span class="recipe-name">${esc(r.name)}</span>${calorieBadge(r)}${effortBadge(r,getCookingPreferences())}<span class="recipe-capacity ${status.preparations>0?'ready':''}" aria-label="Puoi farla ${status.preparations} ${status.preparations===1?'volta':'volte'}" title="Puoi farla ${status.preparations} ${status.preparations===1?'volta':'volte'}"><span class="capacity-description">Puoi farla </span>${status.preparations}<span class="capacity-description"> ${status.preparations===1?'volta':'volte'}</span></span></summary><div class="recipe-body">${(r.id.startsWith('classic-20261102-')||r.id.startsWith('classic-20261103-sweet-')||r.id.startsWith('classic-20261108-'))?'<small class="recipe-dose-note">Dosi orientative per una porzione; condimenti q.b. e pesi dei singoli ortaggi adattati dalla fonte. Verifica il procedimento nel link.</small>':''}<div class="recipe-actions"><button data-command="cook" data-id="${esc(r.id)}" ${status.unitConflicts.length?'disabled':''}>Preparata</button>${r.source_url?`<a href="${esc(r.source_url)}" target="_blank" rel="noopener noreferrer">Apri la ricetta ↗</a>`:r.instructions?'':`<button data-command="edit-recipe" data-id="${esc(r.id)}">Aggiungi il link alla ricetta</button>`}</div>${recipeInstructions(r)}${status.unitConflicts.length?`<p class="recipe-unit-warning" role="status">Correggi unità e dosi: ${status.unitConflicts.map(i=>`${esc(i.ingredient)} deve usare ${unitLabel(i.expected)}`).join(', ')} come in dispensa o nella lista.</p>`:''}<ul class="ingredients compact-ingredients">${status.ingredients.map(i=>{const available=state.pantry.find(p=>p.name===i.ingredient&&p.unit===i.unit&&p.category==='Alimentari')?.qty||0,missing=Math.max(0,round(i.qty-available));return `<li class="${missing>0?'ingredient-missing':'ingredient-ready'}"><strong>${esc(i.ingredient)}<small class="ingredient-stock">${missing>0?'Mancano '+formatQuantity(missing,i.unit)+(available>0?' · Hai '+formatQuantity(available,i.unit):''):'✓ Disponibile'}</small></strong><span>${formatQuantity(i.qty,i.unit)}</span></li>`;}).join('')}</ul>${!status.possible&&!status.unitConflicts.length?`<button class="missing-shop" data-command="recipe-shopping" data-id="${esc(r.id)}" ${recipeShoppingPlan(state,r,unitLookup).length?'':'disabled'} title="Ingredienti mancanti per una persona, arrotondati per eccesso">${recipeShoppingPlan(state,r,unitLookup).length?'＋ Mancanti in spesa':'✓ Mancanti già in lista'}</button>`:''}<div class="recipe-footer"><button data-command="favorite-recipe" data-id="${esc(r.id)}" aria-pressed="${!!r.favorite}" aria-label="${r.favorite?'Rimuovi dai preferiti':'Aggiungi ai preferiti'}">${r.favorite?'★':'☆'} Preferita</button><button data-command="edit-recipe" data-id="${esc(r.id)}">Modifica</button><button data-command="delete-recipe" data-id="${esc(r.id)}">Elimina</button></div></div></details>`).join('')||'<p class="empty">'+(query?'Nessuna ricetta corrisponde alla ricerca.':(mealFilter!=='Tutti i pasti'||dishFilter!=='Tutti i tipi')?'Nessuna ricetta corrisponde ai filtri.':recipeFilter==='Preferite'?'Nessuna ricetta preferita. Usa ☆ sulla ricetta per aggiungerla.':recipeFilter==='Fattibili adesso'?'Non hai ancora tutti gli ingredienti per queste ricette.':'Nessuna ricetta in questa sezione.')+'</p>');return;

 }

 const rows=page==='shopping'?[...state.shopping,...[...leaving.values()].filter(entry=>!state.shopping.some(p=>p.id===entry.product.id)).map(entry=>entry.product)]:state.pantry;

 let items=rows.filter(p=>terms.every(t=>p.name.includes(t)));

 if(page==='pantry')items=items.filter(p=>p.category==='Alimentari').filter(p=>((pantryFilter==='Disponibili'?p.qty>0:stockView(p)===pantryFilter)||((grace.get(p.id)||0)>Date.now())));

 const ids=new Set(items.map(p=>p.id));order=order.filter(id=>ids.has(id));for(const p of [...items].sort((a,b)=>a.qty-b.qty||a.name.localeCompare(b.name,'it')))if(!order.includes(p.id))order.push(p.id);

 reconcile($('#list'),(page==='shopping'&&!query?householdSuggestionsHTML():'')+(['Alimentari','Altro'].map(category=>{const products=items.filter(p=>p.category===category).sort((a,b)=>page==='shopping'||category==='Alimentari'?a.name.localeCompare(b.name,'it'):order.indexOf(a.id)-order.indexOf(b.id));if(!products.length)return '';return `<h2 class="group-title ${page==='shopping'&&products.every(p=>leaving.has(p.id))?'leaving-group':''}" data-key="group-${category}">${category}<span class="section-count">${products.length}</span></h2>`+products.map(p=>`<article data-key="${page}-${esc(p.id)}" class="product ${page==='shopping'?'shopping-product':'pantry-product'} ${page==='shopping'&&leaving.has(p.id)?'is-leaving':''}" ${page==='shopping'&&leaving.has(p.id)?`style="--row-height:${leaving.get(p.id).height}px"`:''}><div class="product-name">${esc(p.name)} <span class="unit">· ${p.unit==='l'&&p.qty>0&&p.qty<1?formatQuantity(p.qty,p.unit):unitLabel(p.unit)}</span>${page==='pantry'&&low(p)?'<span class="stock-label">Scorta bassa</span>':page==='pantry'&&p.qty<=0?'<span class="stock-label">Esaurito</span>':''}</div>${page==='pantry'&&mobile()?quantityControl(p,'pantry',true):page==='pantry'?`${quantityControl(p,'pantry')}<button class="pantry-actions ${p.qty<=0&&pantryFilter==='Esauriti'?'danger':''}" data-command="${p.qty<=0&&pantryFilter==='Esauriti'?'delete-pantry':'exhaust'}" data-id="${esc(p.id)}">${p.qty<=0&&pantryFilter==='Esauriti'?'Elimina':'Esaurito'}</button>`:`<div class="shopping-controls">${quantityControl(p,'shopping')}<button class="primary buy" data-command="buy" data-id="${esc(p.id)}" aria-label="Segna comprato ${esc(p.name)}">✓ Comprato</button><button class="remove" data-command="remove-shopping" data-id="${esc(p.id)}" aria-label="Rimuovi ${esc(p.name)} dalla lista">×</button></div>`}</article>`).join('');}).join('')||'<p class="empty">'+(query?'Nessun prodotto corrisponde alla ricerca.':page==='shopping'?'La lista è vuota.':'Nessun prodotto in questa sezione.')+'</p>'));

 for(const row of document.querySelectorAll('.is-leaving'))for(const control of row.querySelectorAll('button,input'))control.disabled=true;

}

const graceTimers=new Map();

function markGrace(id){clearTimeout(graceTimers.get(id));grace.set(id,Date.now()+1000);graceTimers.set(id,setTimeout(()=>{graceTimers.delete(id);grace.delete(id);renderList();},1050));}


function updateAddDefaults(){const form=$('#add-form');if(!form)return;const previousUnit=form.elements.unit.value;const chosen=[...state.pantry,...state.shopping].find(p=>p.name===normalize(form.elements.name.value));if(chosen){form.elements.category.value=chosen.category;form.elements.unit.value=chosen.unit;}refreshUnits(form,previousUnit);}

function refreshUnits(form,previousUnit=form.dataset.lastUnit||'g'){const cat=form.elements.category.value,unit=form.elements.unit;for(const option of unit.options)option.disabled=cat==='Altro'&&option.value!=='pz';if(cat==='Altro')unit.value='pz';const q=form.elements.qty;q.step=unit.value==='pz'?'1':'any';q.min=unit.value==='pz'?1:.000001;if(unit.value!==previousUnit||!q.value||Number(q.value)<=0)q.value=defaultQuantity(unit.value);form.dataset.lastUnit=unit.value;updateAddUnitError();}

function updateAddUnitError(){const form=$('#add-form'),area=$('#add-unit-error');if(!form||!area)return;const name=normalize(form.elements.name.value),expected=productUnit(state,name),mismatch=!!expected&&form.elements.unit.value!==expected;area.hidden=!mismatch;area.textContent=mismatch?`${name} deve usare ${unitLabel(expected)}, come in dispensa, nella lista e nelle ricette. Scegli ${unitLabel(expected)} per aggiungerlo.`:'';}

function refreshSuggestions(){const target=$('#product-options');if(target)reconcile(target,catalog().map(p=>`<option value="${esc(p.name)}">${esc(p.category)}</option>`).join(''));}

function editorHead(title){return `<div class="dialog-head"><h2>${esc(title)}</h2><button data-command="close-dialog" aria-label="Chiudi">×</button></div>`;}

function showRecipeEditor(recipe=null){

 editingRecipe=recipe;draftIngredients=recipe?structuredClone(recipe.ingredients):[{ingredient:'',qty:50,unit:'g'}];

 $('#editor').innerHTML=editorHead(recipe?'Modifica ricetta':'Nuova ricetta')+`<form id="recipe-form" class="editor-form"><label>Nome ricetta · una persona<input name="name" maxlength="120" value="${esc(recipe?.name||'')}" required></label><label>Tipo di pasto<select name="meal" aria-required="true"><option value="" disabled ${!mealTypes.includes(mealForRecipe(recipe))?'selected':''}>Scegli il pasto</option>${mealTypes.map(meal=>`<option value="${meal}" ${recipe&&mealForRecipe(recipe)===meal?'selected':''}>${meal}</option>`).join('')}</select></label><label>Kcal per porzione · facoltative<input name="kcal" type="number" min="0" max="10000" step="1" value="${recipe?.kcal??''}" placeholder="CALCOLO AUTOMATICO DAGLI INGREDIENTI"></label><div class="recipe-effort-editor"><label>Minuti di lavoro attivo<input name="activeMinutes" type="number" min="1" max="240" step="1" value="${getCookingPreferences().recipeInfo[recipe?.id]?.minutes??''}" placeholder="${recipe?recipeEffort(recipe,getCookingPreferences()).minutes??'DA INDICARE':'DA INDICARE'}"></label><label>Difficoltà<select name="difficulty"><option value="">Indicazione automatica</option>${['Facile','Media','Impegnativa'].map(d=>`<option value="${d}" ${getCookingPreferences().recipeInfo[recipe?.id]?.difficulty===d?'selected':''}>${d}</option>`).join('')}</select></label></div><label>Link alla ricetta o al video · facoltativo<input type="url" maxlength="2048" name="source_url" value="${esc(recipe?.source_url||'')}" placeholder="https://…"></label><label>Preparazione · facoltativa<textarea name="instructions" maxlength="20000" rows="3">${esc(recipe?.instructions||'')}</textarea></label><div id="ingredient-editor"></div><button type="button" data-command="add-ingredient">＋ Ingrediente</button><div class="input-error" role="alert" id="editor-error"></div><div class="editor-footer"><button type="button" data-command="close-dialog">Annulla</button><button class="primary">Salva ricetta</button></div></form>`;renderIngredientEditor();$('#editor').showModal();

}

function renderIngredientEditor(){

 $('#ingredient-editor').innerHTML=draftIngredients.map((i,n)=>`<div class="ingredient-edit"><label>Ingrediente<input list="ingredient-options" maxlength="120" data-ing="${n}" data-prop="ingredient" value="${esc(i.ingredient)}" required>${productUnit(state,i.ingredient,editingRecipe?.id)&&productUnit(state,i.ingredient,editingRecipe?.id)!==i.unit?`<small class="unit-hint">In uso: ${unitLabel(productUnit(state,i.ingredient,editingRecipe?.id))}. Correggi dose e unità.</small>`:''}</label><label>Quantità<input type="number" min="0.000001" max="1000000000" step="any" data-ing="${n}" data-prop="qty" value="${i.qty}" required inputmode="decimal"></label><label>Unità<select data-ing="${n}" data-prop="unit">${['g','l','pz'].map(u=>`<option value="${u}" ${i.unit===u?'selected':''}>${unitLabel(u)}</option>`).join('')}</select></label><button type="button" data-command="remove-ingredient" data-index="${n}" aria-label="Rimuovi ingrediente ${n+1}">×</button></div>`).join('')+`<datalist id="ingredient-options">${catalog().filter(p=>p.category==='Alimentari').map(p=>`<option value="${esc(p.name)}">`).join('')}</datalist>`;

}

function updateIngredientUnitHint(index){const item=draftIngredients[index],field=document.querySelector(`[data-ing="${index}"][data-prop="ingredient"]`);if(!item||!field)return;const expected=productUnit(state,item.ingredient,editingRecipe?.id);let hint=field.parentElement.querySelector('.unit-hint');if(expected&&expected!==item.unit){if(!hint){hint=document.createElement('small');hint.className='unit-hint';field.parentElement.append(hint);}hint.textContent=`In uso: ${unitLabel(expected)}. Correggi dose e unità.`;}else hint?.remove();}



function openDialog(){if(!$('#editor').open)$('#editor').showModal();}

function recipeInstructions(recipe){
 return recipe.instructions ? `<div class="recipe-instructions"><strong>Preparazione</strong><p>${esc(recipe.instructions)}</p></div>` : '';
}

function showRecipeSheet(id,mealContext=null){weekUI?.observeRecipes([id],'open','week');const r=state.recipes.find(r=>r.id===id);if(!r){notify('Questa ricetta non è più nel ricettario.',true);return;}$('#editor').innerHTML=`<article class="recipe-sheet"><header class="recipe-sheet-head"><h2>${esc(r.name)}</h2><div class="recipe-sheet-tools">${favoriteButton(r,true)}<button type="button" data-command="close-dialog" aria-label="Chiudi">×</button></div><div class="recipe-sheet-meta">${calorieBadge(r)}${effortBadge(r,getCookingPreferences())}<span class="recipe-sheet-dose">Per 1 porzione</span></div></header><div class="recipe-sheet-body"><ul class="ingredients compact-ingredients sheet-ingredients">${r.ingredients.map(i=>`<li><strong>${esc(i.ingredient)}</strong><span>${formatQuantity(i.qty,i.unit)}</span></li>`).join('')}</ul>${recipeInstructions(r)}${(r.id.startsWith('classic-20261102-')||r.id.startsWith('classic-20261103-sweet-')||r.id.startsWith('classic-20261108-'))?'<small class="sheet-dose-note">Pesi dei singoli ortaggi e condimenti indicativi: verifica le dosi nella fonte.</small>':''}</div><footer class="recipe-sheet-actions">${r.source_url?`<a href="${esc(r.source_url)}" target="_blank" rel="noopener noreferrer">Apri la ricetta ↗</a>`:'<span></span>'}<button type="button" class="primary" data-command="cook" data-id="${esc(r.id)}" ${mealContext?'data-meal-start="'+esc(mealContext.start)+'" data-meal-id="'+esc(mealContext.mealId)+'"':''}>Preparata</button></footer></article>`;openDialog();}

let historyRequest=0;
async function showPreparationHistory(){const request=++historyRequest;$('#editor').innerHTML=editorHead('Ultime ricette preparate')+'<div data-preparation-history><p class="empty" role="status">Caricamento…</p></div>';openDialog();try{const entries=await store.getPreparationHistory();const root=$('[data-preparation-history]');if(request!==historyRequest||!root||!$('#editor').open)return;const dates=new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});root.innerHTML=entries.length?'<ul class="preparation-history">'+entries.map(e=>`<li><div><strong>${esc(e.name)}</strong><small>${esc(dates.format(new Date(e.at)))}</small></div><div class="history-entry-tools"><span>${e.people} ${e.people===1?'porzione':'porzioni'}</span>${state.recipes.some(r=>r.id===e.recipeId)?favoriteButton(state.recipes.find(r=>r.id===e.recipeId),true):''}</div></li>`).join('')+'</ul>':'<p class="empty">Nessuna preparazione con data registrata.</p>';}catch(e){const root=$('[data-preparation-history]');if(request===historyRequest&&root&&$('#editor').open)root.innerHTML='<p class="input-error" role="alert">Non è stato possibile caricare lo storico. Controlla la connessione e riprova.</p><button data-command="preparation-history">Riprova</button>';}}

function showPreparation(recipe,people=1,substitutions=[],mealContext=null){if(!recipe)throw Error('Questa ricetta non è più disponibile.');preparation={recipe:structuredClone(recipe),people,mealContext,selected:[],amounts:[],base:recipeStatus(state,recipe).ingredients.map(i=>({ingredient:i.ingredient,unit:i.unit,qty:i.qty}))};for(const [n,i]of preparation.base.entries()){const replacement=substitutions.find(x=>x.sourceIngredient===i.ingredient&&x.sourceUnit===i.unit);if(replacement)preparation.selected[n]={ingredient:replacement.ingredient,unit:replacement.unit,qty:replacement.qty};}$('#editor').innerHTML=editorHead('Preparata · '+recipe.name)+`<form id="preparation-form" class="editor-form"><label>Numero di porzioni<input type="number" id="preparation-people" name="people" min="1" max="1000" step="1" value="${people}" required></label><div class="prep-factors">${[1,2,3].map(n=>`<button type="button" data-command="preparation-factor" data-value="${n}">×${n}</button>`).join('')}</div><p class="plan-caption">Puoi sostituire gli ingredienti con prodotti della dispensa e correggere le dosi. Le alternative ↔ sono indicative: verifica che siano adatte al piatto. La ricetta salvata resta invariata.</p><div id="preparation-rows"></div><p class="input-error" role="status" id="preparation-availability"></p><p class="input-error" role="alert" id="preparation-error"></p><div class="editor-footer"><button type="button" data-command="close-dialog">Annulla</button><button class="primary">Conferma preparazione</button></div></form>`;renderPreparationRows();openDialog();}

function preparationAmounts(){return preparation?.base.map((i,n)=>{const used=preparation.selected[n]||i;return {...used,sourceIngredient:i.ingredient,sourceUnit:i.unit,qty:document.querySelector(`[name="used-${n}"]`)?.valueAsNumber};});}

function renderPreparationRows(){if(!preparation||!$('#preparation-rows'))return;$('#preparation-rows').innerHTML=preparation.base.map((original,n)=>{const i=preparation.selected[n]||original,choices=preparationAlternatives(state,original.ingredient);return `<div class="preparation-row"><label for="used-${n}">${esc(original.ingredient)}<small class="prep-available" data-prep-available="${n}"></small></label><input id="used-${n}" name="used-${n}" data-prep-used type="number" min="0" max="1000000000" step="${i.unit==='pz'?1:'any'}" value="${preparation.amounts[n]??round(i.qty*preparation.people)}" aria-label="Quantità usata ${esc(i.ingredient)} in ${i.unit}" required><span>${unitLabel(i.unit)}</span><label class="prep-substitution">Sostituisci ingrediente<select data-prep-substitute="${n}" aria-label="Sostituisci ${esc(original.ingredient)}"><option value="">${esc(original.ingredient)} · originale</option>${choices.map(p=>`<option value="${esc(p.id)}" ${i.ingredient===p.name&&i.unit===p.unit?'selected':''}>${p.suggested?'↔ ':''}${esc(p.name)} · ${formatQuantity(p.qty,p.unit)}</option>`).join('')}</select></label></div>`;}).join('');updatePreparationAvailability();}

function updatePreparationAvailability(){
 const form=$('#preparation-form');
 if(!preparation||!form)return;
 let valid=true;
 for(const [n,original] of preparation.base.entries()){
  const ingredient=preparation.selected[n]||original;
  const available=state.pantry.filter(p=>p.category==='Alimentari'&&p.name===ingredient.ingredient&&p.unit===ingredient.unit).reduce((sum,p)=>sum+p.qty,0);
  const row=$(`[data-prep-available="${n}"]`),field=form.elements[`used-${n}`];
  const missing=round(field.valueAsNumber-available);
  row.textContent='Disponibili '+formatQuantity(available,ingredient.unit)+(missing>0?' · Mancano '+formatQuantity(missing,ingredient.unit):'');
  row.classList.toggle('insufficient',missing>0||!field.validity.valid);
  valid&&=field.validity.valid;
 }
 let problem='';
 if(!form.elements.people.validity.valid)problem='Inserisci un numero intero di porzioni tra 1 e 1000.';
 else if(!valid)problem='Controlla le quantità inserite negli ingredienti.';
 else try{
  const status=preparationStatus(state,preparation.recipe,preparation.people,preparationAmounts());
  if(!status.possible)problem=`Per ${status.people===1?'una porzione':status.people+' porzioni'} mancano: ${status.missing.map(i=>i.ingredient).join(', ')}.`;
 }catch(error){problem=error.message;}
 const feedback=$('#preparation-availability'),message=problem||(meta.pending>0?'Attendi il salvataggio delle ultime modifiche.':'');
 if(feedback.textContent!==message)feedback.textContent=message;
 form.querySelector('.primary').disabled=Boolean(message);
 for(const button of form.querySelectorAll('[data-command="preparation-factor"]'))button.setAttribute('aria-pressed',String(Number(button.dataset.value)===preparation.people));
}


function catalogMissing(){const room=Math.max(0,LIMITS.recipes-state.recipes.length);if(!room)return [];const lookup=createUnitLookup(state);return classicRecipes.filter(r=>r.id.startsWith('classic-20261103-sweet-')&&!state.recipes.some(x=>x.id===r.id||x.name===r.name||x.source_url&&x.source_url.replace(/\/$/,'')===r.source_url.replace(/\/$/,''))&&!recipeStatus(state,r,lookup).unitConflicts.length).slice(0,room);}

function showCatalogReview(){const missing=catalogMissing();$('#editor').innerHTML=editorHead('Aggiorna ricettario')+`<p>Ricette presenti: ${state.recipes.length} / ${LIMITS.recipes}.</p><p>${missing.length} nuove ricette per colazioni e dolci, con dosi per una persona e fonte verificata.</p><ul class="catalog-review">${missing.map(r=>`<li>${esc(r.name)}</li>`).join('')}</ul><button class="primary" data-command="catalog-add" ${missing.length?'':'disabled'}>Aggiungi ${missing.length} ricette</button>`;openDialog();}

document.addEventListener('dblclick',event=>{if(mobile()||event.target.closest('.stepper,.add-stepper'))event.preventDefault();},{passive:false});

document.addEventListener('gesturestart',event=>{if(mobile())event.preventDefault();},{passive:false});

document.addEventListener('touchmove',event=>{if(mobile()&&event.touches.length>1)event.preventDefault();},{passive:false});

let lastBlankTouch=0;

document.addEventListener('touchend',event=>{if(!mobile()||event.changedTouches.length!==1||event.target.closest('button,input,select,textarea,a,summary,label'))return;const now=Date.now();if(now-lastBlankTouch<300)event.preventDefault();lastBlankTouch=now;},{passive:false});

document.addEventListener('focusin',event=>{const el=event.target;if(el.dataset.quantity){const p=state?.[el.dataset.quantity]?.find(p=>p.id===el.dataset.id);if(p)editingBaselines.set(el.dataset.quantity+':'+el.dataset.id,p.qty);}});

document.addEventListener('focusout',event=>{const el=event.target;if(el.dataset.quantity)editingBaselines.delete(el.dataset.quantity+':'+el.dataset.id);});

document.addEventListener('input',event=>{

 const el=event.target;if(el.hasAttribute('data-prep-used')&&preparation)preparation.amounts[Number(el.name.slice(5))]=el.valueAsNumber;if(el.id==='preparation-people'&&preparation){preparation.people=el.valueAsNumber;preparation.amounts=[];if(Number.isInteger(preparation.people)&&preparation.people>=1&&preparation.people<=1000)renderPreparationRows();else updatePreparationAvailability();}if(el.hasAttribute('data-prep-used'))updatePreparationAvailability();if(el.id==='search'){search=el.value;order=[];renderList();}

 if(el.matches('#add-form [name=name]')){const match=catalog().find(p=>p.name===normalize(el.value));if(match)updateAddDefaults();updateAddUnitError();}

 if(el.dataset.ing!==undefined){const item=draftIngredients[Number(el.dataset.ing)];if(item){item[el.dataset.prop]=el.dataset.prop==='qty'?el.valueAsNumber:el.value;updateIngredientUnitHint(Number(el.dataset.ing));}}

});

document.addEventListener('keydown',event=>{if(event.target.dataset.quantity&&event.key==='Enter'){event.preventDefault();event.target.blur();}});

document.addEventListener('change',event=>{

 const el=event.target;

 if(el.hasAttribute('data-prep-substitute')&&preparation){const n=Number(el.dataset.prepSubstitute),original=preparation.base[n],p=state.pantry.find(p=>p.id===el.value&&p.category==='Alimentari'&&p.qty>0);if(!original)return;const previous=preparation.selected[n]||original;preparation.selected[n]=p?{ingredient:p.name,unit:p.unit,qty:p.unit===original.unit?original.qty:defaultQuantity(p.unit)}:null;const next=preparation.selected[n]||original;if(next.unit!==previous.unit)preparation.amounts[n]=round(next.qty*preparation.people);renderPreparationRows();return;}
 if(el.id==='dish-filter'){dishFilter=el.value;openRecipes.clear();renderList();return;}
 if(el.id==='meal-filter'){mealFilter=el.value;openRecipes.clear();renderList();return;}

 if(el.matches('#add-form [name=category],#add-form [name=unit]')){if(el.name==='category'&&el.value==='Alimentari'&&el.form.elements.unit.value==='pz')el.form.elements.unit.value='g';refreshUnits(el.form);}

 if(el.dataset.ing!==undefined&&el.dataset.prop==='unit'){const item=draftIngredients[Number(el.dataset.ing)];if(item){item.unit=el.value;updateIngredientUnitHint(Number(el.dataset.ing));}}

 if(el.dataset.ing!==undefined&&el.dataset.prop==='ingredient'){const item=draftIngredients[Number(el.dataset.ing)],chosen=[...state.pantry,...state.shopping].find(p=>p.name===normalize(el.value)&&p.category==='Alimentari');if(item&&chosen&&!editingRecipe?.ingredients[Number(el.dataset.ing)]){const old=item.unit;item.unit=chosen.unit;const row=el.closest('.ingredient-edit');row.querySelector('select').value=item.unit;if(item.qty===step(old)){item.qty=step(item.unit);row.querySelector('[data-prop=qty]').value=item.qty;}updateIngredientUnitHint(Number(el.dataset.ing));}}

 if(el.dataset.quantity){const id=el.dataset.id,kind=el.dataset.quantity,previous=state[kind]?.find(p=>p.id===id);if(!previous)return;if(!el.value.trim()||!el.checkValidity()){notify(previous.unit==='pz'&&el.value.trim()?'I pezzi devono essere interi. Il valore precedente è stato mantenuto.':'Inserisci una quantità valida. Il valore precedente è stato mantenuto.',true);el.value=previous.qty;return;}if(el.valueAsNumber===previous.qty){editingBaselines.delete(kind+':'+id);return;}if(kind==='pantry')markGrace(id);if(!action('quantity',{kind,id,qty:el.valueAsNumber,expected:editingBaselines.get(kind+':'+id)??previous.qty}))el.value=previous.qty;editingBaselines.delete(kind+':'+id);}

});

document.addEventListener('toggle',event=>{const el=event.target;if(el.isConnected&&el.matches?.('details[data-recipe]')){if(el.open){openRecipes.clear();openRecipes.add(el.dataset.recipe);for(const other of document.querySelectorAll('details[data-recipe][open]'))if(other!==el)other.open=false;}else openRecipes.delete(el.dataset.recipe);}},true);

document.addEventListener('submit',event=>{

 event.preventDefault();const form=event.target;

 if(form.id==='preparation-form'){try{if(!preparation)return;if(meta.pending)throw Error('Attendi il salvataggio delle ultime modifiche.');const button=form.querySelector('.primary');button.disabled=true;const success=action('cook',{id:preparation.recipe.id,people:preparation.people,ingredients:preparationAmounts(),expectedRecipe:preparation.recipe,...(preparation.mealContext?{mealContext:preparation.mealContext}:{})});if(success){preparation=null;$('#editor').close();notify('Preparazione registrata. Dispensa aggiornata.');}else updatePreparationAvailability();}catch(e){$('#preparation-error').textContent=e.message;updatePreparationAvailability();}return;}

 if(form.id==='add-form'){

  refreshUnits(form);const data=new FormData(form),success=action(page==='pantry'?'addPantry':'addShopping',{name:data.get('name'),category:data.get('category'),qty:Number(data.get('qty')),unit:data.get('category')==='Altro'?'pz':data.get('unit')});

  if(success){if(page==='pantry'){pantryFilter='Disponibili';search='';$('#search').value='';for(const item of document.querySelectorAll('[data-filter=stock]')){const active=item.dataset.value===pantryFilter;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));}renderList();}const current=$('#add-form');current.classList.remove('flash');void current.offsetWidth;current.classList.add('flash');current.elements.name.value='';current.elements.qty.value=defaultQuantity(current.elements.unit.value);current.elements.name.focus();updateAddUnitError();}

 }

 if(form.id==='recipe-form'){

  try{const data=new FormData(form),recipe=validateRecipe({id:editingRecipe?.id||crypto.randomUUID(),name:data.get('name'),meal:data.get('meal'),source_url:data.get('source_url'),instructions:data.get('instructions')||'',tools:editingRecipe?.tools||[],favorite:editingRecipe?.favorite||false,...(data.get('kcal')!==''?{kcal:Number(data.get('kcal'))}:{}),ingredients:draftIngredients}),info={minutes:data.get('activeMinutes')?Number(data.get('activeMinutes')):null,difficulty:data.get('difficulty')||null},oldInfo=getCookingPreferences().recipeInfo[recipe.id]||{},effortChanged=info.minutes!==(oldInfo.minutes??null)||info.difficulty!==(oldInfo.difficulty??null);if(effortChanged){if(!weekUI?.ready)throw Error('Attendi il caricamento delle preferenze prima di salvare tempo e difficoltà.');updateCookingPreferences(getCookingPreferences(),{kind:'effort',recipeId:recipe.id,info},Date.now());}if(action('saveRecipe',{recipe,...(editingRecipe?{expected:editingRecipe}:{})})){if(effortChanged)weekUI.savePreferences({kind:'effort',recipeId:recipe.id,info});$('#editor').close();search='';mealFilter='Tutti i pasti';dishFilter='Tutti i tipi';recipeFilter=recipeStatus(state,recipe).possible?'Fattibili adesso':'Non fattibili';renderShell();notify('Ricetta salvata.');}}catch(e){$('#editor-error').textContent=e.message;}

 }

});

document.addEventListener('click',event=>{const summary=event.target.closest('details.recipe>summary');if(summary&&!summary.parentElement.open)weekUI?.observeRecipes([summary.parentElement.dataset.recipe],'open','catalog');});

document.addEventListener('click',async event=>{

 const button=event.target.closest('button');if(!button)return;

 if(button.dataset.nav){nav(button.dataset.nav);return;}

 if(button.dataset.filter){const {filter,value}=button.dataset;if(filter==='recipe')recipeFilter=value;else pantryFilter=value;grace.clear();order=[];for(const item of document.querySelectorAll(`[data-filter="${filter}"]`)){const active=item.dataset.value===value;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));}renderList();return;}

 const {command,id}=button.dataset;try{switch(command){

 case 'household-add':{const item=householdSuggestions(state).find(item=>item.name===button.dataset.name);if(item)action('addShopping',{name:item.name,category:'Altro',qty:item.qty,unit:'pz'});break;}
 case 'toggle-add':if(page==='pantry'){pantryAddOpen=!pantryAddOpen;writePreference('spesapp-pantry-add-open',pantryAddOpen?'1':'0');}else{addOpen=!addOpen;writePreference('spesapp-add-open',addOpen?'1':'0');}const form=$('#add-form');if(form){form.hidden=!isAddOpen();form.style.display=isAddOpen()?'':'none';}button.setAttribute('aria-expanded',String(isAddOpen()));button.textContent=(isAddOpen()?'−':'＋')+' Prodotto';break;

 case 'add-increase':case 'add-decrease':{const f=$('#add-form');if(!f)break;refreshUnits(f);const q=f.elements.qty,amount=step(f.elements.unit.value),current=Number(q.value);const next=round((Number.isFinite(current)?current:0)+(command==='add-increase'?amount:-amount));q.value=next>0?Math.min(LIMITS.quantity,next):(current>0?current:defaultQuantity(f.elements.unit.value));q.dispatchEvent(new Event('input',{bubbles:true}));break;}

 case 'increase':case 'decrease':{const kind=button.dataset.kind,p=state[kind].find(p=>p.id===id);if(!p)break;if(kind==='pantry')markGrace(id);action('quantity',{kind,id,delta:step(p.unit)*(command==='increase'?1:-1)});break;}

 case 'buy':{if(leaving.has(id))break;const product=state.shopping.find(p=>p.id===id),row=button.closest('.product');if(!product||!row)break;leaving.set(id,{product:structuredClone(product),height:row.getBoundingClientRect().height});button.disabled=true;if(!action('buy',{id})){leaving.delete(id);renderList();break;}setTimeout(()=>{leaving.delete(id);renderList();},260);break;}

 case 'remove-shopping':button.disabled=true;if(!action('removeShopping',{id}))button.disabled=false;break;

 case 'buy-all':{const ids=state.shopping.map(p=>p.id);if(!ids.length)break;button.disabled=true;if(action('buy',{ids}))notify('Tutti i prodotti segnati come comprati.');else button.disabled=false;break;}
 case 'bulk-open':showBulkOperation();break;

 case 'bulk-confirm':{const operation=bulkOperation;if(!operation)break;button.disabled=true;if(action(operation.type,{ids:operation.ids})){$('#editor').close();bulkOperation=null;notify(operation.type==='exhaust'?'Prodotti segnati come esauriti.':'Elenco svuotato.');}else button.disabled=false;break;}

 case 'exhaust':button.disabled=true;if(!action('exhaust',{id}))button.disabled=false;break;

 case 'delete-pantry':button.disabled=true;if(!action('deletePantry',{id}))button.disabled=false;break;

 case 'catalog-review':showCatalogReview();break;

 case 'catalog-add':{if(meta.pending)throw Error('Attendi il salvataggio delle modifiche prima di aggiungere le ricette.');if(!meta.preview&&!navigator.onLine)throw Error('Connettiti per aggiungere il catalogo completo.');button.disabled=true;const missing=catalogMissing();let saved=true;for(let i=0;i<missing.length;i+=40){if(!button.isConnected){saved=false;break;}const chunk=missing.slice(i,i+40);if(!action('saveRecipe',{recipes:chunk})){saved=false;break;}button.textContent='Salvataggio '+Math.min(i+40,missing.length)+' / '+missing.length+'…';const until=Date.now()+60000;while(meta.pending){if(!navigator.onLine||Date.now()>until){saved=false;break;}await new Promise(resolve=>setTimeout(resolve,150));}if(!saved)break;if(!chunk.every(r=>state.recipes.some(x=>x.id===r.id||x.name===r.name))){saved=false;break;}await new Promise(resolve=>setTimeout(resolve,0));}if(saved)notify('Ricettario aggiornato.');else if(button.isConnected)notify('Le ricette già salvate restano disponibili. Puoi riprendere l’aggiunta delle restanti.');if(button.isConnected)showCatalogReview();break;}


 case 'recipe-catalog':recipesView='catalog';renderShell();break;

 case 'recipe-week':recipesView='week';weekUI?.openToday();renderShell();break;

 case 'preparation-history':await showPreparationHistory();break;
 case 'cook':showPreparation(state.recipes.find(r=>r.id===id),1,[],button.dataset.mealId?{start:button.dataset.mealStart,mealId:button.dataset.mealId}:null);break;

 case 'preparation-factor':if(preparation){preparation.people=Number(button.dataset.value);preparation.amounts=[];$('#preparation-people').value=preparation.people;renderPreparationRows();}break;

 case 'new-recipe':showRecipeEditor();break;

 case 'edit-recipe':{const recipe=state.recipes.find(r=>r.id===id);if(!recipe)throw Error('Questa ricetta non è più disponibile.');showRecipeEditor(recipe);break;}

 case 'delete-recipe':{const recipe=state.recipes.find(r=>r.id===id);if(!recipe)break;$('#editor').innerHTML=editorHead('Elimina ricetta')+`<p class="delete-question">Eliminare ${esc(recipe.name)}?</p><div class="editor-footer"><button data-command="close-dialog">Annulla</button><button class="danger" data-command="confirm-delete-recipe" data-id="${esc(id)}">Elimina ricetta</button></div>`;$('#editor').showModal();break;}

 case 'confirm-delete-recipe':button.disabled=true;if(action('deleteRecipe',{id}))$('#editor').close();else button.disabled=false;break;

 case 'favorite-recipe':{const recipe=state.recipes.find(r=>r.id===id);if(recipe)action('saveRecipe',{id,favoriteOnly:true,favorite:!recipe.favorite});break;}

 case 'recipe-shopping':{const recipe=state.recipes.find(r=>r.id===id);if(!recipe)break;button.disabled=true;if(action('addShopping',{recipeId:id,expectedRecipe:recipe}))notify('Ingredienti mancanti aggiunti alla lista della spesa.');break;}


 case 'close-dialog':preparation=null;$('#editor').close();break;

 case 'add-ingredient':if(draftIngredients.length>=LIMITS.ingredients){notify('Puoi inserire al massimo 100 ingredienti.',true);break;}draftIngredients.push({ingredient:'',qty:50,unit:'g'});renderIngredientEditor();break;

 case 'remove-ingredient':draftIngredients.splice(Number(button.dataset.index),1);renderIngredientEditor();break;

 case 'logout':await store.logout();break;

 case 'login':button.disabled=true;try{await store.login();}finally{if(button.isConnected)button.disabled=false;}break;

 case 'retry':location.reload();break;

 }}catch(e){notify(e.message,true);}

});

matchMedia('(max-width:650px)').addEventListener('change',()=>{if($('#editor').open)return;if(meta.ready&&(meta.preview||meta.authenticated))renderShell();else onStoreChange(state||{pantry:[],shopping:[],recipes:[]},meta);});

let releaseRecipesAttempted=false;
const catalogBatches = [
 ...Array.from({length:Math.ceil(catalogo71.length/40)}, (_,i)=>({
  id:'release-20261108-catalogo-71-'+i, recipes:catalogo71.slice(i*40,(i+1)*40)
 })),
 ...Array.from({length:Math.ceil(catalogo72.length/12)}, (_,i)=>({
  id:'release-20261110-catalogo-72-'+i, recipes:catalogo72.slice(i*12,(i+1)*12)
 })),
];

function importExpandedCatalog(){
 const savedNames = new Set(state.recipes.map(recipe=>recipe.name));
 const savedIds = new Set(state.recipes.map(recipe=>recipe.id));
 const lookup = createUnitLookup(state);
 const nonFood = new Set([...state.pantry,...state.shopping].filter(item=>item.category==='Altro').map(item=>item.name));
 for(const {id,recipes:batch} of catalogBatches){
  if(state.applied.includes(id))continue;
  const recipes = batch.filter(recipe=>!savedNames.has(recipe.name)&&!savedIds.has(recipe.id)
   &&!recipeStatus(state,recipe,lookup).unitConflicts.length
   &&!recipe.ingredients.some(item=>nonFood.has(item.ingredient)));
  if(!recipes.length)continue;
  if(state.recipes.length+recipes.length>LIMITS.recipes)throw Error('Spazio insufficiente nel ricettario per completare l’importazione.');
  store.dispatch({id,type:'saveRecipe',at:Date.now(),payload:{recipes}});
  return true;
 }
 return false;
}
function ensureReleaseRecipes(){if(releaseRecipesAttempted||!store||!meta.ready||meta.pending||meta.preview||meta.error||!navigator.onLine)return;try{if(importExpandedCatalog())return;}catch(e){releaseRecipesAttempted=true;notify('Nuove ricette non ancora aggiunte: '+e.message,true);return;}const lookup=createUnitLookup(state),recipes=recipeAdditions.filter(r=>!state.recipes.some(x=>x.id===r.id||x.name===r.name||x.source_url===r.source_url)&&!recipeStatus(state,r,lookup).unitConflicts.length&&!r.ingredients.some(i=>[...state.pantry,...state.shopping].some(p=>p.name===i.ingredient&&p.category==='Altro'))).slice(0,Math.min(40,Math.max(0,LIMITS.recipes-state.recipes.length)));if(!recipes.length){releaseRecipesAttempted=true;return;}const id='release-20261108-'+recipes[0].id;if(state.applied.includes(id)){releaseRecipesAttempted=true;return;}try{store.dispatch({id,type:'saveRecipe',at:Date.now(),payload:{recipes}});}catch(e){releaseRecipesAttempted=true;notify('Nuove ricette non ancora aggiunte: '+e.message,true);}}
function onStoreChange(next,nextMeta){

 state=next;meta=nextMeta;queueMicrotask(ensureReleaseRecipes);if(!meta.preview&&!meta.authenticated){$('#editor').close();$('#app').innerHTML='<section class="welcome"><div class="brandmark">S</div><h1>Spesapp</h1><p>Dispensa, ricette e spesa.<br>Sul PC e sul telefono, sempre con te.</p><button class="primary" data-command="login">Accedi con Google</button><p class="local-note">Accesso riservato al tuo account.</p></section>';return;}

 if(!meta.ready){$('#editor').close();$('#app').innerHTML='<section class="welcome"><div class="brandmark">S</div><p role="status">'+esc(meta.error||(meta.online===false?'Per il primo caricamento dei dati serve una connessione.':'Caricamento dei tuoi dati…'))+'</p>'+(meta.error?'<button data-command="retry">Riprova</button><button data-command="logout">Esci dall’account</button>':'')+'</section>';return;}

 if(!$('.shell'))renderShell();else{renderList();refreshSuggestions();updateAddUnitError();}

 for(const button of document.querySelectorAll('#editor [data-command="favorite-recipe"]')){const r=state.recipes.find(r=>r.id===button.dataset.id);if(r){button.setAttribute('aria-pressed',String(!!r.favorite));button.setAttribute('aria-label',r.favorite?'Rimuovi dai preferiti':'Aggiungi ai preferiti');button.textContent=button.dataset.compact==='1'?(r.favorite?'★':'☆'):(r.favorite?'★ Preferita':'☆ Preferita');}}
 weekUI?.refresh();updatePreparationAvailability();

 const error=$('#sync-error');if(error){error.hidden=!meta.error;error.textContent=meta.error||'';}

}

try{store=await createStore([...seed.recipes,...catalogo71,...catalogo72],onStoreChange,error=>notify(error.message,true));ensureReleaseRecipes();try{weekUI=await createWeekUI({store,main:()=>state||store.state,mainMeta:()=>meta,visible:()=>page==='recipes'&&recipesView==='week',openRecipe:(id,context)=>showRecipeSheet(id,context),onPreferencesChange:()=>{if(page==='recipes'&&recipesView==='catalog')renderList();},notify});renderList();}catch(e){notify('Le settimane non sono disponibili: '+e.message,true);}}catch(e){$('#app').innerHTML='<section class="welcome"><div class="brandmark">S</div><h1>Spesapp</h1><p role="alert">Non è stato possibile collegarsi al servizio. Controlla la connessione e riprova. I dati non sono stati modificati.</p><button data-command="retry">Riprova</button></section>';}

if('serviceWorker'in navigator&&!new URLSearchParams(location.search).has('preview'))navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(registration=>{addEventListener('focus',()=>void registration.update().catch(()=>{}));}).catch(()=>notify('Installazione offline non disponibile su questo browser.'));



