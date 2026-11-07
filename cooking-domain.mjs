import {normalize,DomainError} from './domain.mjs?v=20261104-calorie-settimana';
const fail=m=>{throw new DomainError(m);},record=x=>x&&typeof x==='object'&&!Array.isArray(x),id=x=>typeof x==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(x)&&!['__proto__','constructor','prototype'].includes(x);
export const cookingTools=[['fornelli','Fornelli e padelle'],['forno','Forno'],['microonde','Microonde'],['aria',"Friggitrice ad aria"]];
export const difficulties=['Facile','Media','Impegnativa'];
export const defaultCookingPreferences=()=>({updatedAt:0,tools:cookingTools.map(t=>t[0]),likedIngredients:[],dislikedIngredients:[],votes:{},recipeInfo:{},interactions:[]});
export function ingredientList(raw){if(typeof raw!=='string'||raw.length>3000)fail('Inserisci al massimo 100 ingredienti.');const list=[...new Set(raw.split(/[,;\n]+/).map(normalize).filter(Boolean))];if(list.length>100||list.some(x=>x.length>120||/[\x00-\x1f\x7f]/.test(x)))fail('Controlla i nomi degli ingredienti.');return list;}
export function validateCookingPreferences(raw){if(!record(raw)||!Number.isFinite(raw.updatedAt)||raw.updatedAt<0||raw.updatedAt>=Date.UTC(2100,0,1)||!Array.isArray(raw.tools)||!raw.tools.length||raw.tools.some(x=>!cookingTools.some(t=>t[0]===x))||!record(raw.votes)||!record(raw.recipeInfo))fail('Preferenze cucina non valide.');const p=defaultCookingPreferences();p.updatedAt=raw.updatedAt;p.tools=[...new Set(raw.tools)];for(const field of ['likedIngredients','dislikedIngredients']){if(!Array.isArray(raw[field])||raw[field].some(x=>typeof x!=='string'||x.includes(',')||x.includes(';')))fail('Ingredienti preferiti non validi.');p[field]=ingredientList(raw[field].join(','));}if(Object.keys(raw.votes).length>600||Object.keys(raw.recipeInfo).length>600)fail('Troppe preferenze di ricette.');for(const [key,v]of Object.entries(raw.votes)){if(!id(key)||!record(v)||!['like','dislike'].includes(v.rating)||v.reason!==undefined&&!['dish','ingredient'].includes(v.reason))fail('Giudizio della ricetta non valido.');const entry={rating:v.rating};if(v.rating==='dislike'){entry.reason=v.reason||'dish';if(entry.reason==='ingredient'){if(typeof v.ingredient!=='string'||!normalize(v.ingredient)||normalize(v.ingredient).length>120||/[\x00-\x1f\x7f]/.test(v.ingredient))fail('Scegli un ingrediente.');entry.ingredient=normalize(v.ingredient);}}p.votes[key]=entry;}for(const [key,v]of Object.entries(raw.recipeInfo)){if(!id(key)||!record(v)||v.minutes!==undefined&&(!Number.isInteger(v.minutes)||v.minutes<1||v.minutes>240)||v.difficulty!==undefined&&!difficulties.includes(v.difficulty))fail('Tempo o difficoltà non validi.');p.recipeInfo[key]={...(v.minutes!==undefined?{minutes:v.minutes}:{}),...(v.difficulty?{difficulty:v.difficulty}:{})};}if(raw.interactions!==undefined){if(!Array.isArray(raw.interactions)||raw.interactions.length>400)fail('Cronologia delle preferenze non valida.');const seen=new Set();p.interactions=raw.interactions.map(e=>{if(!record(e)||!id(e.id)||!id(e.recipeId)||!['open','pass','shown'].includes(e.kind)||!['catalog','week','easy'].includes(e.context)||!Number.isFinite(e.at)||e.at<Date.UTC(2000,0,1)||e.at>=Date.UTC(2100,0,1)||seen.has(e.id))fail('Interazione della ricetta non valida.');seen.add(e.id);return {id:e.id,recipeId:e.recipeId,kind:e.kind,context:e.context,at:e.at};});}return p;}
export function cookingPreferences(archive){const saved=Object.values(archive.weeks||{}).map(w=>w.cookingPreferences).filter(Boolean).sort((a,b)=>b.updatedAt-a.updatedAt);return saved.length?validateCookingPreferences(saved[0]):defaultCookingPreferences();}
export function updateCookingPreferences(original,change,now){const p=validateCookingPreferences(original);if(!record(change))fail('Modifica delle preferenze non valida.');if(change.kind==='general'){p.tools=change.tools;p.likedIngredients=ingredientList(change.likedIngredients);p.dislikedIngredients=ingredientList(change.dislikedIngredients);}else if(change.kind==='vote'){if(!id(change.recipeId))fail('Ricetta non valida.');if(change.vote===null)delete p.votes[change.recipeId];else p.votes[change.recipeId]=change.vote;}else if(change.kind==='signals'){if(!Array.isArray(change.events)||!change.events.length||change.events.length>10)fail('Interazioni delle ricette non valide.');const cutoff=now-180*86400000;p.interactions=p.interactions.filter(e=>e.at>=cutoff);for(const event of change.events){const e={...event,at:now};if(!p.interactions.some(x=>x.id===e.id||x.recipeId===e.recipeId&&x.kind===e.kind&&x.context===e.context&&new Date(x.at).toDateString()===new Date(now).toDateString()))p.interactions.push(e);}p.interactions=p.interactions.slice(-400);}else if(change.kind==='effort'){if(!id(change.recipeId)||!record(change.info))fail('Ricetta non valida.');const info={...p.recipeInfo[change.recipeId]};for(const field of ['minutes','difficulty'])if(change.info[field]===null)delete info[field];else if(change.info[field]!==undefined)info[field]=change.info[field];if(Object.keys(info).length)p.recipeInfo[change.recipeId]=info;else delete p.recipeInfo[change.recipeId];}else fail('Modifica delle preferenze non riconosciuta.');p.updatedAt=Math.max(now,p.updatedAt+1);return validateCookingPreferences(p);}
export function recipeEffort(recipe,p=defaultCookingPreferences()){const name=normalize(recipe.name),info=p.recipeInfo[recipe.id]||{};let minutes=null,difficulty=null,tools=[];if(/FRIGGITRICE|AIR FRYER/.test(name))tools=['aria'];else if(/FORNO|LASAGN|ARROST|TORTA|CROSTATA|BISCOTT/.test(name))tools=['forno'];else if(/MICROONDE/.test(name))tools=['microonde'];else if(!/INSALAT|CAPRESE|MACEDONIA|YOGURT|FRULLAT|SMOOTHIE/.test(name))tools=['fornelli'];if(/INSALAT|CAPRESE|MACEDONIA|YOGURT|FRULLAT|SMOOTHIE/.test(name)){minutes=10;difficulty='Facile';}else if(/RISOTTO|LASAGN|INVOLTIN|POLPETT|CROSTATA/.test(name)){minutes=35;difficulty='Media';}else if(/RISO |PASTA|SPAGHETT|PENNE|FUSILLI|FRITTATA|OMELETTE|PETT[OI] DI POLLO|PANCAKE|UOVA|VELLUTATA/.test(name)){minutes=20;difficulty='Facile';}return {minutes:info.minutes??minutes,difficulty:info.difficulty??difficulty,estimatedMinutes:info.minutes===undefined,estimatedDifficulty:info.difficulty===undefined,tools};}
const matches=(r,ingredient)=>r.ingredients.some(i=>normalize(i.ingredient).includes(ingredient));
export function preferenceWeight(recipe,p=defaultCookingPreferences()){return recommendationScore(recipe,p).weight;}

export function recipeMatchesEffort(recipe,p,{minutes=0,difficulty=''}={}){const e=recipeEffort(recipe,p);return (!minutes||e.minutes!==null&&e.minutes<=minutes)&&(!difficulty||e.difficulty===difficulty);}
export function proposalReason(state,recipe,p=defaultCookingPreferences()){
 const score=recommendationScore(recipe,p);
 if(recipe.favorite)return 'Tra i tuoi preferiti';
 if(score.prepared>=2&&!score.recent)return 'Lo prepari spesso';
 if(score.affinity>.3&&score.evidence>0)return 'Vicino ai tuoi gusti';
 const meaningful=recipeFeatures(recipe).ingredients;
 if(meaningful.some(name=>state.pantry.some(x=>ingredientKey(x.name)===name&&x.qty>0)))return 'Usa le tue scorte';
 return 'Per variare il menu';
}

const DAY=86400000,clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const staples=/^(ACQUA|SALE(?: .*)?|PEPE(?: .*)?|OLIO(?: .*)?|BASILICO|PREZZEMOLO|ORIGANO|ROSMARINO|TIMO|SALVIA|ALLORO|NOCE MOSCATA)$/;
export function ingredientKey(name){
 const value=normalize(name);
 if(staples.test(value))return null;
 for(const [pattern,key]of [[/POLLO/,'POLLO'],[/TACCHINO/,'TACCHINO'],[/ZUCCHIN/,'ZUCCHINE'],[/SPINAC/,'SPINACI'],[/BROCCOL/,'BROCCOLI'],[/POMODOR/,'POMODORI'],[/PATAT/,'PATATE'],[/MELANZAN/,'MELANZANE'],[/PEPERON/,'PEPERONI'],[/LENTICCH/,'LENTICCHIE'],[/CECI/,'CECI'],[/FAGIOL/,'FAGIOLI'],[/SALMONE/,'SALMONE'],[/TONNO/,'TONNO'],[/UOV[AO]/,'UOVA'],[/^(PASTA|SPAGHETTI|PENNE|FUSILLI|RIGATONI|TAGLIATELLE|FARFALLE|MACCHERONI|LINGUINE|BUCATINI)( |$)/,'PASTA'],[/^RISO( |$)/,'RISO']])if(pattern.test(value))return key;
 return value;
}
export function recipeFeatures(recipe,p=defaultCookingPreferences()){
 const amounts=new Map();for(const i of recipe.ingredients){const key=ingredientKey(i.ingredient);if(!key||i.qty===0)continue;const weight=i.unit==='g'?(i.qty<=5?.2:i.qty<=20?.5:1):i.unit==='l'?(i.qty<=.02?.2:i.qty<=.08?.5:1):i.qty<1?.5:1;amounts.set(key,Math.max(amounts.get(key)||0,weight));}const ingredients=[...amounts.keys()],name=normalize(recipe.name),features=new Map([...amounts].map(([key,weight])=>['ingredient:'+key,weight]));
 const e=recipeEffort(recipe,p);
 const style=/PESTO/.test(name)?'pesto':/RISOTTO/.test(name)?'risotto':/VELLUTATA|ZUPPA|MINESTR/.test(name)?'zuppa':/INSALAT|CAPRESE/.test(name)?'insalata':/FRITTATA|OMELETTE/.test(name)?'frittata':/POLPETT/.test(name)?'polpette':/FORNO|ARROST/.test(name)?'forno':null;
 if(style)features.set('style:'+style,.55);
 if(e.minutes!==null)features.set('effort:'+(e.minutes<=20?'breve':e.minutes<=35?'medio':'lungo'),.18);
 if(e.difficulty)features.set('difficulty:'+e.difficulty,.12);
 const protein=ingredients.some(i=>/POLLO|TACCHINO/.test(i))?'pollame':ingredients.some(i=>/SALMONE|TONNO|MERLUZZO|GAMBER|ORATA|BRANZINO/.test(i))?'pesce':ingredients.some(i=>/CECI|FAGIOLI|LENTICCHIE|PISELLI/.test(i))?'legumi':ingredients.includes('UOVA')?'uova':ingredients.some(i=>/MANZO|VITELLO|MAIALE|SALSICC/.test(i))?'carne':null;
 if(protein)features.set('family:protein:'+protein,.4);return {ingredients,features,protein};
}
const cosine=(a,b)=>{let dot=0,aa=0,bb=0;for(const [k,v]of a){aa+=v*v;dot+=v*(b.get(k)||0);}for(const v of b.values())bb+=v*v;return aa&&bb?dot/Math.sqrt(aa*bb):0;};

// Compute once per set of proposals. Only explicit favorites and completed
// preparations strongly train tastes; views are capped and skips are contextual.
export function createRecommendationContext(state,p=defaultCookingPreferences(),archive={weeks:{}},now=new Date()){
 const relevant=r=>['Primi','Secondi'].includes(r.meal),time=Number(now),features=new Map(state.recipes.map(r=>[r.id,recipeFeatures(r,p)])),frequency=new Map(),recipes=new Map(state.recipes.map(r=>[r.id,r]));
 for(const r of state.recipes.filter(relevant))for(const key of features.get(r.id).features.keys())frequency.set(key,(frequency.get(key)||0)+1);
 const corpusSize=state.recipes.filter(relevant).length;const idf=key=>clamp(Math.log((corpusSize+1)/((frequency.get(key)||0)+1))+.5,.5,3);
 const vectorFor=feature=>new Map([...feature.features].map(([key,value])=>[key,value*idf(key)]));
 const vectors=new Map([...features].map(([key,value])=>[key,vectorFor(value)])),stats=new Map(),seen=new Set(),profile=new Map();let evidence=0,openBudget=0,strongBudget=0;const recentIngredients=new Map();
 const stat=id=>{if(!stats.has(id))stats.set(id,{prepared:0,decayed:0,lastCook:0,opens:0,pass:0,shown:0});return stats.get(id);};
 const add=(vector,weight)=>{const norm=Math.sqrt([...vector.values()].reduce((n,v)=>n+v*v,0))||1;for(const [key,value]of vector)profile.set(key,(profile.get(key)||0)+value/norm*weight);};
 const preparationBudget=new Map(),preparations=Object.values(archive.weeks||{}).flatMap(w=>w.preparations||[]).sort((a,b)=>b.at-a.at);
 for(const entry of preparations){if(seen.has(entry.id)||!recipes.has(entry.recipeId)||!relevant(recipes.get(entry.recipeId))||entry.at>time+300000)continue;seen.add(entry.id);const age=Math.max(0,(time-entry.at)/DAY),s=stat(entry.recipeId);s.prepared++;s.decayed+=Math.pow(.5,age/90);s.lastCook=Math.max(s.lastCook,entry.at);const r=recipes.get(entry.recipeId),actual=entry.usedIngredients?.length?recipeFeatures({...r,ingredients:entry.usedIngredients},p):features.get(r.id);const contribution=Math.min(.65*Math.pow(.5,age/90),Math.max(0,2.5-(preparationBudget.get(r.id)||0)));if(contribution>0){add(vectorFor(actual),contribution);strongBudget+=contribution;}if(age<3)for(const ingredient of actual.ingredients)recentIngredients.set(ingredient,Math.min(2,(recentIngredients.get(ingredient)||0)+Math.pow(.5,age)));preparationBudget.set(r.id,(preparationBudget.get(r.id)||0)+contribution);evidence++;}
 for(const r of state.recipes){if(!relevant(r))continue;const s=stat(r.id),legacy=Math.max(0,(state.counts?.[r.id]||0)-s.prepared);s.prepared+=legacy;if(legacy){const contribution=Math.min(.45,.12*Math.log1p(legacy));add(vectors.get(r.id),contribution);strongBudget+=contribution;evidence++;}if(r.favorite){add(vectors.get(r.id),3);strongBudget+=3;evidence++;}}
 const pinned=new Set();for(const w of Object.values(archive.weeks||{}))for(const meal of w.meals||[]){if(meal.locked&&recipes.has(meal.recipeId)&&!pinned.has(meal.recipeId)){add(vectors.get(meal.recipeId),.15);strongBudget+=.15;pinned.add(meal.recipeId);}}
 // One view per recipe/context/day, with at most half a favorite's influence
 // over the entire taste vector, regardless of rapid taps or repeated reloads.
 const interactions=[...(p.interactions||[])].filter(e=>recipes.has(e.recipeId)&&relevant(recipes.get(e.recipeId))&&e.at<=time+300000).sort((a,b)=>b.at-a.at),days=new Set();
 for(const event of interactions){const age=Math.max(0,(time-event.at)/DAY),key=event.recipeId+'|'+event.kind+'|'+event.context+'|'+new Date(event.at).toDateString();if(days.has(key))continue;days.add(key);const s=stat(event.recipeId);
  if(event.kind==='open'){const interest=.06*Math.pow(.5,age/14),weight=Math.min(interest,Math.max(0,.5-openBudget));s.opens=Math.min(.15,s.opens+weight);if(weight>0){add(vectors.get(event.recipeId),weight);openBudget+=weight;}}
  else if(event.kind==='pass'&&age<7&&event.at>s.lastCook)s.pass=Math.min(.45,s.pass+.22*Math.pow(.5,age/2));
  else if(event.kind==='shown'&&age<3)s.shown=Math.min(.25,s.shown+.1*Math.pow(.5,age));
 }
 const recommendation={now:time,features,vectors,profile,stats,evidence,confidence:clamp((strongBudget+openBudget*.2)/3,0,1),recentIngredients,exploration:.25};return {...p,recommendation};
}
export function recommendationScore(recipe,p=defaultCookingPreferences()){
 const model=p.recommendation,s=model?.stats.get(recipe.id)||{prepared:0,decayed:0,lastCook:0,opens:0,pass:0,shown:0},affinity=model?cosine(model.vectors.get(recipe.id)||new Map(),model.profile)*model.confidence:0;
 const age=s.lastCook?Math.max(0,(model.now-s.lastCook)/DAY):Infinity,recent=age<2;
 let weight=(recipe.favorite?3:1)*(1+Math.min(1.1,.35*Math.log1p(s.decayed||0)))*(1+Math.min(.12,s.opens||0))*(1+Math.min(.9,affinity));
 if(p.likedIngredients.some(i=>matches(recipe,i)))weight*=1.35;
 if(p.dislikedIngredients.some(i=>matches(recipe,i)))weight*=.5;
 weight*=recent?.3:age<7?.72:1;
 weight*=1-(s.pass||0);weight*=1-(s.shown||0);const ingredients=model?.features.get(recipe.id)?.ingredients||[];if(ingredients.length)weight*=clamp(1/(1+ingredients.reduce((n,i)=>n+(model.recentIngredients.get(i)||0),0)/ingredients.length*.15),.65,1);
 return {weight:clamp(weight,.08,8),affinity,prepared:s.prepared,recent,evidence:model?.evidence||0,lastCook:s.lastCook};
}
export function proposalDiversity(recipe,p,used=new Map(),otherRecipe=null){
 const model=p?.recommendation;if(!model)return 1;const f=model.features.get(recipe.id);if(!f)return 1;let proteinCount=0,ingredientCount=0;
 for(const [id,count]of used){const prior=model.features.get(id);if(!prior)continue;if(f.protein&&prior.protein===f.protein)proteinCount+=count;if(f.ingredients.some(i=>prior.ingredients.includes(i)))ingredientCount+=count;}
 let weight=1/(1+proteinCount*.18+ingredientCount*.08);
 if(otherRecipe){const other=model.features.get(otherRecipe.id);if(other?.protein&&other.protein===f.protein)weight*=.65;}
 return clamp(weight,.45,1);
}
