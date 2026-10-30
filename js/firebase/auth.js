/* ============================================================
   FIREBASE AUTH
   Same providers and same call sequence as the original file.
   ============================================================ */

import {
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
    onAuthStateChanged, updateProfile, updatePassword, reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { app, FIREBASE_CONFIGURED, CONFIG_ERROR_MESSAGE } from "./config.js";
import { set, dbRef, PATHS } from "./database.js";
import { loginUrl } from "../router.js";

export const auth = getAuth(app);

export {
    onAuthStateChanged, signOut, updateProfile, updatePassword,
    reauthenticateWithCredential, EmailAuthProvider
};

/** Email + password sign in. */
export function emailLogin(email, password) {
    if (!FIREBASE_CONFIGURED) return Promise.reject(new Error(CONFIG_ERROR_MESSAGE));
    return signInWithEmailAndPassword(auth, email, password);
}

/** Create the account, set the display name, then create the users/{uid} record. */
export function emailRegister({ name, email, phone, password }) {
    if (!FIREBASE_CONFIGURED) return Promise.reject(new Error(CONFIG_ERROR_MESSAGE));
    return createUserWithEmailAndPassword(auth, email, password).then((cred) => {
        updateProfile(cred.user, { displayName: name });
        return set(dbRef(PATHS.users + '/' + cred.user.uid), {
            username: name, email: email, phone: phone, deposit: 0, winning: 0
        }).then(() => cred.user);
    });
}

/** Sign out, then land on the login page. */
export function handleLogout() {
    Swal.fire({
        title: 'Logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (!result.isConfirmed) return;
        signOut(auth).then(() => {
            window.location.replace(loginUrl());
        });
    });
}
