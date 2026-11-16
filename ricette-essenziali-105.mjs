// Release 105: immutable component tables and stable IDs. Single-portion recipes.
import {catalog101} from './recipe-catalog-101.mjs?v=105';
const grains=[
 ['PASTA','PASTA',80,'Lessa la pasta seguendo i tempi sulla confezione e scolala, tenendo poca acqua di cottura.',4],
 ['RISO','RISO',70,'Lessa il riso seguendo i tempi sulla confezione e scolalo.',4],
 ['COUS COUS','COUS COUS',70,'Reidrata il cous cous con acqua calda nelle proporzioni e per i tempi indicati sulla confezione, poi sgranalo con una forchetta.',3],
 ['FARRO','FARRO',70,'Risciacqua il farro e lessalo seguendo i tempi sulla confezione; scolalo quando è tenero. Puoi usare farro a cottura rapida, rispettando le istruzioni del prodotto.',4],
 ['ORZO','ORZO',70,'Risciacqua l’orzo e lessalo seguendo i tempi sulla confezione; scolalo quando è tenero. Puoi usare orzo a cottura rapida, rispettando le istruzioni del prodotto.',4]
];
const proteins=[
 ['TONNO SOTTOLIO','TONNO SOTTOLIO',60,'Scola il tonno già cotto sottolio e dividilo in pezzi.'],
 ['RICOTTA','RICOTTA',60,'Lavora la ricotta con poca acqua di cottura, poi incorporala fuori dal fuoco.'],
 ['MOZZARELLA','MOZZARELLA',60,'Scola e taglia la mozzarella a cubetti; uniscila alla fine, fuori dal fuoco.'],
 ['CECI PRONTI','CECI COTTI',100,'Scola e risciacqua i ceci già cotti. Non usare ceci secchi senza averli prima ammollati e cotti separatamente.'],
 ['PROSCIUTTO COTTO','PROSCIUTTO COTTO',60,'Taglia il prosciutto cotto a striscioline e aggiungilo alla fine.'],
 ['SGOMBRO AL NATURALE','SGOMBRO AL NATURALE',80,'Scola lo sgombro al naturale già cotto e dividilo delicatamente in pezzi.'],
 ['LENTICCHIE PRONTE','LENTICCHIE COTTE',120,'Scola e risciacqua le lenticchie già cotte; non sostituirle direttamente con lenticchie secche.']
];
const vegetables=[
 ['POMODORI','POMODORI',150,'Lava e taglia i pomodori; aggiungili alla fine senza cuocerli.',2],
 ['ZUCCHINE','ZUCCHINE',150,'Lava e taglia le zucchine a cubetti; cuocile in padella con poca acqua per circa 8-10 minuti, finché tenere.',5],
 ['SPINACI','SPINACI',150,'Lava gli spinaci e falli appassire in padella coperta con poca acqua per circa 5-8 minuti.',4],
 ['BROCCOLI','BROCCOLI',150,'Lava i broccoli, dividili in cimette e cuocili al vapore per circa 8-10 minuti, verificando che siano teneri.',4],
 ['PISELLI','PISELLI',100,'Cuoci i piselli freschi sgranati o surgelati in poca acqua seguendo i tempi del prodotto, finché teneri, poi scolali.',3],
 ['PEPERONI','PEPERONI',150,'Lava e pulisci i peperoni, tagliali a listarelle e cuocili in padella coperta con poca acqua per circa 12-15 minuti, finché teneri.',6],
 ['CAROTE','CAROTE',150,'Lava e pela le carote, tagliale a rondelle sottili e cuocile con poca acqua per circa 10-12 minuti, finché tenere.',4],
 ['ZUCCA','ZUCCA',150,'Pesa la polpa di zucca senza buccia e semi; tagliala a cubetti e cuocila coperta con poca acqua per circa 12-15 minuti, finché tenera.',5],
 ['PORRI','PORRI',100,'Pulisci e lava bene i porri, affettali sottilmente e stufali con poca acqua per circa 10-12 minuti.',5],
 ['MELANZANE','MELANZANE',150,'Lava e taglia le melanzane a piccoli cubetti; cuocile in padella coperta con poca acqua per circa 15-18 minuti, mescolando e verificando che siano ben cotte.',6],
 ['CAVOLFIORE','CAVOLFIORE',150,'Lava il cavolfiore, dividilo in piccole cimette e cuocilo al vapore per circa 10-12 minuti, finché tenero.',4],
 ['FINOCCHI','FINOCCHI',150,'Pulisci e lava i finocchi, affettali sottilmente e cuocili coperti con poca acqua per circa 10-12 minuti, finché teneri.',4]
];
const normalized=value=>String(value).normalize('NFC').trim().toLocaleUpperCase('it-IT').replace(/\s+/g,' ');
const signature=r=>JSON.stringify(r.ingredients.map(i=>[normalized(i.ingredient),Number(i.qty),i.unit]).sort((a,b)=>a[0].localeCompare(b[0])));
const names=new Set([...catalog101.values()].map(r=>normalized(r.name)));
const combinations=new Set([...catalog101.values()].map(signature));
const candidates105=[];
export const essentialMinutes105={};
for(const [gi,g] of grains.entries())for(const [pi,p] of proteins.entries())for(const [vi,v] of vegetables.entries()){
 const id=`essenziali-105-${gi}-${pi}-${vi}`,name=g[0]+' CON '+p[0]+' E '+v[0];
 const recipe={id,name,meal:'Primi',ingredients:[{ingredient:g[1],qty:g[2],unit:'g'},{ingredient:p[1],qty:p[2],unit:'g'},{ingredient:v[1],qty:v[2],unit:'g'},{ingredient:'OLIO EXTRAVERGINE DI OLIVA',qty:.005,unit:'l'}],instructions:g[3]+' '+v[3]+' '+p[3]+' Riunisci gli ingredienti, condisci con l’olio a crudo e servi. Dosi per una persona; acqua di cottura non conteggiata. Puoi cuocere cereale e verdura in parallelo.',source_title:'Ricette essenziali Spesapp'};
 const key=signature(recipe);if(names.has(name)||combinations.has(key))continue;
 names.add(name);combinations.add(key);candidates105.push(recipe);essentialMinutes105[id]=g[4]+v[4]+3;
}
export const ricetteEssenziali105=candidates105.slice(0,300);
// Used only to reach the target when a user has deleted older catalog entries.
export const riservaEssenziali105=candidates105.slice(300);
ricetteEssenziali105.push({id:'essenziali-105-colazione',name:'BICCHIERE DI YOGURT AVENA FRUTTI DI BOSCO E CACAO',meal:'Colazioni',ingredients:[{ingredient:'YOGURT GRECO',qty:170,unit:'g'},{ingredient:'FIOCCHI DI AVENA',qty:30,unit:'g'},{ingredient:'FRUTTI DI BOSCO',qty:100,unit:'g'},{ingredient:'CACAO AMARO',qty:5,unit:'g'}],instructions:'Usa frutti di bosco freschi lavati; se sono surgelati segui le istruzioni di preparazione e consumo della confezione. Mescola yogurt e avena, aggiungi i frutti e completa con il cacao. Dosi per una persona.',source_title:'Ricette essenziali Spesapp'});
essentialMinutes105['essenziali-105-colazione']=5;
