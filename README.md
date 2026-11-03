# Yubo Kou — personal website

A small Jekyll site that GitHub Pages builds automatically. There is no build step to run: push to `main` and the site updates in about a minute.

## Where things live

| To change… | Edit this file |
|---|---|
| Name, titles, bio, speech bubble, photo, email, links, "Last saved" date | `_data/profile.yml` |
| Research areas (the quest log) | `_data/quests.yml` |
| Publications (homepage and full list) | `_data/publications.yml` |
| Students | `_data/people.yml` |
| Awards on the homepage | `_data/awards.yml` |
| Courses | `_data/teaching.yml` |
| Colors and fonts | `assets/css/site.css` (variables at the top) |
| Page structure | `index.html`, `publications.html`, `404.html`, `_layouts/default.html` |

## Common updates

**Add a paper.** Copy an entry in `_data/publications.yml`, paste it under the other papers from the same year (the file is newest year first), and fill in `year`, `title`, `authors`, `venue` (short tag such as `CHI`), `venue_full`, and `type` (`paper` or `other`). Optional: `award`, `link` (DOI or PDF), and `featured: true` to show it on the homepage (keep about six featured; remove the flag from the oldest one).

**Add the photo.** Put the image in `assets/img/` (for example `assets/img/yubo.jpg`, about 800×1000 px) and set `photo: "assets/img/yubo.jpg"` in `_data/profile.yml`.

**Add the CV.** Put the PDF in `assets/cv/` and set `links.cv` in `_data/profile.yml`. A "CV" link then appears in the menu.

**A student graduates.** Move them from `current` to `former` in `_data/people.yml` and fill in `year` and `next` (their new position).

After any change, update `last_updated` in `_data/profile.yml`.

## Publishing with GitHub Pages

1. Push this folder to a GitHub repository (for example `yubokou`).
2. In the repository, open **Settings → Pages**, set **Source** to "Deploy from a branch", choose `main` and `/ (root)`, and save.
3. In `_config.yml`, set `url` to `https://YOUR-USERNAME.github.io` and keep `baseurl: "/yubokou"` (use the repository name). For a custom domain, set `baseurl: ""` and add the domain in Settings → Pages.

The site will be at `https://YOUR-USERNAME.github.io/yubokou/`.

## Secret

On any page, type ↑ ↑ ↓ ↓ ← → ← → B A.
