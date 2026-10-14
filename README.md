# E-INVORA Digital Invitations

React + Vite front end served by a small Express server (`server.ts`). Bookings, RSVP responses and settings are saved by the server in `server/data/store.json`. The owner login is saved as a password hash in `server/data/owner.json`. Both files are git-ignored.

## Run it on Windows (easiest)

1. Install Node.js LTS from https://nodejs.org (version 20.19+ or 22.12+).
2. Double-click **`start-local.bat`** in this folder.
   - The first run installs packages (a few minutes) and creates `.env`.
   - Your browser opens automatically. Keep the black window open while you use the site.

**Local address: http://localhost:3000**
If port 3000 is busy, the server uses the next free port and prints the exact address (and the browser opens on it).

**Stop the server:** press `Ctrl+C` in the black window, or close it.

> Do not double-click `index.html`. A page opened from a file cannot run this app, and the browser would show a white page. The page now explains this, but always start the server first.

## Run it manually (any system)

```
npm install
npm run dev        # development, http://localhost:3000
```

Production-style run:

```
npm run build
npm run start       # sets NODE_ENV=production for you
```

## First-time owner setup (admin login)

No admin password exists in the code. You choose your own:

1. Start the server and read the terminal. It prints `One-time setup key: ...`.
2. Open `/admin/login`, enter the setup key, your email and a password of 12+ characters.
3. The setup form closes itself. The password is saved only as a scrypt hash.

To change your email or password later: Admin > **Settings & Security** > *Change Owner Login*. It needs your current password. All other signed-in devices are signed out after a change.

If you forget the password: stop the server, delete `server/data/owner.json`, start again and repeat setup. Bookings and RSVPs are not touched.

## Environment variables (`.env`, optional)

| Name | Purpose |
|---|---|
| `PORT` | Website port (default 3000) |
| `OWNER_SETUP_KEY` | Your own setup key (16+ chars). Required for first setup in production |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Optional: create the owner from `.env` on first start (12+ char password, then remove it) |
| `ADMIN_SECRET_SESSION` | Long random text for signing sessions. Set it in production |
| `GEMINI_API_KEY` | Optional AI drafting (server side only) |

Never put secrets in variables starting with `VITE_`, because those end up in the browser.

## Features and where to find them

- Packages: Basic ₹499, Standard ₹799, Royal Premium ₹1,199 (prices come from `src/data/initialData.ts`).
- RSVP: guests reply on a live invitation (`/invite/<name>`) with no login. Responses show in Admin > **RSVP Responses**. The form appears only for Standard and Royal Premium. The RSVP form on demo pages is a preview and saves nothing.
- Contact details: WhatsApp and phone +91 8778095016, email nivasrhari@gmail.com. Editable in Admin > Settings.

## Troubleshooting

| Problem | Fix |
|---|---|
| White page | You opened `index.html` directly. Use `start-local.bat` or `npm run dev` and open the localhost address |
| `'node' is not recognized` | Install Node.js LTS, then open a new window |
| Packages fail to install | Check internet, delete the `node_modules` folder, run again |
| Page says the server is not reachable | The server window was closed. Start it again |
| Port already in use | The server picks the next port automatically. Use the address it prints |
| Cannot sign in | Check email and password. After 10 failed tries wait 15 minutes. See "forgot password" above |
| Admin says setup is off | Add `OWNER_SETUP_KEY=` (16+ characters) to `.env` and restart |
| Still stuck | Press F12, open Console, and read the red message. Also read the server window |

## Back up your data

Copy the `server/data` folder regularly. It holds all bookings, payments records, RSVP responses and the owner login hash.

## Known limits

- Data is stored in local files, not Supabase. `supabase/` files in this project are not used by the running app.
- Templates, packages and categories are re-loaded from `src/data/initialData.ts` every time the server starts. Change them in that file, not only in the admin screens.
- Live reload (HMR) is switched off in development to avoid port clashes. Refresh the browser after code changes.
- A public site needs HTTPS and a host that can run Node (not static-only hosting).
