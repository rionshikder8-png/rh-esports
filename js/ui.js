/* ============================================================
   UI UTILITIES
   Component includes, global loader, clipboard, support popup,
   match countdown timers and bottom-nav highlighting.
   ============================================================ */

import { BASE, PAGE } from './router.js';
import { state } from './state.js';

/* ---------- Component includes ---------- */

/**
 * Fetches every <div data-include="name"></div> on the page from
 * components/name.html and injects its markup.
 * Requires the project to be served over HTTP (fetch does not work on file://).
 */
export async function mountIncludes() {
    const nodes = Array.from(document.querySelectorAll('[data-include]'));
    await Promise.all(nodes.map(async (host) => {
        const name = host.dataset.include;
        if (!name) return;
        try {
            const res = await fetch(BASE + 'components/' + name + '.html', { cache: 'no-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            host.innerHTML = await res.text();
        } catch (err) {
            console.error('[RH] Failed to load component "' + name + '". Serve the project over HTTP.', err);
        }
    }));
}

/* ---------- Global loader ---------- */

export function toggleLoader(show) {
    const l = document.getElementById('global-loader');
    if (!l) return;
    if (show) l.classList.add('active');
    else l.classList.remove('active');
}

/* ---------- Small DOM helpers ---------- */

export function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

export function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

export function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

/* ---------- Clipboard ---------- */

export function copyToClipboard(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const text = el.innerText;
    navigator.clipboard.writeText(text).then(() => {
        Swal.fire({ icon: 'success', title: 'Copied!', timer: 1000, showConfirmButton: false });
    });
}

/* ---------- Support ---------- */

export function openSupport() {
    const supportLink = state.supportLink;
    if (supportLink && supportLink.startsWith('http')) {
        window.open(supportLink, '_blank');
    } else {
        Swal.fire({ icon: 'info', title: 'Support', text: 'Support link is not set by Admin yet.', confirmButtonText: 'OK' });
    }
}

/* ---------- Bottom navigation highlight ---------- */

export function markActiveNav() {
    if (!PAGE) return;
    document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
    const navItem = document.getElementById('nav-' + PAGE);
    if (navItem) navItem.classList.add('active');
}

/* ---------- Match countdown timers ---------- */

export function startTimers() {
    setInterval(() => {
        document.querySelectorAll('.match-countdown').forEach(e => {
            const t = parseInt(e.dataset.time);
            const display = e.querySelector('.timer-display') || e;
            if (!t || isNaN(t)) return display.innerText = "Time TBA";
            const diff = t - new Date().getTime();
            if (diff < 0) display.innerText = "Started";
            else {
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                display.innerText = `${h}h ${m}m`;
            }
        });
    }, 1000);
}
