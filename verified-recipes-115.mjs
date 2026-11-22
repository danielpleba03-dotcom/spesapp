import part1 from './verified-recipes-115-1.mjs?v=120';
import part2 from './verified-recipes-115-2.mjs?v=120';
// Immutable verified additions: do not edit published recipe definitions.
export const recipes115=[...part1,...part2];
export const CATALOG_115='verified-20261118-115';
export const catalog115=new Map(recipes115.map(r=>[r.id,r]));
export const verifiedSourceURLs115=new Set(recipes115.map(r=>r.source_url));
