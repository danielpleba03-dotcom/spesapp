import {catalog101} from './recipe-catalog-101.mjs?v=120';
import {ricetteEssenziali105} from './ricette-essenziali-105.mjs?v=120';
import {ricetteSemplici106} from './ricette-semplici-106.mjs?v=120';
import {ricette109} from './ricette-109.mjs?v=120';
// Immutable balanced dishes. One recipe, several explicit cooking patterns with unchanged ingredients.
import {classici110,effortClassici110} from './classici-110.mjs?v=120';
export {classici110};
export const ricette110=[...classici110],effort110={...effortClassici110},methods110={};
const i=(ingredient,qty,unit='g')=>({ingredient,qty,unit});
const vegetables=[['ZUCCHINE',150,'rondelle di circa 1 cm',15,12],['CAROTE',150,'bastoncini sottili di circa 5 mm',25,18],['BROCCOLI',150,'piccole cimette',20,13],['CAVOLFIORE',150,'piccole cimette',25,16],['PEPERONI',150,'listarelle',25,16],['FINOCCHI',150,'fettine sottili',25,18],['ZUCCA',150,'cubetti di circa 1,5 cm',25,18],['MELANZANE',150,'cubetti di circa 1,5 cm',25,18]];
const proteins=[
 ['POLLO A CUBETTI','PETTO DI POLLO',150,'cubetti di circa 2 cm',20,14,12,'74 °C al cuore'],
 ['TACCHINO A CUBETTI','FESA DI TACCHINO',150,'cubetti di circa 2 cm',20,14,12,'74 °C al cuore'],
 ['FILETTI DI MERLUZZO','MERLUZZO',160,'filetti di circa 2 cm di spessore',15,10,10,'63 °C al cuore, polpa opaca e sfaldabile'],
 ['FILETTI DI SALMONE','SALMONE',150,'filetti di circa 2 cm di spessore',15,10,10,'63 °C al cuore, polpa opaca e sfaldabile'],
 ['TOFU A CUBETTI','TOFU',150,'cubetti di circa 2 cm',20,14,10,'seguendo anche le istruzioni della confezione'],
 ['CECI CROCCANTI','CECI COTTI',150,'ceci già cotti, scolati e asciugati',25,15,10,'finché caldi e leggermente croccanti; non usare ceci secchi']
];
for(const [pi,p]of proteins.entries())for(const [vi,v]of vegetables.entries()){
 const id=`strumenti-110-p-${pi}-${vi}`,name=`${p[0]} CON ${v[0]} E PANE`,ingredients=[i(p[1],p[2]),i(v[0],v[1]),i('PANE',60),i('OLIO EXTRAVERGINE DI OLIVA',.01,'l')];
 const prep=`Lava e pulisci ${v[0].toLowerCase()}, taglia in ${v[2]} e condisci con metà dell’olio. Prepara ${p[0].toLowerCase()} in ${p[3]}; per il pesce controlla ed elimina le lische. Usa l’olio restante per la proteina. `;
 const end=` Verifica la cottura: ${p[7]}. Servi con la verdura e il pane. I tempi sono indicativi per una porzione, con ingredienti scongelati; non sovrapporre gli alimenti e adatta al tuo apparecchio. Per più porzioni cuoci in più riprese.`;
 const methods=[
 {id:'forno',label:'Forno',tools:['forno'],instructions:prep+`Preriscalda a 200 °C. Cuoci la verdura per circa ${v[3]} minuti finché tenera, poi tienila da parte. Cuoci la proteina in una teglia separata per circa ${p[4]} minuti, girandola se a cubetti.`+end},
 {id:'aria',label:'Friggitrice ad aria',tools:['aria'],instructions:prep+`Preriscalda se richiesto dall’apparecchio. Cuoci prima la verdura a 190 °C per circa ${v[4]} minuti, scuotendo a metà, poi tienila da parte. Cuoci la proteina a 180 °C per circa ${p[5]} minuti, girandola a metà; controlla prima i filetti sottili.`+end},
 {id:'padella',label:'Padella',tools:['fornelli'],instructions:prep+`Cuoci prima la verdura in padella con poca acqua, coperta, finché tenera; falla asciugare e tienila da parte. Nella stessa padella cuoci la proteina per circa ${p[6]} minuti, girandola e aggiungendo poca acqua se occorre.`+end}
 ];
 ricette110.push({id,name,meal:'Secondi',ingredients,tools:['Forno'],instructions:methods[0].instructions,source_title:'Spesapp · piatti semplici con cotture alternative'});methods110[id]=methods;effort110[id]={minutes:15,difficulty:'Facile'};
}
for(const [vi,v]of vegetables.entries())for(const [ci,[cheese,qty]]of [['RICOTTA',60],['MOZZARELLA',60],['SCAMORZA',50],['ROBIOLA',50]].entries()){
 const id=`strumenti-110-g-${vi}-${ci}`,name=`GNOCCHI GRATINATI CON ${v[0]} E ${cheese}`;
 const prep=`Lava e pulisci la verdura, tagliala in ${v[2]} e cuocila in padella con poca acqua finché tenera. Lessa gli gnocchi seguendo la confezione e scolali. Unisci verdura, gnocchi, formaggio a pezzetti e olio. `;
 const methods=[{id:'forno',label:'Forno',tools:['fornelli','forno'],instructions:prep+'Trasferisci in una piccola pirofila e gratina a 200 °C per circa 10-15 minuti, finché caldo anche al centro e dorato. Non usare il grill senza sorvegliare.'},{id:'aria',label:'Friggitrice ad aria',tools:['fornelli','aria'],instructions:prep+'Trasferisci in uno stampo adatto che lasci circolare l’aria nel cestello. Cuoci a 180 °C per circa 6-10 minuti finché ben caldo al centro e il formaggio è fuso; controlla la doratura. Le dosi sono per una porzione: per più persone usa più riprese.'},{id:'padella',label:'Padella',tools:['fornelli'],instructions:prep+'Rimetti in padella a fuoco basso con poca acqua di cottura; mescola finché il formaggio si amalgama e servi subito. In questa variante gli gnocchi sono cremosi, senza gratinatura.'}];
 ricette110.push({id,name,meal:'Primi',ingredients:[i('GNOCCHI DI PATATE',200),i(v[0],v[1]),i(cheese,qty),i('OLIO EXTRAVERGINE DI OLIVA',.005,'l')],tools:['Pentola','Forno'],instructions:methods[0].instructions,source_title:'Spesapp · gnocchi con cotture alternative'});methods110[id]=methods;effort110[id]={minutes:20,difficulty:'Facile'};
}
for(let a=0;a<vegetables.length;a++)for(let b=a+1;b<vegetables.length;b++){
 const v=vegetables[a],w=vegetables[b],id=`strumenti-110-v-${a}-${b}`,name=`VELLUTATA DI ${v[0]} E ${w[0]} CON CANNELLINI`;
 const instructions=`Pulisci ${v[0].toLowerCase()} e ${w[0].toLowerCase()}, taglia a pezzi e cuoci nel brodo per circa 20-30 minuti, finché morbidi. Unisci i cannellini già cotti, scolati e risciacquati; non usare legumi secchi direttamente. Lascia intiepidire prima di frullare: usa un frullatore a immersione adatto o segui le istruzioni del tuo apparecchio per liquidi caldi. Non chiudere liquidi bollenti in un bicchiere non predisposto. Regola con acqua se serve e completa con olio.`;
 ricette110.push({id,name,meal:'Primi',ingredients:[i(v[0],120),i(w[0],120),i('FAGIOLI CANNELLINI COTTI',120),i('BRODO VEGETALE',.25,'l'),i('OLIO EXTRAVERGINE DI OLIVA',.005,'l')],tools:['Pentola','Frullatore'],instructions,source_title:'Spesapp · vellutate semplici'});methods110[id]=[{id:'pentola',label:'Pentola e frullatore',tools:['fornelli','frullatore'],instructions}];effort110[id]={minutes:15,difficulty:'Facile'};
}
// Reuse an existing equivalent dish instead of adding an oven/air-fryer duplicate.
const prior=[...catalog101.values(),...ricetteEssenziali105,...ricetteSemplici106,...ricette109];
const foodKey=r=>r.ingredients.map(i=>(i.ingredient.startsWith('PANE')?'PANE':i.ingredient)+'|'+i.unit).sort().join(';');
for(let n=ricette110.length-1;n>=classici110.length;n--){
 const recipe=ricette110[n];if(!methods110[recipe.id]||methods110[recipe.id].length<2)continue;
 const same=prior.filter(r=>r.ingredients.length===recipe.ingredients.length&&foodKey(r)===foodKey(recipe)&&r.ingredients.every(i=>i.unit!=='g'||i.qty<=250));
 if(!same.length)continue;
 for(const existing of same){methods110[existing.id]=methods110[recipe.id];effort110[existing.id]=effort110[recipe.id];}
 delete methods110[recipe.id];delete effort110[recipe.id];ricette110.splice(n,1);
}
export const CATALOG_110='spesapp-catalog-110';
export const catalog110=new Map(ricette110.map(r=>[r.id,r]));
