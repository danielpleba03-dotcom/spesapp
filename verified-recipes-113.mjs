import part0 from './verified-recipes-113-1.mjs?v=114';
import part1 from './verified-recipes-113-2.mjs?v=114';
import part2 from './verified-recipes-113-3.mjs?v=114';
import part3 from './verified-recipes-113-4.mjs?v=114';
// Immutable source-backed catalogue. Follow the linked recipe for its complete procedure.
export const recipes113=[...part0,...part1,...part2,...part3];
export const CATALOG_113="verified-20261117-113";
export const catalog113=new Map(recipes113.filter(r=>r.id.startsWith("fonte-113-")).map(r=>[r.id,r]));
export const verifiedSourceURLs=new Set(recipes113.map(r=>r.source_url));
