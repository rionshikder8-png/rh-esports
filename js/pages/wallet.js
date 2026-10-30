/* ============================================================
   WALLET PAGE
   ============================================================ */

import { boot } from '../app.js';
import { onData } from '../firebase/listeners.js';
import { updateBalanceUI } from '../services/wallet-service.js';

boot({
    requiresAuth: true,
    onReady: () => {
        updateBalanceUI();
        onData('user', updateBalanceUI);
    }
});
