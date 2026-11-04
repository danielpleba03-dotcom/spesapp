import {installZoomGuard} from './zoom-guard.mjs?v=20261104-calorie-extra';

installZoomGuard();

import {mountPortraitShell} from './portrait-shell.mjs?v=20261104-calorie-extra';

if(!mountPortraitShell()){

try{await import('./app.mjs?v=20261104-calorie-extra');}

catch{const root=document.querySelector('#app');root.innerHTML='<section class="welcome"><div class="brandmark">S</div><h1>Spesapp</h1><p role="alert">Non è stato possibile aprire l’app. Controlla la connessione e riprova. I tuoi dati non sono stati modificati.</p><button id="startup-retry">Riprova</button></section>';document.querySelector('#startup-retry').addEventListener('click',()=>location.reload());}


}

