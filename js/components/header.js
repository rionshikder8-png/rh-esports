/* ============================================================
   HEADER COMPONENT
   Applies app_settings.app_name to the brand label, exactly as the
   original app_settings listener did.
   ============================================================ */

import { onData } from '../firebase/listeners.js';
import { state } from '../state.js';

export function mountHeader() {
    onData('settings', applyAppName);
    applyAppName();
}

function applyAppName() {
    const settings = state.settings;
    if (!settings || !settings.app_name) return;
    const brand = document.querySelector('.brand-name');
    if (brand) brand.innerText = settings.app_name;
}
