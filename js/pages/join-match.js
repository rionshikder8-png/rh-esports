/* ============================================================
   JOIN MATCH PAGE
   Match is read from ?id=KEY and re-resolved from the matches node,
   so the entry fee is never trusted from the URL.
   ============================================================ */

import { boot } from '../app.js';
import { state } from '../state.js';
import { onData } from '../firebase/listeners.js';
import { findMatch, isJoinedMatch, joinMatch } from '../services/match-service.js';
import { toggleLoader, setText } from '../ui.js';
import { pageUrl } from '../router.js';

state.currentJoinId = new URLSearchParams(window.location.search).get('id');
state.currentEntryFee = 0;
let inputsRendered = false;

function renderJoinForm() {
    if (!state.currentJoinId) return;
    const m = findMatch(state.currentJoinId);
    if (!m) return;

    state.currentEntryFee = m.entry;

    setText('join-page-title', m.title || "Match");
    setText('join-page-meta', "Entry Type: " + m.type);
    setText('join-page-fee', m.entry);

    if (inputsRendered) return;
    inputsRendered = true;

    const ic = document.getElementById('join-inputs-container');
    if (!ic) return;
    ic.innerHTML = "";

    const type = String(m.type || 'Solo');
    const slots = type.toLowerCase().includes('duo') ? 2 : (type.toLowerCase().includes('squad') ? 4 : 1);
    for (let i = 1; i <= slots; i++) {
        ic.innerHTML += `<input type="text" class="join-input p-name" placeholder="Player ${i} Game Name / UID">`;
    }
}

async function confirmJoin() {
    if (!state.currentJoinId) {
        return Swal.fire('Error', 'This match could not be found. Please open it again.', 'error');
    }
    if (isJoinedMatch(state.currentJoinId)) return Swal.fire({ icon: 'warning', title: 'Already Joined' });

    const inps = document.querySelectorAll('.p-name');
    const names = [];
    inps.forEach(i => { if (i.value.trim()) names.push(i.value.trim()); });
    if (names.length !== inps.length) return Swal.fire('Error', "Fill all player names", 'error');

    const total = state.currentEntryFee * names.length;
    if ((state.depositBal + state.winningBal) < total) return Swal.fire('Error', "Insufficient Balance", 'error');

    toggleLoader(true);
    try {
        const committed = await joinMatch(names, total);
        toggleLoader(false);
        if (committed) {
            Swal.fire({ icon: 'success', title: 'Joined!', text: 'You joined the match.', confirmButtonText: 'OK' })
                .then(() => closeJoinPage());
        } else {
            Swal.fire('Error', 'Insufficient Balance', 'error');
        }
    } catch (e) {
        console.error(e);
        toggleLoader(false);
        Swal.fire('Error', 'Failed to join', 'error');
    }
}

function closeJoinPage() {
    let ret = null;
    try { ret = sessionStorage.getItem('rh:joinReturn'); } catch (e) { /* noop */ }
    if (ret) window.location.href = ret;
    else window.location.href = pageUrl('home');
}

window.confirmJoin = confirmJoin;
window.closeJoinPage = closeJoinPage;

boot({
    requiresAuth: true,
    onReady: () => {
        onData('matches', renderJoinForm);
    }
});
