import {installZoomGuard} from './zoom-guard.mjs?v=120';
import {mountPortraitShell} from './portrait-shell.mjs?v=124';

installZoomGuard();

if(!mountPortraitShell()){
  try{
    await import('./app.mjs?v=140');
  }catch(error){
    console.error('Spesapp startup error',error);
    const root=document.querySelector('#app');
    const detail=String(error?.message||'Errore tecnico di avvio.').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    root.innerHTML='<section class="welcome"><div class="brandmark">S</div><h1>Spesapp</h1><p role="alert">Non è stato possibile aprire l’app. I tuoi dati non sono stati modificati.</p><p class="local-note">'+detail+'</p><button id="startup-retry">Riprova</button></section>';
    document.querySelector('#startup-retry')?.addEventListener('click',()=>location.reload());
    window.dispatchEvent(new Event('spesapp:ready'));
  }
}
