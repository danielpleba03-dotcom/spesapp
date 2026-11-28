import {catalog125,CATALOG_125,catalog120,CATALOG_120,verifiedSourceURLs120,catalog119,CATALOG_119,verifiedSourceURLs119,catalog116,CATALOG_116,verifiedSourceURLs116,catalog115,CATALOG_115,verifiedSourceURLs115,catalog114,CATALOG_114,verifiedSourceURLs114,catalog113,CATALOG_113,verifiedSourceURLs,catalog111,CATALOG_111,catalog110,CATALOG_110,catalog109,CATALOG_109,catalog106,CATALOG_106,catalog101,CATALOG_VERSION} from './catalog-runtime.mjs?v=138';
export function recipeHasSource(recipe){if(catalog125.has(recipe?.id))return true;if(!recipe?.source_url)return false;const known=catalog101.has(recipe.id)||catalog106.has(recipe.id)||catalog109.has(recipe.id)||catalog110.has(recipe.id)||catalog111.has(recipe.id)||catalog113.has(recipe.id)||catalog114.has(recipe.id)||catalog115.has(recipe.id)||catalog116.has(recipe.id)||catalog119.has(recipe.id)||catalog120.has(recipe.id);return verifiedSourceURLs.has(recipe.source_url)||verifiedSourceURLs114.has(recipe.source_url)||verifiedSourceURLs115.has(recipe.source_url)||verifiedSourceURLs116.has(recipe.source_url)||verifiedSourceURLs119.has(recipe.source_url)||verifiedSourceURLs120.has(recipe.source_url)||(!known&&/^https:\/\//.test(recipe.source_url));}
export const mealTypes=['Primi','Secondi','Contorni','Dolci'];
// Kept for backwards compatibility with the existing recipe catalogue filter.
export const dishTypes=['Pasta','Riso','Carne','Pesce','Vegetariano'];
const legacyMealTypes=['Colazioni','Merende','Antipasti'];

export function reclassifyLegacyMeal(recipe){
 const meal=recipe?.meal;
 if(mealTypes.includes(meal))return meal;
 const n=normalize(recipe?.name||'');
 const ings=(recipe?.ingredients||[]).map(i=>normalize(i.ingredient));
 const hasIng=re=>ings.some(i=>re.test(i));
 const hasSweetIng=hasIng(/^(ZUCCHERO|ZUCCHERO DI CANNA|ZUCCHERO A VELO|CIOCCOLATO|CACAO|MIELE|NUTELLA|MARMELLATA|CONFETTURA|SCIROPPO|BISCOTTI|AMARETTI|SAVOIARDI|MERINGHE|TORRONE|PANETTONE|BRIOCHE|GELATO|PANNA FRESCA)/);
 const hasSavoryMarker=hasIng(/^(PARMIGIANO|PECORINO|GRANA|PROSCIUTTO|SALSICCIA|TONNO|SALMONE|MERLUZZO|ORATA|BRANZINO|CALAMARI|POLPO|GAMBERI|BACCALA|ALICI|SARDINE|MANZO|VITELLO|MAIALE|POLLO|TACCHINO|AGNELLO|CONIGLIO|BRESAOLA|ROAST|SPECK|PANCETTA|GUANCIALE|LARDO|SALAME|MORTADELLA|ACCIUGHE|STRACCHINO|MOZZARELLA|FETA|FONTINA|SCAMORZA|ASIAGO|EMMENTAL|GORGONZOLA|CAPRINO|AGLIO|CIPOLLE|POMODORI|ZUCCHINE|MELANZANE|PEPERONI|CARCIOFI|ASPARAGI|BROCCOLI|CAVOL|SPINACI|BIETOLE|FUNGHI|CECI|FAGIOLI|LENTICCHIE|FAVE|PISELLI)/);
 if(n==='BUDINO BANANA E CIOCCOLATO'||/\b(PORRIDGE|PANCAKE|GRANOLA|MUESLI|CHIA PUDDING|FRENCH TOAST|BISCOTT|MUFFIN|CROSTATA|CIAMBELL|BUDIN|GELAT|SORBETT|GRANIT|MERING|BARRETT|GALLETTES|SPECULOOS|VANILLEKIPFERL|BAICOLI|CANESTRELL|OVIS MOLLIS|COOKIES|NASCONDINI|SCROCCAFUSI|FROLLIN|DOLCETT|MANDORLE CARAMELL|PAIN AU CHOCOLAT|CANNONCIN|ZABAIONE|GHIACCIOL|PIGNE AL CIOCCOLATO|PIZZICOTTI|TRECCINE DI RICOTTA|SOSPIRI D'AMORE|CIOCCOLAT|TORRON|CREME BRULEE|TARTE TATIN|PAN DI SPAGNA|SALAME DI CIOCCOLATO|PASTIER|STRUDEL|PANNA COTTA|BACI DI DAMA|CANNOLI|BONET|TIRAMIS|CHEESECAKE|CREPES SENZA UOVA|CREMA AL|CREMA DI MIRTILLI|CREMA MASCARPONE|CREMA PASTICC|CREMA SEMPLICE|MOUSSE AL CIOCCOLATO|MOUSSE ALLE FRAGOLE|MOUSSE DI MELONE)\b/.test(n))return 'Dolci';
 if((hasSweetIng&&!hasSavoryMarker)||(/\b(TORTA|MOUSSE|CREMA)\b/.test(n)&&hasSweetIng&&!hasIng(/PARMIGIANO|GROVIERA|GORGONZOLA|PROSCIUTTO|MORTADELLA|TONNO|OLIVE/)))return 'Dolci';
 if(/\b(PASTA|SPAGHETT|PENNE|FUSILLI|RIGATONI|TAGLIATEL|TROFIE|LINGUINE|BUCATINI|LASAGN|RAVIOLI|GNOCCH|PACCHERI|ORECCHIETTE|MACCHERONI|FARFALLE|RISOTT|RISO|POLENTA|COUS ?COUS|FARRO|ORZO|QUINOA|PIZZA|FOCACCIA|QUICHE|CASATIELLO|TORTA SALATA|PIADIN|BRUSCHETT|CROSTIN|CANAP|PANIN|TRAMEZZIN|CRESCENTIN|FRISELL|FARINATA|SAMOSA|TACOS|QUESADILL|AREPAS|WAFFLE|BAO|SFOGLIA|VOL AU VENT|BIGOLI|TORTELLIN|CANNELLON|PASSATELLI|MALLOREDDUS|PIZZOCCHERI|FREGULA|RIBOLLITA|MINESTR|VELLUTATA|ZUPPA|PANE GUTTIAU|CORNETTI AL FORMAGGIO|TARTELETTE|TRONCHETTO)\b/.test(n))return 'Primi';
 if(/\b(CHIPS|PATAT|CAROTE|ZUCCHIN|MELANZAN|PEPERON|BROCCOL|CAVOL|FINOCCH|ZUCCA|ASPARAG|FAGIOLIN|SPINACI|BIETOL|RADICCHIO|PUNTARELLE|CARCIOF|PORRI|SCAROLA|CICORIA|VERZA|RAPE|CIPOLLE|CIPOLLINE|FUNGHI|POMODOR|INSALATA|CAPONATA|CECI|FAGIOLI|FAVE|CASTAGNE|HUMMUS|PATE|AGLIATA|CREMA DI OLIVE|PESTO DI|FRULLATO DI POMODORO|MANDORLE SALATE|POP CORN|SALATINI|PANELLE|SCAGLIOZZI)\b/.test(n)&&!/\b(POLPETT|INVOLTIN|FRITTAT|UOVA|CARPACCIO DI MANZO|CARPACCIO DI BRESAOLA|CARPACCIO DI SPADA|MOZZARELLA RIPIENA|PARMIGIANA|FLAN|MOUSSE|TORTINO|POLENTA|COUS|FARRO|RISO|PASTA|GNOCCH)\b/.test(n))return 'Contorni';
 if(/\b(ARROSTO|POLLO|TACCHINO|MANZO|VITELLO|MAIALE|AGNELLO|CONIGLIO|ANATRA|CARNE|SALSICCIA|BRESAOLA|PROSCIUTTO|ROAST ?BEEF|SPECK|MORTADELLA|SALMONE|TONNO|MERLUZZO|ORATA|BRANZINO|TROTA|CALAMARI|POLPO|GAMBERI|BACCALA|ALICI|SARDINE|SEPPIE|COZZE|VONGOL|PESCE|UOVA|UOVO|FRITTAT|OMELETTE|MOZZARELLA|FETA|PROVOLONE|SCAMORZA|FORMAGGIO|FLAN|SFORMATO|POLPETT|INVOLTIN|PARMIGIANA|CARPACCIO|TARTARE|CAPRESE|MOUSSE DI TONNO|MOUSSE DI PROSCIUTTO|MOUSSE DI MORTADELLA|MOUSSE DI GORGONZOLA|CREMA DI PARMIGIANO|PROSCIUTTO E MELONE)\b/.test(n)||hasIng(/^(POLLO|PETTO DI POLLO|TACCHINO|FESA DI TACCHINO|MANZO|VITELLO|MAIALE|AGNELLO|CONIGLIO|SALMONE|TONNO|MERLUZZO|ORATA|BRANZINO|TROTA|CALAMARI|POLPO|GAMBERI|BACCALA|ALICI|SARDINE|UOVA|BRESAOLA|PROSCIUTTO|ROAST BEEF)/))return 'Secondi';
 if(hasIng(/^(FARINA|PASTA|RISO|SEMOLA|FARRO|ORZO|COUS COUS|QUINOA|PANE)/))return 'Primi';
 return 'Contorni';
}

export const mealForRecipe=r=>reclassifyLegacyMeal(r);

export const categories=['Alimentari','Altro'];

export const LIMITS={name:120,quantity:1e9,rows:2000,recipes:5500,ingredients:100,instructions:20000,bytes:780000};

export class DomainError extends Error {constructor(message){super(message);this.name='DomainError';this.code='validation';}}

const fail=message=>{throw new DomainError(message);};

const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);

const own=(obj,key)=>Object.hasOwn(obj||{},key)?obj[key]:undefined;

const idPattern=/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

function identifier(value){if(!['number','string'].includes(typeof value)||!idPattern.test(String(value))||['constructor','prototype','__proto__'].includes(String(value)))fail('Identificativo non valido nei dati.');return String(value);}

export const normalize=s=>String(s??'').normalize('NFC').trim().toLocaleUpperCase('it-IT').replace(/\s+/g,' ');

const EVERYDAY_STAPLE_SPECS={
 'ACQUA':{packSize:1,recipeUnit:'l'},
 'OLIO EXTRAVERGINE DI OLIVA':{packSize:1,recipeUnit:'l'},
 'OLIO DI SEMI':{packSize:1,recipeUnit:'l'},
 'OLIO':{packSize:1,recipeUnit:'l'},
 'ACETO':{packSize:1,recipeUnit:'l'},
 'ACETO BALSAMICO':{packSize:0.5,recipeUnit:'l'},
 'SALSA DI SOIA':{packSize:0.25,recipeUnit:'l'},
 'SALE FINO':{packSize:1000,recipeUnit:'g'},
 'SALE GROSSO':{packSize:1000,recipeUnit:'g'},
 'SALE':{packSize:1000,recipeUnit:'g'},
 'ZUCCHERO':{packSize:1000,recipeUnit:'g'},
 'ZUCCHERO DI CANNA':{packSize:500,recipeUnit:'g'},
 'ZUCCHERO A VELO':{packSize:250,recipeUnit:'g'},
 'AGLIO':{packSize:50,recipeUnit:'g'},
 'PEPE NERO':{packSize:50,recipeUnit:'g'},
 'PEPE BIANCO':{packSize:50,recipeUnit:'g'},
 'PEPE ROSA':{packSize:50,recipeUnit:'g'},
 'PEPE':{packSize:50,recipeUnit:'g'},
 'BICARBONATO':{packSize:500,recipeUnit:'g'},
 'ZAFFERANO':{packSize:1,recipeUnit:'g'},
 'LIEVITO PER DOLCI':{packSize:48,recipeUnit:'g'},
 'LIEVITO DI BIRRA SECCO':{packSize:21,recipeUnit:'g'},
 'LIEVITO SECCO DI BIRRA':{packSize:21,recipeUnit:'g'},
 'ORIGANO':{packSize:30,recipeUnit:'g'},
 'BASILICO':{packSize:30,recipeUnit:'g'},
 'PREZZEMOLO':{packSize:30,recipeUnit:'g'},
 'ROSMARINO':{packSize:30,recipeUnit:'g'},
 'SALVIA':{packSize:30,recipeUnit:'g'},
 'TIMO':{packSize:30,recipeUnit:'g'},
 'ALLORO':{packSize:30,recipeUnit:'g'},
 'MAGGIORANA':{packSize:30,recipeUnit:'g'},
 'MENTA':{packSize:30,recipeUnit:'g'},
 'NOCE MOSCATA':{packSize:30,recipeUnit:'g'},
 'CANNELLA':{packSize:30,recipeUnit:'g'},
 'CURRY':{packSize:30,recipeUnit:'g'},
 'CURCUMA':{packSize:30,recipeUnit:'g'},
 'PAPRIKA':{packSize:30,recipeUnit:'g'},
 'PAPRICA':{packSize:30,recipeUnit:'g'},
 'PEPERONCINO':{packSize:30,recipeUnit:'g'},
 'PEPERONCINO IN POLVERE':{packSize:30,recipeUnit:'g'},
 'CUMINO':{packSize:30,recipeUnit:'g'},
 'CHIODI DI GAROFANO':{packSize:30,recipeUnit:'g'},
 'CARDAMOMO':{packSize:30,recipeUnit:'g'},
 'ANETO':{packSize:30,recipeUnit:'g'},
 'CORIANDOLO':{packSize:30,recipeUnit:'g'},
 'DRAGONCELLO':{packSize:30,recipeUnit:'g'},
 'ERBA CIPOLLINA':{packSize:30,recipeUnit:'g'},
 'ERBE DI PROVENZA':{packSize:30,recipeUnit:'g'},
 'FINOCCHIETTO':{packSize:30,recipeUnit:'g'},
 'VANIGLIA':{packSize:30,recipeUnit:'g'},
 'SENAPE IN POLVERE':{packSize:30,recipeUnit:'g'},
 'SENAPE IN GRANI':{packSize:30,recipeUnit:'g'}
};
export const STAPLE_THRESHOLD=0.25;
export function everydayStapleSpec(productName){const key=normalize(productName);return Object.hasOwn(EVERYDAY_STAPLE_SPECS,key)?{name:key,...EVERYDAY_STAPLE_SPECS[key]}:null;}
export function isEverydayStaple(productName){return everydayStapleSpec(productName)!==null;}
export function stapleAvailableQty(pantryItem){
 if(!pantryItem||pantryItem.category!=='Alimentari')return 0;
 const spec=everydayStapleSpec(pantryItem.name);
 if(!spec)return Number(pantryItem.qty)||0;
 const consumed=Number(pantryItem.consumed)||0;
 return Math.max(0,round((Number(pantryItem.qty)||0)*spec.packSize-consumed));
}
export function consumeStapleFromPantry(pantryItem,amountInRecipeUnit){
 const spec=everydayStapleSpec(pantryItem.name);
 if(!spec)return;
 const P=spec.packSize,deductAt=round((1-STAPLE_THRESHOLD)*P);
 let used=round((Number(pantryItem.consumed)||0)+amountInRecipeUnit);
 while(used>=deductAt&&pantryItem.qty>0){pantryItem.qty-=1;used=round(used-P);}
 if(pantryItem.qty===0&&used>0)used=0;
 if(used===0)delete pantryItem.consumed;else pantryItem.consumed=used;
}
export function restoreStapleToPantry(pantryItem,amountInRecipeUnit){
 const spec=everydayStapleSpec(pantryItem.name);
 if(!spec)return;
 const P=spec.packSize,restoreAt=round(-STAPLE_THRESHOLD*P);
 let used=round((Number(pantryItem.consumed)||0)-amountInRecipeUnit);
 while(used<=restoreAt){pantryItem.qty+=1;used=round(used+P);}
 if(used===0)delete pantryItem.consumed;else pantryItem.consumed=used;
}
export function pantryItemAvailable(state,productName,unit){
 const key=normalize(productName),spec=everydayStapleSpec(key);
 if(spec){
  const item=(state.pantry||[]).find(p=>p.category==='Alimentari'&&p.name===key);
  if(!item)return 0;
  return unit==='pz'?item.qty:unit===spec.recipeUnit?stapleAvailableQty(item):0;
 }
 return (state.pantry||[]).filter(p=>p.category==='Alimentari'&&p.name===key&&p.unit===unit).reduce((sum,p)=>sum+p.qty,0);
}

// Cookbook filters use the four main meal categories only.


function name(value){if(typeof value!=='string')fail('Scrivi il nome del prodotto.');const n=normalize(value);if(!n||n.length>LIMITS.name||/[\x00-\x1f\x7f]/.test(n))fail('Inserisci un nome tra 1 e 120 caratteri, senza caratteri di controllo.');return n;}

function number(value){if(!['number','string'].includes(typeof value)||(typeof value==='string'&&!value.trim()))fail('Inserisci una quantità valida.');const n=Number(value);if(!Number.isFinite(n)||Math.abs(n)>LIMITS.quantity)fail('La quantità deve essere un numero valido, non superiore a un miliardo.');return n;}

export const round=n=>Math.round(n*1e6)/1e6;

export const step=unit=>unit==='g'?50:1;

export const low=p=>{
 if(Number(p.qty)<=0)return false;
 const spec=everydayStapleSpec(p.name);
 if(spec){
  if(p.name==='ACQUA')return Number(p.qty)<=1;
  return Number(p.qty)===1&&(Number(p.consumed)||0)>=spec.packSize*0.5;
 }
 return Number(p.qty)<=(p.unit==='g'?200:2);
};

export const stockView=p=>Number(p.qty)<=0?'Esauriti':low(p)?'Da rifornire':'Disponibili';

function validatePlanStarts(raw){
 if(!Array.isArray(raw)||raw.length>52||raw.some(day=>typeof day!=='string'||!/^20[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(day)||!Number.isFinite(new Date(day+'T12:00:00Z').getTime())))fail('Settimane della spesa non valide.');
 return [...new Set(raw)].sort();
}

export function validProduct(p,positive=false){

 if(!record(p))fail('Prodotto non valido.');name(p.name);

 if(!categories.includes(p.category))fail('Scegli Alimentari oppure Altro.');

 const qty=number(p.qty);

 if(qty<0||(positive&&qty<=0)||round(qty)!==qty)fail('Inserisci una quantità valida, con al massimo sei decimali.');

 if(!['g','l','pz'].includes(p.unit)||(p.category==='Altro'&&p.unit!=='pz'))fail('Per Altro usa solamente pezzi.');

 if(p.unit==='pz'&&!Number.isInteger(qty))fail('I pezzi devono essere interi.');

}

function unitReferences(state,productName,excludeRecipeId){const key=normalize(productName);return [...(state.pantry||[]),...(state.shopping||[])].filter(p=>p.name===key).concat((state.recipes||[]).filter(r=>r.id!==excludeRecipeId).flatMap(r=>r.ingredients.filter(i=>normalize(i.ingredient)===key)));}

// A fresh read-only view index preserves reference order and recipe exclusions.

// Rebuild it for each render/operation; do not reuse it after mutating the state.

export function createUnitLookup(state){
 const refs=new Map(),add=(key,unit,id,product)=>{if(!refs.has(key))refs.set(key,[]);refs.get(key).push([unit,id,product]);};
 for(const p of [...(state.pantry||[]),...(state.shopping||[])])add(p.name,p.unit,null,true);
 for(const r of state.recipes||[])for(const i of r.ingredients)add(normalize(i.ingredient),i.unit,r.id,false);
 return (productName,excludeRecipeId)=>{
  const key=normalize(productName),spec=everydayStapleSpec(key);
  if(spec)return excludeRecipeId===undefined?'pz':spec.recipeUnit;
  return refs.get(key)?.find(item=>item[2]||item[1]!==excludeRecipeId)?.[0];
 };
}

export function productUnit(state,productName,excludeRecipeId){
 const key=normalize(productName),spec=everydayStapleSpec(key);
 if(spec)return excludeRecipeId===undefined?'pz':spec.recipeUnit;
 return unitReferences(state,productName,excludeRecipeId)[0]?.unit;
}

export function lockUnit(state,productName,unit,excludeRecipeId){

 const key=name(productName);if(!['g','l','pz'].includes(unit))fail('Unità non valida: scegli grammi, litri oppure pezzi.');

 const spec=everydayStapleSpec(key);
 if(spec){
  if(excludeRecipeId!==undefined){
   if(unit!==spec.recipeUnit&&unit!=='pz')fail(`${key} nelle ricette deve usare ${spec.recipeUnit==='g'?'grammi':'litri'} o pezzi.`);
  }else if(unit!=='pz'){
   fail(`${key} è un ingrediente di uso quotidiano: in dispensa e nella lista della spesa usa sempre i pezzi (P).`);
  }
  state.units[key]='pz';
  return;
 }

 const references=unitReferences(state,key,excludeRecipeId),existing=references[0]?.unit;

 if(references.some(item=>item.unit!==existing))fail(`${key} ha unità diverse negli elementi salvati. Correggi le ricette per usare la stessa unità della dispensa e della lista.`);

 if(existing&&existing!==unit)fail(`${key} deve essere inserito in ${existing==='g'?'grammi':existing==='l'?'litri':'pezzi'} (${existing==='pz'?'P':existing.toUpperCase()}), come in dispensa, nella lista e nelle ricette.`);

 if(existing)state.units[key]=existing;else delete state.units[key];

}

function rebuildProductUnits(state){const units={};for(const p of [...state.pantry,...state.shopping]){if(!isEverydayStaple(p.name)&&units[p.name]&&units[p.name]!==p.unit)fail(`${p.name}: unità diverse tra dispensa e lista della spesa.`);units[p.name]=isEverydayStaple(p.name)?'pz':p.unit;}for(const r of state.recipes)for(const i of r.ingredients)units[i.ingredient]??=(isEverydayStaple(i.ingredient)?'pz':i.unit);state.units=units;}

export function emptyState(recipes=[]){const state={schema:1,pantry:[],shopping:[],units:{},recipes:recipes.map(r=>validateRecipe(r,true)),counts:{},applied:[]};rebuildProductUnits(state);return state;}

export function recipeStatus(state,r,unitLookup=null){

 const findUnit=unitLookup||createUnitLookup(state);

 const needs=new Map();for(const i of r.ingredients){const key=normalize(i.ingredient)+'|'+i.unit;needs.set(key,{...i,ingredient:normalize(i.ingredient),qty:round((needs.get(key)?.qty||0)+Number(i.qty))});}

 const ingredients=[...needs.values()];const missing=ingredients.filter(i=>{const available=pantryItemAvailable(state,i.ingredient,i.unit);return available+1e-9<i.qty;});

 const unitConflicts=ingredients.flatMap(i=>{const spec=everydayStapleSpec(i.ingredient);if(spec){return (i.unit===spec.recipeUnit||i.unit==='pz')?[]:[{ingredient:i.ingredient,unit:i.unit,expected:spec.recipeUnit}];}const expected=findUnit(i.ingredient,r.id);return expected&&expected!==i.unit?[{ingredient:i.ingredient,unit:i.unit,expected}]:[];});

 const preparations=ingredients.length?Math.min(...ingredients.map(i=>{const available=pantryItemAvailable(state,i.ingredient,i.unit);const required=Math.round(Number(i.qty)*1e6),availScaled=Math.round(available*1e6);return required>0?Math.floor(availScaled/required):0;})):0;

 return {ingredients,missing,unitConflicts,possible:ingredients.length>0&&missing.length===0&&unitConflicts.length===0,preparations:unitConflicts.length?0:preparations};

}

export function preparationStatus(state,recipe,people=1,actual=null){

 const factor=number(people);if(!Number.isInteger(factor)||factor<1||factor>1000)fail('Inserisci un numero intero di porzioni tra 1 e 1000.');

 const status=recipeStatus(state,recipe);if(actual===null&&status.unitConflicts.length)fail('Correggi unità e dosi della ricetta: '+status.unitConflicts.map(i=>`${i.ingredient} usa ${i.expected==='pz'?'P':i.expected.toUpperCase()} in dispensa o nella lista`).join(', ')+'.');

 const base=status.ingredients,byKey=new Map(base.map(i=>[i.ingredient+'|'+i.unit,i]));

 let ingredients;

 if(actual!==null){

  if(!Array.isArray(actual)||actual.length!==base.length)fail('Controlla tutti gli ingredienti della preparazione.');

  const seen=new Set();ingredients=actual.map(item=>{if(!record(item))fail('Ingrediente non valido.');const ingredient=name(item.ingredient),key=(item.sourceIngredient===undefined?ingredient:name(item.sourceIngredient))+'|'+(item.sourceUnit??item.unit);if(!byKey.has(key)||seen.has(key))fail('Gli ingredienti e le unità devono corrispondere alla ricetta.');seen.add(key);const qty=number(item.qty);validProduct({name:ingredient,category:'Alimentari',qty,unit:item.unit});if(key!==ingredient+'|'+item.unit&&!state.pantry.some(p=>p.category==='Alimentari'&&p.name===ingredient&&(p.unit===item.unit||isEverydayStaple(ingredient))&&pantryItemAvailable(state,ingredient,item.unit)>0))fail('Scegli un sostituto disponibile in dispensa.');const spec=everydayStapleSpec(ingredient);if(spec){if(item.unit!==spec.recipeUnit&&item.unit!=='pz')fail(ingredient+' deve usare '+spec.recipeUnit.toUpperCase()+' o P.');}else{const expected=productUnit(state,ingredient,recipe.id);if(expected&&expected!==item.unit)fail(ingredient+' deve usare la stessa unità della dispensa.');}return {ingredient,unit:item.unit,qty};});

 }else ingredients=base.map(i=>({...i,qty:round(i.qty*factor)}));

 const combined=new Map();for(const i of ingredients){const key=i.ingredient+'|'+i.unit,old=combined.get(key);combined.set(key,{...i,qty:round((old?.qty||0)+i.qty)});}ingredients=[...combined.values()];

 for(const i of ingredients)validProduct({name:i.ingredient,category:'Alimentari',qty:i.qty,unit:i.unit});

 if(!ingredients.some(i=>i.qty>0))fail('Inserisci almeno una quantità utilizzata maggiore di zero.');

 ingredients=ingredients.map(i=>{const available=pantryItemAvailable(state,i.ingredient,i.unit);return {...i,available,enough:available+1e-9>=i.qty};});

 return {ingredients,missing:ingredients.filter(i=>!i.enough),possible:ingredients.every(i=>i.enough),people:factor};

}


export function shoppingTarget(qty,unit){
 if(qty<=0)return 0;
 const increment=unit==='g'?50:1;
 const rounded=round(Math.ceil(Math.round(qty*1e6)/Math.round(increment*1e6))*increment);
 return Math.max(unit==='g'?100:1,rounded);
}

export function recipeShoppingPlan(state,recipe,unitLookup=null){

 const status=recipeStatus(state,recipe,unitLookup);if(status.unitConflicts.length)fail('Correggi le unità della ricetta prima di aggiungere gli ingredienti alla spesa.');

 return status.ingredients.flatMap(i=>{

  const spec=everydayStapleSpec(i.ingredient);
  const stocked=pantryItemAvailable(state,i.ingredient,i.unit);

  const missing=Math.max(0,round(i.qty-stocked));if(!missing)return [];

  const targetUnit=spec?'pz':i.unit;
  const target=spec?(i.unit==='pz'?Math.ceil(missing):Math.max(1,Math.ceil(round(missing*1e6)/round(spec.packSize*1e6)))):shoppingTarget(missing,i.unit);

  const planned=state.shopping.filter(p=>p.name===i.ingredient&&p.unit===targetUnit&&p.category==='Alimentari').reduce((sum,p)=>round(sum+p.qty),0);

  const qty=Math.max(0,round(target-planned));return qty>0?[{name:i.ingredient,unit:targetUnit,category:'Alimentari',qty,target}]:[];

 });

}

export function validateRecipe(raw,allowMissingSource=true){

 if(!record(raw)||!Array.isArray(raw.ingredients)||!raw.ingredients.length||raw.ingredients.length>LIMITS.ingredients)fail('Inserisci da 1 a 100 ingredienti.');

 if(raw.tools!==undefined&&(!Array.isArray(raw.tools)||raw.tools.length>30||raw.tools.some(t=>typeof t!=='string'||!normalize(t)||normalize(t).length>120||/[\x00-\x1f\x7f]/.test(t))))fail('Inserisci al massimo 30 strumenti, con nomi da 1 a 120 caratteri.');

 const r={tools:[...new Set((raw.tools||[]).map(normalize))],id:identifier(raw.id),name:name(raw.name),instructions:String(raw.instructions||'').trim(),source_url:String(raw.source_url||'').trim(),source_title:String(raw.source_title||'').trim(),servings:1,ingredients:raw.ingredients.map(i=>{if(!record(i))fail('Ingrediente non valido.');return {ingredient:name(i.ingredient),qty:number(i.qty),unit:i.unit};})};

 if(raw.meal!==undefined){if(typeof raw.meal!=='string'||(!mealTypes.includes(raw.meal)&&!legacyMealTypes.includes(raw.meal)))fail('Scegli una categoria del ricettario.');r.meal=mealTypes.includes(raw.meal)?raw.meal:reclassifyLegacyMeal({...r,meal:raw.meal});}

 if(raw.favorite!==undefined){if(typeof raw.favorite!=='boolean')fail('Preferenza della ricetta non valida.');r.favorite=raw.favorite;}

 if(r.instructions.length>LIMITS.instructions||r.source_url.length>2048||r.source_title.length>300)fail('Testo della ricetta troppo lungo.');

 let url;if(r.source_url){try{url=new URL(r.source_url);}catch{fail('Inserisci un link valido alla ricetta.');}}else if(!allowMissingSource)fail('Inserisci il link alla ricetta.');

 if(url&&(!['https:','http:'].includes(url.protocol)||url.username||url.password))fail('Usa un link http:// o https:// senza credenziali.');


 const units=new Map();for(const i of r.ingredients){validProduct({name:i.ingredient,qty:i.qty,category:'Alimentari',unit:i.unit},true);if(units.has(i.ingredient)&&units.get(i.ingredient)!==i.unit)fail(`Usa una sola unità per ${i.ingredient}.`);units.set(i.ingredient,i.unit);}

 const aggregated=recipeStatus({pantry:[]},r);for(const i of aggregated.ingredients)validProduct({name:i.ingredient,qty:i.qty,category:'Alimentari',unit:i.unit},true);

 r.source_title||=url?.hostname||(r.instructions?'Ricettario Spesapp':'Link da aggiungere');if(raw.kcal!==undefined&&raw.kcal!==null){const kcal=number(raw.kcal);if(kcal<0||kcal>10000)fail('Inserisci calorie valide per una porzione.');r.kcal=kcal;}return r;

}

export function validateImport(raw){

 if(!record(raw)||raw.schema!==1||!['pantry','shopping','recipes'].every(k=>Array.isArray(raw[k]))||raw.pantry.length>LIMITS.rows||raw.shopping.length>LIMITS.rows||raw.recipes.length>LIMITS.recipes)fail('Backup Spesapp non valido o troppo grande.');

 if(raw.units!==undefined&&!record(raw.units)||raw.counts!==undefined&&!record(raw.counts))fail('Unità o conteggi del backup non validi.');

 const s=emptyState();

 for(const kind of ['pantry','shopping']){const ids=new Set(),names=new Set();for(const item of raw[kind]){if(!record(item))fail('Prodotto non valido nel backup.');const p={id:identifier(item.id),name:name(item.name),category:item.category,qty:number(item.qty??item.planned_qty),unit:item.unit};validProduct(p,kind==='shopping');
  const spec=everydayStapleSpec(p.name);
  if(spec&&p.category==='Alimentari'){
   if(p.unit!=='pz'){
    if(kind==='pantry'){
     if(p.qty<=0){p.qty=0;}
     else{const packs=Math.max(1,Math.ceil(round(p.qty*1e6)/round(spec.packSize*1e6))),consumed=round(packs*spec.packSize-p.qty);p.qty=packs;if(consumed>0)p.consumed=consumed;}
    }else{
     p.qty=Math.max(1,Math.ceil(round(p.qty*1e6)/round(spec.packSize*1e6)));
    }
    p.unit='pz';
   }else if(kind==='pantry'&&item.consumed!==undefined&&item.consumed!==null){
    const c=number(item.consumed);
    if(Math.abs(c)>spec.packSize||round(c)!==c)fail('Consumo residuo non valido nel backup.');
    if(c!==0)p.consumed=c;
   }
  }
  if(kind==='shopping'&&item.planStarts)p.planStarts=validatePlanStarts(item.planStarts);
if(kind==='pantry'&&p.category==='Alimentari'&&item.recentBuys!==undefined){
 if(!Array.isArray(item.recentBuys)||item.recentBuys.length>12)fail('Acquisti recenti non validi.');
 p.recentBuys=item.recentBuys.map(event=>{
  if(!record(event)||!Number.isFinite(event.at)||event.at<Date.UTC(2000,0,1)||event.at>=Date.UTC(2100,0,1)||!Number.isFinite(event.qty)||event.qty<=0||event.qty>LIMITS.quantity||!Number.isFinite(event.remaining)||event.remaining<0||event.remaining>event.qty)fail('Acquisto recente non valido.');
  if(p.unit==='pz'&&(!Number.isInteger(event.qty)||!Number.isInteger(event.remaining))){
   if(!spec)fail('Acquisto recente non valido.');
   const eq=Math.max(1,Math.ceil(round(event.qty*1e6)/round(spec.packSize*1e6))),er=Math.min(eq,Math.max(0,Math.ceil(round(event.remaining*1e6)/round(spec.packSize*1e6))));
   return {id:identifier(event.id),at:event.at,qty:eq,remaining:er};
  }
  return {id:identifier(event.id),at:event.at,qty:event.qty,remaining:event.remaining};
 });
 consumeRecentBuys(p);
}
if(kind==='pantry'&&p.category==='Altro'&&item.purchases!==undefined){
 if(!Array.isArray(item.purchases)||item.purchases.length>12)fail('Storico acquisti non valido.');
 p.purchases=item.purchases.map(event=>{
  if(!record(event)||!Number.isFinite(event.at)||event.at<Date.UTC(2000,0,1)||event.at>=Date.UTC(2100,0,1)||!Number.isSafeInteger(event.qty)||event.qty<=0||event.qty>LIMITS.quantity)fail('Acquisto non valido.');
  return {at:event.at,qty:event.qty};
 }).sort((a,b)=>a.at-b.at);
 p.qty=0;
}
lockUnit(s,p.name,p.unit);if(ids.has(p.id)||kind==='pantry'&&names.has(p.name))fail('Prodotto o identificativo duplicato nel backup.');ids.add(p.id);names.add(p.name);s[kind].push(p);}}

 if(Object.keys(raw.units||{}).length>5000)fail('Troppe unità nel backup.');

 for(const [key,unit]of Object.entries(raw.units||{})){name(key);if(!['g','l','pz'].includes(unit))fail('Unità non valida nel backup.');}

 rebuildProductUnits(s);

 const expanded=expandCatalogRows(raw.recipes);
 const ids=new Set(),names=new Set();s.recipes=expanded.map(rawRecipe=>{const r=validateRecipe(rawRecipe,true);if(ids.has(r.id)||names.has(r.name))fail('Ricetta duplicata nel backup.');ids.add(r.id);names.add(r.name);return r;});

 for(const [key,count]of Object.entries(raw.counts||{})){const id=identifier(key);if(!Number.isSafeInteger(count)||count<0||count>LIMITS.quantity)fail('Conteggio delle ricette non valido.');if(ids.has(id))s.counts[id]=count;}

 rebuildProductUnits(s);assertCapacity(s);return s;

}

export function validateState(raw){

 const s=validateImport(raw);

 if(raw.applied!==undefined&&(!Array.isArray(raw.applied)||raw.applied.length>1500||!raw.applied.every(id=>typeof id==='string'&&idPattern.test(id))))fail('Cronologia delle operazioni non valida.');

 s.applied=appliedOperations(raw.applied||[]);

 if(raw.backupDate!==undefined){if(typeof raw.backupDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(raw.backupDate))fail('Data del backup non valida.');s.backupDate=raw.backupDate;}

 return s;

}

// Expand immutable catalog references, preserving order and per-user favorite flags.
const catalogCanonical=new Map(),catalogSignatures=new Map();
function catalogRecipe(id){
 if(!catalog101.has(id)&&!catalog106.has(id)&&!catalog109.has(id)&&!catalog110.has(id)&&!catalog111.has(id)&&!catalog113.has(id)&&!catalog114.has(id)&&!catalog115.has(id)&&!catalog116.has(id)&&!catalog119.has(id)&&!catalog120.has(id)&&!catalog125.has(id))fail('Questo ricettario richiede una versione più recente di Spesapp. Ricarica l’app.');
 if(!catalogCanonical.has(id)){const recipe=validateRecipe(catalog101.get(id)||catalog106.get(id)||catalog109.get(id)||catalog110.get(id)||catalog111.get(id)||catalog113.get(id)||catalog114.get(id)||catalog115.get(id)||catalog116.get(id)||catalog119.get(id)||catalog120.get(id)||catalog125.get(id),true);catalogCanonical.set(id,recipe);catalogSignatures.set(id,recipeSignature(recipe));}
 return catalogCanonical.get(id);
}
function expandCatalogRows(rows){
 const expanded=[];
 for(const row of rows){
  if(record(row)&&Object.hasOwn(row,'catalog')){
   if(![CATALOG_VERSION,CATALOG_106,CATALOG_109,CATALOG_110,CATALOG_111,CATALOG_113,CATALOG_114,CATALOG_115,CATALOG_116,CATALOG_119,CATALOG_120,CATALOG_125].includes(row.catalog)||Object.keys(row).some(key=>!['catalog','ids','favorites'].includes(key))||!Array.isArray(row.ids)||!row.ids.length||row.ids.length>LIMITS.recipes||row.favorites!==undefined&&!record(row.favorites))fail('Riferimento al ricettario non valido. Ricarica l’app.');
   const flags=row.favorites||{},ids=new Set(row.ids);
   if(Object.entries(flags).some(([id,value])=>!ids.has(id)||typeof value!=='boolean'))fail('Preferiti del ricettario non validi.');
   for(const id of row.ids){identifier(id);if(!(row.catalog===CATALOG_VERSION?catalog101:row.catalog===CATALOG_106?catalog106:row.catalog===CATALOG_109?catalog109:row.catalog===CATALOG_110?catalog110:row.catalog===CATALOG_111?catalog111:row.catalog===CATALOG_113?catalog113:row.catalog===CATALOG_114?catalog114:row.catalog===CATALOG_115?catalog115:row.catalog===CATALOG_116?catalog116:row.catalog===CATALOG_119?catalog119:row.catalog===CATALOG_120?catalog120:catalog125).has(id))fail('Riferimento al ricettario non valido.');const recipe={...catalogRecipe(id)};delete recipe.favorite;if(Object.hasOwn(flags,id))recipe.favorite=flags[id];expanded.push(recipe);}
  }else expanded.push(row);
  if(expanded.length>LIMITS.recipes)fail('Troppe ricette nell’archivio.');
 }
 return expanded;
}
function recipeSignature(recipe){const value={...recipe};delete value.favorite;return JSON.stringify(value);}
function compactCustomRecipe(recipe){
 const stored={...recipe};
 if(stored.servings===1)delete stored.servings;
 if(stored.tools?.length===0)delete stored.tools;
 if(stored.instructions==='')delete stored.instructions;
 if(stored.source_url==='')delete stored.source_url;
 const defaultTitle=recipe.source_url?new URL(recipe.source_url).hostname:recipe.instructions?'Ricettario Spesapp':'Link da aggiungere';
 if(stored.source_title===defaultTitle)delete stored.source_title;
 return stored;
}
export function stateForStorage(state){
 const recipes=[];let block=null;
 for(const recipe of state.recipes){
  const base=record(recipe)&&(catalog101.has(recipe.id)||catalog106.has(recipe.id)||catalog109.has(recipe.id)||catalog110.has(recipe.id)||catalog111.has(recipe.id)||catalog113.has(recipe.id)||catalog114.has(recipe.id)||catalog115.has(recipe.id)||catalog116.has(recipe.id)||catalog119.has(recipe.id)||catalog120.has(recipe.id)||catalog125.has(recipe.id))?catalogRecipe(recipe.id):null;
  // An exact match with an already validated immutable recipe needs no repeated parsing.
  // Edited recipes and invalid favorite flags still follow full validation.
  const exact=base&&(recipe.favorite===undefined||typeof recipe.favorite==='boolean')&&recipeSignature(recipe)===catalogSignatures.get(recipe.id);
  const normalized=exact?recipe:validateRecipe(recipe,true);
  if(base&&(exact||recipeSignature(normalized)===catalogSignatures.get(recipe.id))){
   const version=catalog101.has(recipe.id)?CATALOG_VERSION:catalog106.has(recipe.id)?CATALOG_106:catalog109.has(recipe.id)?CATALOG_109:catalog110.has(recipe.id)?CATALOG_110:catalog111.has(recipe.id)?CATALOG_111:catalog113.has(recipe.id)?CATALOG_113:catalog114.has(recipe.id)?CATALOG_114:catalog115.has(recipe.id)?CATALOG_115:catalog116.has(recipe.id)?CATALOG_116:catalog119.has(recipe.id)?CATALOG_119:catalog120.has(recipe.id)?CATALOG_120:CATALOG_125;
   if(!block||block.catalog!==version){block={catalog:version,ids:[],favorites:{}};recipes.push(block);}
   block.ids.push(recipe.id);if(Object.hasOwn(recipe,'favorite'))block.favorites[recipe.id]=recipe.favorite;
  }else{block=null;recipes.push(compactCustomRecipe(recipe));}
 }
 return {...state,recipes};
}
export function firestoreValueBytes(value){
 if(value===null||typeof value==='boolean')return 1;
 if(typeof value==='number')return 8;
 if(typeof value==='string')return new TextEncoder().encode(value).length+1;
 if(Array.isArray(value))return value.reduce((sum,item)=>sum+firestoreValueBytes(item),0);
 return Object.entries(value).reduce((sum,[key,item])=>sum+firestoreValueBytes(key)+firestoreValueBytes(item),32);
}
export function assertCapacity(s){
 if(Object.keys(s.units||{}).length>5000||Object.keys(s.counts||{}).length>1200)fail('Hai raggiunto il limite di elementi dell’archivio.');
 const stored=stateForStorage(s);
 if(stored.recipes.length>1200)fail('Troppi elementi personalizzati nell’archivio.');
 // Reserve space for the document path and stay below Firestore's 1 MiB limit.
 if(new TextEncoder().encode(JSON.stringify(stored)).length>LIMITS.bytes||firestoreValueBytes(stored)+256>1010000)fail('Spazio dell’archivio insufficiente per questa aggiunta.');
}

export function validateAction(action){

 if(!record(action)||action.at!==undefined&&(!Number.isFinite(action.at)||action.at<0)||!idPattern.test(String(action.id||''))||typeof action.type!=='string'||!record(action.payload))fail('Operazione non valida.');

 const allowed=['addPantry','addShopping','quantity','exhaust','deletePantry','removeShopping','buy','saveRecipe','deleteRecipe','cook','import'];if(!allowed.includes(action.type))fail('Operazione non riconosciuta.');

 return action;

}

// Undo only the affected product rows, never a whole archive snapshot.

const productSnapshot=p=>p?{id:p.id,name:p.name,category:p.category,qty:p.qty,unit:p.unit}:null;

export function createUndoPatch(before,after){

 const patch=[];for(const kind of ['pantry','shopping'])for(const id of new Set([...before[kind],...after[kind]].map(p=>p.id))){const previous=productSnapshot(before[kind].find(p=>p.id===id)),next=productSnapshot(after[kind].find(p=>p.id===id));if(JSON.stringify(previous)!==JSON.stringify(next))patch.push({kind,id,before:structuredClone(previous),after:structuredClone(next)});}

 return patch.length&&patch.length<=2?patch:null;

}

export function undoStillValid(state,patch){return Array.isArray(patch)&&patch.length>0&&patch.every(p=>['pantry','shopping'].includes(p.kind)&&JSON.stringify(productSnapshot(state[p.kind].find(x=>x.id===p.id)))===JSON.stringify(productSnapshot(p.after)));}

export function formatQuantity(qty,unit){const small=unit==='l'&&Math.abs(qty)>0&&Math.abs(qty)<1;return new Intl.NumberFormat('it-IT',{maximumFractionDigits:6}).format(round(small?qty*1000:qty))+' '+(small?'ML':unit==='pz'?'P':unit.toUpperCase());}

function selectedIds(a){if(!Array.isArray(a.ids)||!a.ids.length||a.ids.length>LIMITS.rows)fail('Selezione dei prodotti non valida.');return new Set(a.ids.map(identifier));}

// One atomic shopping update: recalculate against the latest stock and cart.

export function addShoppingRequirements(state,requirements,actionId,expectedRecipes=[],weekStart=null){

 if(!Array.isArray(requirements)||requirements.length>LIMITS.rows||!Array.isArray(expectedRecipes)||expectedRecipes.length>40)fail('Ingredienti della spesa non validi.');

 for(const r of expectedRecipes)if(!state.recipes.some(x=>x.id===r.id&&JSON.stringify(x.ingredients)===JSON.stringify(r.ingredients)&&x.name===r.name))fail('Una ricetta è cambiata. Riapri la settimana prima di aggiungere la spesa.');

 const refs=new Map(),needs=new Map();for(const p of [...state.pantry,...state.shopping]){if(!refs.has(p.name))refs.set(p.name,new Set());refs.get(p.name).add(p.unit);}for(const r of state.recipes)for(const i of r.ingredients){if(!refs.has(i.ingredient))refs.set(i.ingredient,new Set());refs.get(i.ingredient).add(i.unit);}

 for(const raw of requirements){
  const i={name:name(raw.name),category:'Alimentari',qty:number(raw.qty),unit:raw.unit};validProduct(i,true);if(raw.category!=='Alimentari')fail('Gli ingredienti devono essere alimentari.');
  const spec=everydayStapleSpec(i.name);
  if(spec){
   if(i.unit!==spec.recipeUnit&&i.unit!=='pz')fail(i.name+': correggi l’unità nella ricetta.');
  }else{
   const units=refs.get(i.name);if(units&&(units.size!==1||!units.has(i.unit)))fail(i.name+': correggi l’unità nella ricetta.');
  }
  if([...state.pantry,...state.shopping].some(p=>p.name===i.name&&p.category==='Altro'))fail(i.name+' appartiene ad Altro: correggi la categoria.');
  const key=i.name+'|'+i.unit;
  needs.set(key,{...i,qty:round((needs.get(key)?.qty||0)+i.qty)});
 }

 const byProduct=new Map();
 for(const i of needs.values()){
  const spec=everydayStapleSpec(i.name);
  const available=pantryItemAvailable(state,i.name,i.unit);
  const missing=Math.max(0,round(i.qty-available));
  const targetUnit=spec?'pz':i.unit;
  const target=spec?(missing>0?(i.unit==='pz'?Math.ceil(missing):Math.max(1,Math.ceil(round(missing*1e6)/round(spec.packSize*1e6)))):0):shoppingTarget(missing,i.unit);
  const pKey=i.name+'|'+targetUnit;
  byProduct.set(pKey,{name:i.name,category:'Alimentari',unit:targetUnit,target:Math.max(byProduct.get(pKey)?.target||0,target)});
 }

 let n=0;for(const i of byProduct.values()){if(i.target<=0)continue;const listed=state.shopping.filter(p=>p.name===i.name&&p.unit===i.unit&&p.category==='Alimentari').reduce((sum,p)=>sum+p.qty,0);if(i.target<=listed)continue;const existing=state.shopping.find(p=>p.name===i.name&&p.unit===i.unit&&p.category==='Alimentari');if(existing){existing.qty=i.target;state.shopping=state.shopping.filter(product=>product.id===existing.id||product.name!==i.name||product.unit!==i.unit||product.category!=='Alimentari');}else state.shopping.push({id:identifier(String(actionId).slice(0,115)+'-shop-'+n),name:i.name,category:'Alimentari',unit:i.unit,qty:round(i.target-listed)});n++;}
 if(weekStart!==null){
  validatePlanStarts([weekStart]);
  const neededNames=new Set([...byProduct.values()].map(i=>i.name));
  for(const product of state.shopping)if(product.category==='Alimentari'&&neededNames.has(product.name))product.planStarts=[...new Set([...(product.planStarts||[]),weekStart])].slice(-52);
 }

}

// Older bulk imports recorded internal steps as if they were standalone actions.
const legacyCatalogStep = /^release-(?:20261108|20261110)-[a-zA-Z0-9_-]+-recipe-(?:[0-9]|[1-3][0-9])$/;
const appliedOperations = ids => {
 const unique=[...new Set(ids.filter(id=>!legacyCatalogStep.test(id)))];
 // Release receipts must outlive ordinary clicks: a completed catalogue upgrade
 // must never refill recipes deliberately removed months later.
 const durable=new Set(unique.filter(id=>/^(?:release|cleanup)-/.test(id)).slice(-500));
 const recent=new Set(unique.filter(id=>!durable.has(id)).slice(-(1500-durable.size)));
 return unique.filter(id=>durable.has(id)||recent.has(id));
};

function saveRecipe(state,recipe,fallbackId,expected){
 if(!record(recipe))fail('Ricetta non valida.');
 const allowMissingSource=Boolean(String(recipe.instructions||'').trim())||catalog125.has(recipe.id);
 const r=validateRecipe({...recipe,id:recipe.id||fallbackId},allowMissingSource);
 if(expected!==undefined&&JSON.stringify(state.recipes.find(x=>x.id===r.id))!==JSON.stringify(expected))fail('La ricetta è stata modificata o eliminata da un altro dispositivo. Riaprila prima di salvare.');
 if(state.recipes.some(x=>x.id!==r.id&&x.name===r.name))fail('Esiste già una ricetta con questo nome.');
 for(const i of r.ingredients){
  if([...state.pantry,...state.shopping].some(p=>p.name===i.ingredient&&p.category==='Altro'))fail(`${i.ingredient} appartiene ad Altro: nelle ricette usa prodotti alimentari.`);
  lockUnit(state,i.ingredient,i.unit,r.id);
 }
 state.recipes=state.recipes.filter(x=>x.id!==r.id);
 state.recipes.push(r);
}

export function householdSuggestions(state,now=Date.now()){
 const listed=new Set(state.shopping.map(item=>item.name)),result=[];
 for(const product of state.pantry){
  const events=product.purchases;
  if(product.category!=='Altro'||listed.has(product.name)||!events||events.length<3)continue;
  const rates=[];
  for(let i=1;i<events.length;i++){
   const days=(events[i].at-events[i-1].at)/86400000;
   if(days>=1)rates.push(days/events[i-1].qty);
  }
  if(rates.length<2)continue;
  rates.sort((a,b)=>a-b);
  const middle=Math.floor(rates.length/2),daysPerPiece=rates.length%2?rates[middle]:(rates[middle-1]+rates[middle])/2;
  const last=events.at(-1),due=last.at+Math.max(1,daysPerPiece*last.qty)*86400000;
  if(now<due-86400000||now<last.at)continue;
  result.push({name:product.name,qty:last.qty,unit:'pz',category:'Altro',due});
 }
 return result.sort((a,b)=>a.due-b.due||a.name.localeCompare(b.name,'it')).slice(0,5);
}

export function consumeRecentBuys(product){
 if(!product.recentBuys)return;
 let excess=Math.max(0,round(product.recentBuys.reduce((sum,event)=>sum+event.remaining,0)-product.qty));
 for(const event of product.recentBuys){
  const consumed=Math.min(excess,event.remaining);
  event.remaining=round(event.remaining-consumed);
  excess=round(excess-consumed);
 }
}
export function recentShoppingPurchases(state,now=Date.now()){
 return state.pantry.filter(product=>product.category==='Alimentari').flatMap(product=>{
  const events=(product.recentBuys||[]).filter(event=>now>=event.at&&now-event.at<=10*3600000&&new Date(now).toDateString()===new Date(event.at).toDateString());
  const qty=round(events.reduce((sum,event)=>sum+event.remaining,0));
  const untouched=events.filter(event=>event.remaining===event.qty);
  return qty>0?[{name:product.name,unit:product.unit,qty,events:events.map(event=>event.id),untouchedQty:round(untouched.reduce((sum,event)=>sum+event.qty,0)),returnEvents:untouched.map(event=>event.id)}]:[];
 });
}

export function applyAction(original,action){

 validateAction(action);if(original.applied?.includes(action.id))return structuredClone(original);

 const s=structuredClone(original),a=action.payload;s.units||={};s.counts||={};s.applied=appliedOperations(s.applied||[]);

 const find=(kind,id)=>s[kind].find(p=>p.id===String(id));

 const upsert=p=>{lockUnit(s,p.name,p.unit);const existing=s.pantry.find(x=>x.name===p.name);if(existing){const qty=round(existing.qty+p.qty);validProduct({...existing,qty,category:p.category});existing.qty=qty;existing.category=p.category;}else s.pantry.push({...p,id:p.pantryId||p.id});};

 switch(action.type){

 case 'addPantry':case 'addShopping':{if(action.type==='addShopping'&&a.requirements!==undefined){addShoppingRequirements(s,a.requirements,action.id,a.expectedRecipes||[],a.weekStart??null);break;}if(action.type==='addShopping'&&a.recipeId!==undefined){const recipe=s.recipes.find(r=>r.id===String(a.recipeId));if(!recipe)fail('Questa ricetta non è più disponibile.');if(a.expectedRecipe!==undefined&&JSON.stringify(recipe)!==JSON.stringify(a.expectedRecipe))fail('La ricetta è cambiata. Riaprila prima di aggiungere gli ingredienti.');const plan=recipeShoppingPlan(s,recipe);for(const [index,item]of plan.entries()){lockUnit(s,item.name,item.unit);if([...s.pantry,...s.shopping].some(p=>p.name===item.name&&p.category==='Altro'))fail(`${item.name} appartiene ad Altro: correggi la categoria prima di continuare.`);const existing=s.shopping.find(p=>p.name===item.name&&p.unit===item.unit&&p.category==='Alimentari');if(existing){validProduct({...existing,qty:item.target},true);existing.qty=item.target;s.shopping=s.shopping.filter(product=>product.id===existing.id||product.name!==item.name||product.unit!==item.unit||product.category!=='Alimentari');}else s.shopping.push({id:identifier(String(action.id).slice(0,120)+'-'+index),name:item.name,qty:item.qty,unit:item.unit,category:'Alimentari'});}break;}if(action.type==='addPantry'&&a.restoreAmount===true&&isEverydayStaple(a.name)&&a.unit!=='pz'){const key=name(a.name),spec=everydayStapleSpec(key),amount=number(a.qty);validProduct({name:key,category:'Alimentari',qty:amount,unit:a.unit},true);if(a.unit!==spec.recipeUnit)fail(key+' usa unità non compatibile.');let existing=s.pantry.find(x=>x.name===key&&x.category==='Alimentari');if(!existing){existing={id:identifier(action.id),name:key,category:'Alimentari',qty:0,unit:'pz'};s.pantry.push(existing);}restoreStapleToPantry(existing,amount);lockUnit(s,key,'pz');break;}const p={id:identifier(action.id),name:name(a.name),category:a.category,qty:number(a.qty),unit:a.unit};if(isEverydayStaple(p.name)&&p.category==='Alimentari')p.unit='pz';validProduct(p,true);if(p.category==='Altro'&&s.recipes.some(r=>r.ingredients.some(i=>i.ingredient===p.name)))fail(`${p.name} è un ingrediente di una ricetta: scegli Alimentari.`);lockUnit(s,p.name,p.unit);if(action.type==='addPantry')upsert(p);else s.shopping.push(p);break;}

 case 'quantity':{if(a.undo!==undefined){const patch=a.undo;if(!Array.isArray(patch)||!patch.length||patch.length>2)fail('Ripristino non valido.');const seen=new Set();for(const item of patch){if(!record(item)||!['pantry','shopping'].includes(item.kind))fail('Ripristino non valido.');identifier(item.id);const key=item.kind+':'+item.id;if(seen.has(key))fail('Ripristino duplicato.');seen.add(key);for(const value of [item.before,item.after])if(value!==null){validProduct(value,item.kind==='shopping');if(value.id!==item.id||name(value.name)!==value.name)fail('Ripristino non valido.');}if(item.before===null&&item.after===null)fail('Ripristino vuoto.');}

 if(!undoStillValid(s,patch))fail('Questo prodotto è cambiato nel frattempo. Non posso annullare senza sovrascrivere le modifiche.');

 for(const item of patch){s[item.kind]=s[item.kind].filter(p=>p.id!==item.id);if(item.before)s[item.kind].push({id:identifier(item.before.id),name:name(item.before.name),category:item.before.category,qty:number(item.before.qty),unit:item.before.unit});}

 for(const item of patch)if(item.before){lockUnit(s,item.before.name,item.before.unit);if(item.before.category==='Altro'&&s.recipes.some(r=>r.ingredients.some(i=>i.ingredient===item.before.name)))fail('Questo prodotto è ora usato in una ricetta.');}

 validateState(s);break;}if(!['pantry','shopping'].includes(a.kind))fail('Elenco dei prodotti non valido.');const p=find(a.kind,a.id);if(!p)break;if(a.expected!==undefined&&number(a.expected)!==p.qty)fail('La quantità è stata modificata da un altro dispositivo. Controlla il valore aggiornato e riprova.');const qty=a.delta!==undefined?Math.max(a.kind==='shopping'?(p.unit==='pz'?1:.01):0,round(p.qty+number(a.delta))):number(a.qty);validProduct({...p,qty},a.kind==='shopping');p.qty=qty;if(a.kind==='pantry'){if(qty===0)delete p.consumed;consumeRecentBuys(p);}break;}

 case 'exhaust':{if(a.ids!==undefined){const ids=selectedIds(a);for(const p of s.pantry)if(ids.has(p.id)){p.qty=0;delete p.consumed;consumeRecentBuys(p);}break;}const p=find('pantry',a.id);if(p){p.qty=0;delete p.consumed;consumeRecentBuys(p);}break;}

 case 'deletePantry':{if(a.ids!==undefined){const ids=selectedIds(a);s.pantry=s.pantry.filter(p=>!ids.has(p.id)||p.qty>0);break;}const p=find('pantry',a.id);if(p&&p.qty<=0)s.pantry=s.pantry.filter(x=>x.id!==p.id);break;}

 case 'removeShopping':{const ids=a.ids!==undefined?selectedIds(a):new Set([String(a.id)]);s.shopping=s.shopping.filter(p=>!ids.has(p.id));break;}

 case 'buy':{const ids=a.ids!==undefined?selectedIds(a):new Set([String(a.id)]);for(const p of s.shopping.filter(p=>ids.has(p.id))){validProduct(p,true);
if(p.category==='Alimentari'){
 upsert({...p,pantryId:'bought-'+p.id});
 const product=s.pantry.find(item=>item.name===p.name),at=Number.isFinite(action.at)&&action.at>=Date.UTC(2000,0,1)&&action.at<Date.UTC(2100,0,1)?action.at:Date.now();
 const events=(product.recentBuys||[]).filter(event=>at-event.at<=10*3600000&&event.at<=at);
 const event=events.find(event=>event.id===action.id);
 if(event){event.qty=round(event.qty+p.qty);event.remaining=round(event.remaining+p.qty);}
 else events.push({id:action.id,at,qty:p.qty,remaining:p.qty});
 product.recentBuys=events.slice(-12);
}
else{
 let history=s.pantry.find(item=>item.name===p.name&&item.category==='Altro');
 if(!history){history={id:'bought-'+p.id,name:p.name,category:'Altro',unit:'pz',qty:0,purchases:[]};s.pantry.push(history);}
 const at=Number.isFinite(action.at)?action.at:Date.now(),events=history.purchases||[];
 const last=events.at(-1);
 if(last&&new Date(last.at).toDateString()===new Date(at).toDateString()&&at>=last.at&&last.qty+p.qty<=LIMITS.quantity)last.qty+=p.qty;
 else events.push({at,qty:p.qty});
 history.purchases=events.slice(-12);history.qty=0;
}}s.shopping=s.shopping.filter(p=>!ids.has(p.id));break;}

 case 'saveRecipe':{
  if(a.verifiedCatalog113===true){
   if(action.id!=='release-20261117-verified-sources-113')fail('Aggiornamento del ricettario non valido.');
   s.recipes=s.recipes.filter(recipe=>recipeHasSource(recipe)||(!recipe.id.startsWith('essenziali-105-')&&![catalog101,catalog106,catalog109,catalog110,catalog111].some(catalog=>catalog.has(recipe.id))));
   const names=new Set(s.recipes.map(recipe=>recipe.name)),urls=new Set(s.recipes.map(recipe=>recipe.source_url)),ids=new Set(s.recipes.map(recipe=>recipe.id)),lookup=createUnitLookup(s),addedUnits=new Map();
   for(const raw of recipes113){if(ids.has(raw.id)||names.has(raw.name)||urls.has(raw.source_url))continue;const recipe=validateRecipe(raw,false);if(recipeStatus(s,recipe,lookup).unitConflicts.length||recipe.ingredients.some(i=>addedUnits.has(i.ingredient)&&addedUnits.get(i.ingredient)!==i.unit||[...s.pantry,...s.shopping].some(p=>p.name===i.ingredient&&p.category==='Altro')))continue;s.recipes.push(recipe);for(const i of recipe.ingredients)addedUnits.set(i.ingredient,i.unit);names.add(recipe.name);ids.add(recipe.id);urls.add(recipe.source_url);}
  }else if(a.repairCatalogUnits110===true){
   if(action.id!=='release-20261117-honey-units-110')fail('Correzione del ricettario non valida.');
   if([...s.pantry,...s.shopping].some(p=>p.name==='MIELE'&&p.unit!=='l'))fail('Mantieni l’unità del miele già presente nelle scorte.');
   // Repair the six unchanged legacy entries together, so unit locking never sees a half-migration.
   s.recipes=s.recipes.map(recipe=>{
    const base=catalog101.get(recipe.id);
    if(!base||!base.id.startsWith('catalogo-89-')||!base.ingredients.some(i=>i.ingredient==='MIELE'&&i.unit==='g')||recipeSignature(recipe)!==recipeSignature(catalogRecipe(recipe.id)))return recipe;
    return {...recipe,ingredients:recipe.ingredients.map(i=>i.ingredient==='MIELE'&&i.unit==='g'?{...i,unit:'l',qty:round(i.qty/1420)}:i)};
   });
  }else if(Array.isArray(a.recipes)){
   if(a.catalogTargetComplete!==undefined){
    if(a.catalogTargetComplete!==5000||action.id!=='release-20261122-catalogue-5000-complete'||a.recipes.length)fail('Completamento del ricettario non valido.');
    if(s.recipes.filter(recipeHasSource).length<5000)fail('Il ricettario è cambiato durante l’aggiornamento. Ricarica per completarlo.');
   }
   if(a.catalogTarget!==undefined&&(![5000,5500].includes(a.catalogTarget)||!/^release-(?:20261122-verified-sources-120|20261126-curated-125)-\d+$/.test(action.id)))fail('Obiettivo del ricettario non valido.');
   if(a.recipes.length>40)fail('Troppe ricette in un aggiornamento.');
   let targetCount=a.catalogTarget===5000?s.recipes.filter(recipeHasSource).length:0;
   const batchUnits=new Map(),household=new Set();
   if(a.catalogTarget===5000||a.catalogTarget===5500){
    const add=(name,unit)=>{if(!batchUnits.has(name))batchUnits.set(name,new Set());batchUnits.get(name).add(unit);};
    for(const item of [...s.pantry,...s.shopping]){add(item.name,item.unit);if(item.category==='Altro')household.add(item.name);}
    for(const recipe of s.recipes)for(const item of recipe.ingredients)add(item.ingredient,item.unit);
   }
   for(const raw of a.recipes){
    if(a.catalogTarget===5000&&targetCount>=5000)break;
    const recipe=validateRecipe(raw);
    if(a.catalogTarget===5000&&(!catalog120.has(recipe.id)||recipeSignature(recipe)!==recipeSignature(catalogRecipe(recipe.id))))fail('Ricetta non appartenente al catalogo verificato.');
    if(a.catalogTarget===5500&&(!catalog125.has(recipe.id)||recipeSignature(recipe)!==recipeSignature(catalogRecipe(recipe.id))))fail('Ricetta non appartenente al catalogo curato.');
    if(s.recipes.some(x=>x.name===recipe.name))continue;
    if(s.recipes.some(x=>x.id===recipe.id))fail('Identificativo di ricetta già in uso.');
    if(a.catalogTarget===5000||a.catalogTarget===5500){
     // New canonical IDs only: index the existing references once per batch,
     // checking every incoming unit and every conflict before appending.
     for(const item of recipe.ingredients){
      if(household.has(item.ingredient))fail(item.ingredient+' appartiene ad Altro: nelle ricette usa prodotti alimentari.');
      const spec=everydayStapleSpec(item.ingredient);
      if(spec){
       if(item.unit!==spec.recipeUnit&&item.unit!=='pz')fail(item.ingredient+': unità non valida nella ricetta.');
       continue;
      }
      const refs=batchUnits.get(item.ingredient);
      if(refs?.size>1)fail(item.ingredient+' ha unità diverse negli elementi salvati. Correggi le ricette.');
      if(refs?.size&&!refs.has(item.unit))fail(item.ingredient+': unità diversa da dispensa, lista o ricette.');
      batchUnits.set(item.ingredient,new Set([item.unit]));
     }
     s.recipes.push(recipe);targetCount++;
    }else saveRecipe(s,recipe);
   }
  }else if(a.favoriteOnly===true){
   const recipe=s.recipes.find(r=>r.id===String(a.id));
   if(!recipe)fail('Questa ricetta non è più disponibile.');
   if(typeof a.favorite!=='boolean')fail('Preferenza non valida.');
   recipe.favorite=a.favorite;
  }else{
   saveRecipe(s,a.recipe,action.id,a.expected);
  }
  break;
 }

 case 'deleteRecipe':if(a.expected!==undefined&&JSON.stringify(s.recipes.find(r=>r.id===String(a.id)))!==JSON.stringify(a.expected))fail('La ricetta è cambiata. Riapri prima di eliminarla.');s.recipes=s.recipes.filter(r=>r.id!==String(a.id));delete s.counts[String(a.id)];break;

 case 'cook':{const r=s.recipes.find(r=>r.id===String(a.id));if(!r)fail('Questa ricetta non è più disponibile.');if(a.expectedRecipe!==undefined&&JSON.stringify(r)!==JSON.stringify(a.expectedRecipe))fail('La ricetta è cambiata su un altro dispositivo. Riapri la preparazione prima di confermare.');const status=preparationStatus(s,r,a.people??1,a.ingredients??null);if(!status.possible)fail('Le quantità disponibili non bastano: '+status.missing.map(i=>i.ingredient).join(', ')+'.');for(const i of status.ingredients){if(i.qty===0)continue;const spec=everydayStapleSpec(i.ingredient);const p=s.pantry.find(p=>p.category==='Alimentari'&&p.name===i.ingredient&&(p.unit===i.unit||spec));if(spec&&i.unit!=='pz')consumeStapleFromPantry(p,i.qty);else p.qty=round(Math.max(0,p.qty-i.qty));consumeRecentBuys(p);}if((own(s.counts,r.id)||0)>=LIMITS.quantity)fail('Conteggio delle preparazioni troppo elevato.');s.counts[r.id]=(own(s.counts,r.id)||0)+1;break;}

 case 'import':{const imported=validateImport(a.state);const applied=s.applied;Object.assign(s,imported);s.applied=applied;break;}

 }

 if(s.pantry.length>LIMITS.rows||s.shopping.length>LIMITS.rows||s.recipes.length>LIMITS.recipes)fail('Hai raggiunto il limite di elementi dell’archivio. Esporta una copia dei dati.');

 rebuildProductUnits(s);

 s.applied=appliedOperations([...s.applied,action.id]);
 if(s.applied.length>256&&new TextEncoder().encode(JSON.stringify(stateForStorage(s))).length>LIMITS.bytes-12000){
  // Firestore keeps a separate receipt for each committed operation.
  s.applied=s.applied.filter((id,index)=>index>=s.applied.length-256||id.startsWith('release-')||id.startsWith('cleanup-'));
 }
 assertCapacity(s);return s;

}



// Commas separate ingredients; plain text also searches recipe names.
export function recipeMatchesSearch(recipe,query){
 const clean=value=>normalize(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const text=clean(query),ingredients=recipe.ingredients.map(i=>clean(i.ingredient));
 if(/[,;\n]/.test(text)){
  const groups=text.split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean);
  return groups.every(group=>ingredients.some(ingredient=>group.split(/\s+/).every(word=>ingredient.includes(word))));
 }
 const haystack=[clean(recipe.name),...ingredients].join(' ');
 return text.split(/\s+/).filter(Boolean).every(word=>haystack.includes(word));
}

export function preparationAlternatives(state,ingredient){
 const groups=[['SPINACI','ZUCCHINE','BIETOLE','BROCCOLI','CAVOLFIORE','MELANZANE','PEPERONI'],['POLLO','TACCHINO'],['CECI','FAGIOLI','LENTICCHIE','PISELLI'],['PASTA','RISO','COUS COUS','FARRO','ORZO'],['RICOTTA','FORMAGGIO SPALMABILE']];
 const group=groups.find(g=>g.some(t=>normalize(ingredient).includes(t)));
 return state.pantry.filter(p=>p.category==='Alimentari'&&p.qty>0&&p.name!==normalize(ingredient)).map(p=>({...p,suggested:!!group?.some(t=>p.name.includes(t))})).sort((a,b)=>Number(b.suggested)-Number(a.suggested)||a.name.localeCompare(b.name,'it'));
}

