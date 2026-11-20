# DocPulse — website

Product site for **DocPulse**, a release documentation and publishing system by KasunRocz Softwares.

**Live:** https://qulaxy.com/DocPulse-Site/
**Source code:** https://github.com/KasunRocz-Softwares/DocPulse

## Editing

Plain static files, no build step:

- `index.html` — the page
- `styles.css` — styles, in the [KasunRocz Softwares](https://qulaxy.com/) visual family (pink accent)
- `app.js` — the published-note card, the publishing pipeline and the page-designer preview
- `kr-hero.js` — the shared 3D hero planet ("pages" kind: release pages orbiting and being published, used only by DocPulse; Three.js from jsDelivr; the page works without it).
  It is a copy of the shared file used by the other project sites; update them together.
- `icon.svg`, `og.png` — tab icon and link-preview image
- `setup/docker-compose.yml`, `setup/env.example` — the self-host files shown and offered for download in the Setup section.
  They are copies of `deploy/` in the DocPulse repo; update both together.

Preview locally with `python -m http.server` in this folder. GitHub Pages publishes `main` on every push.
