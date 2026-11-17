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
its existing rules; up to 3,500 complete recipes can be reconstructed in memory.
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
