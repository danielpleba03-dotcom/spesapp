const maintenance=()=>/iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent)||matchMedia('(max-width:650px)').matches;
try{await import('./app.mjs?v=20261028-quality');}
catch{
 const root=document.querySelector('#app');
 if(maintenance()){root.innerHTML='<main class="welcome" aria-label="Manutenzione"><div class="brandmark" aria-hidden="true">S</div><h1 style="font-size:1.4rem;line-height:1.5">App da telefono in manutenzione</h1></main>';}
 else{root.innerHTML='<section class="welcome"><div class="brandmark">S</div><h1>Spesapp</h1><p role="alert">Non è stato possibile aprire l’app. Controlla la connessione e riprova. I tuoi dati non sono stati modificati.</p><button id="startup-retry">Riprova</button></section>';document.querySelector('#startup-retry').addEventListener('click',()=>location.reload());}
}
