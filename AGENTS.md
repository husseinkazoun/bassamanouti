# AGENTS.md

## Cursor Cloud specific instructions

### What this is
Static art portfolio website (`bassam-anouti-portfolio`) — plain HTML/CSS/vanilla JS, no framework and no backend/database. It contains two parallel concepts of the same site:
- Version 1 (repo root): `index.html` + `css/` + `js/` — single-page gallery with category filters and a lightbox modal.
- Version 2 (`multipage/`): a multi-page concept that loads content at runtime via `fetch('data/site-content.json')`.

### Running it (non-obvious caveats)
- You MUST serve over HTTP, not `file://`. Version 2's `fetch()` of `multipage/data/site-content.json` fails under `file://` (CORS), so the page renders blank. Serve from the repo root:
  - `python3 -m http.server 4173 --bind 127.0.0.1`
  - Version 1: `http://127.0.0.1:4173/` · Version 2: `http://127.0.0.1:4173/multipage/`
  - Port 4173 is the documented convention (see `multipage/README.md`); any static server/port works.
- The `npm install` dependency (`wrangler`) is ONLY for Cloudflare Pages deploy emulation. It is not needed to run or view the site.

### Lint / test / build
- No lint, no automated tests, and no build step exist. `npm test` is the npm placeholder stub and will fail by design. Validation is manual/browser-based.
- Deployment is CI-only (`.github/workflows/deploy.yml`, Cloudflare Pages) and requires `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets — do not run deploy locally.

### Content ownership
- `multipage/data/**` and `multipage/media/cropped/**` are treated as the authoritative content manifest (`site-content.json` is the source of truth). Avoid editing these unless the task is specifically about content.
