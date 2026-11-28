const panel=document.querySelector('#initial-access');
const form=panel?.querySelector('form');
const feedback=document.querySelector('#access-feedback');
let revealed=false,watchdog;

function revealApplication(){
 if(revealed)return;
 revealed=true;
 clearTimeout(watchdog);
 panel?.remove();
 document.documentElement.classList.remove('access-locked');
 window.dispatchEvent(new Event('resize'));
 if(window.parent!==window)window.parent.postMessage({type:'spesapp:ready'},location.origin);
}
function showError(error){
 clearTimeout(watchdog);
 if(!panel)return;
 panel.dataset.mode='error';
 if(form)form.hidden=true;
 if(feedback)feedback.innerHTML='Non è stato possibile aprire Spesapp. <button type="button" id="startup-retry">Riprova</button>';
 document.querySelector('#startup-retry')?.addEventListener('click',()=>location.reload());
 console.error('Spesapp startup error',error);
}
window.addEventListener('spesapp:ready',revealApplication);
window.addEventListener('message',event=>{
 const frame=document.querySelector('iframe.portrait-frame');
 if(event.origin===location.origin&&frame&&event.source===frame.contentWindow&&event.data?.type==='spesapp:ready')revealApplication();
});

if(form)form.hidden=true;
if(panel)panel.dataset.mode='loading';
if(feedback)feedback.textContent='Apertura in corso…';
watchdog=setTimeout(()=>showError(Error('Tempo di avvio scaduto')),18000);

import('./bootstrap.mjs?v=141').catch(showError);
