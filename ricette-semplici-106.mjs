// Immutable release 106: simple single-portion recipes with complete preparation.
import {catalog101} from './recipe-catalog-101.mjs?v=115';
import {ricetteEssenziali105,riservaEssenziali105} from './ricette-essenziali-105.mjs?v=115';
const item=(ingredient,qty,unit='g')=>({ingredient,qty,unit});
// Each component carries its own preparation; quantities of legumes refer to cooked food.
const veg=[
 ['POMODORI',150,'Lava e taglia i pomodori.',2],
 ['CETRIOLI',150,'Lava e affetta i cetrioli.',2],
 ['RUCOLA',50,'Lava e asciuga la rucola.',2],
 ['LATTUGA',100,'Lava e asciuga la lattuga, poi spezzettala.',2],
 ['CAROTE',120,'Lava, pela e grattugia le carote.',3],
 ['ZUCCHINE',150,'Lava e taglia le zucchine; cuocile con poca acqua in padella per 8-10 minuti, finché tenere.',5],
 ['BROCCOLI',150,'Lava i broccoli e cuoci le cimette al vapore per 8-10 minuti, finché tenere.',4],
 ['SPINACI',150,'Lava gli spinaci e cuocili coperti con poca acqua per 5-8 minuti, finché teneri.',4],
 ['FINOCCHI',150,'Pulisci e lava i finocchi, poi affettali sottilmente.',3],
 ['PEPERONI',150,'Lava e pulisci i peperoni; tagliali e cuocili coperti con poca acqua per 12-15 minuti, finché teneri.',5]
];
const proteins=[
 ['TONNO AL NATURALE',80,'Scola il tonno al naturale già cotto e sminuzzalo.',2],
 ['FAGIOLI CANNELLINI COTTI',120,'Scola e risciacqua i cannellini già cotti; non usare fagioli secchi direttamente.',2],
 ['FAGIOLI BORLOTTI COTTI',120,'Scola e risciacqua i borlotti già cotti; non usare fagioli secchi direttamente.',2],
 ['FETA',70,'Sbriciola la feta.',2],
 ['BRESAOLA',80,'Taglia la bresaola pronta da mangiare a striscioline.',2],
 ['ROAST BEEF COTTO',100,'Taglia il roast beef già cotto e pronto da consumare a striscioline.',2],
 ['FESA DI TACCHINO AFFETTATA',100,'Taglia la fesa di tacchino già cotta e affettata pronta da consumare.',2],
 ['TOFU',120,'Taglia il tofu e scaldalo in padella antiaderente con poca acqua, seguendo le istruzioni della confezione.',4]
];
const grains=[['QUINOA',70],['GRANO SARACENO',70],['RISO',70],['FARRO',70],['COUS COUS',70]];
const breads=['PANE','PANE DI SEGALE','PANE IN CASSETTA'];
const normalized=s=>s.normalize('NFC').trim().toLocaleUpperCase('it-IT').replace(/\s+/g,' ');
const signature=r=>JSON.stringify(r.ingredients.map(i=>[normalized(i.ingredient),i.qty,i.unit]).sort((a,b)=>a[0].localeCompare(b[0])));
const previous=[...catalog101.values(),...ricetteEssenziali105,...riservaEssenziali105];
const names=new Set(previous.map(r=>normalized(r.name))),signatures=new Set(previous.map(signature));
export const ricetteSemplici106=[];
export const simpleMinutes106={};
const groups=[[],[],[],[],[]];
function add(group,key,name,meal,ingredients,instructions,minutes){groups[group].push({recipe:{id:'semplici-106-'+key,name,meal,ingredients,instructions:instructions+' Quantità per una persona; cereali pesati a secco, legumi pesati già cotti e scolati. Acqua di cottura non conteggiata.',source_title:'Ricette semplici Spesapp'},minutes});}
for(const [gi,[g,qty]]of grains.entries())for(const [pi,p]of proteins.entries())for(const [vi,v]of veg.entries()){
 const prep=g==='COUS COUS'?'Reidrata il cous cous seguendo dosi di acqua e tempi della confezione, poi sgranalo.':`Risciacqua se richiesto dalla confezione e lessa ${g.toLocaleLowerCase('it-IT')} seguendo i tempi del prodotto; scola.`;
 add(0,`c-${gi}-${pi}-${vi}`,`${g} CON ${p[0]} E ${v[0]}`,'Primi',[item(g,qty),item(p[0],p[1]),item(v[0],v[1]),item('OLIO EXTRAVERGINE DI OLIVA',.005,'l')],prep+' '+v[2]+' '+p[2]+' Riunisci nel piatto e condisci con l’olio a crudo. Puoi preparare le componenti in parallelo.',6+p[3]+v[3]);
}
for(const [bi,b]of breads.entries())for(const [pi,p]of proteins.entries())for(const [vi,v]of veg.entries()){
 add(1,`p-${bi}-${pi}-${vi}`,`CROSTONI DI ${b} CON ${p[0]} E ${v[0]}`,'Secondi',[item(b,80),item(p[0],p[1]),item(v[0],v[1]),item('OLIO EXTRAVERGINE DI OLIVA',.005,'l')],v[2]+' '+p[2]+' Tosta leggermente il pane in padella antiaderente senza grassi; distribuisci sopra il condimento e completa con l’olio. Servi l’eventuale verdura in eccesso accanto.',4+p[3]+v[3]);
}
const mains=[
 ['PETTO DI POLLO',150,'Taglia il pollo a strisce e cuocilo in padella antiaderente con poca acqua, girandolo fino a cottura completa anche al centro (74 °C al cuore).',7],
 ['MERLUZZO',150,'Cuoci il filetto di merluzzo in padella coperta con poca acqua finché è opaco e si sfalda (63 °C al cuore); controlla ed elimina le lische.',5],
 ['UOVA',2,'Rompi le uova in una ciotola, sbattile e cuocile in padella antiaderente, mescolando finché albume e tuorlo sono ben rappresi.',4],
 ['RICOTTA',100,'Disponi la ricotta fresca nel piatto.',1],
 ['MOZZARELLA',100,'Scola e affetta la mozzarella.',2],
 ['CECI COTTI',150,'Scola e risciacqua i ceci già cotti, poi scaldali in poca acqua; non usare ceci secchi direttamente.',3],
 ['LENTICCHIE COTTE',150,'Scola e risciacqua le lenticchie già cotte e scaldale; non usare lenticchie secche direttamente.',3],
 ['SGOMBRO AL NATURALE',100,'Scola lo sgombro al naturale già cotto.',1]
];
for(const [pi,p]of mains.entries())for(const [vi,v]of veg.entries())for(const [ci,c]of ['PATATE','PANE DI SEGALE','RISO'].entries()){
 const prep=c==='PATATE'?'Lava, pela e taglia 180 g di patate a cubetti; lessale finché tenere, poi scola.':c==='RISO'?'Lessa 60 g di riso seguendo i tempi della confezione e scola.':'Affetta 60 g di pane di segale.';
 add(2,`s-${pi}-${vi}-${ci}`,`${p[0]} CON ${v[0]} E ${c}`,'Secondi',[item(p[0],p[1],p[0]==='UOVA'?'pz':'g'),item(v[0],v[1]),item(c,c==='PATATE'?180:60),item('OLIO EXTRAVERGINE DI OLIVA',.005,'l')],prep+' '+v[2]+' '+p[2]+' Servi le componenti insieme, condite con l’olio a crudo. Puoi cuocerle in parallelo.',5+p[3]+v[3]);
}
for(const [pi,p]of proteins.entries())for(let a=0;a<5;a++)for(let b=a+1;b<9;b++){
 const v=veg[a],w=veg[b];
 add(3,`i-${pi}-${a}-${b}`,`INSALATONA DI ${p[0]} CON ${v[0]} E ${w[0]}`,'Secondi',[item(p[0],p[1]),item(v[0],v[1]),item(w[0],w[1]),item('OLIO EXTRAVERGINE DI OLIVA',.005,'l')],v[2]+' '+w[2]+' '+p[2]+' Lascia intiepidire le componenti cotte, riunisci e condisci con l’olio; servi subito.',p[3]+v[3]+w[3]+2);
}
const fruits=[['MELA',120,'Lava e taglia la mela, eliminando torsolo e semi.'],['PERA',120,'Lava e taglia la pera, eliminando torsolo e semi.'],['FRAGOLE',150,'Lava e pulisci le fragole, poi tagliale.'],['FRUTTI DI BOSCO',120,'Usa frutti freschi lavati; per quelli surgelati segui le istruzioni di preparazione e consumo della confezione.'],['ARANCIA',150,'Sbuccia l’arancia e taglia la polpa, eliminando i semi.']];
for(const [fi,f]of fruits.entries())for(const [ni,n]of ['NOCI','MANDORLE','NOCCIOLE','PISTACCHI','ANACARDI'].entries())for(const [bi,b]of ['FIOCCHI DI AVENA','CORNFLAKES NON ZUCCHERATI'].entries()){
 add(4,`b-${fi}-${ni}-${bi}`,`YOGURT CON ${f[0]} ${n} E ${b}`,'Colazioni',[item('YOGURT GRECO',170),item(f[0],f[1]),item(n,15),item(b,30)],f[2]+' Spezzetta la frutta secca. Versa lo yogurt in una ciotola, unisci la frutta e completa con cereali e frutta secca poco prima di mangiare.',5);
}
// Rotate all families to avoid filling the release with near-identical cereal plates.
const quotas=[125,125,100,100,50];
for(let g=0;g<groups.length;g++){
 const available=[],localNames=new Set(),localSignatures=new Set();
 for(const candidate of groups[g]){const r=candidate.recipe,n=normalized(r.name),key=signature(r);if(names.has(n)||signatures.has(key)||localNames.has(n)||localSignatures.has(key))continue;localNames.add(n);localSignatures.add(key);available.push(candidate);}
 if(available.length<quotas[g])throw new Error('Catalogo 106 incompleto');
 // Sample across the whole family: all proteins and bases, not just the first ones.
 for(let i=0;i<quotas[g];i++){const {recipe,minutes}=available[Math.floor(i*available.length/quotas[g])];names.add(normalized(recipe.name));signatures.add(signature(recipe));ricetteSemplici106.push(recipe);simpleMinutes106[recipe.id]=minutes;}
}
export const CATALOG_106='spesapp-catalog-106';
export const catalog106=new Map(ricetteSemplici106.map(r=>[r.id,r]));
