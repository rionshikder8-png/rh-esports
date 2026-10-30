/* ============================================================
   APPLICATION BOOT
   Every page module calls boot({ requiresAuth, onReady }).

   Boot sequence:
     1. expose the original window.* API (inline onclick handlers keep working)
     2. inject the component fragments
     3. highlight the bottom nav, mount header/nav/modal, start countdowns
     4. resolve auth once
     5. attach the shared Firebase listeners
     6. hand control to the page module

   There is no full-screen loader and no setTimeout in this path.
   ============================================================ */

import { mountIncludes, toggleLoader, startTimers, copyToClipboard, openSupport } from './ui.js';
import { waitForUser } from './auth-guard.js';
import { startGlobalListeners, startUserListeners } from './firebase/listeners.js';
import { showTab, navigateSub, openCategory } from './navigation.js';
import { handleLogout } from './firebase/auth.js';
import { checkRoom, openMatchDetails, prepJoin } from './components/match-card.js';
import { mountHeader } from './components/header.js';
import { mountBottomNav } from './components/bottom-nav.js';
import { mountModal } from './components/modal.js';
import { state } from './state.js';
import { loginUrl } from './router.js';

/** The original file exposed all of these on `window`; inline handlers still use them. */
function exposeGlobals() {
    window.showTab = showTab;
    window.navigateSub = navigateSub;
    window.openCategory = openCategory;
    window.copyToClipboard = copyToClipboard;
    window.openSupport = openSupport;
    window.openMatchDetails = openMatchDetails;
    window.checkRoom = checkRoom;
    window.prepJoin = prepJoin;
    window.handleLogout = handleLogout;
    window.toggleLoader = toggleLoader;
}

export async function boot(options = {}) {
    const requiresAuth = options.requiresAuth !== false;
    const onReady = options.onReady || null;

    exposeGlobals();
    await mountIncludes();
    mountBottomNav();
    mountHeader();
    mountModal();
    startTimers();

    const user = await waitForUser();
    state.currentUser = user || null;

    if (requiresAuth && !user) {
        window.location.replace(loginUrl());
        return null;
    }

    if (user) startUserListeners(user.uid);
    startGlobalListeners();

    if (onReady) onReady(user);
    return user;
}
