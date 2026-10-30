/* ============================================================
   USER SERVICE
   Profile name + password change, exactly the original saveProfile().
   ============================================================ */

import {
    updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider
} from '../firebase/auth.js';
import { update, dbRef, PATHS } from '../firebase/database.js';
import { state } from '../state.js';
import { toggleLoader } from '../ui.js';

export function saveProfile() {
    const currentUser = state.currentUser;
    if (!currentUser) return;

    const nameInput = document.getElementById('ep-username');
    const curPassInput = document.getElementById('ep-pass-cur');
    const newPassInput = document.getElementById('ep-pass-new');

    const n = nameInput ? nameInput.value : '';
    const curP = curPassInput ? curPassInput.value : '';
    const newP = newPassInput ? newPassInput.value : '';
    const promises = [];

    toggleLoader(true);

    if (n && n !== currentUser.displayName) {
        promises.push(
            updateProfile(currentUser, { displayName: n })
                .then(() => update(dbRef(PATHS.users + '/' + currentUser.uid), { username: n }))
        );
    }

    if (newP) {
        if (!curP) { toggleLoader(false); return Swal.fire('Error', "Current password required", 'error'); }
        const cred = EmailAuthProvider.credential(currentUser.email, curP);
        promises.push(
            reauthenticateWithCredential(currentUser, cred)
                .then(() => updatePassword(currentUser, newP))
        );
    }

    Promise.all(promises).then(() => {
        toggleLoader(false);
        Swal.fire({ icon: 'success', title: 'Success', text: 'Profile Updated' });
        if (curPassInput) curPassInput.value = '';
        if (newPassInput) newPassInput.value = '';
    }).catch(e => {
        toggleLoader(false);
        Swal.fire('Error', e.message, 'error');
    });
}
