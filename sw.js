const VERSION='spesapp-2026-11-27-ricettario-v132';
// Cache the opening shell only; other resources are cached as the app uses them.
const CORE=['./','./initial-access.css?v=2','./initial-access.mjs?v=132','./bootstrap.mjs?v=132','./manifest.webmanifest','./icon.svg'];
const immutableCatalogue=url=>/\/(?:verified-recipes-[\d-]+|recipe-catalog-101|seed-recipes-101|catalogo-\d+|classic-recipes|classici-\d+|ricette-[\w-]+|piatti-[\w-]+)\.mjs$/.test(url.pathname)&&url.searchParams.has('v');
const timeoutFetch=request=>fetch(request,{cache:'no-store',signal:AbortSignal.timeout(8000)});

self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(VERSION);
 await Promise.all(CORE.map(async path=>{
  const request=new Request(new URL(path,self.registration.scope));
  const saved=new URL(request.url).searchParams.has('v')?await caches.match(request):null;
  if(saved)await cache.put(request,saved);else await cache.add(new Request(request,{cache:'reload'}));
 }));
 await self.skipWaiting();
})()));

self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const cache=await caches.open(VERSION),older=(await caches.keys()).filter(name=>name.startsWith('spesapp-')&&name!==VERSION);
 // Preserve immutable recipe data and requests made during installation.
 // One prior release remains available for already-open tabs.
 for(const name of older){
  const previous=await caches.open(name);
  for(const request of await previous.keys()){
   const url=new URL(request.url);
   if(url.origin===self.location.origin&&url.href.startsWith(self.registration.scope)&&(immutableCatalogue(url)||url.searchParams.get('v')==='122')){
    if(!await cache.match(request)){const response=await previous.match(request);if(response)try{await cache.put(request,response);}catch{/* Retain the usable older cache on quota pressure. */}}
   }
  }
 }
 for(const name of older.slice(0,-1))await caches.delete(name);
 await self.clients.claim();
})()));

// After the screen is usable, retain resources already used by this page.
// force-cache reuses the browser's HTTP cache on a first installation.
self.addEventListener('message',event=>{
 if(event.data?.type!=='CACHE_USED_RESOURCES'||!Array.isArray(event.data.urls))return;
 event.waitUntil((async()=>{
  const cache=await caches.open(VERSION),urls=[...new Set(event.data.urls)].slice(0,180);
  const pending=urls.filter(value=>{try{const url=new URL(value),sdk=url.origin==='https://www.gstatic.com'&&url.pathname.startsWith('/firebasejs/13.1.0/')&&url.pathname.endsWith('.js');return sdk||url.origin===self.location.origin&&url.href.startsWith(self.registration.scope)&&(/\.(?:mjs|js|css|html|png|svg|webmanifest)$/.test(url.pathname)||url.href===self.registration.scope);}catch{return false;}});
  let index=0;async function save(){while(index<pending.length){const url=pending[index++];if(await cache.match(url))continue;try{const saved=await caches.match(url),response=saved||await fetch(url,{cache:'force-cache'});if(response.ok)await cache.put(url,response);}catch{/* Missing optional resources can be fetched on the next online visit. */}}}
  await Promise.all([save(),save(),save()]);event.ports?.[0]?.postMessage({cached:true});
 })());
});

self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET')return;
 const sdk=url.origin==='https://www.gstatic.com'&&url.pathname.startsWith('/firebasejs/13.1.0/');
 const local=url.origin===self.location.origin&&url.href.startsWith(self.registration.scope);
 if(!local&&!sdk)return;
 // ES module graphs can contain many recipe chunks. Let the browser fetch modules
 // directly instead of aborting a slow individual module after a fixed timeout.
 if(local&&/\.mjs$/.test(url.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION),cached=await cache.match(event.request);
  if(sdk||url.searchParams.has('v')){const saved=cached||await caches.match(event.request);if(saved)return saved;}
  try{
   const response=await timeoutFetch(event.request);
   if(response.ok){event.waitUntil(cache.put(event.request,response.clone()).catch(()=>{}));return response;}
   if(response.status>=500&&cached)return cached;
   return response;
  }catch(error){
   const saved=cached||await caches.match(event.request);if(saved)return saved;
   if(event.request.mode==='navigate'){const shell=await cache.match(new URL('./',self.registration.scope));if(shell)return shell;}
   throw error;
  }
 })());
});

