import {normalize,createUnitLookup,recentShoppingPurchases} from './domain.mjs?v=96';

// Suggestions remain explicit choices. Different units never imply a conversion.
const families=[
 [/^(CECI|FAGIOLI(?: .*)?|LENTICCHIE(?: .*)?|PISELLI(?: .*)?)$/,['CECI','FAGIOLI CANNELLINI','LENTICCHIE','PISELLI']],
 [/^(FUNGHI(?: .*)?|ZUCCHINE|MELANZANE|PEPERONI)$/,['ZUCCHINE','MELANZANE','PEPERONI','FUNGHI CHAMPIGNON']],
 [/^(SPINACI|BIETOLE|BIETOLA|CICORIA)$/,['SPINACI','BIETOLE','CICORIA']],
 [/^(BROCCOLI|CAVOLFIORE|CAVOLO ROMANESCO)$/,['BROCCOLI','CAVOLFIORE']],
 [/^(PETTO DI POLLO|PETTI DI POLLO|POLLO|PETTO DI TACCHINO|TACCHINO)$/,['PETTO DI POLLO','PETTO DI TACCHINO']],
 [/^(MERLUZZO|NASELLO|PLATESSA)(?: .*)?$/,['MERLUZZO','NASELLO','PLATESSA']],
 [/^(RICOTTA|FORMAGGIO SPALMABILE)$/,['RICOTTA','FORMAGGIO SPALMABILE']],
 [/^(PARMIGIANO(?: .*)?|GRANA PADANO)$/,['PARMIGIANO REGGIANO','GRANA PADANO']],
 [/^(PENNE|FUSILLI|RIGATONI|FARFALLE|PASTA CORTA)$/,['PENNE','FUSILLI','RIGATONI']],
 [/^(SPAGHETTI|LINGUINE|BUCATINI)$/,['SPAGHETTI','LINGUINE','BUCATINI']]
];
const key=item=>(item.ingredient??item.name)+'|'+item.unit;
export function ingredientSuggestions(main,recipe,source){
 if(!source||!recipe.ingredients.some(i=>key(i)===key(source)))return [];
 const unitFor=createUnitLookup(main);
 const family=families.find(([pattern])=>pattern.test(normalize(source.ingredient)));
 const options=new Map(),existing=new Set(recipe.ingredients.map(i=>i.ingredient));
 function add(name,unit,qty,score,reason){
  name=normalize(name);
  if(existing.has(name)||name.startsWith(normalize(source.ingredient)+' ')||normalize(source.ingredient).startsWith(name+' ')||!Number.isFinite(qty)||qty<=0||main.pantry.concat(main.shopping).some(p=>p.name===name&&p.category==='Altro'))return;
  const registered=unitFor(name);
  if(registered&&registered!==unit)return;
  const stock=main.pantry.find(p=>p.name===name&&p.unit===unit&&p.qty>0);
  score+=stock?4:0;
  const entry={ingredient:name,unit,qty,score,reason:stock?'Già in dispensa · '+reason:reason};
  if(!options.has(name)||options.get(name).score<score)options.set(name,entry);
 }
 // Learn swaps from recipes with the same remaining ingredients and just one change.
 const rest=recipe.ingredients.filter(i=>key(i)!==key(source));
 for(const other of main.recipes){
  if(other.id===recipe.id||other.meal!==recipe.meal||other.ingredients.some(i=>i.ingredient===source.ingredient))continue;
  const overlap=rest.filter(i=>other.ingredients.some(j=>key(i)===key(j))).length;
  const replacements=other.ingredients.filter(i=>!rest.some(j=>key(i)===key(j)));
  if(rest.length&&overlap===rest.length&&replacements.length===1){
   const target=replacements[0];
   if(target.unit===source.unit)add(target.ingredient,target.unit,target.qty,10,'Usato in una ricetta simile');
  }
 }
 if(family){
  const names=new Set(family[1]);
  for(const item of [...main.pantry,...main.shopping,...main.recipes.flatMap(r=>r.ingredients)]){
   const name=item.ingredient??item.name;if(family[0].test(name))names.add(name);
  }
  for(const name of names){
   // Same measure and initial dose, shown as editable rather than a hidden conversion.
   const unit=unitFor(name)||source.unit;
   if(unit===source.unit)add(name,unit,source.qty,2,'Dose iniziale da verificare per il piatto');
  }
 }
 return [...options.values()].sort((a,b)=>b.score-a.score||a.ingredient.localeCompare(b.ingredient,'it')).slice(0,3);
}

export function dishSuggestions(main,original,unavailable){
 const unitFor=createUnitLookup(main);
 const purchases=new Set(recentShoppingPurchases(main).map(key));
 const old=new Set(original.ingredients.map(key));
 const stock=new Set(main.pantry.filter(p=>p.category==='Alimentari'&&p.qty>0).map(key));
 return main.recipes.filter(r=>r.meal===original.meal&&r.id!==original.id&&!r.ingredients.some(i=>i.ingredient===unavailable)&&r.ingredients.every(i=>!unitFor(i.ingredient)||unitFor(i.ingredient)===i.unit)).map(recipe=>{
  const bought=recipe.ingredients.filter(i=>purchases.has(key(i))).length;
  const shared=recipe.ingredients.filter(i=>old.has(key(i))).length;
  const stocked=recipe.ingredients.filter(i=>stock.has(key(i))).length;
  return {recipe,bought,shared,score:bought*6+shared*3+stocked-recipe.ingredients.length*.15};
 }).sort((a,b)=>b.score-a.score||a.recipe.name.localeCompare(b.recipe.name,'it'));
}
