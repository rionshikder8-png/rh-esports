/* ============================================================
   WITHDRAW SERVICE
   Frontend copy of the original submitWithdraw(). See README →
   "Security notes": this validation is advisory only.
   ============================================================ */

import { push, set, runTransaction, serverTimestamp, dbRef, PATHS, userRef } from '../firebase/database.js';
import { state } from '../state.js';
import { toggleLoader } from '../ui.js';
import { refreshBalances } from './wallet-service.js';
import { navigateSub } from '../navigation.js';

export async function submitWithdraw() {
    const currentUser = state.currentUser;
    if (!currentUser) return;

    const amountInput = document.getElementById('withdraw-amount');
    const numberInput = document.getElementById('withdraw-number');
    const methodInput = document.getElementById('withdraw-method');
    if (!amountInput || !numberInput) return;

    const amount = parseFloat(amountInput.value);
    const number = numberInput.value;
    const method = methodInput ? methodInput.value : 'bKash';

    if (!amount || !number) return Swal.fire('Error', 'Please fill all fields', 'error');
    if (amount < 100) return Swal.fire('Error', 'Minimum withdraw amount is 100 TK', 'error');
    if (amount > state.winningBal) return Swal.fire('Error', 'Insufficient winning balance', 'error');

    Swal.fire({
        title: 'Confirm Withdraw',
        text: `Are you sure you want to withdraw ${amount} TK to ${method} (${number})?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Withdraw'
    }).then(async (result) => {
        if (!result.isConfirmed) return;
        toggleLoader(true);
        try {
            const resultTx = await runTransaction(userRef(currentUser.uid), (data) => {
                if (data === null) return data;
                const win = data.winning || 0;
                if (win < amount) return; // abort
                data.winning = win - amount;
                return data;
            });

            if (resultTx.committed) {
                // 1. Admin panel queue
                const reqId = push(dbRef(PATHS.withdrawRequests)).key;
                await set(dbRef(PATHS.withdrawRequests + '/' + reqId), {
                    userId: currentUser.uid,
                    userName: currentUser.displayName || 'User',
                    userEmail: currentUser.email,
                    amount: amount,
                    method: method,
                    mobileNumber: number,
                    status: 'pending',
                    timestamp: new Date().toLocaleString(),
                    requestedAt: serverTimestamp()
                });

                // 2. User transaction history
                const txId = push(dbRef(PATHS.transactions + '/' + currentUser.uid)).key;
                await set(dbRef(PATHS.transactions + '/' + currentUser.uid + '/' + txId), {
                    type: 'Withdraw Request',
                    amount: amount,
                    method: method,
                    number: number,
                    status: 'Pending',
                    date: new Date().toLocaleString()
                });

                await refreshBalances();
                toggleLoader(false);
                Swal.fire('Success', 'Withdraw request submitted successfully!', 'success')
                    .then(() => navigateSub('wallet'));
            } else {
                toggleLoader(false);
                Swal.fire('Error', 'Transaction failed. Please try again.', 'error');
            }
        } catch (error) {
            toggleLoader(false);
            console.error(error);
            Swal.fire('Error', 'Failed to process request', 'error');
        }
    });
}
