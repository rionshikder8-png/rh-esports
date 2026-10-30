/* ============================================================
   NAVIGATION
   The original app toggled `.active` classes between sections inside
   one document, wrapped in a 300ms artificial delay. Both behaviours
   are gone: these are now real document navigations, with no loader
   and no setTimeout. Unknown targets are a safe no-op.
   ============================================================ */

import { go, pageUrl } from './router.js';

export function showTab(t) {
    return go(t);
}

export function navigateSub(t) {
    return go(t);
}

export function openCategory(cid) {
    const url = pageUrl('matches');
    if (!url) return false;
    window.location.href = url + '?category=' + encodeURIComponent(cid);
    return true;
}
