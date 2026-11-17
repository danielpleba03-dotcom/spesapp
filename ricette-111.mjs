// Immutable release 111: varied everyday dishes, one card per ingredient combination.
import {catalog101} from './recipe-catalog-101.mjs?v=114';
import {ricetteEssenziali105,riservaEssenziali105} from './ricette-essenziali-105.mjs?v=114';
import {ricetteSemplici106} from './ricette-semplici-106.mjs?v=114';
import {ricette109} from './ricette-109.mjs?v=114';
import {ricette110} from './ricette-110.mjs?v=114';
const i=(ingredient,qty,unit='g')=>({ingredient,qty,unit});
const vegetables=[
 ['ZUCCHINE',150,'rondelle di circa 1 cm',10,18,12],['CAROTE',150,'bastoncini sottili',12,25,18],['BROCCOLI',150,'piccole cimette',10,20,13],['CAVOLFIORE',150,'piccole cimette',12,25,16],['PEPERONI',150,'listarelle',15,25,18],['ZUCCA',150,'polpa pulita a cubetti di 1,5 cm',15,25,18],['FINOCCHI',150,'fettine sottili',12,25,18],['MELANZANE',150,'cubetti di 1,5 cm',18,25,18],['SPINACI',150,'foglie pulite',8,null,null],['BIETOLE',150,'foglie pulite, separando le coste più spesse',12,null,null],['CICORIA',150,'foglie pulite',15,null,null],['VERZA',150,'strisce sottili',15,22,15],['CAVOLO CAPPUCCIO',150,'strisce sottili',15,22,15],['RADICCHIO',120,'spicchi piccoli',10,18,12],['PORRI',120,'rondelle ben lavate',12,22,15],['FAGIOLINI',150,'fagiolini spuntati',18,25,18],['ASPARAGI',150,'pezzi privati della base legnosa',10,18,12],['FUNGHI CHAMPIGNON',150,'fettine di funghi coltivati puliti',10,20,14],['POMODORI',150,'cubetti lavati',0,null,null],['CETRIOLI',150,'fettine lavate',0,null,null]
];
const carbs=[
 ['PASTA',80,'Lessa la pasta seguendo la confezione e scola.'],['RISO',70,'Lessa il riso seguendo la confezione e scola.'],['FARRO',70,'Risciacqua se richiesto e lessa il farro seguendo la confezione; scola.'],['ORZO',70,'Lessa l’orzo seguendo la confezione e scola.'],['COUS COUS',70,'Reidrata il cous cous con acqua calda nelle proporzioni e per i tempi della confezione; sgranalo.'],['QUINOA',70,'Risciacqua la quinoa e cuocila nelle proporzioni di acqua e per i tempi indicati sulla confezione.'],['GRANO SARACENO',70,'Lessa il grano saraceno seguendo la confezione e scola.'],['PATATE',200,'Lava e pela le patate, tagliale a cubetti e lessale finché tenere; scola.'],['PANE',70,'Affetta il pane; servilo accanto al piatto.']
];
// Last fields: kind, oven minutes, air-fryer minutes, pan minutes, doneness.
const proteins=[
 ['PETTO DI POLLO',150,'raw',22,16,14,'Taglia a cubetti di circa 2 cm; cuoci fino a 74 °C al cuore.'],['FESA DI TACCHINO',150,'raw',22,16,14,'Taglia a cubetti di circa 2 cm; cuoci fino a 74 °C al cuore.'],['MERLUZZO',160,'fish',16,11,10,'Usa filetti senza lische, di circa 2 cm di spessore; cuoci fino a 63 °C al cuore, con polpa opaca e sfaldabile.'],['SALMONE',150,'fish',16,11,10,'Usa filetti senza lische, di circa 2 cm di spessore; cuoci fino a 63 °C al cuore.'],['PLATESSA',160,'fish',12,8,8,'Controlla ed elimina le lische; verifica la cottura prima se il filetto è sottile, fino a 63 °C al cuore.'],['TOFU',150,'plant',22,15,10,'Taglia a cubetti di circa 2 cm; segui anche le istruzioni della confezione.'],['TEMPEH',120,'plant',20,14,10,'Usa un prodotto pronto da cuocere, taglialo a fettine e rispetta le istruzioni di preparazione della confezione.'],['SEITAN',120,'plant',18,12,8,'Usa seitan già preparato e pronto da cuocere; taglia a fettine e segui la confezione.'],
 ['CECI COTTI',130,'Scola e risciacqua i ceci già cotti; non usare ceci secchi direttamente.'],['FAGIOLI CANNELLINI COTTI',130,'Scola e risciacqua i cannellini già cotti; non usare fagioli secchi direttamente.'],['FAGIOLI BORLOTTI COTTI',130,'Scola e risciacqua i borlotti già cotti; non usare fagioli secchi direttamente.'],['LENTICCHIE COTTE',130,'Scola e risciacqua le lenticchie già cotte; non usare lenticchie secche direttamente.'],['TONNO AL NATURALE',80,'Scola e spezzetta il tonno al naturale già cotto.'],['SGOMBRO AL NATURALE',90,'Scola e spezzetta lo sgombro al naturale già cotto.'],['RICOTTA',80,'Lavora la ricotta con poca acqua di cottura e incorporala fuori dal fuoco.'],['MOZZARELLA',80,'Scola e taglia la mozzarella; aggiungila alla fine, fuori dal fuoco.'],['FETA',60,'Sbriciola la feta e aggiungila alla fine.'],['ROBIOLA',60,'Stempera la robiola con poca acqua di cottura e incorporala fuori dal fuoco.'],['CAPRINO',60,'Stempera il caprino con poca acqua di cottura e incorporalo fuori dal fuoco.'],['PROSCIUTTO COTTO',80,'Taglia il prosciutto cotto pronto da mangiare a striscioline e uniscilo alla fine.']
];
const norm=s=>String(s).normalize('NFC').trim().toLocaleUpperCase('it-IT').replace(/\s+/g,' ');
// Ignore dose differences: changing the weight does not create a new recipe.
const foodKey=r=>r.ingredients.map(x=>(norm(x.ingredient).startsWith('PANE')?'PANE':norm(x.ingredient))+'|'+x.unit).sort().join(';');
const previous=[...catalog101.values(),...ricetteEssenziali105,...riservaEssenziali105,...ricetteSemplici106,...ricette109,...ricette110];
const names=new Set(previous.map(r=>norm(r.name))),foods=new Set(previous.map(foodKey));
const mains=[],sides=[],breakfast=[];
function candidate(pool,id,name,meal,ingredients,parts){const r={id,name,meal,ingredients};const key=foodKey(r);if(names.has(norm(name))||foods.has(key))return;names.add(norm(name));foods.add(key);pool.push({...r,parts});}
for(const [ci,c]of carbs.entries())for(const [pi,p]of proteins.entries())for(const [vi,v]of vegetables.entries()){
 candidate(mains,`quotidiane-111-${ci}-${pi}-${vi}`,`${c[0]} CON ${p[0]} E ${v[0]}`,ci<7?'Primi':'Secondi',[i(c[0],c[1]),i(p[0],p[1]),i(v[0],v[1]),i('OLIO EXTRAVERGINE DI OLIVA',.01,'l')],{c,p,v});
}
for(let a=0;a<vegetables.length;a++)for(let b=a+1;b<vegetables.length;b++){
 const v=vegetables[a],w=vegetables[b];candidate(sides,`contorni-111-${a}-${b}`,`CONTORNO DI ${v[0]} E ${w[0]}`,'Contorni',[i(v[0],130),i(w[0],130),i('OLIO EXTRAVERGINE DI OLIVA',.01,'l')],{v,w});
}
const fruits=[['MELA',120,'Lava e taglia la mela, eliminando torsolo e semi.'],['PERA',120,'Lava e taglia la pera, eliminando torsolo e semi.'],['FRAGOLE',150,'Lava e pulisci le fragole, poi tagliale.'],['FRUTTI DI BOSCO',100,'Usa frutti freschi lavati; per quelli surgelati rispetta le istruzioni di preparazione e consumo della confezione.'],['MIRTILLI',100,'Usa mirtilli freschi lavati; se surgelati rispetta la confezione.'],['PESCHE',120,'Lava la pesca, elimina il nocciolo e taglia la polpa.'],['MELONE',150,'Lava la buccia del melone prima di tagliarlo; pesa la polpa senza buccia e semi.'],['ARANCIA',150,'Sbuccia l’arancia, elimina i semi e taglia la polpa.']];
const dairy=[['YOGURT GRECO',170,'g'],['YOGURT BIANCO',170,'g'],['RICOTTA',100,'g'],['LATTE',.2,'l']];
const cereals=[['FIOCCHI DI AVENA',30],['CORNFLAKES NON ZUCCHERATI',30],['BISCOTTI SECCHI',30],['PANE',40]];
for(const [di,d]of dairy.entries())for(const [fi,f]of fruits.entries())for(const [ni,n]of ['NOCI','MANDORLE','NOCCIOLE','PISTACCHI','ANACARDI'].entries())for(const [ci,c]of cereals.entries()){
 candidate(breakfast,`colazioni-111-${di}-${fi}-${ni}-${ci}`,`${d[0]} CON ${f[0]} ${n} E ${c[0]}`,'Colazioni',[i(d[0],d[1],d[2]),i(f[0],f[1]),i(n,15),i(c[0],c[1])],{d,f,n,c});
}
function sample(pool,count){if(pool.length<count)throw Error('Catalogo 111 incompleto: '+pool.length+' / '+count);const selected=[];for(let n=0;n<count;n++)selected.push(pool[Math.floor(n*pool.length/count)]);return selected;}
const selected=[...sample(mains,1600),...sample(sides,150),...sample(breakfast,125)],selectedIds=new Set(selected.map(r=>r.id));
const reserve=sample(mains.filter(r=>!selectedIds.has(r.id)),200);
export const methods111={},effort111={};
const vegPrep=(v,mode)=>{const start=`Lava e pulisci ${v[0].toLowerCase()}, taglia in ${v[2]}. `;if(!v[3])return start+'Lasciala cruda e uniscila prima di servire. ';if(mode==='forno'&&v[4])return start+`Cuoci la verdura su una teglia a 200 °C per circa ${v[4]} minuti, mescolando a metà e verificando che sia tenera. `;if(mode==='aria'&&v[5])return start+`Cuoci la verdura nel cestello a 190 °C per circa ${v[5]} minuti, scuotendo a metà e verificando che sia tenera. `;return start+`Cuoci in pentola o padella coperta con poca acqua per circa ${v[3]} minuti, finché ben cotta; scola se necessario. `;};
function build(r){
 let methods=[],minutes=15,tools=[];
 if(r.parts.p){
  const {c,p,v}=r.parts,raw=['raw','fish','plant'].includes(p[2]),needsBoiling=c[0]!=='PANE',hasHotVeg=v[3]>0;
  const modes=[raw?'padella':needsBoiling||hasHotVeg?'pentola':'freddo'];
  if(raw||v[4])modes.push('forno');if(raw||v[5])modes.push('aria');
  methods=modes.map(mode=>{
   const used=new Set();if(needsBoiling||hasHotVeg&&(!['forno','aria'].includes(mode)||!v[mode==='forno'?4:5])||mode==='padella')used.add('fornelli');if(mode==='forno'||mode==='aria')used.add(mode);
   let text=c[2]+' '+vegPrep(v,mode)+'Usa l’olio previsto per ungere leggermente e condire, senza aggiungere altri grassi. ';
   if(raw){text+='Prepara '+p[0].toLowerCase()+'. '+p[6]+' Tieni da parte la verdura già cotta e cuoci separatamente la proteina. ';if(mode==='forno')text+=`Cuoci a 200 °C per circa ${p[3]} minuti, girando i bocconcini a metà. `;else if(mode==='aria')text+=`Cuoci a 180 °C per circa ${p[4]} minuti, girando a metà e controllando prima i filetti sottili. `;else text+=`Cuoci in padella per circa ${p[5]} minuti, girando e aggiungendo poca acqua se occorre. `;text+='I minuti sono orientativi: verifica sempre la cottura indicata al centro. ';}else text+=(needsBoiling?p[2]:p[2].replace('acqua di cottura','acqua'))+' ';
   text+='Riunisci nel piatto e servi. Dosi per una persona; cereali pesati a secco, legumi già cotti e scolati, pesce senza lische. L’acqua di cottura non è conteggiata. Per più porzioni non sovrapporre gli alimenti e cuoci in più riprese; segui le istruzioni del tuo apparecchio.';
   return {id:mode,label:mode==='aria'?'Friggitrice ad aria'+(used.has('fornelli')?' + pentola':''):mode==='forno'?'Forno'+(used.has('fornelli')?' + pentola':''):mode==='padella'?'Padella'+(needsBoiling?' + pentola':''):mode==='freddo'?'Senza cottura':'Pentola',tools:[...used],instructions:text};
  });
 }else if(r.parts.w){
  const {v,w}=r.parts,modes=[v[3]||w[3]?'pentola':'freddo'];if((v[4]||!v[3])&&(w[4]||!w[3])&&(v[4]||w[4]))modes.push('forno');if((v[5]||!v[3])&&(w[5]||!w[3])&&(v[5]||w[5]))modes.push('aria');minutes=10;
  methods=modes.map(mode=>({id:mode,label:mode==='aria'?'Friggitrice ad aria':mode==='forno'?'Forno':mode==='freddo'?'Senza cottura':'Pentola',tools:mode==='freddo'?[]:[mode==='pentola'?'fornelli':mode],instructions:vegPrep(v,mode)+vegPrep(w,mode)+'Le quantità di questa scheda sono 130 g per ciascuna verdura. Se i tempi sono diversi, cuoci le componenti separatamente. Riunisci e condisci con l’olio previsto. Dosi per una persona; per più porzioni evita di sovraccaricare cestello o teglia.'}));
 }else{
  const {d,f,n,c}=r.parts;minutes=5;const text=f[2]+' Spezzetta la frutta secca. '+(d[0]==='LATTE'?'Versa il latte in una tazza; consuma cereali o pane con il latte e servi frutta e frutta secca accanto.':'Versa lo yogurt o lavora la ricotta in una coppetta; unisci la frutta e la frutta secca, con i cereali o il pane serviti accanto.')+' Dosi per una persona; usa frutta secca sgusciata e non salata. Consuma subito o conserva i latticini al freddo fino al consumo.';
  methods=[{id:'freddo',label:'Pronta subito',tools:[],instructions:text}];
 }
 tools=methods[0].tools.map(t=>({fornelli:methods[0].id==='padella'?'Padella':'Pentola',aria:'Friggitrice ad aria',forno:'Forno'}[t]));
 const {parts,...recipe}=r;recipe.instructions=methods[0].instructions;recipe.tools=tools;recipe.source_title='Spesapp · ricette quotidiane semplici';methods111[r.id]=methods;effort111[r.id]={minutes,difficulty:'Facile'};return recipe;
}
export const ricette111=selected.map(build);
// Fills the target if earlier recipes were deleted, without restoring deleted entries.
export const riserva111=reserve.map(build);
export const CATALOG_111='spesapp-catalog-111';
export const catalog111=new Map([...ricette111,...riserva111].map(r=>[r.id,r]));
