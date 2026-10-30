/* ============================================================
   HISTORY PAGE
   ============================================================ */

import { boot } from '../app.js';
import { subscribeTransactions, renderHistoryList } from '../services/transaction-service.js';

boot({
    requiresAuth: true,
    onReady: (user) => {
        const list = document.getElementById('history-list');
        if (!list) return;
        list.innerHTML = "Loading...";
        if (!user) return;
        subscribeTransactions(user.uid, (data) => renderHistoryList(list, data));
    }
});
