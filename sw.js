const VERSION='spesapp-2026-11-22-ricettario-5000-v120';

const MODULES=['verified-recipes-120','verified-recipes-120-1','verified-recipes-120-2','verified-recipes-120-3','verified-recipes-120-4','verified-recipes-120-5','verified-recipes-120-6','verified-recipes-120-7','verified-recipes-120-8','verified-recipes-120-9','verified-recipes-120-10','verified-recipes-120-11','verified-recipes-120-12','verified-recipes-120-13','verified-recipes-120-14','verified-recipes-119','verified-recipes-119-1','verified-recipes-119-2','verified-recipes-119-3','verified-recipes-119-4','verified-recipes-119-5','verified-recipes-119-6','catalog-viewport','verified-recipes-116','verified-recipes-116-1','verified-recipes-116-2','verified-recipes-116-3','verified-recipes-115','verified-recipes-115-1','verified-recipes-115-2','verified-recipes-114','verified-recipes-113-1','verified-recipes-113-2','verified-recipes-113-3','verified-recipes-113-4','verified-recipes-113','cooking-domain','cooking-ui','bootstrap','zoom-guard','app','cloud','domain','week-domain','week-store','week-ui','shopping-resolution-ui','shopping-suggestions','recipe-omissions','piatti-rapidi-100','piatti-semplici-101','ricette-essenziali-105','ricette-semplici-106','ricette-109','classici-110','ricette-110','ricette-111','cooking-methods','seed-recipes-101','recipe-catalog-101','recipe-calories','recipe-additions','catalogo-71','catalogo-72','catalogo-89','ricette-facili-93','ricette-facili-94','classic-recipes','journal','ui','select-menu','suggestions','portrait-shell','firebase-config'].map(n=>`./${n}.mjs?v=120`);

const LOCAL=['./initial-access.css?v=1','./initial-access.mjs?v=120','./','./index.html','./workspace.css?v=120','./style.css?v=20261104-calorie-settimana',...MODULES,'./seed.json','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];

const SDK=['firebase-app','firebase-auth','firebase-firestore'].map(n=>`https://www.gstatic.com/firebasejs/13.1.0/${n}.js`);

const timeoutFetch=request=>fetch(request,{cache:'no-store',signal:AbortSignal.timeout(8000)});

self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(VERSION);await cache.addAll(LOCAL.map(url=>new Request(url,{cache:'reload'})));await Promise.allSettled(SDK.map(url=>cache.add(url)));await self.skipWaiting();})()));

self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('spesapp-')&&name!==VERSION)await caches.delete(name);await self.clients.claim();})()));

self.addEventListener('fetch',event=>{

 const url=new URL(event.request.url);if(event.request.method!=='GET')return;

 const sdk=url.origin==='https://www.gstatic.com'&&url.pathname.startsWith('/firebasejs/13.1.0/');

 const local=url.origin===self.location.origin&&url.pathname.startsWith(self.registration.scope.replace(self.location.origin,''));

 if(!local&&!sdk)return;

 event.respondWith((async()=>{

  const cache=await caches.open(VERSION),cached=await cache.match(event.request);

  // Versioned files are immutable within a release; old open tabs may still request their own release.

  if((sdk||url.searchParams.has('v'))&&cached)return cached;

  try{

   const response=await timeoutFetch(event.request);

   if(response.ok){try{await cache.put(event.request,response.clone());}catch{/* Cache quota must never prevent an online response. */}return response;}

   if(response.status>=500&&cached)return cached;

   return response;

  }catch(error){

   if(cached)return cached;

   if(event.request.mode==='navigate'){const shell=await cache.match('./index.html');if(shell)return shell;}

   throw error;

  }

 })());

});



