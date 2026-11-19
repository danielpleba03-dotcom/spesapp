const APP_CONFIG = {"name": "Spesapp", "key": "spesapp:initial-access:v1", "digest": "7a5309f6c62da7fe49b499290ac1f47b3ac141312b7da06d2039e598e0affca3", "entry": "./bootstrap.mjs?v=117", "numeric": true};

const { name, key, digest, entry, numeric } = APP_CONFIG;
const form = document.querySelector('#initial-access form');
const input = form.elements.accessCode;
const feedback = document.querySelector('#access-feedback');
const button = form.querySelector('button');
const panel = form.closest('main');

if (numeric) input.inputMode = 'numeric';
form.hidden = false;
feedback.textContent = '';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {});
}

async function openApp() {
  button.disabled = true;
  try {
    await import(entry);
    panel.remove();
    document.documentElement.classList.remove('access-locked');
  } catch (error) {
    console.error(error);
    form.hidden = true;
    feedback.textContent = 'Impossibile aprire ' + name + '. Ricarica la pagina per riprovare.';
  }
}

let unlocked = false;
try {
  unlocked = localStorage.getItem(key) === digest;
} catch {
  // A browser that blocks storage can still unlock the current session.
}

if (unlocked) {
  form.hidden = true;
  feedback.textContent = 'Apertura in corso…';
  void openApp();
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
    form.hidden = true;
    feedback.textContent = 'Apertura in corso…';
    await openApp();
  });
}
