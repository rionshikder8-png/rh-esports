/* ============================================================
   FIREBASE CONFIG — the single shared configuration module.
   Same project, same database URL, same app id as the original file.
   Initialised exactly once; every other module imports this `app`.

   ⚠️  ACTION REQUIRED (one value only):
   The `apiKey` was not present in the provided source file, so it is
   left here as an obvious placeholder. Paste the Web API key of the
   SAME Firebase project (rh-esports-1f458):
       Firebase console → Project settings → General → Your apps → Web app
   Nothing else in the project needs to change. A Firebase Web API key
   is a public client identifier, not a secret, so it is safe to sit in
   this file exactly like it did in the original index.html.
   ============================================================ */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

export const API_KEY_PLACEHOLDER = "REPLACE_WITH_YOUR_FIREBASE_WEB_API_KEY";

export const firebaseConfig = {
    apiKey: API_KEY_PLACEHOLDER,
    authDomain: "rh-esports-1f458.firebaseapp.com",
    databaseURL: "https://rh-esports-1f458-default-rtdb.firebaseio.com",
    projectId: "rh-esports-1f458",
    storageBucket: "rh-esports-1f458.firebasestorage.app",
    messagingSenderId: "476083440994",
    appId: "1:476083440994:web:f9558ecd8bbdbce183f03b",
    measurementId: "G-TGZ58H7FN2"
};

/** True once a real key is pasted in. Used to show a clear error instead of a silent failure. */
export const FIREBASE_CONFIGURED = (() => {
    const k = firebaseConfig.apiKey || '';
    return k !== API_KEY_PLACEHOLDER && k.length > 10 && k.indexOf('$') !== 0;
})();

export const CONFIG_ERROR_MESSAGE =
    'Firebase is not configured yet. Open js/firebase/config.js and replace ' +
    'firebaseConfig.apiKey with your project\'s Web API key.';

// Guard against double initialisation (the original app re-ran this on every load).
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export default app;
