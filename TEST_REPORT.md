# E-INVORA Test Report (13 Oct 2026)

Environment: Linux sandbox, Node 22.22, no real browser available (Chromium download was blocked).
UI checks used jsdom, which runs the real React app but does not do layout, CSS or images.

## Passed (actually run)
- `tsc --noEmit`: no errors. `vite build`: succeeded. Dev server and production-mode server both start.
- Pages render with no console errors and visible content: `/`, `/gallery`, 3 demo packages, `/invite/<slug>` (Standard and Basic), unknown invitation, `/admin/login`, `/admin`, unknown URL.
- Gallery: 12 designs, 12 View Demo and 12 Book Design buttons, simple event names, simple event filters, no "Design & Cultural Attributes" section, none of the removed labels, no Tamil text, price range ₹499 — ₹1,199.
- No "Lifetime", "Keepsake", "Cloud Hosting", "6-Month", "1-Year" or UPI text on the home page, gallery or demos.
- Package features and prices: ₹499 / ₹799 / ₹1,199, features match your list. Demo shows the correct sections per package.
- Links: every WhatsApp link uses 918778095016; `tel:+918778095016`; `mailto:nivasrhari@gmail.com`. Logo present with alt "E-INVORA Digital Invitation".
- Security (live API): logged-out access to admin routes returns 401; forged cookie 401; wrong setup key rejected; weak password rejected; setup works once and then closes; login works (email case-insensitive); wrong password 401; password stored only as scrypt hash (file mode 600); changing credentials needs a session and the current password; after a change the old password fails, new one works, old sessions are signed out; logout ends the session; no public admin registration route; production mode without a setup key disables admin setup.
- Bookings: empty form rejected (400), invalid package rejected, valid bookings saved and confirmed only after the server saved them. The server sets the price (₹799 / ₹499).
- RSVP: Standard invitation accepts yes/no replies; invalid name, choice or guest count rejected; Basic invitation refused (403); unknown invitation 404; only the owner can read or delete responses.
- Built JavaScript bundle contains no passwords, setup key, or old default credentials. The public invitation API does not expose the customer phone number.

## Not verified
- Visual layout on desktop, tablet and mobile, image loading, and the animations (no real browser).
- Clicking through the booking form and RSVP form in a browser (the underlying API was tested, the form code was only rendered).
- `start-local.bat` itself (written for Windows; this sandbox is Linux). The server features it relies on (port fallback, browser opening) were not run on Windows.
- Admin screens after sign-in (Bookings, RSVP tab, Settings) were type-checked but not rendered while signed in.
- Supabase: not used by this app, so nothing to test.

## Remaining issues / decisions
- Storage is a local JSON file, not a database. Fine for one owner on one machine; back it up.
- The demo countdown numbers are fixed sample values.
- An existing sample booking from your data contains Tamil-script names. It is customer data, shown only in the admin area, and was left untouched.
