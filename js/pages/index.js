/* ============================================================
   ENTRY PAGE
   Shows the original splash animation once, resolves the session,
   then replaces the location. This is the only page with a splash;
   normal navigation between pages never shows one.
   ============================================================ */

import { waitForUser } from '../auth-guard.js';
import { pageUrl, loginUrl } from '../router.js';
import { dbRef, onValue, PATHS } from '../firebase/database.js';
import { FIREBASE_CONFIGURED } from '../firebase/config.js';

const splash = document.getElementById('app-splash');
const progressBar = document.getElementById('splash-progress');

/* The original app applied app_settings values to the splash screen too. */
if (FIREBASE_CONFIGURED) {
    onValue(dbRef(PATHS.appSettings), (s) => {
        const d = s.val();
        if (!d) return;
        if (d.app_name) {
            const nameEl = document.getElementById('splash-app-name');
            if (nameEl) nameEl.innerText = d.app_name;
        }
        if (d.app_logo) {
            const logoEl = document.getElementById('splash-logo');
            if (logoEl) logoEl.src = d.app_logo;
        }
    });
}

let width = 0;
const progressInterval = setInterval(() => {
    width = Math.min(width + 5, 100);
    if (progressBar) progressBar.style.width = width + '%';
    if (width >= 100) clearInterval(progressInterval);
}, 30);

let finished = false;
function finish(target) {
    if (finished) return;
    finished = true;
    clearInterval(progressInterval);
    if (progressBar) progressBar.style.width = '100%';
    if (splash) splash.style.opacity = '0';
    setTimeout(() => window.location.replace(target), 400);
}

// Safety net: never trap the visitor on the splash if Firebase is unreachable.
const safety = setTimeout(() => finish(loginUrl()), 6000);

waitForUser().then((user) => {
    clearTimeout(safety);
    finish(user ? pageUrl('home') : loginUrl());
});
