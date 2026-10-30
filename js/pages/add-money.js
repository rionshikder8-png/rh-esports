/* ============================================================
   ADD MONEY PAGE
   bKash / Rocket / Nagad tabs, admin numbers, TrxID verification.
   ============================================================ */

import { boot } from '../app.js';
import { state } from '../state.js';
import { onData } from '../firebase/listeners.js';
import { verifyAutoPay } from '../services/payment-service.js';
import { setText } from '../ui.js';

function switchPayTab(t) {
    state.currentPayMethod = t;
    document.querySelectorAll('.method-card').forEach(e => e.classList.remove('active'));
    const tab = document.getElementById(`tab-${t}`);
    if (tab) tab.classList.add('active');
    document.querySelectorAll('.am-box').forEach(e => e.style.display = 'none');
    const content = document.getElementById(`content-${t}`);
    if (content) content.style.display = 'block';
}

function triggerVerify() {
    verifyAutoPay(state.currentPayMethod);
}

function applyNumbers() {
    const d = state.settings;
    if (!d) return;
    if (d.bkash_number) setText('bkash-num-display', d.bkash_number);
    if (d.nagad_number) setText('nagad-num-display', d.nagad_number);
    if (d.rocket_number) setText('rocket-num-display', d.rocket_number);
}

window.switchPayTab = switchPayTab;
window.triggerVerify = triggerVerify;

boot({
    requiresAuth: true,
    onReady: () => {
        onData('settings', applyNumbers);
    }
});
