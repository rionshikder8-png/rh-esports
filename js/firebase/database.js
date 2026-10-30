/* ============================================================
   REALTIME DATABASE
   One database instance, one place with the SDK imports, and the
   exact same database paths the original code used.
   ============================================================ */

import {
    getDatabase, ref, set, onValue, push, update, get, serverTimestamp, runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { app } from "./config.js";

export const db = getDatabase(app);

// Re-exported so no other module has to import the SDK directly.
export { ref, set, onValue, push, update, get, serverTimestamp, runTransaction };

/** Exact paths from the original source — do not rename these. */
export const PATHS = {
    categories: 'categories',
    matches: 'matches',
    matchParticipants: 'match_participants',
    appSettings: 'app_settings',
    users: 'users',
    transactions: 'transactions',
    withdrawRequests: 'withdraw_requests',
    autoPay: 'Auto Pay',            // note the space, matching the original
    smsInbox: 'sms_inbox'
};

export function dbRef(path) {
    return ref(db, path);
}

export function userRef(uid) {
    return ref(db, PATHS.users + '/' + uid);
}

export function userTransactionsRef(uid) {
    return ref(db, PATHS.transactions + '/' + uid);
}
