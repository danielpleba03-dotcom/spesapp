import {installZoomGuard} from './zoom-guard.mjs?v=120';

installZoomGuard();

import {mountPortraitShell} from './portrait-shell.mjs?v=124';

if(!mountPortraitShell()){

try{await import('./app.mjs?v=129');}

catch(primaryError){console.warn('Spesapp Pages startup failed; using recovery source.',primaryError);try{await import('https://cdn.jsdelivr.net/gh/danielpleba03-dotcom/spesapp@9e89d543a40a2c4e4705a762f835f274960367c9/app.mjs');}catch(error){console.error('Spesapp startup error',error);const root=document.querySelector('#app');const detail=String(error?.message||primaryError?.message||'Errore tecnico di avvio.');root.innerHTML='<section class="welcome"><div class="brandmark">S</div><h1>Spesapp</h1><p role="alert">Non è stato possibile aprire l’app. I tuoi dati non sono stati modificati.</p><p class="local-note">'+detail.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</p><button id="startup-retry">Riprova</button></section>';document.querySelector('#startup-retry').addEventListener('click',()=>location.reload());window.dispatchEvent(new Event('spesapp:ready'));}}


}


