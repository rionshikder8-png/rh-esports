/* ============================================================
   REALTIME LISTENERS
   The four original onValue subscriptions (categories, matches,
   match_participants, app_settings) plus the per-user balance
   listener. Each is attached exactly once and can be detached,
   so the duplicate-listener bug of the original file is gone.

   Data is written into shared state and announced to subscribers;
   page modules own all DOM rendering.
   ============================================================ */

import { dbRef, onValue, PATHS } from './database.js';
import { state } from '../state.js';
import { recalcJoinedMatches } from '../services/match-service.js';
import { updateBalanceUI } from '../services/wallet-service.js';

const subscribers = { categories: [], matches: [], participants: [], settings: [], user: [] };

let started = null;
let userDetach = null;

function safeCall(fn) {
    try { fn(); } catch (err) { console.error('[RH] listener callback failed', err); }
}

function emit(kind) {
    (subscribers[kind] || []).forEach(safeCall);
}

/**
 * Subscribe to a data stream.
 * Fires immediately when the data has already arrived.
 * Returns an unsubscribe function.
 */
export function onData(kind, fn) {
    if (!subscribers[kind]) subscribers[kind] = [];
    subscribers[kind].push(fn);
    if (started && started.ready[kind]) safeCall(fn);
    return () => {
        subscribers[kind] = subscribers[kind].filter(f => f !== fn);
    };
}

/** Attach the four global listeners. Safe to call more than once. */
export function startGlobalListeners() {
    if (started) return started;
    started = { ready: {}, detachers: [] };

    started.detachers.push(onValue(dbRef(PATHS.categories), (s) => {
        const d = s.val();
        if (d) state.activeCategories = d;
        started.ready.categories = true;
        emit('categories');
    }));

    started.detachers.push(onValue(dbRef(PATHS.matches), (s) => {
        state.rawMatches = [];
        const d = s.val();
        if (d) Object.entries(d).forEach(([k, v]) => { state.rawMatches.push(Object.assign({ dbKey: k }, v)); });
        started.ready.matches = true;
        emit('matches');
    }));

    started.detachers.push(onValue(dbRef(PATHS.matchParticipants), (s) => {
        state.allParticipants = s.val() || {};
        recalcJoinedMatches();
        started.ready.participants = true;
        emit('participants');
    }));

    started.detachers.push(onValue(dbRef(PATHS.appSettings), (s) => {
        const d = s.val();
        if (d) {
            state.settings = d;
            state.supportLink = d.support_link;
        }
        started.ready.settings = true;
        emit('settings');
    }));

    return started;
}

/** Balance listener for the signed-in user. Re-safe: replaces the previous one. */
export function startUserListeners(uid) {
    stopUserListeners();
    if (!uid) return;
    userDetach = onValue(dbRef(PATHS.users + '/' + uid), (s) => {
        const d = s.val();
        if (d) {
            state.depositBal = parseFloat(d.deposit) || 0;
            state.winningBal = parseFloat(d.winning) || 0;
            updateBalanceUI();
        }
        if (started) started.ready.user = true;
        emit('user');
    });
}

export function stopUserListeners() {
    if (userDetach) {
        try { userDetach(); } catch (e) { /* noop */ }
        userDetach = null;
    }
}

export function stopGlobalListeners() {
    if (!started) return;
    started.detachers.forEach(d => { try { d(); } catch (e) { /* noop */ } });
    started = null;
    stopUserListeners();
}
