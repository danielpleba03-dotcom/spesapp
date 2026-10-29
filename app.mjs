import {normalize,step,low,stockView,recipeStatus,validateRecipe,LIMITS,preparationStatus,round} from './domain.mjs?v=20261028-capacity';
import {createStore} from './cloud.mjs?v=20261028-capacity';
import {reconcile,readPreference,writePreference} from './ui.mjs?v=20261028-capacity';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mobile=()=>/iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent)||matchMedia('(max-width:650px)').matches;
function renderMaintenance(){
 document.querySelector('#editor')?.close();
 const notice=document.querySelector('#notice');if(notice)notice.style.display='none';
 document.querySelector('#app').innerHTML='<main class="welcome" aria-label="Manutenzione"><div class="brandmark" aria-hidden="true">S</div><h1 style="font-size:1.4rem;line-height:1.5">App da telefono in manutenzione</h1></main>';
}
if(mobile())renderMaintenance();
const seed=await fetch('./seed.json',{signal:AbortSignal.timeout(15000)}).then(r=>{if(!r.ok)throw Error('Impossibile caricare le ricette.');return r.json();});
const editingBaselines=new Map();
let store,state,meta={},page=mobile()?'shopping':'pantry',search='',pantryFilter='Disponibili',categoryFilter='Tutte',recipeFilter='Fattibili adesso',addOpen=readPreference('spesapp-add-open')==='1',openRecipes=new Set(),grace=new Map(),order=[],draftIngredients=[],editingRecipe=null,preparation=null,noticeTimer;
function notify(message,error=false){
 if(mobile())return;
 const dialog=$('#editor');
 if(error&&dialog?.open){let area=dialog.querySelector('#editor-error,#preparation-error,.dialog-notice');if(!area){area=document.createElement('p');area.className='sync-error dialog-notice';area.setAttribute('role','alert');dialog.querySelector('.dialog-head')?.after(area);}area.textContent=message;return;}
 const el=$('#notice');el.textContent=message;el.classList.toggle('error',error);el.style.display='block';clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.style.display='none',error?6500:3000);
}

function action(type,payload){if(mobile())return false;try{store.dispatch({id:crypto.randomUUID(),type,payload,at:Date.now()});return true;}catch(e){notify(e.message,true);renderList();return false;}}
function nav(target){clearTimeout(noticeTimer);$('#notice').style.display='none';page=target;search='';grace.clear();order=[];renderShell();}
function statusText(){if(meta.preview)return 'Anteprima locale · dati di prova separati';if(meta.online===false)return meta.pending?'Offline · modifiche salvate su questo dispositivo':'Offline · dati disponibili su questo dispositivo';if(meta.error)return meta.pending?'Modifiche salvate sul dispositivo · sincronizzazione in attesa':'Collegamento da verificare';if(meta.pending)return `Sincronizzazione · ${meta.pending} ${meta.pending===1?'modifica':'modifiche'}`;return meta.fromCache?'Collegamento in corso…':'Sincronizzato';}

function catalog(){const map=new Map();for(const p of state.pantry)map.set(p.name,p);return [...map.values()].sort((a,b)=>a.category===b.category?a.name.localeCompare(b.name,'it'):a.category==='Alimentari'?-1:1);}
const unitLabel=unit=>unit==='pz'?'P':unit.toUpperCase();
function filterButtons(values,current,group){return values.map(v=>`<button class="filter ${current===v?'active':''}" data-filter="${group}" data-value="${esc(v)}" aria-pressed="${current===v}">${esc(v)}</button>`).join('');}
function addForm(){return `<form id="add-form" class="addform" ${mobile()&&!addOpen?'hidden style="display:none"':''}><label class="product-field">Prodotto<input name="name" list="product-options" placeholder="SCRIVI O SCEGLI UN PRODOTTO" autocomplete="off" maxlength="120" required></label><datalist id="product-options">${catalog().map(p=>`<option value="${esc(p.name)}">${esc(p.category)}</option>`).join('')}</datalist><label class="category-field">Categoria<select name="category"><option>Alimentari</option><option>Altro</option></select></label><label class="qty-field" for="add-qty">Quantità<span class="add-stepper"><button type="button" data-command="add-decrease" aria-label="Riduci quantità da aggiungere">−</button><input type="number" id="add-qty" aria-label="Quantità da aggiungere" name="qty" value="0" step="any" min="0.000001" max="1000000000" required inputmode="decimal"><button type="button" data-command="add-increase" aria-label="Aumenta quantità da aggiungere">＋</button></span></label><label class="unit-field">Unità<select name="unit"><option value="g">G</option><option value="l">L</option><option value="pz">P</option></select></label><button class="primary submit-add">＋ Aggiungi</button></form>`;}
function renderShell(){
 if(mobile()){renderMaintenance();return;}
 if(!state)return;
 $('#app').innerHTML=`<header class="topbar"><span class="brand">Spesapp<span style="color:var(--bright)">.</span></span><nav class="nav" aria-label="Sezioni"><button data-nav="pantry" class="${page==='pantry'?'active':''}">Dispensa</button><button data-nav="recipes" class="recipes-nav ${page==='recipes'?'active':''}">Ricette</button><button data-nav="shopping" class="${page==='shopping'?'active':''}"><span class="desktop-only">Lista della spesa</span><span class="phone-only">Spesa</span></button></nav>${page==='shopping'?`<button class="mobile-add ${addOpen?'active':''}" data-command="toggle-add" aria-expanded="${addOpen}">${addOpen?'−':'＋'} Prodotto</button>`:''}<button class="settings logout-icon" aria-label="Esci dall’account" title="Esci dall’account" data-command="logout"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M10 4H5v16h5M9 12h12m-4-4 4 4-4 4" stroke-linecap="round" stroke-linejoin="round"/></svg></button></header><main class="shell"><div class="sync ${meta.online===false?'offline':''}" id="sync-label" role="status" aria-live="polite">${statusText()}</div><p id="sync-error" class="sync-error" role="alert" hidden></p>${page==='recipes'?`<div class="toolbar"><input id="search" type="search" aria-label="Cerca ricetta o ingrediente" placeholder="CERCA RICETTA O INGREDIENTE…" value="${esc(search)}" maxlength="120"><button data-command="new-recipe">＋ Nuova ricetta</button></div><div class="filters">${filterButtons(['Tutte','Fattibili adesso','Non fattibili'],recipeFilter,'recipe')}</div>`:page==='pantry'?`${!mobile()?addForm():''}<div class="toolbar"><input id="search" type="search" aria-label="Cerca in dispensa" placeholder="CERCA IN DISPENSA…" value="${esc(search)}" maxlength="120"></div>${!mobile()?`<div class="filters">${filterButtons(['Disponibili','Da rifornire','Esauriti'],pantryFilter,'stock')}<select id="category-filter" aria-label="Filtra per categoria" style="width:auto;min-height:35px"><option>Tutte</option><option>Alimentari</option><option>Altro</option></select></div>`:''}`:addForm()}<section id="list" aria-label="${page==='shopping'?'Prodotti da comprare':page==='pantry'?'Prodotti in dispensa':'Ricette'}"></section></main>`;
 if($('#category-filter'))$('#category-filter').value=categoryFilter;
 renderList();
}
function quantityControl(p,kind){return `<div class="stepper"><button data-command="decrease" data-kind="${kind}" data-id="${esc(p.id)}" aria-label="Riduci ${esc(p.name)} di ${step(p.unit)} ${p.unit}">−</button><input type="number" min="${kind==='shopping'?(p.unit==='pz'?1:.000001):0}" max="1000000000" step="${p.unit==='pz'?1:'any'}" value="${p.qty}" data-quantity="${kind}" data-id="${esc(p.id)}" aria-label="Quantità ${esc(p.name)} in ${p.unit}" inputmode="decimal"><button data-command="increase" data-kind="${kind}" data-id="${esc(p.id)}" aria-label="Aumenta ${esc(p.name)} di ${step(p.unit)} ${p.unit}">＋</button></div>`;}
function renderList(){
 if(!$('#list')||!state)return;const query=normalize(search),terms=query.split(' ').filter(Boolean);
 if(page==='recipes'){
  let recipes=state.recipes.filter(r=>terms.every(term=>(r.name+' '+r.ingredients.map(i=>i.ingredient).join(' ')).includes(term))).map(r=>({r,status:recipeStatus(state,r)}));
  recipes=recipes.filter(({status})=>recipeFilter==='Tutte'||status.possible===(recipeFilter==='Fattibili adesso')).sort((a,b)=>(Number(b.status.possible)-Number(a.status.possible))||((state.counts[b.r.id]||0)-(state.counts[a.r.id]||0))||a.r.name.localeCompare(b.r.name,'it'));
  reconcile($('#list'),recipes.map(({r,status})=>`<details class="recipe" data-recipe="${esc(r.id)}" ${openRecipes.has(r.id)?'open':''}><summary>${esc(r.name)} <span class="recipe-capacity ${status.preparations>0?'ready':''}">Puoi farla ${status.preparations} ${status.preparations===1?'volta':'volte'}</span></summary><div class="recipe-body"><div class="recipe-actions">${r.source_url?`<a href="${esc(r.source_url)}" target="_blank" rel="noopener noreferrer">Apri la ricetta ↗</a>`:`<button data-command="edit-recipe" data-id="${esc(r.id)}">Aggiungi il link alla ricetta</button>`}<button data-command="cook" data-id="${esc(r.id)}" title="Conferma persone e ingredienti usati">Preparata</button></div><ul class="ingredients compact-ingredients">${status.ingredients.map(i=>`<li><strong>${esc(i.ingredient)}</strong><span>${i.qty} ${unitLabel(i.unit)}</span></li>`).join('')}</ul><div class="recipe-footer"><button data-command="edit-recipe" data-id="${esc(r.id)}">Modifica</button><button data-command="delete-recipe" data-id="${esc(r.id)}">Elimina</button></div></div></details>`).join('')||'<p class="empty">'+(query?'Nessuna ricetta corrisponde alla ricerca.':recipeFilter==='Fattibili adesso'?'Non hai ancora tutti gli ingredienti per queste ricette.':'Nessuna ricetta in questa sezione.')+'</p>');return;
 }
 let items=(page==='shopping'?state.shopping:state.pantry).filter(p=>terms.every(t=>p.name.includes(t)));
 if(page==='pantry'&&!mobile())items=items.filter(p=>(categoryFilter==='Tutte'||p.category===categoryFilter)&&((pantryFilter==='Disponibili'?p.qty>0:stockView(p)===pantryFilter)||((grace.get(p.id)||0)>Date.now())));
 const ids=new Set(items.map(p=>p.id));order=order.filter(id=>ids.has(id));for(const p of [...items].sort((a,b)=>a.qty-b.qty||a.name.localeCompare(b.name,'it')))if(!order.includes(p.id))order.push(p.id);
 reconcile($('#list'),['Alimentari','Altro'].map(category=>{const products=items.filter(p=>p.category===category).sort((a,b)=>page==='shopping'?a.name.localeCompare(b.name,'it'):mobile()?a.qty-b.qty||a.name.localeCompare(b.name,'it'):order.indexOf(a.id)-order.indexOf(b.id));if(!products.length)return '';return `<h2 class="group-title" data-key="group-${category}">${category}</h2>`+products.map(p=>`<article data-key="${page}-${esc(p.id)}" class="product ${page==='shopping'?'shopping-product':'pantry-product'}"><div class="product-name">${esc(p.name)} <span class="unit">· ${unitLabel(p.unit)}</span>${page==='pantry'&&low(p)?'<span class="stock-label">Scorta bassa</span>':''}</div>${page==='pantry'&&mobile()?`<span class="phone-quantity">${p.qty>0?`${p.qty} ${unitLabel(p.unit)}`:'ESAURITO'}</span>`:page==='pantry'?`${quantityControl(p,'pantry')}<button class="pantry-actions ${p.qty<=0&&pantryFilter==='Esauriti'?'danger':''}" data-command="${p.qty<=0&&pantryFilter==='Esauriti'?'delete-pantry':'exhaust'}" data-id="${esc(p.id)}">${p.qty<=0&&pantryFilter==='Esauriti'?'Elimina':'Esaurito'}</button>`:`<div class="shopping-controls">${quantityControl(p,'shopping')}<button class="primary buy" data-command="buy" data-id="${esc(p.id)}" aria-label="Segna comprato ${esc(p.name)}">✓ Comprato</button><button class="remove" data-command="remove-shopping" data-id="${esc(p.id)}" aria-label="Rimuovi ${esc(p.name)} dalla lista">×</button></div>`}</article>`).join('');}).join('')||'<p class="empty">'+(query?'Nessun prodotto corrisponde alla ricerca.':page==='shopping'?'La lista è vuota.':'Nessun prodotto in questa sezione.')+'</p>');
}
function markGrace(id){grace.set(id,Date.now()+800);setTimeout(()=>{if((grace.get(id)||0)<=Date.now()){grace.delete(id);renderList();}},850);}
function updateAddDefaults(){const form=$('#add-form');if(!form)return;const previousUnit=form.elements.unit.value;const chosen=[...state.pantry,...state.shopping].find(p=>p.name===normalize(form.elements.name.value));if(chosen){form.elements.category.value=chosen.category;form.elements.unit.value=state.units[chosen.name]||chosen.unit;}refreshUnits(form,previousUnit);}
function refreshUnits(form,previousUnit=form.dataset.lastUnit||'g'){const cat=form.elements.category.value,unit=form.elements.unit;for(const option of unit.options)option.disabled=cat==='Altro'&&option.value!=='pz';if(cat==='Altro')unit.value='pz';const q=form.elements.qty;q.step=unit.value==='pz'?'1':'any';q.min=unit.value==='pz'?1:.000001;if(unit.value!==previousUnit||!q.value)q.value=0;form.dataset.lastUnit=unit.value;}
function refreshSuggestions(){const target=$('#product-options');if(target)reconcile(target,catalog().map(p=>`<option value="${esc(p.name)}">${esc(p.category)}</option>`).join(''));}
function editorHead(title){return `<div class="dialog-head"><h2>${esc(title)}</h2><button data-command="close-dialog" aria-label="Chiudi">×</button></div>`;}
function showRecipeEditor(recipe=null){
 editingRecipe=recipe;draftIngredients=recipe?structuredClone(recipe.ingredients):[{ingredient:'',qty:50,unit:'g'}];
 $('#editor').innerHTML=editorHead(recipe?'Modifica ricetta':'Nuova ricetta')+`<form id="recipe-form" class="editor-form"><label>Nome ricetta · una persona<input name="name" maxlength="120" value="${esc(recipe?.name||'')}" required></label><label>Link alla ricetta o al video<input type="url" maxlength="2048" name="source_url" value="${esc(recipe?.source_url||'')}" placeholder="https://…" required></label><div id="ingredient-editor"></div><button type="button" data-command="add-ingredient">＋ Ingrediente</button><div class="input-error" role="alert" id="editor-error"></div><div class="editor-footer"><button type="button" data-command="close-dialog">Annulla</button><button class="primary">Salva ricetta</button></div></form>`;renderIngredientEditor();$('#editor').showModal();
}
function renderIngredientEditor(){
 $('#ingredient-editor').innerHTML=draftIngredients.map((i,n)=>`<div class="ingredient-edit"><label>Ingrediente<input list="ingredient-options" maxlength="120" data-ing="${n}" data-prop="ingredient" value="${esc(i.ingredient)}" required></label><label>Quantità<input type="number" min="0.000001" max="1000000000" step="any" data-ing="${n}" data-prop="qty" value="${i.qty}" required inputmode="decimal"></label><label>Unità<select data-ing="${n}" data-prop="unit">${['g','l','pz'].map(u=>`<option value="${u}" ${i.unit===u?'selected':''}>${unitLabel(u)}</option>`).join('')}</select></label><button type="button" data-command="remove-ingredient" data-index="${n}" aria-label="Rimuovi ingrediente ${n+1}">×</button></div>`).join('')+`<datalist id="ingredient-options">${catalog().filter(p=>p.category==='Alimentari').map(p=>`<option value="${esc(p.name)}">`).join('')}</datalist>`;
}
function showPreparation(recipe){
 if(!recipe)throw Error('Questa ricetta non è più disponibile.');
 preparation={recipe:structuredClone(recipe),people:1,ingredients:recipeStatus(state,recipe).ingredients.map(i=>({...i}))};
 $('#editor').innerHTML=editorHead('Preparata · '+recipe.name)+`<form id="preparation-form" class="editor-form"><div class="preparation-toolbar"><label>Persone<input type="number" id="preparation-people" min="1" max="1000" step="1" value="1" inputmode="numeric" required></label><button type="button" data-command="prep-factor" data-value="1">×1</button><button type="button" data-command="prep-factor" data-value="2">×2</button></div><p class="preparation-note">Dosi per una persona moltiplicate per le persone indicate. Correggi le quantità effettivamente usate: la ricetta salvata resta invariata.</p><div id="preparation-ingredients"></div><p id="preparation-error" class="input-error" role="status"></p><div class="editor-footer"><button type="button" data-command="close-dialog">Annulla</button><button class="primary" id="confirm-preparation">Conferma e aggiorna dispensa</button></div></form>`;
 renderPreparationRows();$('#editor').showModal();
}
function renderPreparationRows(){
 if(!preparation)return;
 $('#preparation-ingredients').innerHTML=preparation.ingredients.map((i,n)=>`<div class="preparation-row"><label for="prepared-${n}">${esc(i.ingredient)}<small class="prep-available" data-index="${n}"></small></label><input id="prepared-${n}" type="number" min="0" max="1000000000" step="${i.unit==='pz'?1:'any'}" data-prepared="${n}" value="${i.qty}" aria-label="Quantità usata ${esc(i.ingredient)} in ${i.unit}" inputmode="decimal" required><span class="unit">${unitLabel(i.unit)}</span></div>`).join('');
 updatePreparationAvailability();
}
function scalePreparation(value){
 if(!preparation)return;
 const people=Number(value);preparation.people=people;
 if(Number.isInteger(people)&&people>=1&&people<=1000){preparation.ingredients=recipeStatus(state,preparation.recipe).ingredients.map(i=>({...i,qty:round(i.qty*people)}));renderPreparationRows();}else updatePreparationAvailability();
}
function updatePreparationAvailability(){
 if(!$('#preparation-form')||!preparation)return;
 const error=$('#preparation-error'),button=$('#confirm-preparation');
 for(const [index,item]of preparation.ingredients.entries()){const p=state.pantry.find(p=>p.category==='Alimentari'&&p.name===item.ingredient&&p.unit===item.unit),label=document.querySelector(`.prep-available[data-index="${index}"]`);if(label){label.textContent=`Disponibili ${p?.qty||0} ${unitLabel(item.unit)}`;label.classList.toggle('insufficient',(p?.qty||0)+1e-9<item.qty);}}
 try{const status=preparationStatus(state,preparation.recipe,preparation.people,preparation.ingredients);if(JSON.stringify(state.recipes.find(r=>r.id===preparation.recipe.id))!==JSON.stringify(preparation.recipe))throw Error('La ricetta è cambiata: chiudi e riapri la preparazione.');error.textContent=status.missing.length?'Scorta insufficiente: '+status.missing.map(i=>i.ingredient).join(', ')+'.':'';button.disabled=!status.possible;}catch(e){error.textContent=e.message;button.disabled=true;}
}
document.addEventListener('focusin',event=>{const el=event.target;if(el.dataset.quantity){const p=state?.[el.dataset.quantity]?.find(p=>p.id===el.dataset.id);if(p)editingBaselines.set(el.dataset.quantity+':'+el.dataset.id,p.qty);}});
document.addEventListener('focusout',event=>{const el=event.target;if(el.dataset.quantity)editingBaselines.delete(el.dataset.quantity+':'+el.dataset.id);});
document.addEventListener('input',event=>{
 const el=event.target;if(el.id==='preparation-people'){scalePreparation(el.value);return;}if(el.dataset.prepared!==undefined&&preparation){preparation.ingredients[Number(el.dataset.prepared)].qty=el.valueAsNumber;updatePreparationAvailability();return;}if(el.id==='search'){search=el.value;order=[];renderList();}
 if(el.matches('#add-form [name=name]')){const match=catalog().find(p=>p.name===normalize(el.value));if(match)updateAddDefaults();}
 if(el.dataset.ing!==undefined){const item=draftIngredients[Number(el.dataset.ing)];if(item)item[el.dataset.prop]=el.dataset.prop==='qty'?el.valueAsNumber:el.value;}
});
document.addEventListener('keydown',event=>{if(event.target.dataset.quantity&&event.key==='Enter'){event.preventDefault();event.target.blur();}});
document.addEventListener('change',event=>{
 const el=event.target;if(el.id==='category-filter'){categoryFilter=el.value;order=[];renderList();}
 if(el.matches('#add-form [name=category],#add-form [name=unit]')){if(el.name==='category'&&el.value==='Alimentari'&&el.form.elements.unit.value==='pz')el.form.elements.unit.value='g';refreshUnits(el.form);}
 if(el.dataset.ing!==undefined&&el.dataset.prop==='unit'){const item=draftIngredients[Number(el.dataset.ing)];if(item)item.unit=el.value;}
 if(el.dataset.ing!==undefined&&el.dataset.prop==='ingredient'){const item=draftIngredients[Number(el.dataset.ing)],chosen=catalog().find(p=>p.name===normalize(el.value)&&p.category==='Alimentari');if(item&&chosen){const old=item.unit;item.unit=state.units[chosen.name]||chosen.unit;const row=el.closest('.ingredient-edit');row.querySelector('select').value=item.unit;if(item.qty===step(old)){item.qty=step(item.unit);row.querySelector('[data-prop=qty]').value=item.qty;}}}
 if(el.dataset.quantity){const id=el.dataset.id,kind=el.dataset.quantity,previous=state[kind]?.find(p=>p.id===id);if(!previous)return;if(!el.value.trim()||!el.checkValidity()){notify(previous.unit==='pz'&&el.value.trim()?'I pezzi devono essere interi. Il valore precedente è stato mantenuto.':'Inserisci una quantità valida. Il valore precedente è stato mantenuto.',true);el.value=previous.qty;return;}if(el.valueAsNumber===previous.qty){editingBaselines.delete(kind+':'+id);return;}if(kind==='pantry')markGrace(id);if(!action('quantity',{kind,id,qty:el.valueAsNumber,expected:editingBaselines.get(kind+':'+id)??previous.qty}))el.value=previous.qty;editingBaselines.delete(kind+':'+id);}
});
document.addEventListener('toggle',event=>{const el=event.target;if(el.isConnected&&el.matches?.('details[data-recipe]')){if(el.open)openRecipes.add(el.dataset.recipe);else openRecipes.delete(el.dataset.recipe);}},true);
document.addEventListener('submit',event=>{
 event.preventDefault();const form=event.target;
 if(form.id==='add-form'){
  refreshUnits(form);const data=new FormData(form),success=action(page==='pantry'?'addPantry':'addShopping',{name:data.get('name'),category:data.get('category'),qty:Number(data.get('qty')),unit:data.get('category')==='Altro'?'pz':data.get('unit')});
  if(success){if(page==='pantry'){pantryFilter='Disponibili';categoryFilter='Tutte';search='';$('#search').value='';$('#category-filter').value='Tutte';for(const item of document.querySelectorAll('[data-filter=stock]')){const active=item.dataset.value===pantryFilter;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));}renderList();}const current=$('#add-form');current.classList.remove('flash');void current.offsetWidth;current.classList.add('flash');current.elements.name.value='';current.elements.qty.value=0;current.elements.name.focus();}
 }
 if(form.id==='preparation-form'){if(!preparation)return;const {recipe,people,ingredients}=preparation;if(action('cook',{id:recipe.id,people,ingredients,expectedRecipe:recipe})){$('#editor').close();preparation=null;notify('Preparazione registrata. Dispensa aggiornata.');}return;}
 if(form.id==='recipe-form'){
  try{const data=new FormData(form),recipe=validateRecipe({id:editingRecipe?.id||crypto.randomUUID(),name:data.get('name'),source_url:data.get('source_url'),instructions:'',tools:[],ingredients:draftIngredients});if(action('saveRecipe',{recipe,...(editingRecipe?{expected:editingRecipe}:{})})){$('#editor').close();search='';recipeFilter='Tutte';renderShell();notify('Ricetta salvata.');}}catch(e){$('#editor-error').textContent=e.message;}
 }
});
document.addEventListener('click',async event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.dataset.nav){nav(button.dataset.nav);return;}
 if(button.dataset.filter){const {filter,value}=button.dataset;if(filter==='recipe')recipeFilter=value;else pantryFilter=value;grace.clear();order=[];for(const item of document.querySelectorAll(`[data-filter="${filter}"]`)){const active=item.dataset.value===value;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));}renderList();return;}
 const {command,id}=button.dataset;try{switch(command){
 case 'toggle-add':addOpen=!addOpen;writePreference('spesapp-add-open',addOpen?'1':'0');const form=$('#add-form');if(form){form.hidden=!addOpen;form.style.display=addOpen?'':'none';}button.setAttribute('aria-expanded',String(addOpen));button.textContent=(addOpen?'−':'＋')+' Prodotto';break;
 case 'add-increase':case 'add-decrease':{const f=$('#add-form');if(!f)break;refreshUnits(f);const q=f.elements.qty,amount=step(f.elements.unit.value),current=Number(q.value);const next=round((Number.isFinite(current)?current:0)+(command==='add-increase'?amount:-amount));q.value=Math.min(LIMITS.quantity,Math.max(0,next));q.dispatchEvent(new Event('input',{bubbles:true}));break;}
 case 'increase':case 'decrease':{const kind=button.dataset.kind,p=state[kind].find(p=>p.id===id);if(!p)break;if(kind==='pantry')markGrace(id);action('quantity',{kind,id,delta:step(p.unit)*(command==='increase'?1:-1)});break;}
 case 'buy':button.disabled=true;if(!action('buy',{id}))button.disabled=false;break;
 case 'remove-shopping':button.disabled=true;if(!action('removeShopping',{id}))button.disabled=false;break;
 case 'exhaust':button.disabled=true;if(!action('exhaust',{id}))button.disabled=false;break;
 case 'delete-pantry':button.disabled=true;if(!action('deletePantry',{id}))button.disabled=false;break;
 case 'new-recipe':showRecipeEditor();break;
 case 'edit-recipe':{const recipe=state.recipes.find(r=>r.id===id);if(!recipe)throw Error('Questa ricetta non è più disponibile.');showRecipeEditor(recipe);break;}
 case 'delete-recipe':{const recipe=state.recipes.find(r=>r.id===id);if(!recipe)break;$('#editor').innerHTML=editorHead('Elimina ricetta')+`<p class="delete-question">Eliminare ${esc(recipe.name)}?</p><div class="editor-footer"><button data-command="close-dialog">Annulla</button><button class="danger" data-command="confirm-delete-recipe" data-id="${esc(id)}">Elimina ricetta</button></div>`;$('#editor').showModal();break;}
 case 'confirm-delete-recipe':button.disabled=true;if(action('deleteRecipe',{id}))$('#editor').close();else button.disabled=false;break;
 case 'cook':showPreparation(state.recipes.find(r=>r.id===id));break;
 case 'prep-factor':if(preparation){$('#preparation-people').value=button.dataset.value;scalePreparation(button.dataset.value);}break;
 case 'close-dialog':$('#editor').close();break;
 case 'add-ingredient':if(draftIngredients.length>=LIMITS.ingredients){notify('Puoi inserire al massimo 100 ingredienti.',true);break;}draftIngredients.push({ingredient:'',qty:50,unit:'g'});renderIngredientEditor();break;
 case 'remove-ingredient':draftIngredients.splice(Number(button.dataset.index),1);renderIngredientEditor();break;
 case 'logout':await store.logout();break;
 case 'login':button.disabled=true;try{await store.login();}finally{if(button.isConnected)button.disabled=false;}break;
 case 'retry':location.reload();break;
 }}catch(e){notify(e.message,true);}
});
matchMedia('(max-width:650px)').addEventListener('change',()=>{if(mobile()&&page==='recipes')page='shopping';if(meta.ready&&(meta.preview||meta.authenticated))renderShell();else onStoreChange(state||{pantry:[],shopping:[],recipes:[]},meta);});
function onStoreChange(next,nextMeta){
 state=next;meta=nextMeta;if(mobile()){renderMaintenance();return;}if(!meta.preview&&!meta.authenticated){$('#editor').close();$('#app').innerHTML='<section class="welcome"><div class="brandmark">S</div><h1>Spesapp</h1><p>Dispensa, ricette e spesa.<br>Sul PC e sul telefono, sempre con te.</p><button class="primary" data-command="login">Accedi con Google</button><p class="local-note">Accesso riservato al tuo account.</p></section>';return;}
 if(!meta.ready){$('#editor').close();$('#app').innerHTML='<section class="welcome"><div class="brandmark">S</div><p role="status">'+esc(meta.error||(meta.online===false?'Per il primo caricamento dei dati serve una connessione.':'Caricamento dei tuoi dati…'))+'</p>'+(meta.error?'<button data-command="retry">Riprova</button><button data-command="logout">Esci dall’account</button>':'')+'</section>';return;}
 if(!$('.shell'))renderShell();else{renderList();refreshSuggestions();$('#sync-label').textContent=statusText();$('#sync-label').classList.toggle('offline',meta.online===false);}
 const error=$('#sync-error');if(error){error.hidden=!meta.error;error.textContent=meta.error||'';}
 if($('#editor').open&&$('#preparation-form'))updatePreparationAvailability();
}
try{store=await createStore(seed.recipes,onStoreChange,error=>notify(error.message,true));}catch(e){if(!mobile()){$('#app').innerHTML='<section class="welcome"><div class="brandmark">S</div><h1>Spesapp</h1><p role="alert">'+esc('Non è stato possibile collegarsi al servizio. Controlla la connessione e riprova. I dati non sono stati modificati.')+'</p><button data-command="retry">Riprova</button></section>';}}
if('serviceWorker'in navigator&&!new URLSearchParams(location.search).has('preview'))navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(registration=>{addEventListener('focus',()=>void registration.update().catch(()=>{}));}).catch(()=>notify('Installazione offline non disponibile su questo browser.'));
