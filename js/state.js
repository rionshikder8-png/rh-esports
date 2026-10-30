/* ============================================================
   SHARED APPLICATION STATE

   The original single-file app kept these as module-level `let`
   variables that lived for the whole session. Pages are now real
   documents, so the same names live here and are re-hydrated from
   Firebase on each page load by js/app.js + js/firebase/listeners.js.
   ============================================================ */

export const state = {
    currentUser: null,
    depositBal: 0,
    winningBal: 0,
    activeCategories: {},
    rawMatches: [],
    currentActiveCategory: null,
    userJoinedMatches: [],
    currentJoinId: null,
    currentEntryFee: 0,
    currentMatchFilter: 'Upcoming',
    supportLink: "",
    currentPayMethod: 'bkash',
    allParticipants: {},
    settings: null
};

export function resetState() {
    state.currentUser = null;
    state.depositBal = 0;
    state.winningBal = 0;
    state.activeCategories = {};
    state.rawMatches = [];
    state.currentActiveCategory = null;
    state.userJoinedMatches = [];
    state.currentJoinId = null;
    state.currentEntryFee = 0;
    state.currentMatchFilter = 'Upcoming';
    state.supportLink = "";
    state.currentPayMethod = 'bkash';
    state.allParticipants = {};
    state.settings = null;
}
