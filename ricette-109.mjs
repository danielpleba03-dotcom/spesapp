// Immutable release 109. Single-portion classics and simple everyday variations.
import {catalog101} from './recipe-catalog-101.mjs?v=116';
import {ricetteEssenziali105,riservaEssenziali105} from './ricette-essenziali-105.mjs?v=116';
import {ricetteSemplici106} from './ricette-semplici-106.mjs?v=116';
const ing=(ingredient,qty,unit='g')=>({ingredient,qty,unit});
export const ricette109=[
 {id:'classici-109-carbonara',name:'SPAGHETTI ALLA CARBONARA',meal:'Primi',ingredients:[ing('PASTA',80),ing('GUANCIALE',37.5),ing('TUORLI',27),ing('PECORINO ROMANO',12.5),ing('PEPE NERO',.1),ing('SALE FINO',.5)],source_url:'https://ricette.giallozafferano.it/Spaghetti-alla-Carbonara.html',source_title:'GialloZafferano · dosi adattate per una persona',instructions:'Per una persona: 27 g di tuorli corrispondono indicativamente a un tuorlo e mezzo; pesali, preferibilmente pastorizzati. Rosola il guanciale senza altri grassi. Cuoci la pasta in acqua salata. Mescola tuorli, pecorino e pepe; unisci la pasta al guanciale e incorpora la crema fuori dal fuoco, regolando con poca acqua di cottura. Servi subito. Il link mostra la tecnica completa.'},
 {id:'classici-109-lasagne',name:'LASAGNE ALLA BOLOGNESE',meal:'Primi',ingredients:[ing("PASTA FRESCA ALL'UOVO",70),ing('MANZO MACINATO',90),ing('PANCETTA',15),ing('PASSATA DI POMODORO',80),ing('CAROTE',15),ing('SEDANO',15),ing('CIPOLLE',15),ing('BESCIAMELLA',100),ing('PARMIGIANO REGGIANO',15),ing('OLIO EXTRAVERGINE DI OLIVA',.005,'l'),ing('VINO ROSSO',.025,'l'),ing('BRODO VEGETALE',.05,'l'),ing('SALE FINO',.5),ing('PEPE NERO',.1)],source_url:'https://ricette.giallozafferano.it/Lasagne-alla-Bolognese.html',source_title:'GialloZafferano · adattamento con sfoglia e besciamella pronte',instructions:'Una porzione, con sfoglia fresca e besciamella già pronte: per farle in casa segui il link e adatta gli ingredienti. Trita carota, sedano e cipolla; falli appassire con olio e pancetta. Rosola bene il macinato, sfuma col vino e aggiungi pomodoro e brodo. Cuoci dolcemente per circa due ore, aggiungendo acqua se occorre. Alterna sfoglia, ragù, besciamella e parmigiano in una piccola pirofila. Cuoci a 180 °C per circa 30-40 minuti, rispettando anche le indicazioni della sfoglia; lascia assestare prima di servire.'},
 {id:'classici-109-tiramisu',name:'TIRAMISÙ CLASSICO',meal:'Dolci',ingredients:[ing('MASCARPONE',70),ing('TUORLI',15),ing('ALBUMI',30),ing('SAVOIARDI',30),ing('ZUCCHERO',18),ing('CAFFÈ PREPARATO',.025,'l'),ing('CACAO AMARO',2)],source_url:'https://ricette.giallozafferano.it/Tiramisu.html',source_title:'GialloZafferano · dosi adattate in coppetta per una persona',instructions:'Una coppetta: usa tuorli e albumi pastorizzati adatti al consumo senza cottura e, per gli albumi, alla montatura. Prepara il caffè e raffreddalo. Monta i tuorli con metà zucchero e incorpora il mascarpone. Monta gli albumi con il resto dello zucchero e incorporali delicatamente. Alterna nella coppetta savoiardi appena bagnati nel caffè e crema; completa con cacao. Riponi coperto in frigorifero per almeno due ore. Il link spiega la preparazione completa.'}
];
export const effort109={'classici-109-carbonara':{minutes:15,difficulty:'Media'},'classici-109-lasagne':{minutes:35,difficulty:'Media'},'classici-109-tiramisu':{minutes:15,difficulty:'Facile'}};
const vegetables=[
 ['ZUCCHINE',150,'Lava e taglia le zucchine, poi cuocile in padella con poca acqua per 8-10 minuti, finché tenere.',5],
 ['SPINACI',150,'Lava gli spinaci e cuocili coperti con poca acqua per 5-8 minuti, finché teneri.',4],
 ['BROCCOLI',150,'Lava e dividi i broccoli in cimette; cuocili al vapore per 8-10 minuti, finché teneri.',4],
 ['ZUCCA',150,'Pulisci la zucca da buccia e semi, taglia la polpa a cubetti e cuocila con poca acqua per 12-15 minuti.',5],
 ['PEPERONI',150,'Lava e pulisci i peperoni; tagliali e cuocili coperti con poca acqua per 12-15 minuti, finché teneri.',5],
 ['PORRI',100,'Pulisci e lava i porri, affettali e stufali con poca acqua per 10-12 minuti.',5],
 ['FUNGHI CHAMPIGNON',150,'Pulisci gli champignon coltivati, affettali e cuocili in padella per 8-10 minuti, finché ben cotti.',5],
 ['PISELLI',100,'Cuoci i piselli freschi sgranati o surgelati seguendo i tempi del prodotto; scola.',3],
 ['CAVOLFIORE',150,'Lava il cavolfiore e cuoci le cimette al vapore per 10-12 minuti, finché tenere.',4],
 ['MELANZANE',150,'Lava e taglia le melanzane a cubetti; cuocile coperte con poca acqua per 15-18 minuti, finché ben cotte.',6]
];
const cheeses=[['RICOTTA',60],['ROBIOLA',50],['STRACCHINO',50],['GORGONZOLA',40],['SCAMORZA',50],['MOZZARELLA',60],['FETA',50],['CAPRINO',50]];
const ready=[
 ['TONNO AL NATURALE',80,'Scola il tonno già cotto al naturale e spezzettalo.'],
 ['CECI COTTI',120,'Scola e risciacqua i ceci già cotti; non usare ceci secchi direttamente.'],
 ['FAGIOLI CANNELLINI COTTI',120,'Scola e risciacqua i cannellini già cotti; non usare fagioli secchi direttamente.'],
 ['LENTICCHIE COTTE',120,'Scola e risciacqua le lenticchie già cotte; non usare lenticchie secche direttamente.'],
 ['SGOMBRO AL NATURALE',80,'Scola lo sgombro al naturale già cotto e spezzettalo.'],
 ['PROSCIUTTO COTTO',70,'Taglia il prosciutto cotto pronto da consumare a striscioline.'],
 ['BRESAOLA',70,'Taglia la bresaola pronta da consumare a striscioline.'],
 ['FESA DI TACCHINO AFFETTATA',80,'Taglia la fesa di tacchino già cotta e affettata pronta da consumare.']
];
const groups=[[],[],[],[],[],[]];
const oil=()=>ing('OLIO EXTRAVERGINE DI OLIVA',.005,'l');
function add(group,key,name,meal,ingredients,instructions,minutes){groups[group].push({recipe:{id:'quotidiane-109-'+key,name,meal,ingredients,instructions:instructions+' Dosi per una persona; acqua di cottura non conteggiata.',source_title:'Ricette quotidiane Spesapp'},minutes});}
for(const [vi,v]of vegetables.entries())for(const [ci,c]of cheeses.entries()){
 for(const [bi,b]of ['GNOCCHI DI PATATE',"PASTA FRESCA ALL'UOVO"].entries())add(0,`g-${bi}-${vi}-${ci}`,`${b} CON ${v[0]} E ${c[0]}`,'Primi',[ing(b,b==='GNOCCHI DI PATATE'?180:100),ing(v[0],v[1]),ing(c[0],c[1]),oil()],v[2]+' Cuoci la pasta o gli gnocchi seguendo la confezione; scola conservando poca acqua di cottura. Taglia o sbriciola il formaggio e uniscilo alla verdura calda fuori dal fuoco. Aggiungi la pasta o gli gnocchi, ammorbidisci con poca acqua di cottura e completa con l’olio.',8+v[3]);
}
for(const [vi,v]of vegetables.entries())for(const [pi,p]of ready.entries())for(const [bi,b]of ['POLENTA COTTA','PATATE','PANE NERO'].entries()){
 const prep=b==='PATATE'?'Lava, pela e taglia le patate; lessale finché tenere e scola.':b==='POLENTA COTTA'?'Scalda la polenta già cotta e pronta seguendo le istruzioni della confezione, con poca acqua se necessario.':'Affetta il pane nero e tostalo se desideri.';
 add(1,`q-${bi}-${vi}-${pi}`,`${b} CON ${v[0]} E ${p[0]}`,'Secondi',[ing(b,b==='POLENTA COTTA'?200:b==='PATATE'?180:70),ing(v[0],v[1]),ing(p[0],p[1]),oil()],prep+' '+v[2]+' '+p[2]+' Servi le componenti insieme e condisci con l’olio. Puoi prepararle in parallelo.',7+v[3]);
}
for(const [vi,v]of vegetables.entries())for(const [ci,c]of cheeses.entries())for(const [si,s]of ['FRITTATINA','UOVA STRAPAZZATE'].entries()){
 const prep=s==='FRITTATINA'?'Sbatti le uova, unisci la verdura intiepidita e il formaggio a pezzetti. Ungi una piccola padella antiaderente con l’olio, versa il composto e cuocilo coperto a fuoco basso; giralo aiutandoti con un piatto e termina la cottura, finché le uova sono ben rapprese anche al centro.':'Sbatti le uova e versale in una padella antiaderente unta con l’olio. Unisci il formaggio a pezzetti e mescola a fuoco basso finché le uova sono ben rapprese; servi con la verdura.';
 add(2,`u-${si}-${vi}-${ci}`,`${s} CON ${v[0]} E ${c[0]}`,'Secondi',[ing('UOVA',2,'pz'),ing(v[0],v[1]),ing(c[0],c[1]),oil()],v[2]+' '+prep,7+v[3]);
}
for(const [vi,v]of vegetables.entries())for(const [pi,p]of ready.entries())for(const [bi,b]of ['COUS COUS','FARRO','ORZO'].entries()){
 const prep=b==='COUS COUS'?'Reidrata il cous cous con acqua calda nelle proporzioni e per i tempi indicati sulla confezione, poi sgranalo.':`Lessa ${b.toLowerCase()} seguendo i tempi della confezione e scola.`;
 add(3,`c-${bi}-${vi}-${pi}`,`${b} TIEPIDO CON ${v[0]} E ${p[0]}`,'Primi',[ing(b,70),ing(v[0],v[1]),ing(p[0],p[1]),oil()],prep+' '+v[2]+' '+p[2]+' Riunisci gli ingredienti e condisci con l’olio; servi tiepido.',7+v[3]);
}
for(let a=0;a<vegetables.length;a++)for(let b=a+1;b<vegetables.length;b++)for(const [pi,p]of ready.slice(1,4).entries()){
 const v=vegetables[a],w=vegetables[b];add(4,`v-${a}-${b}-${pi}`,`${v[0]} E ${w[0]} CON ${p[0]}`,'Contorni',[ing(v[0],100),ing(w[0],100),ing(p[0],80),oil()],v[2]+' '+w[2]+' '+p[2]+' Riunisci con i legumi e condisci con l’olio. Le verdure qui pesano 100 g ciascuna; puoi prepararle in parallelo.',v[3]+w[3]+3);
}
const fruits=[['MELA',120,'Lava e taglia la mela, eliminando torsolo e semi.'],['PERA',120,'Lava e taglia la pera, eliminando torsolo e semi.'],['FRAGOLE',150,'Lava e pulisci le fragole e tagliale.'],['MIRTILLI',100,'Usa mirtilli freschi lavati; se surgelati segui le istruzioni di preparazione e consumo della confezione.'],['PESCHE',120,'Lava la pesca, elimina il nocciolo e taglia la polpa.']];
for(const [fi,f]of fruits.entries())for(const [ni,n]of ['NOCI','MANDORLE','NOCCIOLE','PISTACCHI','ANACARDI'].entries())for(const [ci,c]of ['RICOTTA','YOGURT BIANCO'].entries()){
 add(5,`d-${fi}-${ni}-${ci}`,`COPPETTA DI ${c} CON ${f[0]} E ${n}`,'Dolci',[ing(c,100),ing(f[0],f[1]),ing(n,15),ing('CIOCCOLATO FONDENTE',10)],f[2]+' Lavora la ricotta con una forchetta, oppure versa lo yogurt nella coppetta. Distribuisci la frutta, la frutta secca spezzettata e il cioccolato tritato. Servi subito o conserva in frigorifero fino al consumo.',5);
}
const norm=s=>s.normalize('NFC').trim().toLocaleUpperCase('it-IT').replace(/\s+/g,' ');
const signature=r=>JSON.stringify(r.ingredients.map(i=>[norm(i.ingredient),i.qty,i.unit]).sort((a,b)=>a[0].localeCompare(b[0])));
const old=[...catalog101.values(),...ricetteEssenziali105,...riservaEssenziali105,...ricetteSemplici106];
const names=new Set([...old,...ricette109].map(r=>norm(r.name))),signatures=new Set([...old,...ricette109].map(signature));
const quotas=[100,150,50,100,50,47];
for(const [gi,group]of groups.entries()){
 const available=[],localNames=new Set(),localSignatures=new Set();
 for(const candidate of group){const r=candidate.recipe,n=norm(r.name),sig=signature(r);if(names.has(n)||signatures.has(sig)||localNames.has(n)||localSignatures.has(sig))continue;localNames.add(n);localSignatures.add(sig);available.push(candidate);}
 if(available.length<quotas[gi])throw Error('Catalogo 109 incompleto: '+gi);
 for(let i=0;i<quotas[gi];i++){const {recipe,minutes}=available[Math.floor(i*available.length/quotas[gi])];names.add(norm(recipe.name));signatures.add(signature(recipe));ricette109.push(recipe);effort109[recipe.id]={minutes,difficulty:'Facile'};}
}
export const CATALOG_109='spesapp-catalog-109';
export const catalog109=new Map(ricette109.map(r=>[r.id,r]));
