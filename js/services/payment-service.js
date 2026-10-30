/* ============================================================
   PAYMENT SERVICE (add money / auto-verify)
   Identical flow to the original verifyAutoPay(): TrxID format check,
   reuse check, SMS-reader lookup in sms_inbox/{trxId}, atomic claim,
   balance credit, Auto Pay record, transaction log.

   See README → "Security notes": the claim protects against double use,
   but the client still writes its own balance, so this is not tamper proof.
   ============================================================ */

import { get, set, update, push, runTransaction, serverTimestamp, dbRef, PATHS, userRef } from '../firebase/database.js';
import { state } from '../state.js';
import { toggleLoader } from '../ui.js';
import { refreshBalances } from './wallet-service.js';
import { addTransaction } from './transaction-service.js';
import { navigateSub } from '../navigation.js';

export async function verifyAutoPay(method) {
    const currentUser = state.currentUser;
    if (!currentUser) return;

    const input = document.getElementById(`trx-${method}`);
    if (!input) return;

    const trxId = input.value.trim().toUpperCase();
    if (!/^[A-Z0-9]{6,20}$/.test(trxId)) return Swal.fire('Warning', 'Enter a valid TrxID', 'warning');

    toggleLoader(true);
    let claimed = false;

    try {
        // 1. Already used before?
        const usedSnap = await get(dbRef(PATHS.autoPay + '/' + trxId));
        if (usedSnap.exists()) { toggleLoader(false); return Swal.fire('Error', 'TrxID already used', 'error'); }

        // 2. Look up the SMS captured by the reader app (direct lookup, not a full download)
        const smsRef = dbRef(PATHS.smsInbox + '/' + trxId);
        const smsSnap = await get(smsRef);
        if (!smsSnap.exists()) {
            toggleLoader(false);
            return Swal.fire('Not found', 'Payment not received yet. Wait a minute and try again, or check the TrxID.', 'error');
        }
        const sms = smsSnap.val();
        if (sms.used) { toggleLoader(false); return Swal.fire('Error', 'TrxID already used', 'error'); }
        if (sms.method && sms.method.toLowerCase() !== method.toLowerCase()) {
            toggleLoader(false);
            return Swal.fire('Error', `This TrxID is not a ${method} payment`, 'error');
        }

        // 3. Atomically claim it (prevents double use)
        const claim = await runTransaction(smsRef, (d) => {
            if (d === null) return d;
            if (d.used) return;            // abort
            d.used = true; d.usedBy = currentUser.uid; d.usedAt = Date.now();
            return d;
        });
        const claimedVal = claim.snapshot.val();
        if (!claim.committed || !claimedVal || claimedVal.usedBy !== currentUser.uid) {
            toggleLoader(false);
            return Swal.fire('Error', 'TrxID already used', 'error');
        }
        claimed = true;

        // 4. Add balance
        const amount = parseFloat(claimedVal.amount);
        if (!amount || amount <= 0) throw new Error('bad amount');

        await runTransaction(userRef(currentUser.uid), (data) => {
            if (data) { data.deposit = (data.deposit || 0) + amount; return data; }
            return data;
        });

        await set(dbRef(PATHS.autoPay + '/' + trxId), {
            amount: amount, usedBy: currentUser.uid, method: method, time: serverTimestamp()
        });

        await addTransaction(currentUser.uid, {
            type: 'Deposit', amount: amount, method: method, trxId: trxId,
            status: 'Success', date: new Date().toLocaleString()
        });

        input.value = '';
        await refreshBalances();
        toggleLoader(false);
        Swal.fire('Success', `Added ${amount} TK`, 'success').then(() => navigateSub('wallet'));

    } catch (e) {
        console.error(e);
        if (claimed) {
            try { await update(dbRef(PATHS.smsInbox + '/' + trxId), { used: false, usedBy: null }); } catch (_) { /* noop */ }
        }
        toggleLoader(false);
        Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
    }
}
