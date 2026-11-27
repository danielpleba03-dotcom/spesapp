// Load the 5,000-recipe catalogue after authentication, not in the opening module graph.
export const CATALOG_VERSION='spesapp-catalog-101',CATALOG_106='spesapp-catalog-106',CATALOG_109='spesapp-catalog-109',CATALOG_110='spesapp-catalog-110',CATALOG_111='spesapp-catalog-111',CATALOG_113='verified-20261117-113',CATALOG_114='verified-20261117-114',CATALOG_115='verified-20261118-115',CATALOG_116='verified-20261119-116',CATALOG_119='verified-20261122-119',CATALOG_120='verified-20261122-120',CATALOG_125='curated-20261126-125';
export const catalog101=new Map(),catalog106=new Map(),catalog109=new Map(),catalog110=new Map(),catalog111=new Map(),catalog113=new Map(),catalog114=new Map(),catalog115=new Map(),catalog116=new Map(),catalog119=new Map(),catalog120=new Map(),catalog125=new Map();
export const verifiedSourceURLs=new Set(),verifiedSourceURLs114=new Set(),verifiedSourceURLs115=new Set(),verifiedSourceURLs116=new Set(),verifiedSourceURLs119=new Set(),verifiedSourceURLs120=new Set();
let loading;
const copy=(target,source)=>{for(const [id,recipe] of source)target.set(id,recipe);};
const urls=(target,source)=>{for(const value of source)target.add(value);};
export function ensureCatalogs(){
 if(loading)return loading;
 loading=(async()=>{
  const [a,b,c,d,e,f,g,h,i,j,k,l]=await Promise.all([
   import('./recipe-catalog-101.mjs?v=120'),import('./ricette-semplici-106.mjs?v=120'),import('./ricette-109.mjs?v=120'),import('./ricette-110.mjs?v=120'),import('./ricette-111.mjs?v=120'),import('./verified-recipes-113.mjs?v=120'),import('./verified-recipes-114.mjs?v=120'),import('./verified-recipes-115.mjs?v=120'),import('./verified-recipes-116.mjs?v=120'),import('./verified-recipes-119.mjs?v=120'),import('./verified-recipes-120.mjs?v=120'),import('./curated-recipes-125.mjs?v=125')
  ]);
  copy(catalog101,a.catalog101);copy(catalog106,b.catalog106);copy(catalog109,c.catalog109);copy(catalog110,d.catalog110);copy(catalog111,e.catalog111);copy(catalog113,f.catalog113);copy(catalog114,g.catalog114);copy(catalog115,h.catalog115);copy(catalog116,i.catalog116);copy(catalog119,j.catalog119);copy(catalog120,k.catalog120);copy(catalog125,l.catalog125);
  urls(verifiedSourceURLs,f.verifiedSourceURLs);urls(verifiedSourceURLs114,g.verifiedSourceURLs114);urls(verifiedSourceURLs115,h.verifiedSourceURLs115);urls(verifiedSourceURLs116,i.verifiedSourceURLs116);urls(verifiedSourceURLs119,j.verifiedSourceURLs119);urls(verifiedSourceURLs120,k.verifiedSourceURLs120);
 })();
 return loading;
}