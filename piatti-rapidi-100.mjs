// Single portions; ready meats and canned legumes are explicitly already cooked.
const dish=(id,name,items,instructions,minutes)=>({id:'rapidi-100-'+id,name,meal:'Secondi',ingredients:items.map(([ingredient,qty,unit='g'])=>({ingredient,qty,unit})),instructions,source_title:'Piatti rapidi Spesapp'});
export const piattiRapidi100=[
 dish('roast-pomodori','ROAST BEEF PRONTO CON POMODORI E PANE',[['ROAST BEEF COTTO',100],['POMODORI',150],['PANE',60],['OLIO EXTRAVERGINE DI OLIVA',.005,'l']],'Disponi il roast beef già cotto e affettato sul piatto. Lava e taglia i pomodori, condiscili con olio e accompagna con il pane.',5),
 dish('roast-cetrioli','ROAST BEEF PRONTO CON CETRIOLI E RICOTTA',[['ROAST BEEF COTTO',100],['CETRIOLI',150],['RICOTTA',60]],'Lava e affetta i cetrioli. Servili con roast beef già cotto e affettato e ricotta fresca.',5),
 dish('bresaola-ricotta','BRESAOLA CON RICOTTA E POMODORI',[['BRESAOLA',80],['RICOTTA',60],['POMODORI',150]],'Lava e taglia i pomodori. Disponi la bresaola sul piatto e aggiungi ricotta e pomodori.',5),
 dish('bresaola-pane','BRESAOLA CON RUCOLA E PANE',[['BRESAOLA',80],['RUCOLA',40],['PANE',70],['OLIO EXTRAVERGINE DI OLIVA',.005,'l']],'Lava e asciuga la rucola. Servi la bresaola con rucola e pane, condendo con olio.',5),
 dish('uova-pomodori','UOVA STRAPAZZATE CON POMODORI E PANE',[['UOVA',2,'pz'],['POMODORI',150],['PANE',60],['OLIO EXTRAVERGINE DI OLIVA',.005,'l']],'Lava e taglia i pomodori. Scalda l’olio in padella, aggiungi le uova sbattute e mescola fino a completa cottura. Servi con pomodori e pane.',10),
 dish('uova-spinaci','UOVA IN PADELLA CON SPINACI E RICOTTA',[['UOVA',2,'pz'],['SPINACI',150],['RICOTTA',50],['OLIO EXTRAVERGINE DI OLIVA',.005,'l']],'Lava gli spinaci e falli appassire in padella con poca acqua. Aggiungi olio e uova, mescolando fino a completa cottura; incorpora la ricotta alla fine.',15),
 dish('insalatona-uova','INSALATONA DI UOVA SODE POMODORI E CANNELLINI',[['UOVA',2,'pz'],['POMODORI',150],['FAGIOLI CANNELLINI COTTI',100],['OLIO EXTRAVERGINE DI OLIVA',.005,'l']],'Cuoci le uova in acqua per circa 9-10 minuti dal bollore. Raffreddale, sgusciale e tagliale. Unisci pomodori lavati e tagliati e cannellini già cotti, scolati e risciacquati. Condisci con olio.',15),
 dish('insalatona-mozzarella','INSALATONA DI MOZZARELLA CANNELLINI E RUCOLA',[['MOZZARELLA',100],['FAGIOLI CANNELLINI COTTI',100],['RUCOLA',40],['POMODORI',150]],'Lava rucola e pomodori. Scola e risciacqua i cannellini già cotti, taglia la mozzarella e riunisci tutti gli ingredienti.',5),
 dish('insalatona-tonno','INSALATONA DI TONNO CETRIOLI E POMODORI',[['TONNO SOTTOLIO',80],['CETRIOLI',150],['POMODORI',150],['PANE',60]],'Scola il tonno già cotto sottolio. Lava e taglia cetrioli e pomodori, uniscili al tonno e accompagna con pane.',5),
 dish('ricotta-pomodori','RICOTTA CON POMODORI RUCOLA E PANE',[['RICOTTA',120],['POMODORI',150],['RUCOLA',30],['PANE',70]],'Lava rucola e pomodori e taglia questi ultimi. Servi con la ricotta fresca e il pane.',5)
];
export const quickMealMinutes100={
 'roast-pomodori':5,'roast-cetrioli':5,'bresaola-ricotta':5,'bresaola-pane':5,
 'uova-pomodori':10,'uova-spinaci':15,'insalatona-uova':15,'insalatona-mozzarella':5,'insalatona-tonno':5,'ricotta-pomodori':5
};
