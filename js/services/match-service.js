/* ============================================================
   MATCH SERVICE
   Participant mapping, filtering and the join transaction.
   Business logic is identical to the original confirmJoin().
   ============================================================ */

import { push, get, update, runTransaction, dbRef, PATHS, userRef } from '../firebase/database.js';
import { state } from '../state.js';
import { refreshBalances } from './wallet-service.js';
import { addTransaction } from './transaction-service.js';

/** Rebuild state.userJoinedMatches from match_participants. */
export function recalcJoinedMatches() {
    const joined = [];
    const uid = state.currentUser && state.currentUser.uid;
    if (state.allParticipants && uid) {
        Object.keys(state.allParticipants).forEach(matchKey => {
            const parts = Object.values(state.allParticipants[matchKey] || {});
            if (parts.some(p => p && p.joinedBy === uid)) joined.push(matchKey);
        });
    }
    state.userJoinedMatches = joined;
    return joined;
}

export function isJoinedMatch(key) {
    return state.userJoinedMatches.indexOf(key) !== -1;
}

/** Matches for the currently open category + status tab. */
export function filterMatches(status) {
    return state.rawMatches.filter(x =>
        x.categoryId === state.currentActiveCategory && x.status === status
    );
}

/** Matches the signed-in user has joined. */
export function myMatches() {
    return state.rawMatches.filter(x => state.userJoinedMatches.indexOf(x.dbKey) !== -1);
}

export function findMatch(key) {
    return state.rawMatches.find(x => x.dbKey === key) || null;
}

/**
 * The original join flow: atomic balance deduction, participant rows,
 * joined counter, transaction log, then a balance refresh.
 * Returns true when the balance transaction committed.
 */
export async function joinMatch(names, total) {
    const currentUser = state.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const result = await runTransaction(userRef(currentUser.uid), (data) => {
        if (data === null) return data;
        let dep = data.deposit || 0, win = data.winning || 0;
        if ((dep + win) < total) return; // abort
        let rem = total;
        if (dep >= rem) dep -= rem;
        else { rem -= dep; dep = 0; win -= rem; }
        data.deposit = dep; data.winning = win;
        return data;
    });

    if (!result.committed) return false;

    for (const n of names) {
        await push(dbRef(PATHS.matchParticipants + '/' + state.currentJoinId), {
            ign: n, joinedBy: currentUser.uid, kills: 0, win: 0
        });
    }

    const mRef = dbRef(PATHS.matches + '/' + state.currentJoinId);
    const snap = await get(mRef);
    const current = snap.val() || {};
    await update(mRef, { joined: (current.joined || 0) + names.length });

    await addTransaction(currentUser.uid, {
        type: 'Match Join', amount: total, status: 'Success', date: new Date().toLocaleString()
    });

    await refreshBalances();
    return true;
}
