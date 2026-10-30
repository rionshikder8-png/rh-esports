/* ============================================================
   TRANSACTION SERVICE
   Same transactions/{uid}/{txId} shape as the original.
   ============================================================ */

import { onValue, push, set, dbRef, PATHS } from '../firebase/database.js';

/** Subscribe to a user's transaction history. Returns an unsubscribe function. */
export function subscribeTransactions(uid, callback) {
    return onValue(dbRef(PATHS.transactions + '/' + uid), (s) => {
        callback(s.val());
    });
}

/** push().key + set() exactly like the original, tid included in the write. */
export async function addTransaction(uid, data) {
    const txId = push(dbRef(PATHS.transactions + '/' + uid)).key;
    await set(dbRef(PATHS.transactions + '/' + uid + '/' + txId), data);
    return txId;
}

/** Renders the original history card list markup. */
export function renderHistoryList(container, data) {
    if (!container) return;
    container.innerHTML = "";
    if (data) {
        Object.values(data).reverse().forEach(t => {
            container.innerHTML += `
            <div class="history-card">
                <div>
                    <div class="hc-title">${t.type || "Transaction"}</div>
                    <div class="hc-date">${t.date}</div>
                </div>
                <div class="hc-amount">৳${t.amount || 0}</div>
            </div>`;
        });
    } else {
        container.innerHTML = "<div class='empty-msg'>No Transactions</div>";
    }
}
