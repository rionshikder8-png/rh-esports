/* ============================================================
   WITHDRAW PAGE
   ============================================================ */

import { boot } from '../app.js';
import { onData } from '../firebase/listeners.js';
import { updateBalanceUI } from '../services/wallet-service.js';
import { submitWithdraw } from '../services/withdraw-service.js';
import { setValue } from '../ui.js';

function selectWithdrawMethod(el, method) {
    document.querySelectorAll('.method-card').forEach(e => e.classList.remove('active'));
    el.classList.add('active');
    setValue('withdraw-method', method);
}

window.selectWithdrawMethod = selectWithdrawMethod;
window.submitWithdraw = submitWithdraw;

boot({
    requiresAuth: true,
    onReady: () => {
        updateBalanceUI();
        onData('user', updateBalanceUI);
    }
});
