# Varnam Mind Care — site

Static site. No build step, no dependencies.

## Run locally

```bash
python serve.py 8899
```

Then open <http://localhost:8899>.

Use `serve.py` rather than `python -m http.server`: it sends `Cache-Control: no-store`,
so edits to `styles.css` / `script.js` show up on a plain refresh instead of the browser
serving a stale copy.

## Deploy to Vercel

**Option A — CLI**

```bash
npm i -g vercel
vercel
```

Run it from this folder. Accept the defaults: no framework, no build command, output
directory `.`. Then `vercel --prod` to promote it.

**Option B — Git**

Push this folder to GitHub, then in the Vercel dashboard: *Add New → Project → Import*.
Framework preset **Other**, build command **empty**, output directory **`.`**.
Every push to the default branch redeploys.

## What ships

`.vercelignore` keeps `serve.py`, the source `.jpg` originals and the superseded photos
out of the deploy — 15 assets, roughly 1.3 MB. The originals stay in the repo so the
images can be re-cut later.

`vercel.json` sets security headers and a one-hour cache on images
(`stale-while-revalidate`), with CSS/JS always revalidated so a deploy takes effect
immediately.

## Booking form

The Book a Session modal posts directly into the practice's Google Form. Field IDs live in
`script.js` as `entry.*` names on the inputs in `index.html`.

**If the Google Form is edited, re-check these IDs.** Adding or reordering questions can
issue new `entry.*` values, and the mapping breaks silently — submissions keep appearing
to succeed while the data goes nowhere. The IDs are recoverable from the form's page
source (`FB_PUBLIC_LOAD_DATA_`).

Submission goes through a hidden iframe because Google rejects cross-origin `fetch`. That
means the response cannot be read: the confirmation panel shows when the iframe loads or
after 4 seconds, whichever is first. It is not proof the row was written.
