/* ============================================================
   LOGIN PAGE
   ============================================================ */

import { BASE, pageUrl } from '../router.js';
import { waitForUser } from '../auth-guard.js';
import { emailLogin } from '../firebase/auth.js';
import { toggleLoader, mountIncludes } from '../ui.js';

window.toggleAuthMode = function (mode) {
    window.location.href = BASE + (mode === 'login' ? 'login.html' : 'register.html');
};

window.emailLogin = async function () {
    const e = document.getElementById('login-email').value;
    const p = document.getElementById('login-pass').value;
    if (!e || !p) return Swal.fire('Error', 'Fill all fields', 'error');

    toggleLoader(true);
    try {
        await emailLogin(e, p);
        window.location.replace(pageUrl('home'));
    } catch (err) {
        toggleLoader(false);
        Swal.fire('Error', err.message, 'error');
    }
};

(async () => {
    await mountIncludes();
    const user = await waitForUser();
    if (user) window.location.replace(pageUrl('home'));
})();
