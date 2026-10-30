/* ============================================================
   MATCH CARD COMPONENT
   Renders the original card markup and owns the three card actions:
   openMatchDetails (info popup), checkRoom (room modal) and prepJoin
   (go to the join page).
   ============================================================ */

import { state } from '../state.js';
import { isJoinedMatch } from '../services/match-service.js';
import { openRoomModal } from './modal.js';
import { pageUrl } from '../router.js';

/**
 * @param {object} m    match record (with dbKey)
 * @param {string} type 'play' | 'joined' | 'result'
 */
export function createMatchCardHTML(m, type) {
    const joined = parseInt(m.joined) || 0;
    const total = parseInt(m.total) || 48;
    const perc = Math.min((joined / total) * 100, 100);
    const isJoined = isJoinedMatch(m.dbKey);
    const catImg = state.activeCategories[m.categoryId] ? state.activeCategories[m.categoryId].img : '';

    let btnJoinHTML = '';
    if (type === 'play') {
        btnJoinHTML = isJoined
            ? `<button class="btn-join-main disabled">JOINED</button>`
            : `<button class="btn-join-main" onclick="event.stopPropagation(); window.prepJoin('${m.dbKey}', '${m.type}', ${m.entry}, '${m.dbKey}', '${m.title}')">Join Now</button>`;
    } else if (type === 'joined') {
        btnJoinHTML = `<button class="btn-join-main disabled">JOINED</button>`;
    } else {
        btnJoinHTML = `<button class="btn-join-main result-btn">View Result</button>`;
    }

    const shortId = m.dbKey ? m.dbKey.slice(-4).toUpperCase() : '----';

    return `
    <div class="match-card" onclick="window.openMatchDetails('${m.dbKey}')">
        <div class="banner-box">
            <img src="${catImg}" alt="Match Banner">
            <div class="banner-overlay"></div>
            <div class="badge-map">${m.map || 'Bermuda'}</div>
            <div class="badge-id">ID: ${shortId}</div>
            ${type !== 'result' ? `<div class="timer-badge match-countdown" data-time="${m.timestamp}"><i class="far fa-clock"></i> <span class="timer-display">Loading...</span></div>` : ''}
            <h3 class="banner-title">${m.title}</h3>
        </div>

        <div class="stats-grid">
            <div class="stat-item"><i class="fa-solid fa-sack-dollar"></i><span class="stat-lbl">Prize Pool</span><span class="stat-val">৳${m.total_prize || 0}</span></div>
            <div class="stat-item"><i class="fa-solid fa-skull"></i><span class="stat-lbl">Per Kill</span><span class="stat-val">৳${m.per_kill || 0}</span></div>
            <div class="stat-item"><i class="fa-solid fa-ticket"></i><span class="stat-lbl">Entry</span><span class="stat-val">৳${m.entry || 0}</span></div>
            <div class="stat-item"><i class="fa-solid fa-users"></i><span class="stat-lbl">Type</span><span class="stat-val">${m.type || 'Solo'}</span></div>
        </div>

        <div class="action-container">
            ${type !== 'result' ? `
            <div class="spots-left">Only ${Math.max(0, total - joined)} Spots Left</div>
            <div class="bar-bg" style="width:100%"><div class="bar-fill" style="width:${perc}%"></div></div>
            ` : `<div class="spots-left">Match Finished</div>`}
            ${btnJoinHTML}
        </div>

        <div class="bottom-grid">
            <div class="btn-bottom"><i class="fa-solid fa-users"></i> Participants</div>
            <div class="btn-bottom" onclick="event.stopPropagation(); window.checkRoom('${m.dbKey}')"><i class="fas fa-key"></i> Id & Password</div>
        </div>
    </div>`;
}

/**
 * Match details: there is no separate details page in the original
 * source (and per the approved plan none is created). This is the
 * original placeholder popup, preserved exactly.
 */
export function openMatchDetails(key) {
    const m = state.rawMatches.find(x => x.dbKey === key);
    if (!m) return;
    Swal.fire({ title: m.title, text: `Map: ${m.map} | Type: ${m.type}`, icon: 'info' });
}

/** Room ID / password popup, joined users only. */
export function checkRoom(key) {
    if (!state.currentUser) return;
    const m = state.rawMatches.find(x => x.dbKey === key);
    if (!m) return;

    if (isJoinedMatch(key)) {
        if (!m.room_id) {
            Swal.fire({ icon: 'info', title: 'Wait', text: 'Room details will be shared before match starts.', confirmButtonText: 'OK' });
        } else {
            openRoomModal(m.room_id, m.room_pass);
        }
    } else {
        Swal.fire({ icon: 'warning', title: 'Not Joined', text: 'You have not joined this match.', confirmButtonText: 'OK' });
    }
}

/**
 * Opens the join page for a match.
 * The original function filled the join section in place; it now stores the
 * return URL and navigates, and the join page re-reads the match record.
 */
export function prepJoin(id, type, fee, key, title) {
    if (!state.currentUser) return;
    if (isJoinedMatch(id)) return Swal.fire({ icon: 'warning', title: 'Already Joined' });

    const url = pageUrl('join-match');
    if (!url) return;

    try { sessionStorage.setItem('rh:joinReturn', window.location.href); } catch (e) { /* noop */ }
    window.location.href = url + '?id=' + encodeURIComponent(key);
}
