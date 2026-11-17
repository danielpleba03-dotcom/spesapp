import {ricette111,riserva111,methods111} from './ricette-111.mjs?v=114';
// Cooking methods are attached to a recipe, never duplicated as separate recipes.
import {catalog101} from './recipe-catalog-101.mjs?v=114';
import {ricetteEssenziali105,riservaEssenziali105} from './ricette-essenziali-105.mjs?v=114';
import {ricetteSemplici106} from './ricette-semplici-106.mjs?v=114';
import {ricette109} from './ricette-109.mjs?v=114';
import {ricette110,methods110} from './ricette-110.mjs?v=114';
const norm=x=>String(x||'').normalize('NFC').trim().toLocaleUpperCase('it-IT').replace(/\s+/g,' ');
const signature=r=>JSON.stringify([norm(r.name),String(r.instructions||'').trim(),(r.tools||[]).map(norm),r.ingredients.map(i=>[norm(i.ingredient),i.qty,i.unit]).sort((a,b)=>a[0].localeCompare(b[0]))]);
const originals=new Map([...catalog101.values(),...ricetteEssenziali105,...riservaEssenziali105,...ricetteSemplici106,...ricette109,...ricette110,...ricette111,...riserva111].map(r=>[r.id,{r,key:signature(r)}]));
const labels={pentola:'Pentola',padella:'Padella',forno:'Forno',aria:'Friggitrice ad aria',frullatore:'Frullatore',freddo:'Senza cottura',microonde:'Microonde'};
export const toolNames={fornelli:'Pentola / padella',forno:'Forno',aria:'Friggitrice ad aria',frullatore:'Frullatore',microonde:'Microonde'};
export const availableCookingTools=['fornelli','forno','aria','frullatore'];
const toolCode=t=>/FRIGGITRICE|AIR FRYER/.test(norm(t))?'aria':/FORNO/.test(norm(t))?'forno':/MICROONDE/.test(norm(t))?'microonde':/FRULLATORE|MIXER/.test(norm(t))?'frullatore':/PENTOLA|PADELLA|FORNELLI/.test(norm(t))?'fornelli':null;
function baseMethod(r){
 const text=norm(r.instructions),name=norm(r.name),explicit=(r.tools||[]).map(norm);
 let id=explicit.some(t=>/FRIGGITRICE/.test(t))?'aria':explicit.includes('FORNO')?'forno':explicit.includes('PADELLA')?'padella':explicit.includes('PENTOLA')?'pentola':explicit.includes('FRULLATORE')?'frullatore':explicit.includes('PREPARAZIONE A FREDDO')?'freddo':null;
 if(!id)id=/FRIGGITRICE|AIR FRYER/.test(name)?'aria':/MICROONDE/.test(name)?'microonde':/CUOCI.{0,25}FORNO|INFORNA/.test(text)||/FORNO|LASAGN|CROSTATA|TORTA|BISCOTT|CIAMBELL|STRUDEL/.test(name)?'forno':/LESSA|BOLLIRE|PENTOLA|RISOTTO|VELLUTATA|ZUPPA/.test(text+' '+name)?'pentola':/PADELLA|ROSOLA/.test(text)?'padella':/INSALAT|CAPRESE|MACEDONIA|YOGURT|SENZA COTTURA|BRESAOLA|ROAST BEEF PRONTO/.test(name)?'freddo':/FRULLA|SMOOTHIE/.test(name)?'frullatore':'pentola';
 const tools=[...new Set(explicit.map(toolCode).filter(Boolean))];if(!tools.length&&id!=='freddo')tools.push(id==='pentola'||id==='padella'?'fornelli':id);
 if(/FRULLA/.test(text)&&!tools.includes('frullatore'))tools.push('frullatore');
 return {id,label:labels[id],tools,instructions:r.instructions||(r.source_url?'Apri il link della ricetta per il procedimento completo. Gli strumenti qui sono indicativi: verifica quelli richiesti dalla fonte.':'Aggiungi un procedimento o un link dalla modifica della ricetta.'),estimated:!explicit.length};
}
const veggies={'ZUCCHINE':['rondelle di circa 1 cm',15,12],'CAROTE':['bastoncini sottili',25,18],'BROCCOLI':['piccole cimette',20,13],'CAVOLFIORE':['piccole cimette',25,16],'PEPERONI':['listarelle',25,16],'FINOCCHI':['fettine sottili',25,18],'ZUCCA':['cubetti di circa 1,5 cm',25,18],'MELANZANE':['cubetti di circa 1,5 cm',25,18]};
const grains={'PASTA':'Cuoci la pasta in acqua seguendo la confezione e scola.','RISO':'Cuoci il riso in acqua seguendo la confezione e scola.','COUS COUS':'Reidrata il cous cous con acqua calda nelle proporzioni e per i tempi indicati dalla confezione e sgranalo.','FARRO':'Risciacqua se richiesto e lessa il farro seguendo la confezione, poi scola.','ORZO':'Lessa l’orzo seguendo la confezione e scola.','QUINOA':'Risciacqua la quinoa e cuocila seguendo le proporzioni di acqua e i tempi della confezione.','GRANO SARACENO':'Lessa il grano saraceno seguendo la confezione e scola.'};
const ready={'TONNO SOTTOLIO':'Scola il tonno già cotto sottolio.','TONNO AL NATURALE':'Scola il tonno già cotto al naturale.','SGOMBRO AL NATURALE':'Scola lo sgombro al naturale già cotto.','CECI COTTI':'Scola e risciacqua i ceci già cotti; non usare ceci secchi direttamente.','LENTICCHIE COTTE':'Scola e risciacqua le lenticchie già cotte.','FAGIOLI CANNELLINI COTTI':'Scola e risciacqua i cannellini già cotti.','FAGIOLI BORLOTTI COTTI':'Scola e risciacqua i borlotti già cotti.','RICOTTA':'Lavora la ricotta con poca acqua di cottura e incorporala fuori dal fuoco.','MOZZARELLA':'Scola e taglia la mozzarella, aggiungendola alla fine.','PROSCIUTTO COTTO':'Taglia il prosciutto cotto pronto da consumare a striscioline.','BRESAOLA':'Taglia la bresaola pronta da consumare.','ROAST BEEF COTTO':'Taglia il roast beef già cotto e pronto da mangiare.','FESA DI TACCHINO AFFETTATA':'Taglia la fesa di tacchino già cotta e affettata.','FETA':'Sbriciola la feta.'};
const checked=new WeakMap();
export function recipeCookingMethods(recipe){
 if(checked.has(recipe))return checked.get(recipe);
 let methods=[baseMethod(recipe)];
 const original=originals.get(recipe.id),unchanged=original&&signature(recipe)===original.key;
 if(unchanged&&(methods111[recipe.id]||methods110[recipe.id]))methods=methods111[recipe.id]||methods110[recipe.id];
 // Alternatives only for an unchanged, fully known four-ingredient cereal plate.
 else if(unchanged&&recipe.ingredients.length===4){
  const g=recipe.ingredients.find(i=>grains[i.ingredient]&&i.unit==='g'),v=recipe.ingredients.find(i=>veggies[i.ingredient]&&i.unit==='g'&&i.qty<=250),p=recipe.ingredients.find(i=>ready[i.ingredient]&&i.unit==='g'),oil=recipe.ingredients.find(i=>i.ingredient==='OLIO EXTRAVERGINE DI OLIVA'&&i.unit==='l');
  if(g&&v&&p&&oil&&new Set([g,v,p,oil]).size===4){
   const [cut,oven,air]=veggies[v.ingredient],prep=grains[g.ingredient]+' Lava e pulisci la verdura, tagliala in '+cut+'. '+ready[p.ingredient]+' ',end=' Riunisci gli ingredienti e condisci con l’olio previsto, senza aggiungere altri grassi. Le quantità restano quelle della scheda. Per più porzioni evita di riempire troppo teglia o cestello e cuoci in più riprese.';
   methods=[{...methods[0],id:'pentola',label:'Pentola e padella',tools:['fornelli']},{id:'forno',label:'Forno + pentola',tools:['fornelli','forno'],instructions:prep+'Cuoci la verdura a 200 °C in forno preriscaldato per circa '+oven+' minuti, finché tenera; mescola a metà cottura.'+end},{id:'aria',label:'Friggitrice ad aria + pentola',tools:['fornelli','aria'],instructions:prep+'Cuoci la verdura a 190 °C per circa '+air+' minuti, scuotendo a metà e controllando che sia tenera. Segui le indicazioni del tuo apparecchio sul preriscaldamento.'+end}];
  }
 }
 // A substitution cannot safely inherit cooking times or temperatures for the original ingredient.
 if(original&&String(recipe.instructions||'').trim()===String(original.r.instructions||'').trim()){
  const names=r=>r.ingredients.map(i=>norm(i.ingredient)).sort().join('|');
  if(names(recipe)!==names(original.r))methods=[{...baseMethod(recipe),instructions:'Ingredienti modificati rispetto alla ricetta originale. Il procedimento originale non è applicabile automaticamente: verifica la preparazione adatta agli ingredienti sostituiti prima di cucinare.'}];
 }
 checked.set(recipe,methods);return methods;
}
export function weekCookingAssignments(week,excludeMealId=null){
 const assignments=new Map(),counts={pentola:0,padella:0,forno:0,aria:0};
 for(const m of week.meals||[]){if(excludeMealId&&(m.id===excludeMealId||m.from===excludeMealId))continue;if(m.from&&assignments.has(m.from)){assignments.set(m.id,assignments.get(m.from));continue;}const r=week.recipes[m.recipeId];if(!r)continue;const options=recipeCookingMethods(r).filter(x=>x.tools.every(t=>availableCookingTools.includes(t))),balanced=options.filter(x=>Object.hasOwn(counts,x.id));const selected=(balanced.length?balanced:options).slice().sort((a,b)=>(counts[a.id]||0)-(counts[b.id]||0))[0];if(selected){assignments.set(m.id,selected.id);if(Object.hasOwn(counts,selected.id))counts[selected.id]++;}}
 return {assignments,counts};
}
export function balanceCookingOptions(options,week,excludeMealId=null,coldEligible=new Set()){
 const {counts}=weekCookingAssignments(week,excludeMealId),rank=r=>Math.min(...recipeCookingMethods(r).filter(m=>Object.hasOwn(counts,m.id)&&m.tools.every(t=>availableCookingTools.includes(t))).map(m=>counts[m.id]));
 const finite=options.filter(r=>Number.isFinite(rank(r)));if(!finite.length)return options;const least=Math.min(...finite.map(rank));const coldUsed=(week.meals||[]).some(m=>m.id!==excludeMealId&&m.from!==excludeMealId&&week.recipes[m.recipeId]&&recipeCookingMethods(week.recipes[m.recipeId]).every(method=>method.id==='freddo'));return options.filter(r=>rank(r)===least||(!coldUsed&&coldEligible.has(r.id)&&recipeCookingMethods(r).some(method=>method.id==='freddo')));
}

