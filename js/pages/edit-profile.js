/* ============================================================
   EDIT PROFILE PAGE
   ============================================================ */

import { boot } from '../app.js';
import { saveProfile } from '../services/user-service.js';
import { setValue } from '../ui.js';

window.saveProfile = saveProfile;

boot({
    requiresAuth: true,
    onReady: (user) => {
        if (!user) return;
        setValue('ep-username', user.displayName || '');
        setValue('ep-email', user.email || '');
    }
});
