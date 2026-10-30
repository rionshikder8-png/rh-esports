/* ============================================================
   MY MATCHES PAGE
   ============================================================ */

import { boot } from '../app.js';
import { myMatches } from '../services/match-service.js';
import { createMatchCardHTML } from '../components/match-card.js';
import { onData } from '../firebase/listeners.js';

let matchesLoaded = false;

function loadMyMatches() {
    const c = document.getElementById('mymatches-container');
    if (!c) return;
    c.innerHTML = "";
    if (!matchesLoaded) return; // first paint waits for the matches node

    const m = myMatches();
    if (m.length === 0) c.innerHTML = "<div class='empty-msg'>No joined matches</div>";
    else m.forEach(x => c.innerHTML += createMatchCardHTML(x, 'joined'));
}

boot({
    requiresAuth: true,
    onReady: () => {
        onData('matches', () => { matchesLoaded = true; loadMyMatches(); });
        onData('categories', loadMyMatches);
        onData('participants', loadMyMatches);
    }
});
