// Immutable catalog version used to restore compact references in saved archives.
// Never edit these data files after release; edited user recipes stay stored in full.
import {seedRecipes101} from './seed-recipes-101.mjs?v=116';
import {catalogo71} from './catalogo-71.mjs?v=116';
import {catalogo72} from './catalogo-72.mjs?v=116';
import {catalogo89} from './catalogo-89.mjs?v=116';
import {ricetteFacili93} from './ricette-facili-93.mjs?v=116';
import {ricetteFacili94} from './ricette-facili-94.mjs?v=116';
import {piattiRapidi100} from './piatti-rapidi-100.mjs?v=116';
import {piattiSemplici101} from './piatti-semplici-101.mjs?v=116';
export const CATALOG_VERSION='spesapp-catalog-101';
export const catalog101=new Map([...seedRecipes101,...catalogo71,...catalogo72,...catalogo89,...ricetteFacili93,...ricetteFacili94,...piattiRapidi100,...piattiSemplici101].map(recipe=>[recipe.id,recipe]));
