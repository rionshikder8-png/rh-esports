/* ============================================================
   REGISTER PAGE
   ============================================================ */

import { BASE, pageUrl } from '../router.js';
import { waitForUser } from '../auth-guard.js';
import { emailRegister } from '../firebase/auth.js';
import { toggleLoader, mountIncludes } from '../ui.js';

window.toggleAuthMode = function (mode) {
    window.location.href = BASE + (mode === 'login' ? 'login.html' : 'register.html');
};

window.emailRegister = async function () {
    const n = document.getElementById('reg-username').value;
    const e = document.getElementById('reg-email').value;
    const ph = document.getElementById('reg-phone').value;
    const p = document.getElementById('reg-pass').value;
    if (!n || !e || !ph || !p) return Swal.fire('Error', 'Fill all fields', 'error');

    toggleLoader(true);
    try {
        await emailRegister({ name: n, email: e, phone: ph, password: p });
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
