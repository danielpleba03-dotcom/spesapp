const APP_CONFIG = {"name": "Spesapp", "key": "spesapp:initial-access:v1", "digest": "7a5309f6c62da7fe49b499290ac1f47b3ac141312b7da06d2039e598e0affca3", "entry": "./bootstrap.mjs?v=136", "numeric": true};

const { name, key, digest, entry, numeric } = APP_CONFIG;
const form = document.querySelector('#initial-access form');
const input = form.elements.accessCode;
const feedback = document.querySelector('#access-feedback');
const button = form.querySelector('button');
const panel = form.closest('main');

if (numeric) input.inputMode = 'numeric';
panel.dataset.mode = 'entry';
form.hidden = false;
feedback.textContent = '';

// A previous service worker cached a partial module graph on some installed
// copies of the app. Do a one-time clean start before loading any module.
const cleanStart = new URLSearchParams(location.search).get('cleanStart') === '1';
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(async registrations => {
    if (!cleanStart && registrations.length) {
      await Promise.all(registrations.map(registration => registration.unregister()));
      try { await caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('spesapp-')).map(key => caches.delete(key)))); } catch {}
      const url = new URL(location.href);
      url.searchParams.set('cleanStart', '1');
      location.replace(url.href);
      return;
    }
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {});
  }).catch(() => {});
}

let appVisible=false,accessAuthorized=false;
function revealApplication(){
 if(appVisible||!accessAuthorized)return;appVisible=true;
 panel.remove();document.documentElement.classList.remove('access-locked');
 // Apply final phone geometry before the first visible application frame.
 window.dispatchEvent(new Event('resize'));
 if(window.parent!==window)window.parent.postMessage({type:'spesapp:ready'},location.origin);
}
window.addEventListener('spesapp:ready',revealApplication);
window.addEventListener('message',event=>{
 const frame=document.querySelector('iframe.portrait-frame');
 if(event.origin===location.origin&&frame&&event.source===frame.contentWindow&&event.data?.type==='spesapp:ready')revealApplication();
});

async function openApp() {
  button.disabled = true;
  try {
    await import(entry);
    // The app signals readiness after its first usable page, not just module loading.
  } catch (error) {
    console.error(error);
    panel.dataset.mode = 'error';
    form.hidden = true;
    feedback.textContent = 'Impossibile aprire ' + name + '. Ricarica la pagina per riprovare.';
    const retry=document.createElement('button');retry.type='button';retry.textContent='Riprova';retry.addEventListener('click',()=>location.reload());feedback.after(retry);
  }
}

let unlocked = false;
try {
  unlocked = localStorage.getItem(key) === digest;
} catch {
  // A browser that blocks storage can still unlock the current session.
}

// A phone's same-origin portrait context shares the already verified tab session.
// This avoids asking for the code again if storage is unavailable in that context.
if(!unlocked&&window.parent!==window)try{
 unlocked=window.parent.location.origin===location.origin&&window.parent.document.documentElement.dataset.spesappAccess===digest;
}catch{}

if (unlocked) {
  accessAuthorized = true;
  document.documentElement.dataset.spesappAccess = digest;
  panel.dataset.mode = 'loading';
  form.hidden = true;
  feedback.textContent = 'Apertura in corso…';
  void runtimePrepared.then(openApp);
} else {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    button.disabled = true;
    feedback.textContent = '';
    let matches;
    try {
      const bytes = new TextEncoder().encode(key + ':' + input.value.trim());
      const hash = await crypto.subtle.digest('SHA-256', bytes);
      const hex = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
      matches = hex === digest;
    } catch {
      feedback.textContent = 'Verifica del codice non disponibile. Ricarica la pagina e riprova.';
      button.disabled = false;
      return;
    }
    if (!matches) {
      feedback.textContent = 'Codice errato. Riprova.';
      button.disabled = false;
      input.focus();
      input.select();
      return;
    }
    try {
      localStorage.setItem(key, digest);
    } catch {
      // Storage is optional for the current session.
    }
    input.value = '';
    accessAuthorized = true;
    document.documentElement.dataset.spesappAccess = digest;
    panel.dataset.mode = 'loading';
    form.hidden = true;
    feedback.textContent = 'Apertura in corso…';
    await runtimePrepared;
    await openApp();
  });
}


