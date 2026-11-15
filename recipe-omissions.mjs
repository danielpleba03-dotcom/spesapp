// Reviewed recipe-specific finishing ingredients. No generic "small amount" rule.
// The ingredient signature invalidates the review when a user edits the recipe.
const reviewed=[
 {id:'classic-20261102-1',name:'PASTA E CECI',url:'https://www.cucchiaio.it/ricetta/pasta-e-ceci/',
  ingredients:[['PASTA',80,'g'],['CECI SECCHI',100,'g'],['CAROTE',25,'g'],['SEDANO',20,'g'],['CIPOLLE',30,'g'],['ROSMARINO',.5,'g'],['AGLIO',.75,'g'],['OLIO EXTRAVERGINE DI OLIVA',.01,'l'],['SALE FINO',1,'g'],['PEPE NERO',.1,'g'],['PREZZEMOLO',1,'g'],['ACQUA',.3,'l']],
  optional:['PREZZEMOLO'],reason:'È la guarnizione aggiunta a fine cottura: senza, cambia l’aroma ma non la preparazione.'},
 {id:'pasta-ricotta',name:'PASTA E RICOTTA',url:'https://blog.giallozafferano.it/notadolce/pasta-e-ricotta-ricetta/',
  ingredients:[['PASTA',80,'g'],['RICOTTA',30,'g'],['OLIO EXTRAVERGINE DI OLIVA',.0075,'l'],['SALE FINO',.5,'g'],['PEPE NERO',.1,'g'],['PREZZEMOLO',1,'g']],
  optional:['PREZZEMOLO'],reason:'La fonte usa un’erba aromatica a piacere per profumare: la crema resta a base di ricotta e olio.'}
];
const signature=items=>JSON.stringify(items.map(i=>Array.isArray(i)?i:[i.ingredient,i.qty,i.unit]).sort((a,b)=>a[0].localeCompare(b[0])));
export function omissionOption(recipe,ingredient,unit){
 const rule=reviewed.find(r=>r.id===recipe.id&&r.name===recipe.name&&r.url===recipe.source_url&&r.optional.includes(ingredient));
 if(!rule||String(recipe.instructions||'').trim()||unit!=='g'||signature(recipe.ingredients)!==signature(rule.ingredients))return null;
 return {ingredient,unit,reason:rule.reason,source:rule.url};
}
