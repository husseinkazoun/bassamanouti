# Bassam Anouti — comparison version two

`multipage/` is the web-native comparison concept. The existing website at the repository root remains comparison version one.

## Local comparison

From the repository root, start a static server:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open:

- Version one: `http://127.0.0.1:4173/`
- Version two: `http://127.0.0.1:4173/multipage/`
- Iconic image-presentation study: `http://127.0.0.1:4173/multipage/series/iconic-study/`

The Iconic study is a local comparison surface for three representative works. It preserves the supplied crops at their natural aspect ratios and tests single-, double- and triple-image presentations without masks or overlapping imagery. It is marked `noindex` and is not linked from the public navigation.

## Current public structure

The primary navigation is deliberately concise:

- Work
- About
- Contact

Work currently contains one practice area, **Art**, with two series:

- **Iconic** — History, Mythology and Folklore
- **Bestiaire Mythique** — Bestiaire and Hybrides

Iconic now uses an image-first **art plate** system: every crop keeps its natural aspect ratio, single images remain uninterrupted, and multiple details are arranged as non-overlapping sequences. The separate Iconic study route remains available temporarily for comparison while this direction is reviewed.

The Work layout can receive a second practice later without changing the page hierarchy. **Jewelry Design is a future, pending practice and is not a published route, placeholder or navigation item in this round.**

The existing `exhibitions/` route is retained only as an unlinked, `noindex` archive-review page. It does not appear in public navigation, and no unverified exhibition is published.

## Public and internal data

The browser fetches only:

- `data/site-content.json` — public artist, series, work and confirmed contact content

It never fetches:

- `data/internal-research.json`
- research notes or handoff markers
- jewelry audit material

Internal research files are local production references and must remain outside any public deployment payload. The public manifest contains the approved five-paragraph English biography and no internal research records.

## Artwork policy

- Semiramis and Ninyas is the single approved complete-image exception on the homepage hero.
- Every other displayed artwork image is an approved fragment under `media/cropped/`.
- No complete-artwork lightbox is provided.
- The three Iconic works without approved imagery are named in restrained text-only **Further Works** lists; no large placeholder panels appear.
- Ancien Testament, Religion, Education and Process sections are not published.

## Review-phase details

- The footer carries confirmed email and Instagram links.
- A discreet **Previous version** link remains in the footer while the two concepts are being compared.
- An `EN` position is reserved for a future complete EN/FR language switch; no partial toggle is implemented.
- Social metadata uses `assets/media/bassam-anouti-share.png`, a typography-led card with no artwork.

## Validation completed

- Home, About, Work, Iconic, Bestiaire Mythique, Contact and the unlinked Exhibitions route return HTTP 200.
- Primary navigation is consistently Work · About · Contact.
- Desktop (1440 × 1000) and mobile (390 × 844) layouts have no horizontal document overflow.
- The mobile menu opens, moves focus to its first link, closes on Escape and restores focus to the menu button.
- Focus indicators are visible; reduced-motion mode suppresses non-essential motion.
- No console or page errors were detected in local browser checks.
- Iconic renders History, Mythology and Folklore only; the missing-image works are text-only.
- Every rendered artwork image except the approved hero resolves under `multipage/media/cropped/`.
- Email, Instagram, favicon and social-card assets resolve locally.
- No root-site, package, workflow or deployment file was changed for this production pass.

## Parallel ownership

Codex owns the HTML, CSS, JavaScript and this README inside `multipage/`.

Claude owns and prepares:

- `multipage/data/**`
- `multipage/media/cropped/**`
- `multipage/media/jewelry-review/**`

Those content and media paths remain read-only to the site implementation work.
