const VERSION='spesapp-2026-10-27-v1';
const LOCAL=['./','./index.html','./style.css','./app.mjs','./cloud.mjs','./domain.mjs','./firebase-config.mjs','./seed.json','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
const SDK=['firebase-app','firebase-auth','firebase-firestore'].map(name=>`https://www.gstatic.com/firebasejs/13.1.0/${name}.js`);
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(VERSION);await cache.addAll(LOCAL);await Promise.allSettled(SDK.map(url=>cache.add(url)));self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('spesapp-')&&name!==VERSION)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET')return;
 const local=url.origin===self.location.origin,sdk=url.origin==='https://www.gstatic.com'&&url.pathname.startsWith('/firebasejs/13.1.0/');
 if(!local&&!sdk)return;
 event.respondWith((async()=>{const cache=await caches.open(VERSION);
  if(sdk){const cached=await cache.match(event.request);if(cached)return cached;const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}
  try{const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}catch(error){const cached=await cache.match(event.request);if(cached)return cached;if(event.request.mode==='navigate')return cache.match('./index.html');throw error;}
 })());
});
