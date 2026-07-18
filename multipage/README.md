# Bassam Anouti — multi-page comparison

This directory is comparison version two. The existing website at the repository root remains unchanged as comparison version one.

## Local comparison

From the repository root, start a local static server:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Then compare:

- Version one: `http://127.0.0.1:4173/`
- Version two: `http://127.0.0.1:4173/multipage/`

Version two is a complete multi-page concept with Home, About, Series, Iconic, Bestiaire Mythique, Exhibitions, and Contact routes. It consumes `data/site-content.json` in the browser and uses only artwork fragments from `media/cropped/`.

## Parallel ownership

Codex owns the HTML, CSS, JavaScript, and this README inside `multipage/`.

Claude owns:

- `multipage/data/**`
- `multipage/media/cropped/**`

Those folders must remain read-only to the site implementation agent.

## Content integration

Claude's content handoff is marked by:

`multipage/data/READY`

`multipage/data/site-content.json` is the source of truth for:

- series hierarchy and work metadata;
- approved cropped-image mapping;
- exhibition verification state;
- contact verification state.

The public pages deliberately filter unverified exhibition and contact claims. When no verified entry exists, they show a restrained archive/status message instead of publishing an unsupported claim.

## Final media handoff

The chrome-free artwork-fragment handoff is complete and marked by:

`multipage/data/CROPS_READY`

All 31 approved WebP assets keep stable `media/cropped/` paths. The cleaned Baba Yaga fragment is published in the Folklore chapter; three works without an approved crop retain a restrained typographic placeholder.

## Content decisions

- Iconic contains History, Mythology, and Folklore only.
- Bestiaire Mythique contains Bestiaire and Hybrides.
- Iconic and Bestiaire Mythique appear only under Series.
- No standalone Process, Education, Religion, or Ancien Testament content is published.
- The approved English biography is preserved.
- Unavailable images are represented typographically and never substituted with full artworks.
- Unverified exhibitions and contact methods remain hidden.

## Validation completed

- All seven routes load successfully through HTTP with working local links and assets.
- Desktop was reviewed at 1440 × 900; mobile was reviewed at 390 × 844, including dense artwork sequences.
- No route has horizontal overflow at the tested sizes.
- Responsive navigation opens and closes accessibly, restores focus on Escape, and exposes a visible focus treatment.
- Iconic chapter links scroll to History, Mythology, and Folklore; the cleaned Baba Yaga crop loads successfully.
- Reduced-motion CSS and JavaScript paths disable non-essential animation and transitions.
- All 31 manifest image references exist, and every public artwork image resolves under `multipage/media/cropped/`.
- No root artwork, full-artwork lightbox, placeholder `#` link, or unverified exhibition/contact claim is published.
- Iconic and Bestiaire Mythique appear only under Series; prohibited standalone sections are absent publicly.
- No production domain, deployment configuration, package file, or root-site file was changed.
