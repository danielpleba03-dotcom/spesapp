import {normalize,step,low,stockView,recipeStatus,validateImport,validateRecipe} from './domain.mjs';
import {createStore} from './cloud.mjs';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mobile=()=>matchMedia('(max-width:650px)').matches;
const seed=await fetch('./seed.json').then(r=>{if(!r.ok)throw Error('Impossibile caricare le ricette.');return r.json();});
let store,state,meta={},page=mobile()?'shopping':'pantry',search='',pantryFilter='Disponibili',categoryFilter='Tutte',recipeFilter='Fattibili adesso',addOpen=localStorage.getItem('spesapp-add-open')==='1',openRecipes=new Set(),grace=new Map(),order=[],draftIngredients=[],editingRecipe=null,noticeTimer,canInstall=null;
function notify(message,error=false){const el=$('#notice');el.textContent=message;el.classList.toggle('error',error);el.style.display='block';clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.style.display='none',error?6500:3000);}
function action(type,payload){try{store.dispatch({id:crypto.randomUUID(),type,payload,at:Date.now()});return true;}catch(e){notify(e.message,true);return false;}}
function nav(target){page=target;search='';grace.clear();order=[];renderShell();}
function statusText(){if(meta.preview)return 'Anteprima locale · dati di prova separati';if(!meta.online)return meta.pending?'Offline · modifiche salvate su questo dispositivo':'Offline · dati disponibili su questo dispositivo';return meta.pending?`Sincronizzazione · ${meta.pending} modifiche`:'Sincronizzato';}
function catalog(){const map=new Map(seed.catalog.map(p=>[normalize(p.name),p]));for(const p of [...state.shopping,...state.pantry])map.set(p.name,p);return [...map.values()].sort((a,b)=>a.category===b.category?a.name.localeCompare(b.name,'it'):a.category==='Alimentari'?-1:1);}
function filterButtons(values,current,group){return values.map(v=>`<button class="filter ${current===v?'active':''}" data-filter="${group}" data-value="${esc(v)}" aria-pressed="${current===v}">${esc(v)}</button>`).join('');}
function addForm(){return `<form id="add-form" class="addform" ${mobile()&&!addOpen?'hidden style="display:none"':''}><label class="product-field">Prodotto<input name="name" list="product-options" placeholder="SCRIVI O SCEGLI UN PRODOTTO" autocomplete="off" required></label><datalist id="product-options">${catalog().map(p=>`<option value="${esc(p.name)}">${esc(p.category)}</option>`).join('')}</datalist><label class="category-field">Categoria<select name="category"><option>Alimentari</option><option>Altro</option></select></label><label class="qty-field">Quantità<input type="number" name="qty" value="50" step="any" min="0.01" required inputmode="decimal"></label><label class="unit-field">Unità<select name="unit"><option value="g">Grammi</option><option value="l">Litri</option><option value="pz">Pezzi</option></select></label><button class="primary submit-add">＋ Aggiungi</button></form>`;}
function renderShell(){
 if(!state)return;
 $('#app').innerHTML=`<header class="topbar"><span class="brand">Spesapp<span style="color:var(--bright)">.</span></span><nav class="nav" aria-label="Sezioni"><button data-nav="pantry" class="${page==='pantry'?'active':''}">Dispensa</button><button data-nav="recipes" class="recipes-nav ${page==='recipes'?'active':''}">Ricette</button><button data-nav="shopping" class="${page==='shopping'?'active':''}"><span class="desktop-only">Lista della spesa</span><span class="phone-only">Spesa</span></button></nav>${page==='shopping'?`<button class="mobile-add ${addOpen?'active':''}" data-command="toggle-add" aria-expanded="${addOpen}">${addOpen?'−':'＋'} Prodotto</button>`:''}<button class="settings" aria-label="Impostazioni e backup" data-command="settings">⋯</button></header><main class="shell"><div class="sync ${meta.online===false?'offline':''}" id="sync-label">${statusText()}</div>${page==='recipes'?`<div class="toolbar"><input id="search" type="search" aria-label="Cerca ricetta o ingrediente" placeholder="CERCA RICETTA O INGREDIENTE…" value="${esc(search)}"><button data-command="new-recipe">＋ Nuova ricetta</button></div><div class="filters">${filterButtons(['Tutte','Fattibili adesso','Non fattibili'],recipeFilter,'recipe')}</div>`:page==='pantry'?`${!mobile()?addForm():''}<div class="toolbar"><input id="search" type="search" aria-label="Cerca in dispensa" placeholder="CERCA IN DISPENSA…" value="${esc(search)}"></div>${!mobile()?`<div class="filters">${filterButtons(['Disponibili','Da rifornire','Esauriti'],pantryFilter,'stock')}<select id="category-filter" aria-label="Filtra per categoria" style="width:auto;min-height:35px"><option>Tutte</option><option>Alimentari</option><option>Altro</option></select></div>`:''}`:addForm()}<section id="list" aria-label="${page==='shopping'?'Prodotti da comprare':page==='pantry'?'Prodotti in dispensa':'Ricette'}"></section></main>`;
 if($('#category-filter'))$('#category-filter').value=categoryFilter;
 renderList();
}
function quantityControl(p,kind){return `<div class="stepper"><button data-command="decrease" data-kind="${kind}" data-id="${esc(p.id)}" aria-label="Riduci ${esc(p.name)} di ${step(p.unit)} ${p.unit}">−</button><input type="number" min="${kind==='shopping'?(p.unit==='pz'?1:.01):0}" step="${step(p.unit)}" value="${p.qty}" data-quantity="${kind}" data-id="${esc(p.id)}" aria-label="Quantità ${esc(p.name)} in ${p.unit}" inputmode="decimal"><button data-command="increase" data-kind="${kind}" data-id="${esc(p.id)}" aria-label="Aumenta ${esc(p.name)} di ${step(p.unit)} ${p.unit}">＋</button></div>`;}
function renderList(){
 if(!$('#list')||!state)return;const query=normalize(search),terms=query.split(' ').filter(Boolean);
 if(page==='recipes'){
  let recipes=state.recipes.filter(r=>terms.every(term=>(r.name+' '+r.ingredients.map(i=>i.ingredient).join(' ')).includes(term))).map(r=>({r,status:recipeStatus(state,r)}));
  recipes=recipes.filter(({status})=>recipeFilter==='Tutte'||status.possible===(recipeFilter==='Fattibili adesso')).sort((a,b)=>(Number(b.status.possible)-Number(a.status.possible))||((state.counts[b.r.id]||0)-(state.counts[a.r.id]||0))||a.r.name.localeCompare(b.r.name,'it'));
  $('#list').innerHTML=recipes.map(({r,status})=>`<details class="recipe" data-recipe="${esc(r.id)}" ${openRecipes.has(r.id)?'open':''}><summary>${esc(r.name)}${state.counts[r.id]?` <span class="frequent">· ${state.counts[r.id]} volte</span>`:''}</summary><div class="recipe-body"><div class="recipe-actions">${r.source_url?`<a href="${esc(r.source_url)}" target="_blank" rel="noopener noreferrer">Apri ricetta · ${esc(r.source_title||new URL(r.source_url).hostname)}</a>`:`<button data-command="edit-recipe" data-id="${esc(r.id)}">Aggiungi il link alla ricetta</button>`}<button data-command="cook" data-id="${esc(r.id)}" ${status.possible?'':'disabled'}>Preparata</button></div><div class="recipe-content"><ul class="ingredients">${status.ingredients.map(i=>{const p=state.pantry.find(p=>p.name===i.ingredient&&p.unit===i.unit),qty=p?.qty||0;return `<li>${qty>=i.qty?'✓':'−'} <strong>${esc(i.ingredient)}</strong> · ${i.qty} ${esc(i.unit)}<small>Disponibili ${qty} ${esc(i.unit)}</small></li>`;}).join('')}</ul><p class="method">${esc(r.instructions)}</p></div><div class="recipe-footer"><button data-command="edit-recipe" data-id="${esc(r.id)}">Modifica</button><button data-command="delete-recipe" data-id="${esc(r.id)}">Elimina</button></div></div></details>`).join('')||(query?'<p class="empty">Nessuna ricetta corrisponde alla ricerca.</p>':'');return;
 }
 let items=(page==='shopping'?state.shopping:state.pantry).filter(p=>terms.every(t=>p.name.includes(t)));
 if(page==='pantry'&&!mobile())items=items.filter(p=>(categoryFilter==='Tutte'||p.category===categoryFilter)&&((pantryFilter==='Disponibili'?p.qty>0:stockView(p)===pantryFilter)||(grace.get(p.id)||0)>Date.now()));
 const ids=items.map(p=>p.id);order=order.filter(id=>ids.includes(id));for(const p of [...items].sort((a,b)=>a.qty-b.qty||a.name.localeCompare(b.name,'it')))if(!order.includes(p.id))order.push(p.id);
 $('#list').innerHTML=['Alimentari','Altro'].map(category=>{const products=items.filter(p=>p.category===category).sort((a,b)=>page==='shopping'?a.name.localeCompare(b.name,'it'):mobile()?a.qty-b.qty||a.name.localeCompare(b.name,'it'):order.indexOf(a.id)-order.indexOf(b.id));if(!products.length)return '';return `<h2 class="group-title">${category}</h2>`+products.map(p=>`<article class="product ${page==='shopping'?'shopping-product':'pantry-product'}"><div class="product-name">${esc(p.name)} <span class="unit">· ${esc(p.unit)}</span>${page==='pantry'&&low(p)?'<span class="stock-label">Scorta bassa</span>':''}</div>${page==='pantry'&&mobile()?`<span class="phone-quantity">${p.qty>0?`${p.qty} ${esc(p.unit)}`:'ESAURITO'}</span>`:page==='pantry'?`${quantityControl(p,'pantry')}<button class="pantry-actions ${p.qty<=0&&pantryFilter==='Esauriti'?'danger':''}" data-command="${p.qty<=0&&pantryFilter==='Esauriti'?'delete-pantry':'exhaust'}" data-id="${esc(p.id)}">${p.qty<=0&&pantryFilter==='Esauriti'?'Elimina':'Esaurito'}</button>`:`<div class="shopping-controls">${quantityControl(p,'shopping')}<button class="primary buy" data-command="buy" data-id="${esc(p.id)}" aria-label="Segna comprato ${esc(p.name)}">✓ Comprato</button><button class="remove" data-command="remove-shopping" data-id="${esc(p.id)}" aria-label="Rimuovi ${esc(p.name)} dalla lista">×</button></div>`}</article>`).join('');}).join('')||'<p class="empty">'+(query?'Nessun prodotto corrisponde alla ricerca.':page==='shopping'?'La lista è vuota.':'Nessun prodotto in questa sezione.')+'</p>';
}
function markGrace(id){grace.set(id,Date.now()+800);setTimeout(()=>{if((grace.get(id)||0)<=Date.now()){grace.delete(id);renderList();}},850);}
function updateAddDefaults(){const form=$('#add-form');if(!form)return;const chosen=catalog().find(p=>p.name===normalize(form.elements.name.value));if(chosen){form.elements.category.value=chosen.category;form.elements.unit.value=state.units[chosen.name]||chosen.unit;}refreshUnits(form);}
function refreshUnits(form){const cat=form.elements.category.value,unit=form.elements.unit;for(const option of unit.options)option.disabled=cat==='Altro'&&option.value!=='pz';if(cat==='Altro')unit.value='pz';const q=form.elements.qty;q.step=unit.value==='pz'?'1':'any';q.min=unit.value==='pz'?1:.01;q.value=step(unit.value);}
function editorHead(title){return `<div class="dialog-head"><h2>${esc(title)}</h2><button data-command="close-dialog" aria-label="Chiudi">×</button></div>`;}
function showRecipeEditor(recipe=null){
 editingRecipe=recipe;draftIngredients=recipe?structuredClone(recipe.ingredients):[{ingredient:'',qty:50,unit:'g'}];
 $('#editor').innerHTML=editorHead(recipe?'Modifica ricetta':'Nuova ricetta')+`<form id="recipe-form" class="editor-form"><label>Nome ricetta · una persona<input name="name" value="${esc(recipe?.name||'')}" required></label><label>Link alla ricetta o al video<input type="url" name="source_url" value="${esc(recipe?.source_url||'')}" placeholder="https://…" required></label><div id="ingredient-editor"></div><button type="button" data-command="add-ingredient">＋ Ingrediente</button><label>Procedimento<textarea name="instructions" required>${esc(recipe?.instructions||'')}</textarea></label><div class="input-error" role="alert" id="editor-error"></div><div class="editor-footer"><button type="button" data-command="close-dialog">Annulla</button><button class="primary">Salva ricetta</button></div></form>`;renderIngredientEditor();$('#editor').showModal();
}
function renderIngredientEditor(){
 $('#ingredient-editor').innerHTML=draftIngredients.map((i,n)=>`<div class="ingredient-edit"><label>Ingrediente<input list="ingredient-options" data-ing="${n}" data-prop="ingredient" value="${esc(i.ingredient)}" required></label><label>Quantità<input type="number" min="0.001" step="any" data-ing="${n}" data-prop="qty" value="${i.qty}" required inputmode="decimal"></label><label>Unità<select data-ing="${n}" data-prop="unit">${['g','l','pz'].map(u=>`<option ${i.unit===u?'selected':''}>${u}</option>`).join('')}</select></label><button type="button" data-command="remove-ingredient" data-index="${n}" aria-label="Rimuovi ingrediente ${n+1}">×</button></div>`).join('')+`<datalist id="ingredient-options">${catalog().filter(p=>p.category==='Alimentari').map(p=>`<option value="${esc(p.name)}">`).join('')}</datalist>`;
}
function downloadBackup(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`spesapp-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
function settings(){
 $('#editor').innerHTML=editorHead('La tua Spesapp')+`<div class="settings-actions"><p>${meta.preview?'Stai usando una copia locale di prova.':`Accesso: ${esc(store.user?.displayName||'personale')}.`}<br>${statusText()}</p><button data-command="export">Scarica una copia dei dati</button><button data-command="import">Importa un backup</button>${canInstall?'<button data-command="install">Installa sul telefono o sul PC</button>':'<p>Per installarla sul telefono, apri il menu del browser e scegli «Aggiungi alla schermata Home».</p>'}<p>La dispensa e la lista si sincronizzano tra i tuoi dispositivi. Senza connessione, le modifiche restano sul dispositivo fino al prossimo collegamento.</p><button data-command="logout">Esci dall’account</button></div>`;$('#editor').showModal();
}
document.addEventListener('input',event=>{
 const el=event.target;if(el.id==='search'){search=el.value;order=[];renderList();}
 if(el.matches('#add-form [name=name]')){const match=catalog().find(p=>p.name===normalize(el.value));if(match)updateAddDefaults();}
 if(el.dataset.ing!==undefined){const item=draftIngredients[Number(el.dataset.ing)];item[el.dataset.prop]=el.dataset.prop==='qty'?Number(el.value):el.value;}
});
document.addEventListener('change',event=>{
 const el=event.target;if(el.id==='category-filter'){categoryFilter=el.value;order=[];renderList();}
 if(el.matches('#add-form [name=category],#add-form [name=unit]'))refreshUnits(el.form);
 if(el.dataset.quantity){const id=el.dataset.id;if(el.dataset.quantity==='pantry')markGrace(id);action('quantity',{kind:el.dataset.quantity,id,qty:Number(el.value)});}
});
document.addEventListener('toggle',event=>{const el=event.target;if(el.matches?.('details[data-recipe]')){if(el.open)openRecipes.add(el.dataset.recipe);else openRecipes.delete(el.dataset.recipe);}},true);
document.addEventListener('submit',event=>{
 event.preventDefault();const form=event.target;
 if(form.id==='add-form'){
  const data=new FormData(form),success=action(page==='pantry'?'addPantry':'addShopping',{name:data.get('name'),category:data.get('category'),qty:Number(data.get('qty')),unit:data.get('unit')});
  if(success){const current=$('#add-form');current.classList.remove('flash');void current.offsetWidth;current.classList.add('flash');current.elements.name.value='';current.elements.name.focus();}
 }
 if(form.id==='recipe-form'){
  try{const data=new FormData(form),recipe=validateRecipe({id:editingRecipe?.id||crypto.randomUUID(),name:data.get('name'),source_url:data.get('source_url'),instructions:data.get('instructions'),ingredients:draftIngredients});if(action('saveRecipe',{recipe}))$('#editor').close();}catch(e){$('#editor-error').textContent=e.message;}
 }
});
document.addEventListener('click',async event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.dataset.nav){nav(button.dataset.nav);return;}
 if(button.dataset.filter){const {filter,value}=button.dataset;if(filter==='recipe')recipeFilter=value;else pantryFilter=value;grace.clear();order=[];renderShell();return;}
 const {command,id}=button.dataset;try{switch(command){
 case 'toggle-add':addOpen=!addOpen;localStorage.setItem('spesapp-add-open',addOpen?'1':'0');renderShell();break;
 case 'increase':case 'decrease':{const kind=button.dataset.kind,p=state[kind].find(p=>p.id===id);if(!p)break;if(kind==='pantry')markGrace(id);action('quantity',{kind,id,delta:step(p.unit)*(command==='increase'?1:-1)});break;}
 case 'buy':button.disabled=true;action('buy',{id});break;
 case 'remove-shopping':button.disabled=true;action('removeShopping',{id});break;
 case 'exhaust':button.disabled=true;action('exhaust',{id});break;
 case 'delete-pantry':button.disabled=true;action('deletePantry',{id});break;
 case 'new-recipe':showRecipeEditor();break;
 case 'edit-recipe':showRecipeEditor(state.recipes.find(r=>r.id===id));break;
 case 'delete-recipe':if(confirm('Eliminare questa ricetta?'))action('deleteRecipe',{id});break;
 case 'cook':button.disabled=true;action('cook',{id});break;
 case 'close-dialog':$('#editor').close();break;
 case 'add-ingredient':draftIngredients.push({ingredient:'',qty:50,unit:'g'});renderIngredientEditor();break;
 case 'remove-ingredient':draftIngredients.splice(Number(button.dataset.index),1);renderIngredientEditor();break;
 case 'settings':settings();break;
 case 'export':downloadBackup();break;
 case 'import':$('#import-file').click();break;
 case 'logout':await store.logout();break;
 case 'login':button.disabled=true;try{await store.login();}finally{button.disabled=false;}break;
 case 'install':await canInstall.prompt();canInstall=null;break;
 }}catch(e){notify(e.message,true);}
});
$('#import-file').addEventListener('change',async event=>{try{const file=event.target.files[0];if(!file)return;const imported=validateImport(JSON.parse(await file.text()));if(confirm(`Importare ${imported.pantry.length} prodotti e ${imported.recipes.length} ricette? Scarico prima una copia dei dati attuali.`)){downloadBackup();if(action('import',{state:imported})){$('#editor').close();renderShell();}}}catch(e){notify(e.message,true);}finally{event.target.value='';}});
addEventListener('beforeinstallprompt',event=>{event.preventDefault();canInstall=event;});
matchMedia('(max-width:650px)').addEventListener('change',()=>{if(mobile()&&page==='recipes')page='shopping';renderShell();});
function onStoreChange(next,nextMeta){
 state=next;meta=nextMeta;if(!meta.preview&&!meta.authenticated){$('#app').innerHTML='<section class="welcome"><div class="brandmark">S</div><h1>Spesapp</h1><p>Dispensa, ricette e spesa.<br>Sul PC e sul telefono, sempre con te.</p><button class="primary" data-command="login">Accedi con Google</button><p class="local-note">Accesso riservato al tuo account.</p></section>';return;}
 if(!meta.ready){$('#app').innerHTML='<section class="welcome"><div class="brandmark">S</div><p>Caricamento dei tuoi dati…</p></section>';return;}
 if(!$('.shell'))renderShell();else{renderList();$('#sync-label').textContent=statusText();$('#sync-label').classList.toggle('offline',!meta.online);}
}
try{store=await createStore(seed.recipes,onStoreChange,error=>notify(error.message,true));}catch(e){$('#startup-status').textContent=e.message;}
if('serviceWorker'in navigator&&!new URLSearchParams(location.search).has('preview'))navigator.serviceWorker.register('./sw.js').catch(()=>notify('Installazione offline non disponibile su questo browser.'));
