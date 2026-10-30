/* ============================================================
   MODAL COMPONENT (room details)
   The markup carries its own inline close handler, matching the
   original; this module just fills the values and toggles the class.
   ============================================================ */

import { setText } from '../ui.js';

export function mountModal() {
    // nothing to bind: components/modal.html uses the original inline handlers
}

export function openRoomModal(roomId, roomPass) {
    setText('popup-room-id', roomId);
    setText('popup-room-pass', roomPass);
    const m = document.getElementById('room-modal');
    if (m) m.classList.add('active');
}

export function closeRoomModal() {
    const m = document.getElementById('room-modal');
    if (m) m.classList.remove('active');
}
