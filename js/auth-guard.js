/* ============================================================
   AUTH GUARD
   One auth resolution per page load. Replaces the single global
   onAuthStateChanged "gate" that used to show/hide #auth-view.
   ============================================================ */

import { auth, onAuthStateChanged } from './firebase/auth.js';
import { state } from './state.js';
import { loginUrl } from './router.js';

/**
 * Resolves once with the Firebase user (or null). Safe to call on any page.
 */
export function waitForUser() {
    return new Promise((resolve) => {
        let settled = false;
        let unsubscribe = null;

        const finish = (user) => {
            if (settled) return;
            settled = true;
            state.currentUser = user || null;
            if (unsubscribe) { try { unsubscribe(); } catch (e) { /* noop */ } }
            resolve(user || null);
        };

        try {
            unsubscribe = onAuthStateChanged(
                auth,
                (u) => finish(u),
                (err) => { console.error('[RH] Auth state error', err); finish(null); }
            );
        } catch (err) {
            console.error('[RH] Auth init failed', err);
            finish(null);
        }

        // Never leave the UI hanging if Firebase cannot answer.
        setTimeout(() => finish(null), 8000);
    });
}

/**
 * For protected pages. Redirects to login.html when there is no session.
 */
export async function requireUser() {
    const user = await waitForUser();
    if (!user) {
        window.location.replace(loginUrl());
        return null;
    }
    return user;
}
