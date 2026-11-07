import {recipeCalories} from './recipe-calories.mjs?v=20261104-calorie-settimana';
import {normalize,createUnitLookup,addShoppingRequirements,round,validateRecipe,validateState,recipeStatus,productUnit,applyAction,DomainError} from './domain.mjs?v=20261104-calorie-settimana';

const fail=m=>{throw new DomainError(m);},record=x=>!!x&&typeof x==='object'&&!Array.isArray(x),id=x=>{if(typeof x!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(x)||['constructor','prototype','__proto__'].includes(x))fail('Identificativo non valido.');return x;};

export const localDate=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

export function date(v){if(typeof v!=='string'||!/^20\d\d-\d\d-\d\d$/.test(v)||localDate(new Date(v+'T12:00:00'))!==v)fail('Data non valida.');return v;}

export function addDays(v,n){const d=new Date(date(v)+'T12:00:00');d.setDate(d.getDate()+n);return localDate(d);}

export function monday(v=localDate()){return addDays(v,-((new Date(date(v)+'T12:00:00').getDay()+6)%7));}

export const digest=r=>JSON.stringify({id:r.id,name:r.name,ingredients:r.ingredients}),emptyWeeks=()=>({schema:1,weeks:{},applied:[]});

export function settings(raw){if(!record(raw)||!['always','some','different'].includes(raw.leftovers)||![0,30,45].includes(raw.minutes)||typeof raw.pantryPriority!=='boolean'||typeof raw.exclude!=='string'||raw.exclude.length>1000)fail('Impostazioni della settimana non valide.');return {leftovers:raw.leftovers,minutes:raw.minutes,pantryPriority:raw.pantryPriority,exclude:normalize(raw.exclude)};}

export function validateWeek(raw){if(!record(raw)||!record(raw.recipes)||!Array.isArray(raw.meals)||![0,10].includes(raw.meals.length)||!Number.isInteger(raw.revision)||raw.revision<0||raw.revision>100000)fail('Settimana non valida.');if(raw.history!==undefined&&(!Array.isArray(raw.history)||raw.history.length>500))fail('Cronologia delle proposte non valida.');const w={start:date(raw.start),revision:raw.revision,settings:settings(raw.settings),recipes:{},meals:[],history:[...new Set((raw.history||[]).map(id))]};if(monday(w.start)!==w.start)fail('La settimana deve iniziare di lunedì.');for(const [key,value]of Object.entries(raw.recipes)){id(key);const r=validateRecipe(value,true);if(r.id!==key)fail('Ricetta non valida.');w.recipes[key]=r;}if(Object.keys(w.recipes).length>20)fail('Troppe ricette nella settimana.');for(const m of raw.meals){if(!record(m))fail('Pasto non valido.');const v={id:id(m.id),date:date(m.date),slot:m.slot,recipeId:id(m.recipeId),from:m.from?id(m.from):null};if(v.date<w.start||v.date>addDays(w.start,4)||!['Pranzo','Cena'].includes(v.slot)||!w.recipes[v.recipeId]||w.meals.some(x=>x.id===v.id||x.date===v.date&&x.slot===v.slot))fail('Controlla i pasti della settimana.');if(m.locked!==undefined&&typeof m.locked!=='boolean')fail('Blocco pasto non valido.');if(m.locked)v.locked=true;w.meals.push(v);}for(const m of w.meals)if(m.from){const root=w.meals.find(x=>x.id===m.from);if(!root||root.from||root.slot!=='Cena'||m.slot!=='Pranzo'||root.recipeId!==m.recipeId||addDays(root.date,1)!==m.date)fail('Collegamento tra cena e pranzo non valido.');}const entries=raw.calorieEntries??[];if(!Array.isArray(entries)||entries.length>500)fail('Troppi inserimenti calorici nella settimana.');w.calorieEntries=[];for(const e of entries){if(!record(e)||!['recipe','extra'].includes(e.kind)||typeof e.name!=='string'||!e.name.trim()||e.name.length>120||e.kcal!==null&&(!Number.isFinite(e.kcal)||e.kcal<0||e.kcal>100000)||e.kind==='extra'&&!(e.kcal>0))fail('Calorie non valide.');const entry={id:id(e.id),date:date(e.date),kind:e.kind,name:e.name.trim(),kcal:e.kcal};if(entry.date<w.start||entry.date>addDays(w.start,6)||w.calorieEntries.some(x=>x.id===entry.id))fail('Data o inserimento calorico non valido.');w.calorieEntries.push(entry);}return w;}

export function validateWeeks(raw){if(!record(raw)||raw.schema!==1||!record(raw.weeks)||!Array.isArray(raw.applied))fail('La settimana salvata non è leggibile. I dati sono conservati.');const s=emptyWeeks();for(const [key,value]of Object.entries(raw.weeks)){const w=validateWeek(value);if(w.start!==key)fail('Settimana non valida.');s.weeks[key]=w;}s.applied=raw.applied.map(id).slice(-1500);if(Object.keys(s.weeks).length>52||new TextEncoder().encode(JSON.stringify(s)).length>780000)fail('Archivio settimanale pieno. Le settimane salvate restano conservate.');return s;}

export function candidates(main,preferences){const p=settings(preferences),excluded=p.exclude.split(',').map(normalize).filter(Boolean),unitLookup=createUnitLookup(main);return main.recipes.filter(r=>['Primi','Secondi'].includes(r.meal)&&!recipeStatus(main,r,unitLookup).unitConflicts.length&&!excluded.some(t=>r.name.includes(t)||r.ingredients.some(i=>i.ingredient.includes(t))));}

export function estimatedMinutes(r){if(/SODE|CAPRESE/.test(r.name))return 15;if(/PASTA|FRITTATA/.test(r.name))return 25;if(/RISO|RISOTTO/.test(r.name))return 40;return null;}

function abundance(main,r){const parts=r.ingredients.filter(i=>i.qty>0&&!['SALE FINO','PEPE NERO','ACQUA','BASILICO','PREZZEMOLO','ORIGANO'].includes(i.ingredient));if(!parts.length)return 0;return Math.min(3,parts.reduce((n,i)=>{const qty=main.pantry.filter(p=>p.name===i.ingredient&&p.unit===i.unit&&p.category==='Alimentari').reduce((n,p)=>n+p.qty,0);return n+Math.min(8,qty/i.qty);},0)/parts.length/3);}

export function mealExpired(meal,now=new Date()){const today=localDate(now);return meal.date<today||meal.date===today&&now.getHours()>=(meal.slot==='Pranzo'?12:20);}

// Stable weighted sampling: pantry is a preference, never a feasibility filter.

// Remember recent selections across refreshes, without reserving pantry stock.

function remember(history,recipeId){return [...history.filter(x=>x!==recipeId),recipeId].slice(-500);}

function randomFraction(seed,recipeId){let h=2166136261;for(const c of seed+'|'+recipeId){h=Math.imul(h^c.charCodeAt(0),16777619);}h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);h^=h>>>16;return ((h>>>0)+1)/4294967297;}

function choose(main,choices,p,history,used,otherRecipe,seed){

 let options=choices;

 const least=Math.min(...options.map(r=>used.get(r.id)||0));options=options.filter(r=>(used.get(r.id)||0)===least);

 if(otherRecipe&&isPasta(otherRecipe)){const balanced=options.filter(r=>!isPasta(r));if(balanced.length)options=balanced;}

 const unseen=options.filter(r=>!history.includes(r.id));

 if(unseen.length)options=unseen;

 else {const ordered=[...options].sort((a,b)=>history.indexOf(a.id)-history.indexOf(b.id));options=ordered.slice(0,Math.max(1,Math.ceil(ordered.length/4)));}

 return options.map(r=>({r,score:-Math.log(randomFraction(seed,r.id))/((1+(p.pantryPriority?abundance(main,r):0))*(p.minutes&&estimatedMinutes(r)>p.minutes?.25:1))})).sort((a,b)=>a.score-b.score||a.r.id.localeCompare(b.r.id))[0].r;

}

export function alternativeRecipe(main,w,m,variant=0){const old=w.recipes[m.recipeId],pool=candidates(main,w.settings).filter(r=>r.id!==m.recipeId&&r.meal===old.meal);if(!pool.length)fail('Non ci sono altre ricette dello stesso tipo disponibili.');const other=w.meals.find(x=>x.date===m.date&&x.id!==m.id),otherRecipe=other&&w.recipes[other.recipeId],used=new Map();for(const x of w.meals)if(!x.from&&x.id!==m.id)used.set(x.recipeId,(used.get(x.recipeId)||0)+1);const history=[...new Set([...(w.history||[]),...w.meals.map(x=>x.recipeId)])];return choose(main,pool,w.settings,history,used,otherRecipe,w.start+'|change|'+m.id+'|'+w.revision+'|'+variant);}


const isPasta=r=>r.ingredients.some(i=>/^(PASTA|SPAGHETTI|PENNE|FUSILLI|RIGATONI|TAGLIATELLE)$/.test(i.ingredient));

export function generateWeek(main,preferences,start,variant=0,previous=null,now=new Date()){const p=settings(preferences);date(start);if(monday(start)!==start)fail('Scegli una settimana da lunedì.');const old=previous?validateWeek(previous):null;const frozenIds=new Set(old?.meals.filter(m=>mealExpired(m,now)||m.locked).map(m=>m.recipeId)||[]),pool=candidates(main,p).filter(r=>!frozenIds.has(r.id)||digest(r)===digest(old.recipes[r.id]));if(!pool.length)fail('Non ci sono primi o secondi compatibili. Aggiungi ricette al ricettario.');if(old&&old.start!==start)fail('La settimana precedente non corrisponde.');const w={start,revision:0,settings:p,recipes:{},meals:[],history:[...(old?.history||[])]},used=new Map();for(const m of old?.meals||[])w.history=remember(w.history,m.recipeId);let rootIndex=0;

 function pick(day,slot){const other=w.meals.find(m=>m.date===day),otherRecipe=other&&w.recipes[other.recipeId],opposite=otherRecipe?.meal==='Primi'?'Secondi':otherRecipe?.meal==='Secondi'?'Primi':null,balanced=opposite?pool.filter(r=>r.meal===opposite):pool,choices=balanced.length?balanced:pool,prior=old?.meals.find(m=>m.date===day&&m.slot===slot),fresh=choices.filter(r=>r.id!==prior?.recipeId),options=fresh.length?fresh:choices;const r=choose(main,options,p,w.history,used,otherRecipe,start+'|generate|'+(old?.revision||0)+'|'+variant+'|'+rootIndex++);w.history=remember(w.history,r.id);return r;}


 for(let i=0;i<5;i++){const d=addDays(start,i);for(const slot of ['Pranzo','Cena']){const before=old?.meals.find(m=>m.date===d&&m.slot===slot);if(before&&(mealExpired(before,now)||before.locked)){const r=old.recipes[before.recipeId],kept=structuredClone(before);if(kept.from&&w.meals.find(m=>m.id===kept.from)?.recipeId!==kept.recipeId)kept.from=null;w.meals.push(kept);w.recipes[r.id]=structuredClone(r);if(!kept.from)used.set(r.id,(used.get(r.id)||0)+1);continue;}const linked=slot==='Pranzo'&&i>0&&(p.leftovers==='always'||p.leftovers==='some'&&[1,3].includes(i)),parent=linked?w.meals.find(m=>m.date===addDays(d,-1)&&m.slot==='Cena'):null,r=parent?w.recipes[parent.recipeId]:pick(d,slot);w.meals.push({id:before?.id||'week-'+d+'-'+slot.toLowerCase(),date:d,slot,recipeId:r.id,from:parent?.id||null});w.recipes[r.id]=structuredClone(r);if(!parent)used.set(r.id,(used.get(r.id)||0)+1);}}return validateWeek(w);}

export function swapWeekMeals(original,sourceId,targetId,now=new Date()){
 const w=validateWeek(original),source=w.meals.find(m=>m.id===sourceId),target=w.meals.find(m=>m.id===targetId);
 if(!source||!target||source.id===target.id)fail('Scegli un altro pasto della settimana.');
 for(const m of [source,target]){if(mealExpired(m,now))fail('I pasti già passati non possono essere spostati.');if(m.locked)fail('Sblocca il pasto prima di spostarlo.');}
 const sourceRecipe=source.recipeId;source.recipeId=target.recipeId;target.recipeId=sourceRecipe;source.from=null;target.from=null;
 for(const parent of [source,target])for(const linked of w.meals.filter(m=>m.from===parent.id)){
  if(linked.locked||mealExpired(linked,now))linked.from=null;else linked.recipeId=parent.recipeId;
 }
 w.recipes=Object.fromEntries([...new Set(w.meals.map(m=>m.recipeId))].map(key=>[key,w.recipes[key]]));
 return validateWeek(w);
}

export function portions(w,m){return w.meals.filter(x=>x.id===m.id||x.from===m.id).length;}

// Read current pantry only: no simulation or stock reservation for later meals.

export function mealStockStatus(main,w,meal,unitLookup=null){const recipe=main.recipes.find(r=>r.id===meal.recipeId);if(!recipe)return {possible:false,missing:[],unitConflicts:[],portions:portions(w,meal),removed:true};const count=portions(w,meal),status=recipeStatus(main,{...recipe,ingredients:recipe.ingredients.map(i=>({...i,qty:round(i.qty*count)}))},unitLookup);return {...status,portions:count,removed:false};}

export function shoppingRequirements(main,w,now=new Date()){w=validateWeek(w);const map=new Map(),unitLookup=createUnitLookup(main);for(const meal of w.meals.filter(m=>!m.from)){const count=w.meals.filter(m=>(m.id===meal.id||m.from===meal.id)&&!mealExpired(m,now)).length;if(!count)continue;const r=w.recipes[meal.recipeId],current=main.recipes.find(x=>x.id===r.id);if(!current||digest(current)!==digest(r))fail('Una ricetta della settimana è cambiata. Sostituiscila prima di aggiungere la spesa.');for(const i of r.ingredients){const unit=unitLookup(i.ingredient);if(unit&&unit!==i.unit)fail(i.ingredient+': correggi l’unità nella ricetta.');if([...main.pantry,...main.shopping].some(p=>p.name===i.ingredient&&p.category==='Altro'))fail(i.ingredient+' appartiene ad Altro: correggi la categoria.');const key=i.ingredient+'|'+i.unit;map.set(key,{name:i.ingredient,category:'Alimentari',unit:i.unit,qty:round((map.get(key)?.qty||0)+i.qty*count)});}}return [...map.values()];}

export function shoppingNeeds(main,w,now=new Date()){const requirements=shoppingRequirements(main,w,now);return requirements.flatMap(i=>{const available=main.pantry.filter(p=>p.category==='Alimentari'&&p.name===i.name&&p.unit===i.unit).reduce((n,p)=>n+p.qty,0),listed=main.shopping.filter(p=>p.category==='Alimentari'&&p.name===i.name&&p.unit===i.unit).reduce((n,p)=>n+p.qty,0),missing=Math.max(0,round(i.qty-available)),target=missing?(i.unit==='g'?Math.max(100,Math.ceil(round(missing/50))*50):Math.max(1,Math.ceil(missing))):0;return target>listed?[{...i,qty:round(target-listed)}]:[];});}

export function applyWeekAction(original,mainOriginal,action){if(!record(action)||!record(action.payload))fail('Operazione non valida.');id(action.id);const plan=validateWeeks(original),main=validateState(mainOriginal),a=action.payload;if(plan.applied.includes(action.id))return {plan,main};const now=new Date(Number.isFinite(action.at)?action.at:Date.now());let updated=main;const getWeek=()=>{const w=plan.weeks[date(a.start)];if(!w)fail('Settimana non disponibile.');if(a.revision!==w.revision)fail('La settimana è cambiata su un altro dispositivo. Riaprila e riprova.');return w;};switch(action.type){case 'swapMeals':{const w=getWeek();for(const mealId of [a.mealId,a.targetId]){const m=w.meals.find(m=>m.id===mealId),r=m&&w.recipes[m.recipeId];if(!r||!main.recipes.some(x=>digest(x)===digest(r)))fail('Una ricetta è stata modificata o rimossa. Aggiorna la proposta prima di spostarla.');}const moved=swapWeekMeals(w,a.mealId,a.targetId,now);moved.revision++;plan.weeks[w.start]=moved;break;}case 'lockMeal':{const w=getWeek(),m=w.meals.find(m=>m.id===a.mealId);if(!m||typeof a.locked!=='boolean')fail('Pasto non valido.');if(mealExpired(m,now))fail('Questo pasto è già passato.');if(a.locked)m.locked=true;else delete m.locked;w.revision++;break;}case 'saveWeek':{const w=validateWeek(a.week),old=plan.weeks[w.start];if((old?.revision??null)!==a.expectedRevision)fail('La settimana è cambiata. Riprova.');if(old)for(const m of old.meals.filter(m=>mealExpired(m,now)||m.locked)){const n=w.meals.find(x=>x.id===m.id);if(!n||JSON.stringify({...n,from:null})!==JSON.stringify({...m,from:null})||(mealExpired(m,now)&&n.from!==m.from)||digest(w.recipes[n.recipeId])!==digest(old.recipes[m.recipeId]))fail('I pasti passati o bloccati non possono essere modificati.');}for(const r of Object.values(w.recipes).filter(r=>w.meals.some(m=>m.recipeId===r.id&&!mealExpired(m,now))))if(!main.recipes.some(x=>digest(x)===digest(r))&&!old?.meals.some(m=>m.recipeId===r.id&&(mealExpired(m,now)||m.locked)))fail('Una ricetta è cambiata. Genera una nuova proposta.');w.calorieEntries=structuredClone(old?.calorieEntries||[]);w.revision=(old?.revision||0)+1;plan.weeks[w.start]=w;break;}case 'changeRecipe':{const w=getWeek(),m=w.meals.find(m=>m.id===a.mealId),r=main.recipes.find(r=>r.id===a.recipeId);if(m&&(mealExpired(m,now)||m.locked))fail(m.locked?'Sblocca il pasto prima di cambiarlo.':'Questo pasto è già passato.');if(!m||!r||r.meal!==w.recipes[m.recipeId].meal||r.id===m.recipeId||!candidates(main,w.settings).some(x=>x.id===r.id))fail('Ricetta non compatibile con le scelte della settimana.');if(m.from)m.from=null;w.history=remember(remember(w.history,m.recipeId),r.id);m.recipeId=r.id;w.recipes[r.id]=structuredClone(r);for(const linked of w.meals.filter(x=>x.from===m.id)){if(linked.locked)linked.from=null;else linked.recipeId=r.id;}w.recipes=Object.fromEntries([...new Set(w.meals.map(m=>m.recipeId))].map(id=>[id,w.recipes[id]]));w.revision++;break;}case 'shopping':{const w=getWeek(),requirements=shoppingRequirements(main,w,now);updated=applyAction(main,{id:action.id.slice(0,120)+'-cart',type:'addShopping',payload:{requirements}});break;}default:fail('Operazione della settimana non riconosciuta.');}plan.applied=[...plan.applied,action.id].slice(-1500);return {plan:validateWeeks(plan),main:updated};}

