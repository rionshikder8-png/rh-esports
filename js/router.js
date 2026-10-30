/* ============================================================
   ROUTER — path map for the multi-page app.

   Each page declares its own depth on <body>:
       <body data-page="home" data-base="../">
   `data-base` is the relative path back to the project root, so the
   same page module can build correct links from any folder depth
   without hardcoding ".." counts.
   ============================================================ */

export const BASE = (typeof document !== 'undefined' && document.body && document.body.dataset.base) || '';
export const PAGE = (typeof document !== 'undefined' && document.body && document.body.dataset.page) || '';

export const PAGES = {
    'home': 'pages/home.html',
    'matches': 'pages/matches.html',
    'mymatches': 'pages/my-matches.html',
    'join-match': 'pages/join-match.html',
    'wallet': 'pages/wallet/wallet.html',
    'add-money': 'pages/wallet/add-money.html',
    'withdraw': 'pages/wallet/withdraw.html',
    'history': 'pages/wallet/history.html',
    'profile': 'pages/profile/profile.html',
    'edit-profile': 'pages/profile/edit-profile.html',
    'developer': 'pages/profile/developer.html'
};

/** Absolute-from-root (but still relative) URL for a page key. Null when unknown. */
export function pageUrl(key) {
    return Object.prototype.hasOwnProperty.call(PAGES, key) ? BASE + PAGES[key] : null;
}

export function loginUrl() { return BASE + 'login.html'; }
export function registerUrl() { return BASE + 'register.html'; }
export function indexUrl() { return BASE + 'index.html'; }

/** Navigate by page key. Unknown keys are a safe no-op (see README: behaviour notes). */
export function go(key) {
    const url = pageUrl(key);
    if (!url) return false;
    window.location.href = url;
    return true;
}

export function goReplace(key) {
    const url = pageUrl(key);
    if (!url) return false;
    window.location.replace(url);
    return true;
}

/** Read a query-string parameter. */
export function query(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}
