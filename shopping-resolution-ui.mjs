import {ingredientSuggestions,dishSuggestions} from './shopping-suggestions.mjs?v=97';
import {shoppingAffectedMeals,shoppingResolutionPreview} from './week-domain.mjs?v=97';
import {formatQuantity,normalize,productUnit,recentShoppingPurchases} from './domain.mjs?v=97';

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const $=selector=>document.querySelector(selector);
const button=(action,text,attributes='')=>'<button type="button" data-resolution="'+action+'" '+attributes+'>'+text+'</button>';
const dateLabel=day=>new Intl.DateTimeFormat('it-IT',{weekday:'short',day:'numeric',month:'short'}).format(new Date(day+'T12:00:00'));
const ingredients=recipe=>'<ul class="ingredients compact-ingredients resolution-ingredients">'+recipe.ingredients.map(item=>'<li><strong>'+esc(item.ingredient)+'</strong><span>'+esc(formatQuantity(item.qty,item.unit))+'</span></li>').join('')+'</ul>';

const recipeGuide=recipe=>(recipe.source_url?'<a class="resolution-source" href="'+esc(recipe.source_url)+'" target="_blank" rel="noopener noreferrer">Apri la ricetta ↗</a>':'')+(recipe.instructions?'<details class="resolution-guide"><summary>Procedimento</summary><p>'+esc(recipe.instructions)+'</p></details>':'');

export function createShoppingResolutionUI(api){
 let context=null,searchTimer;
 function ready(){
  if(!api.ready())throw Error('Attendi il salvataggio delle ultime modifiche e riprova.');
 }
 function showError(error){
  const target=$('#resolution-error');
  if(target)target.textContent=error.message;
  else api.notify(error.message,true);
 }
 function shell(title,html){
  api.dialog(title,html+'<p id="resolution-error" class="input-error" role="alert"></p>');
 }
 function selected(){
  return context.options[context.selected];
 }
 function baseRequest(){
  const item=selected();
  return {start:item.start,revision:item.revision,mealId:item.mealId,scopeStart:item.scopeStart,scopeRevision:item.scopeRevision,ingredient:context.name,unit:context.unit};
 }
 function open(name,unit){
  try{
   ready();
   context={name,unit,selected:0,query:'',offset:0,options:shoppingAffectedMeals(api.getPlan(),api.getMain(),name,unit,api.getStart())};
   showMeals();
  }catch(error){api.notify(error.message,true);}
 }
 function showMeals(){
  const options=context.options;
  shell('Non trovo '+context.name,options.length?'<p>Scegli il pasto da aggiornare.</p><div class="resolution-meal-options">'+options.map((item,index)=>button('meal','<strong>'+esc(item.recipe.name)+'</strong><small>'+esc(dateLabel(item.date))+' · '+item.slot+(item.linkedMeals?.length?' + pranzo collegato':'')+'</small>','data-index="'+index+'"')).join('')+'</div>':'<p>Nessun pasto futuro da preparare usa questo ingrediente. Puoi aggiornare il prodotto direttamente dalla lista.</p>');
 }
 function availableSubstitutes(){
  const recipe=selected().recipe,source=recipe.ingredients.find(item=>item.ingredient===context.name&&item.unit===context.unit);
  return ingredientSuggestions(api.getMain(),recipe,source).filter(replacement=>{
   try{shoppingResolutionPreview(api.getPlan(),api.getMain(),{...baseRequest(),mode:'substitute',replacement});return true;}catch{return false;}
  });
 }
 function showMeal(index){
  context.selected=index;
  const item=selected(),canSubstitute=availableSubstitutes().length>0;
  shell(item.recipe.name,'<p class="summary-note">'+esc(dateLabel(item.date))+' · '+item.slot+' · Ingredienti per 1 porzione</p>'+ingredients(item.recipe)+recipeGuide(item.recipe)+'<div class="resolution-modes">'+(canSubstitute?button('substitute','Sostituisci '+esc(context.name),'class="primary"'):'')+button('recipe-mode','Cambia piatto',canSubstitute?'':'class="primary"')+'</div>'+button('meals','Altri pasti'));
 }
 function showSubstitution(){
  if(!availableSubstitutes().length){showRecipeChoices();return;}
  const source=selected().recipe.ingredients.find(item=>item.ingredient===context.name&&item.unit===context.unit);
  shell('Sostituisci '+context.name,'<form id="resolution-substitution" class="resolution-form"><p class="summary-note">Scegli un sostituto suggerito oppure scrivine uno. Verifica la dose prima di confermare.</p><label>Prodotto trovato<input name="replacement" id="resolution-replacement" autocomplete="off" maxlength="120" required></label><div id="resolution-suggestions" class="resolution-suggestions"></div><div class="resolution-form-amount"><label>Quantità per 1 porzione<input name="qty" type="number" min="0.000001" max="1000000000" step="any" inputmode="decimal" value="'+source.qty+'" required></label><label>Unità<select name="unit">'+['g','l','pz'].map(unit=>'<option value="'+unit+'" '+(unit===source.unit?'selected':'')+'>'+(unit==='pz'?'P':unit.toUpperCase())+'</option>').join('')+'</select></label></div><p class="summary-note">Inserisci la quantità del prodotto sostitutivo che userai nella ricetta.</p><div class="editor-footer">'+button('meal','Indietro','data-index="'+context.selected+'"')+'<button type="submit" class="primary">Vedi riepilogo</button></div></form>');
  renderSuggestions();
 }
 function renderSuggestions(){
  const form=$('#resolution-substitution'),target=$('#resolution-suggestions');
  if(!form||!target)return;
  const query=normalize(form.elements.replacement.value);
  const source=selected().recipe.ingredients.find(item=>item.ingredient===context.name&&item.unit===context.unit);
  context.substitutes=availableSubstitutes();
  if(!query){
   target.innerHTML=context.substitutes.length?context.substitutes.map((item,index)=>button('suggested-ingredient','<strong>'+esc(item.ingredient)+'</strong><small>'+esc(formatQuantity(item.qty,item.unit))+' · '+esc(item.reason)+'</small>','data-index="'+index+'"')).join(''):'<p class="summary-note">Non ho un sostituto adatto da suggerire per questo ingrediente. Puoi indicarne uno oppure cambiare piatto.</p>';
   return;
  }
  const names=new Set(api.getMain().recipes.flatMap(recipe=>recipe.ingredients.map(item=>item.ingredient)).concat(api.getMain().pantry.filter(item=>item.category==='Alimentari').map(item=>item.name)));
  target.innerHTML=[...names].filter(name=>name!==context.name&&name.includes(query)).sort((a,b)=>a.localeCompare(b,'it')).slice(0,6).map(name=>button('ingredient-option',esc(name),'data-name="'+esc(name)+'"')).join('');
 }
 function showRecipeChoices(){
  context.query='';context.offset=0;
  context.candidates=dishSuggestions(api.getMain(),selected().recipe,context.name);
  shell('Cambia piatto','<p class="summary-note">Tre alternative dello stesso tipo, dando priorità agli ingredienti già presi e a quelli della ricetta attuale.</p><div id="resolution-recipe-results" class="resolution-recipe-results"></div>'+button('meal','Indietro','data-index="'+context.selected+'"'));
  renderRecipes();
 }
 function renderRecipes(){
  const target=$('#resolution-recipe-results');
  if(!target)return;
  const page=[];let cursor=context.offset;
  while(cursor<context.candidates.length&&page.length<3){
   const item=context.candidates[cursor++];
   try{shoppingResolutionPreview(api.getPlan(),api.getMain(),{...baseRequest(),mode:'recipe',recipeId:item.recipe.id});page.push(item);}catch{}
  }
  context.nextOffset=cursor>=context.candidates.length?0:cursor;
  target.innerHTML=page.length?page.map(({recipe,bought,shared})=>button('recipe','<strong>'+esc(recipe.name)+'</strong><small>'+esc(recipe.ingredients.map(i=>i.ingredient).join(' · '))+'</small><small>'+(bought?'Riutilizza '+bought+' ingredienti già presi':shared?'Mantiene '+shared+' ingredienti della ricetta':'Un piatto diverso')+'</small>','data-id="'+esc(recipe.id)+'"')).join('')+(context.candidates.length>3?button('more-recipes','Altre 3 proposte'):''):'<p class="empty">Non ci sono altri piatti compatibili dello stesso tipo senza questo ingrediente.</p>';
 }

 function showPreview(request){
  ready();
  const preview=shoppingResolutionPreview(api.getPlan(),api.getMain(),request);
  context.request={...request,expectedMain:preview.expectedMain};
  context.preview=preview;
  const changes=preview.changes.map(change=>'<li><strong>'+esc(change.name)+'</strong><span>'+(change.after?esc(formatQuantity(change.after,change.unit)):'Togli dalla lista')+'<small>'+(change.before?'Prima '+esc(formatQuantity(change.before,change.unit)):'Da aggiungere')+'</small></span></li>').join('');
  const bought=preview.purchased.map((item,index)=>'<li><div><strong>'+esc(item.name)+'</strong><small>Presi '+esc(formatQuantity(item.qty,item.unit))+'</small></div>'+(item.returnable?'<label class="resolution-return"><input type="checkbox" data-resolution-return="'+index+'"><span>Rimetto '+esc(formatQuantity(item.returnable,item.unit))+' sullo scaffale'+(item.qty>item.returnable?'<small>Tieni '+esc(formatQuantity(item.qty-item.returnable,item.unit))+' per gli altri pasti</small>':'')+'</span></label>':'<span class="resolution-keep">'+(item.needed?'Tieni: serve ancora ai pasti':'Tieni: acquisto già utilizzato in parte')+'</span>')+'</li>').join('');
  const subtitle=request.mode==='substitute'?esc(context.name)+' → '+esc(request.replacement.ingredient):esc(selected().recipe.name)+' → '+esc(preview.recipe.name);
  shell('Riepilogo cambio','<p class="resolution-change-title">'+subtitle+'</p><details class="resolution-recipe-preview" open><summary>Ingredienti aggiornati per 1 porzione</summary>'+ingredients(preview.recipe)+'</details><section><h3>Lista della spesa</h3>'+(changes?'<ul class="resolution-changes">'+changes+'</ul>':'<p>Le quantità in lista coprono già il cambio.</p>')+'</section><section><h3>Già presi in questa spesa</h3>'+(bought?'<ul class="resolution-purchases">'+bought+'</ul><p class="summary-note">Acquisti segnati Comprato oggi nelle ultime 10 ore. Spunta solo ciò che rimetti davvero sullo scaffale.</p>':'<p class="summary-note">Nessun acquisto recente registrato per questi ingredienti. Verifica il carrello per i prodotti presi prima di questo aggiornamento.</p>')+'</section><div class="editor-footer">'+button('meal','Indietro','data-index="'+context.selected+'"')+button('confirm','Conferma cambio','class="primary"')+'</div>');
 }
 document.addEventListener('input',event=>{
  if(event.target.id==='resolution-replacement')renderSuggestions();
  if(event.target.id==='resolution-recipe-search'){
   context.query=event.target.value;context.offset=0;
   clearTimeout(searchTimer);searchTimer=setTimeout(renderRecipes,90);
  }
 });
 document.addEventListener('submit',event=>{
  if(event.target.id!=='resolution-substitution')return;
  event.preventDefault();
  const form=event.target;
  if(!form.reportValidity())return;
  try{
   showPreview({...baseRequest(),mode:'substitute',replacement:{ingredient:normalize(form.elements.replacement.value),qty:form.elements.qty.valueAsNumber,unit:form.elements.unit.value}});
  }catch(error){showError(error);}
 });
 document.addEventListener('click',event=>{
  const control=event.target.closest('[data-resolution]');
  if(!control||control.disabled||!context)return;
  try{
   switch(control.dataset.resolution){
    case 'meals':showMeals();break;
    case 'meal':showMeal(Number(control.dataset.index));break;
    case 'substitute':showSubstitution();break;
    case 'recipe-mode':showRecipeChoices();break;
    case 'more-recipes':context.offset=context.nextOffset||0;renderRecipes();break;
    case 'recipe':showPreview({...baseRequest(),mode:'recipe',recipeId:control.dataset.id});break;
    case 'suggested-ingredient':{
     const item=context.substitutes[Number(control.dataset.index)],form=$('#resolution-substitution');
     if(!item||!form)break;
     form.elements.replacement.value=item.ingredient;form.elements.qty.value=item.qty;form.elements.unit.value=item.unit;
     form.elements.unit.dispatchEvent(new Event('change',{bubbles:true}));
     $('#resolution-suggestions').innerHTML='<p class="summary-note">'+esc(item.reason)+'. Controlla la quantità e apri il riepilogo.</p>';
     break;
    }
    case 'ingredient-option':{
     const form=$('#resolution-substitution');
     form.elements.replacement.value=control.dataset.name;
     const unit=productUnit(api.getMain(),control.dataset.name);
     if(unit){form.elements.unit.value=unit;form.elements.unit.dispatchEvent(new Event('change',{bubbles:true}));}
     $('#resolution-suggestions').innerHTML='';
     form.elements.qty.focus();
     break;
    }
    case 'confirm':{
     ready();
     const returnItems=[...document.querySelectorAll('[data-resolution-return]:checked')].map(input=>{
      const item=context.preview.purchased[Number(input.dataset.resolutionReturn)];
      return {name:item.name,unit:item.unit,qty:item.returnable};
     });
     control.disabled=true;
     try{api.dispatch({...context.request,returnItems});api.close();api.notify('Pasto e lista della spesa aggiornati.');}
     catch(error){control.disabled=false;throw error;}
     break;
    }
   }
  }catch(error){showError(error);}
 });
 return {open};
}
