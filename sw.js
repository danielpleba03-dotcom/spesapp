const VERSION='spesapp-2026-10-29-sharedunits-v7';
const MODULES=['bootstrap','app','cloud','domain','journal','ui','firebase-config'].map(n=>`./${n}.mjs?v=20261029-sharedunits`);
const LOCAL=['./','./index.html','./style.css?v=20261029-sharedunits',...MODULES,'./seed.json','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
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
