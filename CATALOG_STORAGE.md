# Catalog references, release 101

Runtime state always contains complete validated recipes. `stateForStorage` may
replace consecutive unchanged catalog recipes with a block containing `catalog`,
ordered `ids`, and optional per-user `favorites` flags. `validateState` and
`validateImport` expand these blocks before normal recipe validation.

`recipe-catalog-101.mjs` and its recipe data dependencies are immutable. Never
change or remove recipes from those data files after publishing this release:
saved data and daily backups depend on their exact content. Publish future catalog
changes under a new version while retaining the old resolver. Changing query-string
cache versions does not change the persisted catalog version.

Recipes edited by the user no longer match the catalog signature and are saved in
full. Deleted catalog recipes are omitted from the ID list. Order, favorite true,
favorite false, absent favorite flags, custom recipes, and counts are preserved.
Storage compaction does not change pantry, shopping, preparation history, or the
weekly plan. Unknown references fail closed instead of dropping user data.

The database still receives at most 1,200 recipe rows and 1,200 count keys, below
its existing rules; up to 5,500 complete recipes can be reconstructed in memory.
The byte limit remains checked against the actual stored representation, including
Firestore's document size estimate. No Firebase rules were relaxed.

Release 100 and earlier cannot decode catalog blocks. Refresh all open app clients
after deploying release 101. Old clients cannot validate the new document and
therefore cannot overwrite it; their pending journal entries can be retried by
the updated client. Offline support must precache every catalog dependency.

Release 105 adds 301 recipes stored in full. Automatic imports stop at 2,000
recipes; the additional in-memory capacity remains available for user recipes.

Release 106 adds 500 simple recipes (2,500 standard total). Immutable catalog-106 references keep these recipes compact; catalog-101 references and release-105 full recipes remain readable. User edits are stored in full and favorites remain per user. The automatic importer stops at 2,500; personal recipes have headroom up to 3,000, subject to the existing byte and custom-row limits.

Release 109 adds 500 recipes, including single-portion classics with verified sources. Catalog-109 references coexist with 101 and 106. Automatic imports stop at 3,000, with capacity for personal recipes up to 3,500 under existing byte and custom-row limits. Prior catalog data remains immutable.

Release 110 adds 42 Italian classics and 83 simple dishes, reusing equivalent existing dishes for cooking alternatives instead of duplicating cards. Catalog-110 references and all prior resolvers remain available. The automatic target is 3,000 plus the immutable release-110 additions. Cooking methods are a derived presentation layer, used only for unchanged catalog recipes; personal edits retain their own instructions. Six unchanged legacy honey recipes are safely converted to the existing litre convention with an expected-version check, preserving stock, shopping, favorites and history.

Release 111 adds 1,875 simple everyday recipes, taking the standard catalog to 5,000. Ingredient-set deduplication ignores portion differences, and oven/air-fryer/pan alternatives remain methods within one card. An immutable catalog-111 resolver packs the new recipes into references; 200 additional candidates fill gaps left by deleted entries without restoring deletions. Existing byte limits, recipe-row limits, private data and all old catalog resolvers are retained.


## Verified external catalogue (release 113)

The release-113 bank has 1,054 distinct recipes and distinct external procedure URLs, checked on 2026-11-17. Verification requires a readable Recipe procedure (structured steps or the page’s explicit PROCEDIMENTO section); selected classic sources were also checked with the web reader. Broken, blocked/unverified, search-only and missing-procedure pages are excluded. Source facts are split into four immutable modules; full publisher procedures are followed on the linked website, not copied into the new catalogue. Quantities are adapted to one serving; q.b. seasonings and whole-food weights are indicative. Ambiguous portions, unsupported quantities and incompatible piece fractions are excluded.

The fixed, idempotent saveRecipe migration release-20261117-verified-sources-113 removes unverified built-in combinations and installs the verified bank atomically, preserving source-backed favourites, pantry, shopping and preparation counts/history. User-edited verified definitions are retained. Conflicts with current stock units are skipped rather than silently converted. Personal definitions remain recoverable; only linked recipes are exposed. Legacy immutable catalogues remain loaded for decoding existing compact backups/history. They must not be edited or automatically imported again. New manual recipe saves require an external source URL; the manual author must supply the matching procedure.

The new compact reference version covers newly introduced IDs only. Old IDs retain their original immutable definitions. Offline caches include all four source modules. Source availability can change after the verification date.


## Verified additions (release 114)

Adds 70 distinct external-source recipes (33 Italian classics and 37 simple dishes), for a seeded total of 1,124. Classic sources were checked with the web reader for the specific Come preparare section; simpler Cucchiaio pages were checked for Recipe steps or the explicit HTML PROCEDIMENTO section. Existing canonical definitions and source records remain immutable. The new compact reference covers only fonte-114 IDs; the classic IDs still resolve through their original catalogue. New sources extend the verified URL registry.

The application adds only this new bank in idempotent batches of at most 40, preserving existing definitions, favourites, stocks, counts and previous deletions. It does not reinstall the old 1,054-entry bank. Source, name and ID duplicates are skipped, as are conflicts with active stock units or nonfood products. Pending operations block the next batch. A per-session request set prevents repeated dispatch when old acknowledgement IDs have been trimmed. Fresh accounts seed the combined source-backed bank.


## Current active catalogue: 1,500 recipes (release 115)

Adds 376 source-backed recipes, bringing the seeded total from 1,124 to 1,500: 160 primi, 113 secondi, 93 contorni and 10 dolci in the new bank. Every added URL was checked on 2026-11-18 for a successful response, recipe identity, ingredients, yield and a preparation section. Sources are Lo Spicchio d’Aglio (373) and Il Cucchiaio d’Argento (3). New publisher procedures are linked, not copied. Source per-serving calories are retained where supplied. Serving and unit checks reject incompatible fractional pieces or ambiguous quantities; weights for whole vegetables and q.b. seasonings remain indicative as stated in the UI.

Names are compared after punctuation, preposition and pasta-format normalization, with additional core-ingredient deduplication for pasta, risotto, frittata, caprese and polenta. Existing definitions are never modified to fill a quota. Outdoor-barbecue, microwave and pressure-cooker additions are excluded. Existing source-backed cards, favourites, quantities, preparation history and saved weeks are retained.

The new immutable bank is split into two fact modules and a version-115 registry. Compact references keep the test archive near 60 KB (6 recipe rows). The app resumes the release-114 and release-115 import banks independently, using stable action IDs and batches of at most 40; it does not restore deleted old catalogue entries. Tests cover replay, interruption/resumption, source audits, unit consistency, storage round trips, week generation, PC/mobile recipe links and rapid shopping actions.
