/* ============================================================
   PROFILE PAGE
   ============================================================ */

import { boot } from '../app.js';
import { setText } from '../ui.js';

boot({
    requiresAuth: true,
    onReady: (user) => {
        if (!user) return;
        setText('profile-name', user.displayName || 'User');
        setText('profile-email', user.email);
    }
});
