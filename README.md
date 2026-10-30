# RH E-SPORTS

A multi-page reconstruction of the original single-file RH E-SPORTS tournament app.
Same UI, same colours, same typography, same animations, same Firebase project, same
database paths, same business logic. The only change is how the code is organised.

- **Stack:** HTML + CSS + vanilla JavaScript (ES modules) + Firebase SDK 10.12.0
- **No frameworks, no build step, no bundler, no npm dependencies**
- **Firebase project:** `rh-esports-1f458` (unchanged)

## Live deployment

| | |
|---|---|
| **Live site** | https://rionshikder8-png.github.io/rh-esports/ |
| **Repository** | https://github.com/rionshikder8-png/rh-esports |
| **Host** | GitHub Pages (free, HTTPS enforced, public repo) |
| **Auto-deploy** | every push to `main` republishes the site |

The site is served from a sub-path (`/rh-esports/`). That works because every path in
this project is **relative** — no root-absolute `/css/...` links anywhere. If you ever add
one, it will break on GitHub Pages but not on localhost, which is an easy trap.

The repo root contains an empty `.nojekyll` file so GitHub Pages publishes the project
verbatim instead of running it through Jekyll. Do not delete it.

---

## 1. Read this first — two setup steps

### 1.1 Add your Firebase Web API key (only missing value)

The API key was **not present in the source file that was handed over** — that one line
had already been stripped out before the code reached this project. It has **not** been
invented or replaced with a guessed value.

Open `js/firebase/config.js` and replace this one placeholder:

```js
export const API_KEY_PLACEHOLDER = "REPLACE_WITH_YOUR_FIREBASE_WEB_API_KEY";
```

with the real key of the same project:

> Firebase console → Project settings → General → Your apps → Web app → `apiKey`

Everything else in the config is already filled in and unchanged:
`authDomain`, `databaseURL`, `projectId`, `storageBucket`, `messagingSenderId`,
`appId`, `measurementId`.

**Until you do this**, the app degrades safely instead of breaking:
- the entry page still loads and sends you to `login.html`
- login and register show a clear message: *"Firebase is not configured yet. Open
  js/firebase/config.js and replace firebaseConfig.apiKey…"*
- nothing crashes, nothing is half-initialised

A Firebase Web API key is a **public client identifier**, not a secret. It sat in the
`<head>` of your original HTML file and is safe in this file too.

### 1.2 Serve the project over HTTP (not `file://`)

Two things in this structure need a real HTTP origin: **ES modules** and the
**component includes** (`fetch()`). Opening `index.html` by double-clicking will show
a blank page or a console error. That is a browser restriction, not a bug.

Also add the host you serve from to **Firebase console → Authentication → Settings →
Authorized domains**:

- `localhost` — for local development
- `rionshikder8-png.github.io` — **required** for the live site, otherwise Firebase
  login fails there with `auth/unauthorized-domain`

Add them as bare hostnames, no `https://` and no path.

---

## 2. Running it

Pick any one:

```bash
# Python (already installed on most machines)
cd RH-ESPORTS
python3 -m http.server 8080
# open http://localhost:8080
```

```bash
# Node
npx serve RH-ESPORTS -l 8080
```

```bash
# Firebase Hosting
firebase login
firebase init hosting     # public directory: .
firebase deploy
```

VS Code users can also just use the **Live Server** extension on `index.html`.

Entry point is always **`index.html`** — it shows the original splash, resolves the
session, then routes to `pages/home.html` or `login.html`.

---

## 3. Project structure

```
RH-ESPORTS/
├── index.html                     entry: splash + session routing only
├── login.html                     login form
├── register.html                  register form
├── README.md
│
├── pages/
│   ├── home.html                  banner slider + game categories
│   ├── matches.html               category match list (?category=KEY)
│   ├── my-matches.html            joined matches
│   ├── join-match.html            player entry form (?id=MATCH_KEY)
│   ├── wallet/
│   │   ├── wallet.html            balances + actions
│   │   ├── add-money.html         bKash / Rocket / Nagad + TrxID verify
│   │   ├── withdraw.html          withdraw request
│   │   └── history.html           transaction history
│   └── profile/
│       ├── profile.html           avatar, quick actions, menu
│       ├── edit-profile.html      name + password
│       └── developer.html         developer profile page
│
├── components/                    HTML fragments injected at runtime
│   ├── header.html
│   ├── bottom-nav.html
│   ├── notice-bar.html
│   ├── modal.html                 room ID / password popup
│   ├── loader.html                #global-loader
│   ├── footer.html                developer credit
│   ├── match-card.html            reference markup (renderer is in JS)
│   └── category-card.html         reference markup (renderer is in JS)
│
├── css/
│   ├── variables.css              :root design tokens
│   ├── main.css                   reset, body, #main-content, empty state,
│   │                              footer credit, SweetAlert2 overrides
│   ├── animations.css             fadeUp, marqueeScroll, spin, .animate-fade-up
│   ├── responsive.css             the original single @media query
│   ├── components/
│   │   ├── header.css             .app-header + .notice-bar
│   │   ├── bottom-nav.css         .bottom-nav + .back-nav
│   │   ├── cards.css              match card
│   │   ├── modal.css              modal, popup, copy button
│   │   └── loader.css             splash + global loader
│   └── pages/
│       ├── home.css               slider, section headers, category grid
│       ├── matches.css            match tabs + join page
│       ├── wallet.css             wallet, methods, am-box, withdraw, history
│       ├── profile.css            profile header, quick actions, menu
│       └── auth.css               auth card, tabs, form group, btn-auth
│
├── js/
│   ├── state.js                   shared state object (page-independent)
│   ├── router.js                  page map + relative URL builder
│   ├── navigation.js              showTab / navigateSub / openCategory
│   ├── auth-guard.js              one auth resolution per page load
│   ├── ui.js                      includes, loader, clipboard, support, timers
│   ├── app.js                     boot() used by every page module
│   │
│   ├── firebase/
│   │   ├── config.js              single config + single initialisation
│   │   ├── database.js            db instance, SDK re-exports, PATHS
│   │   ├── auth.js                login / register / logout
│   │   └── listeners.js           the four realtime streams + user balance
│   │
│   ├── services/
│   │   ├── user-service.js        saveProfile
│   │   ├── match-service.js       join, filter, participant mapping
│   │   ├── wallet-service.js      refreshBalances, updateBalanceUI
│   │   ├── payment-service.js     verifyAutoPay (deposit)
│   │   ├── withdraw-service.js    submitWithdraw
│   │   └── transaction-service.js history list + transaction writes
│   │
│   ├── components/
│   │   ├── header.js              app_name from app_settings
│   │   ├── bottom-nav.js          active tab highlight
│   │   ├── modal.js               room modal open/close
│   │   └── match-card.js          card renderer + card actions
│   │
│   └── pages/                     one module per page
│       ├── index.js  home.js  matches.js  my-matches.js  join-match.js
│       ├── wallet.js  add-money.js  withdraw.js  history.js
│       ├── profile.js  edit-profile.js
│       └── login.js  register.js
│
└── assets/
    ├── images/                    empty — all original assets are remote URLs
    ├── icons/
    └── fonts/                     empty — Google Fonts is loaded from CDN
```

`js/state.js` is the only file added beyond the agreed structure. It exists because
the original kept 15 module-level variables alive for the whole session; with real
pages each load has fresh memory, so those variables need one shared home that every
module can import without circular dependencies.

`assets/*` are empty on purpose: your original file referenced every image from
`i.ibb.co.com` / `flaticon.com` and every font/icon from a CDN. No local asset was
invented or downloaded.

---

## 4. Page map and how navigation works

| Page key        | URL                                       |
|-----------------|-------------------------------------------|
| `home`          | `pages/home.html`                         |
| `mymatches`     | `pages/my-matches.html`                   |
| `profile`       | `pages/profile/profile.html`              |
| `matches`       | `pages/matches.html?category=KEY`         |
| `join-match`    | `pages/join-match.html?id=MATCH_KEY`      |
| `wallet`        | `pages/wallet/wallet.html`                |
| `add-money`     | `pages/wallet/add-money.html`             |
| `withdraw`      | `pages/wallet/withdraw.html`              |
| `history`       | `pages/wallet/history.html`               |
| `edit-profile`  | `pages/profile/edit-profile.html`         |
| `developer`     | `pages/profile/developer.html`            |

**`showTab()` / `navigateSub()` / `openCategory()` are still the same functions with the
same names**, so every original `onclick` in the markup keeps working. They now perform
a real navigation instead of toggling a class.

Each page declares its own depth:

```html
<body data-page="home" data-base="../">
```

`data-base` is the relative path back to the project root, so `router.pageUrl('wallet')`
produces the correct link from any folder depth. There is no hardcoded `../` counting
in the JS.

**What was removed:** the `toggleLoader(true)` + `setTimeout(…, 300)` wrapper that used
to run on every tab switch, and the splash screen on anything other than `index.html`.
Switching pages is now a plain browser navigation.

**What was kept:** `toggleLoader()` itself, for real async work (login, register, join,
withdraw, deposit verify), and every original animation — `fadeUp` entrances, card
animations, marquee notice, slider, modal animation, bottom-nav states, SweetAlert2
motion.

Because these are ordinary documents, refresh, back/forward, deep links and bookmarking
all behave normally. Category and match context live in the query string, not in memory.

---

## 5. Component system

Pages declare what they need:

```html
<div data-include="header"></div>
<div data-include="modal"></div>
```

`mountIncludes()` (in `js/ui.js`) fetches `components/<name>.html` and injects it.
Paths are built from `data-base`, so it works from any depth. All original inline
handlers inside the fragments keep working because `js/app.js` still exposes the same
`window.*` API as your original file:

```js
window.showTab, window.navigateSub, window.openCategory, window.copyToClipboard,
window.openSupport, window.openMatchDetails, window.checkRoom, window.prepJoin,
window.handleLogout, window.toggleLoader
```

`match-card.html` and `category-card.html` are **reference markup** only. The live
cards are produced by `js/components/match-card.js` and `js/pages/home.js`, exactly as
the original built them with string interpolation. They are marked with a
`reference-template` comment in the file header.

---

## 6. Firebase architecture

- **One** `initializeApp()`, guarded with `getApps()` so a double load cannot happen.
- **One** `getDatabase()` in `database.js` and **one** `getAuth()` in `auth.js`, both
  built from the same `app`.
- All database path strings live in `PATHS` in `js/firebase/database.js`. Nothing else
  in the codebase contains a raw path string.

Paths preserved exactly as in your original:

```
categories                                  → category cards
matches                                     → match records (dbKey, joined, total, …)
match_participants/<matchId>/<pushId>       → { ign, joinedBy, kills, win }
app_settings                                → app_name, app_logo, notice, banners,
                                              bkash_number, nagad_number,
                                              rocket_number, support_link
users/<uid>                                 → { username, email, phone, deposit, winning }
transactions/<uid>/<txId>                   → { type, amount, status, date, … }
withdraw_requests/<reqId>                   → { userId, amount, method, status, … }
Auto Pay/<trxId>                            → used-deposit marker
sms_inbox/<trxId>                           → SMS reader records (used, usedBy, amount, method)
```

Listeners: the four original `onValue` streams (categories, matches,
match_participants, app_settings) plus one `users/<uid>` balance stream. Each is
attached **once** per page load and every one returns a detach function, so the
duplicate-listener bug of the original file (a new `transactions` listener added on
every visit to history, never removed) is structurally gone.

---

## 7. Behaviour notes — decisions kept exactly as approved

1. **No `match-details.html`.** `openMatchDetails()` keeps its original behaviour: a
   SweetAlert2 info popup (`title` / `Map: … | Type: …`).
2. **No notification system.** No `notifications.html`, no `notification-service.js`,
   no invented push/FCM/list code. The header bell still calls
   `navigateSub('notifications')`, which is a safe no-op.
3. **No `errors/404.html` or `errors/access-denied.html`.** A visitor without a session
   is redirected to `login.html`, which is exactly what the original did.
4. **No Refer & Earn page.** The Gift quick action and the "Refer & Earn" menu item
   still call `navigateSub('refer')`, which is a safe no-op.
5. **Join page Kill and Prize values untouched** — the markup still shows the literal
   `Kill: ৳0` and `Prize: ৳0` that your original source contains. Not wired to the
   match record, not "fixed".
6. All UI, CSS, animations, Firebase logic and database paths preserved.

**One deliberate divergence, stated openly:** in the original, `navigateSub('notifications')`
and `navigateSub('refer')` removed every active section while adding `body.sub-page` and
hiding the bottom nav — the result was a completely blank screen with no way back except
refresh. In this build, an unknown navigation target is a no-op, so the user simply stays
where they are. Nothing was added; only the dead end was removed. If you would rather
have the exact blank-screen behaviour back, change `go()` in `js/router.js` to fall
through instead of returning `false`.

Other preserved quirks, kept on purpose so behaviour matches:

- `total` defaults to `48` and `joined` to `0` when a match record lacks them.
- Status matching is exact and case-sensitive (`'Upcoming'`, `'Finished'`).
- `saveProfile()` only writes `users/<uid>/username` when the display name changed.
- If a match title contains a single quote, the inline `prepJoin(...)` handler in the
  card breaks — that is inherited from the original string-built markup.
- Sub pages keep the original `80px` bottom padding even without a bottom nav.

---

## 8. Security notes — read before handling real money

This project is a faithful code separation, **not** a security hardening pass. The
financial flows still run in the browser and remain advisory only:

1. **Deposits:** `users/<uid>/deposit` is client-writable. A user can set their own
   balance. The `sms_inbox` claim transaction prevents double use of one TrxID, but a
   client can still write a fake `sms_inbox/<trxId>` record with any `amount` and claim it.
2. **Withdrawals:** the client decrements `winning` and then writes `withdraw_requests`.
   Nothing stops a user from writing a `withdraw_requests` row directly without the
   decrement.
3. **Joining a match:** deduction, participant rows, the `joined` counter and the
   transaction log are four separate client writes. A mid-sequence failure leaves
   inconsistent state (inherited from the original design).

The real fix is **Firebase Security Rules plus trusted Cloud Functions** for every
balance mutation, with the client reduced to a thin UI. That is a separate piece of work
and has intentionally not been attempted here, because it would change your architecture.

---

## 9. Testing performed

Verified in this environment:

- **Syntax:** `node --check` on all 33 JS modules — all pass.
- **Static graph:** 248 references checked — every relative `href`/`src`, every
  `data-include` fragment, every JS `import` path, and every imported symbol against the
  target module's exports. Zero missing assets, imports, exports or handlers.
- **HTTP:** served with `python3 -m http.server` and requested all 72 project files —
  every page, component, stylesheet and module returned `200`.
- **Unit-style smoke tests** (run under Node with stubbed Firebase and DOM):
  - match card renderer: image, map, ID suffix, prize/kill/entry/type, spots left,
    progress width, countdown attribute, join button states, `checkRoom` handler,
    result variant with no countdown.
  - match service: participant mapping, joined detection, category/status filtering,
    `myMatches`, `findMatch`.
  - join transaction: deposit-first then winning deduction, fee × number of players,
    multi-player (duo) charging, and full abort on insufficient balance (no participant
    rows, no counter bump, no transaction, no commit).
  - withdraw: empty fields, minimum 100 TK, above-balance rejection, successful request
    write with correct `withdraw_requests` + `transactions` payloads, loader cleared,
    redirect to wallet, and no writes when the user cancels.
  - deposit verify: bad TrxID format, reused TrxID, TrxID not yet received, already-claimed
    SMS, wrong payment method, successful credit + `Auto Pay` marker + transaction +
    input reset, and losing the atomic claim race.
  - history list and balance UI: empty state, card count, newest-first reversal, amount
    formatting (`375.50` total, raw winning value), fallback type label.

**Not tested:** a real browser session against your live Firebase project, because that
requires the API key from step 1.1 and real user data. Everything that could be verified
without them was verified.

---

## 10. Remaining setup requirements

The site is deployed and every page, stylesheet, module and component fragment loads
correctly over HTTPS (139 requests verified against the live URLs). What is **not** yet
verified is Firebase sign-in on the deployed site, because it cannot work until step 1
is done.

1. **Paste the real `apiKey` into `js/firebase/config.js`**, then commit and push. Until
   this is done, the deployed site reaches `login.html` and shows the configuration
   message instead of signing anyone in.
2. **Add `rionshikder8-png.github.io` to Firebase → Authentication → Settings →
   Authorized domains.** Without this exact hostname, login fails with
   `auth/unauthorized-domain` even after the key is correct.
3. Confirm your Realtime Database rules allow the paths in section 6 for signed-in users,
   and that the `sms_inbox` reader app is still writing to them.
4. Decide whether to harden the financial flows (section 8). Recommended before real money.

Steps 1 and 2 are the only things standing between the current deployment and working
login. Neither can be done from this repository — both are Firebase console changes.

---

Developer — Iasan · WhatsApp `+8801819441618`
