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
its existing rules; up to 2,000 complete recipes can be reconstructed in memory.
The byte limit remains checked against the actual stored representation, including
Firestore's document size estimate. No Firebase rules were relaxed.

Release 100 and earlier cannot decode catalog blocks. Refresh all open app clients
after deploying release 101. Old clients cannot validate the new document and
therefore cannot overwrite it; their pending journal entries can be retried by
the updated client. Offline support must precache every catalog dependency.
