/* ============================================================
   MATCHES PAGE (category list)
   Category comes from ?category=KEY so refresh, back/forward and
   direct links all work.
   ============================================================ */

import { boot } from '../app.js';
import { state } from '../state.js';
import { onData } from '../firebase/listeners.js';
import { filterMatches } from '../services/match-service.js';
import { createMatchCardHTML } from '../components/match-card.js';
import { query } from '../router.js';

state.currentActiveCategory = query('category');

let matchesLoaded = false;

function filterMatchTab(status) {
    state.currentMatchFilter = status;

    document.querySelectorAll('.m-tab').forEach(e => e.classList.remove('active'));
    const tab = document.getElementById('mt-' + status);
    if (tab) tab.classList.add('active');

    const c = document.getElementById('matches-container');
    if (!c) return;
    c.innerHTML = "";

    if (!matchesLoaded) return; // first paint waits for the matches node

    const m = filterMatches(status);
    if (m.length === 0) c.innerHTML = `<div class='empty-msg'>No Matches Found</div>`;
    else m.forEach(x => c.innerHTML += createMatchCardHTML(x, (status === 'Finished' ? 'result' : 'play')));
}

window.filterMatchTab = filterMatchTab;

boot({
    requiresAuth: true,
    onReady: () => {
        const redraw = () => filterMatchTab(state.currentMatchFilter);

        onData('matches', () => { matchesLoaded = true; redraw(); });
        onData('categories', redraw);
        onData('participants', redraw);
    }
});
