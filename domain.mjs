export const categories=['Alimentari','Altro'];
export const LIMITS={name:120,quantity:1e9,rows:2000,recipes:500,ingredients:100,instructions:20000,bytes:780000};
export class DomainError extends Error {constructor(message){super(message);this.name='DomainError';this.code='validation';}}
const fail=message=>{throw new DomainError(message);};
const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const own=(obj,key)=>Object.hasOwn(obj||{},key)?obj[key]:undefined;
const idPattern=/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
function identifier(value){if(!['number','string'].includes(typeof value)||!idPattern.test(String(value))||['constructor','prototype','__proto__'].includes(String(value)))fail('Identificativo non valido nei dati.');return String(value);}
export const normalize=s=>String(s??'').normalize('NFC').trim().toLocaleUpperCase('it-IT').replace(/\s+/g,' ');
function name(value){if(typeof value!=='string')fail('Scrivi il nome del prodotto.');const n=normalize(value);if(!n||n.length>LIMITS.name||/[\x00-\x1f\x7f]/.test(n))fail('Inserisci un nome tra 1 e 120 caratteri, senza caratteri di controllo.');return n;}
function number(value){if(!['number','string'].includes(typeof value)||(typeof value==='string'&&!value.trim()))fail('Inserisci una quantità valida.');const n=Number(value);if(!Number.isFinite(n)||Math.abs(n)>LIMITS.quantity)fail('La quantità deve essere un numero valido, non superiore a un miliardo.');return n;}
export const round=n=>Math.round(n*1e6)/1e6;
export const step=unit=>unit==='g'?50:1;
export const low=p=>Number(p.qty)>0&&Number(p.qty)<=(p.unit==='g'?200:2);
export const stockView=p=>Number(p.qty)<=0?'Esauriti':low(p)?'Da rifornire':'Disponibili';
export function validProduct(p,positive=false){
 if(!record(p))fail('Prodotto non valido.');name(p.name);
 if(!categories.includes(p.category))fail('Scegli Alimentari oppure Altro.');
 const qty=number(p.qty);
 if(qty<0||(positive&&qty<=0)||round(qty)!==qty)fail('Inserisci una quantità valida, con al massimo sei decimali.');
 if(!['g','l','pz'].includes(p.unit)||(p.category==='Altro'&&p.unit!=='pz'))fail('Per Altro usa solamente pezzi.');
 if(p.unit==='pz'&&!Number.isInteger(qty))fail('I pezzi devono essere interi.');
}
export function lockUnit(state,productName,unit){
 const key=name(productName);if(!['g','l','pz'].includes(unit))fail('Unità non valida: scegli grammi, litri oppure pezzi.');
 const existing=own(state.units,key)||state.pantry.find(p=>p.name===key)?.unit||state.shopping.find(p=>p.name===key)?.unit;
 if(existing&&existing!==unit)fail(`${key} deve essere inserito in ${existing==='g'?'grammi':existing==='l'?'litri':'pezzi'} (${existing}).`);
 state.units[key]=unit;
}
// An old food-unit entry must not block an explicitly classified household item
// when no product or recipe still refers to that name. Never convert live stock.
function lockAddedProduct(state,product){
 const key=product.name,previous=own(state.units,key);
 if(product.category==='Altro'&&product.unit==='pz'&&['g','l'].includes(previous)
   && ![...state.pantry,...state.shopping].some(p=>p.name===key)
   && !state.recipes.some(r=>r.ingredients.some(i=>normalize(i.ingredient)===key))){
  state.units[key]='pz';
 }
 lockUnit(state,key,product.unit);
}
export function emptyState(recipes=[]){return {schema:1,pantry:[],shopping:[],units:{},recipes:recipes.map(r=>validateRecipe(r,true)),counts:{},applied:[]};}
export function recipeStatus(state,r){
 const needs=new Map();for(const i of r.ingredients){const key=normalize(i.ingredient)+'|'+i.unit;needs.set(key,{...i,ingredient:normalize(i.ingredient),qty:round((needs.get(key)?.qty||0)+Number(i.qty))});}
 const ingredients=[...needs.values()];const missing=ingredients.filter(i=>{const p=state.pantry.find(p=>p.category==='Alimentari'&&p.name===i.ingredient&&p.unit===i.unit);return (Number(p?.qty)||0)+1e-9<i.qty;});
 const preparations=ingredients.length?Math.min(...ingredients.map(i=>{const p=state.pantry.find(p=>p.category==='Alimentari'&&p.name===i.ingredient&&p.unit===i.unit);const required=Math.round(Number(i.qty)*1e6),available=Math.round(Number(p?.qty||0)*1e6);return required>0?Math.floor(available/required):0;})):0;
 return {ingredients,missing,possible:ingredients.length>0&&missing.length===0,preparations};
}
export function preparationStatus(state,recipe,people=1,actual=null){
 const factor=number(people);if(!Number.isInteger(factor)||factor<1||factor>1000)fail('Inserisci un numero intero di persone tra 1 e 1000.');
 const base=recipeStatus(state,recipe).ingredients,byKey=new Map(base.map(i=>[i.ingredient+'|'+i.unit,i]));
 let ingredients;
 if(actual!==null){
  if(!Array.isArray(actual)||actual.length!==base.length)fail('Controlla tutti gli ingredienti della preparazione.');
  const seen=new Set();ingredients=actual.map(item=>{if(!record(item))fail('Ingrediente non valido.');const ingredient=name(item.ingredient),key=ingredient+'|'+item.unit;if(!byKey.has(key)||seen.has(key))fail('Gli ingredienti e le unità devono corrispondere alla ricetta.');seen.add(key);const qty=number(item.qty);validProduct({name:ingredient,category:'Alimentari',qty,unit:item.unit});return {ingredient,unit:item.unit,qty};});
 }else ingredients=base.map(i=>({...i,qty:round(i.qty*factor)}));
 for(const i of ingredients)validProduct({name:i.ingredient,category:'Alimentari',qty:i.qty,unit:i.unit});
 if(!ingredients.some(i=>i.qty>0))fail('Inserisci almeno una quantità utilizzata maggiore di zero.');
 ingredients=ingredients.map(i=>{const p=state.pantry.find(p=>p.category==='Alimentari'&&p.name===i.ingredient&&p.unit===i.unit),available=p?.qty||0;return {...i,available,enough:available+1e-9>=i.qty};});
 return {ingredients,missing:ingredients.filter(i=>!i.enough),possible:ingredients.every(i=>i.enough),people:factor};
}

export function validateRecipe(raw,allowMissingSource=false){
 if(!record(raw)||!Array.isArray(raw.ingredients)||!raw.ingredients.length||raw.ingredients.length>LIMITS.ingredients)fail('Inserisci da 1 a 100 ingredienti.');
 if(raw.tools!==undefined&&(!Array.isArray(raw.tools)||raw.tools.length>30||raw.tools.some(t=>typeof t!=='string'||!normalize(t)||normalize(t).length>120||/[\x00-\x1f\x7f]/.test(t))))fail('Inserisci al massimo 30 strumenti, con nomi da 1 a 120 caratteri.');
 const r={tools:[...new Set((raw.tools||[]).map(normalize))],id:identifier(raw.id),name:name(raw.name),instructions:String(raw.instructions||'').trim(),source_url:String(raw.source_url||'').trim(),source_title:String(raw.source_title||'').trim(),servings:1,ingredients:raw.ingredients.map(i=>{if(!record(i))fail('Ingrediente non valido.');return {ingredient:name(i.ingredient),qty:number(i.qty),unit:i.unit};})};
 if(r.instructions.length>LIMITS.instructions||r.source_url.length>2048||r.source_title.length>300)fail('Testo della ricetta troppo lungo.');
 let url;if(r.source_url){try{url=new URL(r.source_url);}catch{fail('Inserisci un link valido alla ricetta.');}}else if(!allowMissingSource)fail('Inserisci il link alla ricetta.');
 if(url&&(!['https:','http:'].includes(url.protocol)||url.username||url.password))fail('Usa un link http:// o https:// senza credenziali.');

 const units=new Map();for(const i of r.ingredients){validProduct({name:i.ingredient,qty:i.qty,category:'Alimentari',unit:i.unit},true);if(units.has(i.ingredient)&&units.get(i.ingredient)!==i.unit)fail(`Usa una sola unità per ${i.ingredient}.`);units.set(i.ingredient,i.unit);}
 const aggregated=recipeStatus({pantry:[]},r);for(const i of aggregated.ingredients)validProduct({name:i.ingredient,qty:i.qty,category:'Alimentari',unit:i.unit},true);
 r.source_title||=url?.hostname||'Link da aggiungere';return r;
}
export function validateImport(raw){
 if(!record(raw)||raw.schema!==1||!['pantry','shopping','recipes'].every(k=>Array.isArray(raw[k]))||raw.pantry.length>LIMITS.rows||raw.shopping.length>LIMITS.rows||raw.recipes.length>LIMITS.recipes)fail('Backup Spesapp non valido o troppo grande.');
 if(raw.units!==undefined&&!record(raw.units)||raw.counts!==undefined&&!record(raw.counts))fail('Unità o conteggi del backup non validi.');
 const s=emptyState();
 for(const kind of ['pantry','shopping']){const ids=new Set(),names=new Set();for(const item of raw[kind]){if(!record(item))fail('Prodotto non valido nel backup.');const p={id:identifier(item.id),name:name(item.name),category:item.category,qty:number(item.qty??item.planned_qty),unit:item.unit};validProduct(p,kind==='shopping');lockUnit(s,p.name,p.unit);if(ids.has(p.id)||kind==='pantry'&&names.has(p.name))fail('Prodotto o identificativo duplicato nel backup.');ids.add(p.id);names.add(p.name);s[kind].push(p);}}
 if(Object.keys(raw.units||{}).length>5000)fail('Troppe unità nel backup.');
 for(const [key,unit]of Object.entries(raw.units||{}))lockUnit(s,key,unit);
 const ids=new Set(),names=new Set();s.recipes=raw.recipes.map(rawRecipe=>{const r=validateRecipe(rawRecipe,true);if(ids.has(r.id)||names.has(r.name))fail('Ricetta duplicata nel backup.');ids.add(r.id);names.add(r.name);return r;});
 for(const [key,count]of Object.entries(raw.counts||{})){const id=identifier(key);if(!Number.isSafeInteger(count)||count<0||count>LIMITS.quantity)fail('Conteggio delle ricette non valido.');if(ids.has(id))s.counts[id]=count;}
 assertCapacity(s);return s;
}
export function validateState(raw){
 const s=validateImport(raw);
 if(raw.applied!==undefined&&(!Array.isArray(raw.applied)||raw.applied.length>1500||!raw.applied.every(id=>typeof id==='string'&&idPattern.test(id))))fail('Cronologia delle operazioni non valida.');
 s.applied=raw.applied||[];
 if(raw.backupDate!==undefined){if(typeof raw.backupDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(raw.backupDate))fail('Data del backup non valida.');s.backupDate=raw.backupDate;}
 return s;
}
export function assertCapacity(s){if(Object.keys(s.units||{}).length>5000||Object.keys(s.counts||{}).length>LIMITS.recipes)fail('Hai raggiunto il limite dell’archivio. Esporta una copia dei dati.');if(new TextEncoder().encode(JSON.stringify(s)).length>LIMITS.bytes)fail('Archivio quasi pieno. Esporta una copia dei dati prima di aggiungere altri elementi.');}
export function validateAction(action){
 if(!record(action)||action.at!==undefined&&(!Number.isFinite(action.at)||action.at<0)||!idPattern.test(String(action.id||''))||typeof action.type!=='string'||!record(action.payload))fail('Operazione non valida.');
 const allowed=['addPantry','addShopping','quantity','exhaust','deletePantry','removeShopping','buy','saveRecipe','deleteRecipe','cook','import'];if(!allowed.includes(action.type))fail('Operazione non riconosciuta.');
 return action;
}
export function applyAction(original,action){
 validateAction(action);if(original.applied?.includes(action.id))return structuredClone(original);
 const s=structuredClone(original),a=action.payload;s.units||={};s.counts||={};s.applied||=[];
 const find=(kind,id)=>s[kind].find(p=>p.id===String(id));
 const upsert=p=>{lockUnit(s,p.name,p.unit);const existing=s.pantry.find(x=>x.name===p.name);if(existing){const qty=round(existing.qty+p.qty);validProduct({...existing,qty,category:p.category});existing.qty=qty;existing.category=p.category;}else s.pantry.push({...p,id:p.pantryId||p.id});};
 switch(action.type){
 case 'addPantry':case 'addShopping':{const p={id:identifier(action.id),name:name(a.name),category:a.category,qty:number(a.qty),unit:a.unit};validProduct(p,true);lockAddedProduct(s,p);if(action.type==='addPantry')upsert(p);else s.shopping.push(p);break;}
 case 'quantity':{if(!['pantry','shopping'].includes(a.kind))fail('Elenco dei prodotti non valido.');const p=find(a.kind,a.id);if(!p)break;if(a.expected!==undefined&&number(a.expected)!==p.qty)fail('La quantità è stata modificata da un altro dispositivo. Controlla il valore aggiornato e riprova.');const qty=a.delta!==undefined?Math.max(a.kind==='shopping'?(p.unit==='pz'?1:.01):0,round(p.qty+number(a.delta))):number(a.qty);validProduct({...p,qty},a.kind==='shopping');p.qty=qty;break;}
 case 'exhaust':{const p=find('pantry',a.id);if(p)p.qty=0;break;}
 case 'deletePantry':{const p=find('pantry',a.id);if(p&&p.qty<=0)s.pantry=s.pantry.filter(x=>x.id!==p.id);break;}
 case 'removeShopping':s.shopping=s.shopping.filter(p=>p.id!==String(a.id));break;
 case 'buy':{const p=find('shopping',a.id);if(!p)break;validProduct(p,true);upsert({...p,pantryId:'bought-'+p.id});s.shopping=s.shopping.filter(x=>x.id!==p.id);break;}
 case 'saveRecipe':{if(!record(a.recipe))fail('Ricetta non valida.');const r=validateRecipe({...a.recipe,id:a.recipe.id||action.id});if(a.expected!==undefined&&JSON.stringify(s.recipes.find(x=>x.id===r.id))!==JSON.stringify(a.expected))fail('La ricetta è stata modificata o eliminata da un altro dispositivo. Riaprila prima di salvare.');if(s.recipes.some(x=>x.id!==r.id&&x.name===r.name))fail('Esiste già una ricetta con questo nome.');for(const i of r.ingredients){if([...s.pantry,...s.shopping].some(p=>p.name===i.ingredient&&p.category==='Altro'))fail(`${i.ingredient} appartiene ad Altro: nelle ricette usa prodotti alimentari.`);lockUnit(s,i.ingredient,i.unit);}s.recipes=s.recipes.filter(x=>x.id!==r.id);s.recipes.push(r);break;}
 case 'deleteRecipe':s.recipes=s.recipes.filter(r=>r.id!==String(a.id));delete s.counts[String(a.id)];break;
 case 'cook':{const r=s.recipes.find(r=>r.id===String(a.id));if(!r)fail('Questa ricetta non è più disponibile.');if(a.expectedRecipe!==undefined&&JSON.stringify(r)!==JSON.stringify(a.expectedRecipe))fail('La ricetta è cambiata su un altro dispositivo. Riapri la preparazione prima di confermare.');const status=preparationStatus(s,r,a.people??1,a.ingredients??null);if(!status.possible)fail('Le quantità disponibili non bastano: '+status.missing.map(i=>i.ingredient).join(', ')+'.');for(const i of status.ingredients){if(i.qty===0)continue;const p=s.pantry.find(p=>p.category==='Alimentari'&&p.name===i.ingredient&&p.unit===i.unit);p.qty=round(Math.max(0,p.qty-i.qty));}if((own(s.counts,r.id)||0)>=LIMITS.quantity)fail('Conteggio delle preparazioni troppo elevato.');s.counts[r.id]=(own(s.counts,r.id)||0)+1;break;}
 case 'import':{const imported=validateImport(a.state);const applied=s.applied;Object.assign(s,imported);s.applied=applied;break;}
 }
 if(s.pantry.length>LIMITS.rows||s.shopping.length>LIMITS.rows||s.recipes.length>LIMITS.recipes)fail('Hai raggiunto il limite di elementi dell’archivio. Esporta una copia dei dati.');
 s.applied=[...new Set([...s.applied,action.id])].slice(-1500);assertCapacity(s);return s;
}
