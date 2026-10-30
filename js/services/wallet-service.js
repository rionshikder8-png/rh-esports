/* ============================================================
   WALLET SERVICE
   Balance reading + the four balance display nodes.
   Splitting deposit/winning is unchanged from the original.
   ============================================================ */

import { get, dbRef, PATHS } from '../firebase/database.js';
import { state } from '../state.js';
import { setText } from '../ui.js';

export async function refreshBalances() {
    const currentUser = state.currentUser;
    if (!currentUser) return;
    const snap = await get(dbRef(PATHS.users + '/' + currentUser.uid));
    const d = snap.val();
    if (d) {
        state.depositBal = parseFloat(d.deposit) || 0;
        state.winningBal = parseFloat(d.winning) || 0;
        updateBalanceUI();
    }
}

/**
 * Updates whatever balance nodes exist on the current page.
 * The original file assumed all four existed in one document; they are
 * now spread over wallet.html / withdraw.html, hence the id lookups.
 */
export function updateBalanceUI() {
    setText('wallet-balance-display', (state.depositBal + state.winningBal).toFixed(2));
    setText('withdraw-available', state.winningBal);
    setText('deposit-available-wallet', state.depositBal);
    setText('withdraw-available-wallet', state.winningBal);
}

export function totalBalance() {
    return state.depositBal + state.winningBal;
}
