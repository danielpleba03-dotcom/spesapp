// Immutable catalog 101: 500 complete single-portion plates.
// Do not change the component order or recipes after publishing: saved catalog IDs depend on them.
const proteins = [
 [
  "ROAST BEEF PRONTO",
  "ROAST BEEF COTTO",
  100,
  "g",
  "Disponi il roast beef già cotto e affettato sul piatto.",
  3
 ],
 [
  "BRESAOLA",
  "BRESAOLA",
  80,
  "g",
  "Disponi la bresaola pronta da consumare sul piatto.",
  3
 ],
 [
  "PROSCIUTTO COTTO",
  "PROSCIUTTO COTTO",
  100,
  "g",
  "Disponi il prosciutto cotto affettato sul piatto.",
  3
 ],
 [
  "FESA DI TACCHINO AFFETTATA",
  "FESA DI TACCHINO AFFETTATA",
  100,
  "g",
  "Usa fesa di tacchino affettata già cotta, pronta da consumare.",
  3
 ],
 [
  "TONNO AL NATURALE",
  "TONNO AL NATURALE",
  100,
  "g",
  "Scola il tonno già cotto al naturale.",
  3
 ],
 [
  "SGOMBRO AL NATURALE",
  "SGOMBRO AL NATURALE",
  100,
  "g",
  "Scola lo sgombro già cotto al naturale.",
  3
 ],
 [
  "MOZZARELLA",
  "MOZZARELLA",
  100,
  "g",
  "Scola e taglia la mozzarella.",
  3
 ],
 [
  "RICOTTA",
  "RICOTTA",
  120,
  "g",
  "Disponi la ricotta fresca sul piatto.",
  3
 ],
 [
  "CANNELLINI PRONTI",
  "FAGIOLI CANNELLINI COTTI",
  180,
  "g",
  "Scola e risciacqua i cannellini già cotti: non usare legumi secchi al loro posto.",
  3
 ],
 [
  "UOVA SODE",
  "UOVA",
  2,
  "pz",
  "Cuoci le uova per circa 9-10 minuti dal bollore; raffreddale, sgusciale e tagliale.",
  5
 ]
];
const carbs = [
 [
  "PANE",
  "PANE",
  60,
  "Servi con il pane.",
  1
 ],
 [
  "PANE DI SEGALE",
  "PANE DI SEGALE",
  60,
  "Servi con il pane di segale.",
  1
 ],
 [
  "PATATE LESSE",
  "PATATE",
  200,
  "Pela e taglia le patate a cubetti; lessale per circa 12-15 minuti, verificando che siano tenere, quindi scolale.",
  5
 ],
 [
  "COUS COUS",
  "COUS COUS",
  70,
  "Reidrata il cous cous con acqua calda seguendo la quantità di acqua e i tempi sulla confezione; sgranalo con una forchetta.",
  3
 ],
 [
  "RISO",
  "RISO",
  70,
  "Lessa il riso seguendo i tempi indicati sulla confezione e scolalo. Servilo appena pronto.",
  3
 ]
];
const vegetables = [
 [
  "POMODORI",
  "POMODORI",
  150,
  "Lava e taglia i pomodori.",
  2
 ],
 [
  "CETRIOLI",
  "CETRIOLI",
  150,
  "Lava e affetta i cetrioli.",
  2
 ],
 [
  "RUCOLA",
  "RUCOLA",
  50,
  "Lava e asciuga bene la rucola.",
  2
 ],
 [
  "CAROTE CRUDE",
  "CAROTE",
  150,
  "Lava, pela e grattugia le carote.",
  3
 ],
 [
  "FINOCCHI CRUDI",
  "FINOCCHI",
  150,
  "Pulisci e affetta sottilmente i finocchi, poi lavali.",
  3
 ],
 [
  "ZUCCHINE IN PADELLA",
  "ZUCCHINE",
  150,
  "Lava e taglia le zucchine a cubetti; cuocile in padella antiaderente con poca acqua per circa 8-10 minuti, finché tenere.",
  5
 ],
 [
  "SPINACI IN PADELLA",
  "SPINACI",
  150,
  "Lava gli spinaci e falli appassire in padella coperta con poca acqua per circa 5-8 minuti.",
  4
 ],
 [
  "PEPERONI IN PADELLA",
  "PEPERONI",
  150,
  "Lava i peperoni, elimina semi e filamenti e tagliali a listarelle; cuoci con poca acqua in padella coperta per circa 12-15 minuti, finché teneri.",
  6
 ],
 [
  "MELANZANE A CUBETTI",
  "MELANZANE",
  150,
  "Lava e taglia le melanzane a cubetti piccoli; cuocile in padella coperta con poca acqua per circa 15-18 minuti, mescolando e verificando che siano morbide e ben cotte.",
  6
 ],
 [
  "BROCCOLI AL VAPORE",
  "BROCCOLI",
  150,
  "Lava i broccoli, dividili in piccole cimette e cuocili al vapore per circa 8-10 minuti, verificando che siano teneri.",
  4
 ]
];
export const piattiSemplici101=[];
export const simpleMealMinutes101={};
for(const [pi,p] of proteins.entries())for(const [ci,c] of carbs.entries())for(const [vi,v] of vegetables.entries()){
 const id=`semplici-101-${pi}-${ci}-${vi}`;
 let name=p[0]+' CON '+v[0]+' E '+c[0];
 const ingredients=[{ingredient:p[1],qty:p[2],unit:p[3]},{ingredient:c[1],qty:c[2],unit:'g'},{ingredient:v[1],qty:v[2],unit:'g'},{ingredient:'OLIO EXTRAVERGINE DI OLIVA',qty:.005,unit:'l'}];
 let instructions=c[3]+' '+v[3]+' '+p[4]+' Condisci con l’olio a crudo e riunisci nel piatto. Dosi per una persona; acqua di cottura non conteggiata. Puoi preparare le componenti in parallelo.';
 let minutes=Math.min(20,p[5]+c[4]+v[4]);
 // Avoid two plates already present in catalog 100; these include a real extra component.
 if(pi===0&&ci===0&&vi===0){name='ROAST BEEF PRONTO CON POMODORI CETRIOLI E PANE';ingredients.push({ingredient:'CETRIOLI',qty:100,unit:'g'});instructions='Lava e affetta anche i cetrioli. '+instructions;minutes+=2;}
 if(pi===1&&ci===0&&vi===2){name='BRESAOLA CON RICOTTA RUCOLA E PANE';ingredients.push({ingredient:'RICOTTA',qty:50,unit:'g'});instructions='Disponi la ricotta fresca accanto alla bresaola. '+instructions;minutes++;}
 piattiSemplici101.push({id,name,meal:'Secondi',ingredients,instructions,source_title:'Piatti semplici Spesapp'});
 simpleMealMinutes101[id]=minutes;
}
