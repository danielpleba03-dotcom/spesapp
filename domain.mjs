export const categories=['Alimentari','Altro'];
export const normalize=s=>String(s??'').trim().toLocaleUpperCase('it-IT').replace(/\s+/g,' ');
export const step=unit=>unit==='g'?50:1;
export const low=p=>Number(p.qty)>0&&Number(p.qty)<=(p.unit==='g'?200:2);
export const stockView=p=>Number(p.qty)<=0?'Esauriti':low(p)?'Da rifornire':'Disponibili';
export const round=n=>Math.round(n*1000000)/1000000;
export function validProduct(p,positive=false){
 if(!normalize(p.name))throw Error('Scrivi il nome del prodotto.');
 if(!categories.includes(p.category))throw Error('Scegli Alimentari oppure Altro.');
 if(!Number.isFinite(Number(p.qty))||Number(p.qty)<0||(positive&&Number(p.qty)<=0))throw Error('Inserisci una quantità valida.');
 if(!['g','l','pz'].includes(p.unit)||(p.category==='Altro'&&p.unit!=='pz'))throw Error('Per Altro usa solamente pezzi.');
 if(p.unit==='pz'&&!Number.isInteger(Number(p.qty)))throw Error('I pezzi devono essere interi.');
}
export function lockUnit(state,name,unit){
 const key=normalize(name),existing=state.units[key]||state.pantry.find(p=>p.name===key)?.unit||state.shopping.find(p=>p.name===key)?.unit;
 if(existing&&existing!==unit)throw Error(`${key} deve essere inserito in ${existing==='g'?'grammi':existing==='l'?'litri':'pezzi'} (${existing}).`);
 state.units[key]=unit;
}
export function emptyState(recipes=[]){return {schema:1,pantry:[],shopping:[],units:{},recipes:structuredClone(recipes),counts:{},applied:[]};}
export function recipeStatus(state,r){
 const needs=new Map();for(const i of r.ingredients){const key=normalize(i.ingredient)+'|'+i.unit;needs.set(key,{...i,ingredient:normalize(i.ingredient),qty:(needs.get(key)?.qty||0)+Number(i.qty)});}
 const ingredients=[...needs.values()];const missing=ingredients.filter(i=>{const p=state.pantry.find(p=>p.name===i.ingredient&&p.unit===i.unit);return (Number(p?.qty)||0)+1e-9<i.qty;});
 return {ingredients,missing,possible:ingredients.length>0&&missing.length===0};
}
export function validateImport(raw){
 if(!raw||raw.schema!==1||!['pantry','shopping','recipes'].every(k=>Array.isArray(raw[k])))throw Error('Backup Spesapp non valido.');
 const s=emptyState();s.units={};s.counts={};
 for(const kind of ['pantry','shopping'])for(const item of raw[kind]){const p={id:String(item.id),name:normalize(item.name),category:item.category,qty:Number(item.qty??item.planned_qty),unit:item.unit};validProduct(p,kind==='shopping');lockUnit(s,p.name,p.unit);if(item.id===undefined||item.id===null||!p.id||s[kind].some(x=>x.id===p.id))throw Error('Identificativo duplicato nel backup.');s[kind].push(p);}
 for(const [name,unit]of Object.entries(raw.units||{}))lockUnit(s,name,unit);
 s.recipes=raw.recipes.map(r=>validateRecipe(r,true));
 for(const [id,count]of Object.entries(raw.counts||{}))if(Number.isInteger(count)&&count>=0)s.counts[id]=count;
 return s;
}
export function validateRecipe(raw,allowMissingSource=false){
 const r={id:String(raw.id),name:normalize(raw.name),instructions:String(raw.instructions||'').trim(),source_url:String(raw.source_url||''),source_title:String(raw.source_title||''),servings:1,ingredients:raw.ingredients?.map(i=>({ingredient:normalize(i.ingredient),qty:Number(i.qty),unit:i.unit}))||[]};
 let url;if(r.source_url){try{url=new URL(r.source_url);}catch{throw Error('Inserisci un link valido alla ricetta.');}}else if(!allowMissingSource)throw Error('Inserisci il link alla ricetta.');
 if(url&&!['https:','http:'].includes(url.protocol))throw Error('Il link deve iniziare con https:// o http://.');
 if(raw.id===undefined||raw.id===null||!r.name||!r.ingredients.length)throw Error('Inserisci nome e almeno un ingrediente.');
 for(const i of r.ingredients)validProduct({name:i.ingredient,qty:i.qty,category:'Alimentari',unit:i.unit},true);
 r.source_title||=url?.hostname||'Link da aggiungere';return r;
}
export function applyAction(original,action){
 if(original.applied?.includes(action.id))return structuredClone(original);
 const s=structuredClone(original),a=action.payload||{};s.units||={};s.counts||={};s.applied||=[];
 const find=(kind,id)=>s[kind].find(p=>p.id===String(id));
 const upsert=p=>{lockUnit(s,p.name,p.unit);const existing=s.pantry.find(x=>x.name===p.name);if(existing){existing.qty=round(existing.qty+p.qty);existing.category=p.category;}else s.pantry.push({...p,id:p.pantryId||p.id});};
 switch(action.type){
 case 'addPantry':case 'addShopping':{const p={id:action.id,name:normalize(a.name),category:a.category,qty:Number(a.qty),unit:a.unit};validProduct(p,true);lockUnit(s,p.name,p.unit);if(action.type==='addPantry')upsert(p);else s.shopping.push(p);break;}
 case 'quantity':{const p=find(a.kind,a.id);if(!p)break;const qty=a.delta!==undefined?Math.max(a.kind==='shopping'?(p.unit==='pz'?1:.01):0,round(p.qty+Number(a.delta))):Number(a.qty);validProduct({...p,qty},a.kind==='shopping');p.qty=qty;break;}
 case 'exhaust':{const p=find('pantry',a.id);if(p)p.qty=0;break;}
 case 'deletePantry':{const p=find('pantry',a.id);if(p&&p.qty<=0)s.pantry=s.pantry.filter(x=>x.id!==p.id);break;}
 case 'removeShopping':s.shopping=s.shopping.filter(p=>p.id!==String(a.id));break;
 case 'buy':{const p=find('shopping',a.id);if(!p)break;validProduct(p,true);upsert({...p,pantryId:'bought-'+p.id});s.shopping=s.shopping.filter(x=>x.id!==p.id);break;}
 case 'saveRecipe':{const r=validateRecipe({...a.recipe,id:a.recipe.id||action.id});if(s.recipes.some(x=>x.id!==r.id&&x.name===r.name))throw Error('Esiste già una ricetta con questo nome.');for(const i of r.ingredients)lockUnit(s,i.ingredient,i.unit);s.recipes=s.recipes.filter(x=>x.id!==r.id);s.recipes.push(r);break;}
 case 'deleteRecipe':s.recipes=s.recipes.filter(r=>r.id!==String(a.id));break;
 case 'cook':{const r=s.recipes.find(r=>r.id===String(a.id));if(!r)break;const status=recipeStatus(s,r);if(!status.possible)throw Error('Le quantità disponibili non bastano per questa ricetta.');for(const i of status.ingredients){const p=s.pantry.find(p=>p.name===i.ingredient&&p.unit===i.unit);p.qty=round(Math.max(0,p.qty-i.qty));}s.counts[r.id]=(s.counts[r.id]||0)+1;break;}
 case 'import':{const imported=validateImport(a.state);Object.assign(s,imported);break;}
 default:throw Error('Operazione non riconosciuta.');
 }
 s.applied=[...new Set([...s.applied,action.id])].slice(-1500);return s;
}
