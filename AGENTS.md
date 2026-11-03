# Instructions for AI assistants updating this site

This is Yubo Kou's academic website (Jekyll on GitHub Pages; pushes to `main` deploy automatically). Most requests are content updates. Make them in the `_data/*.yml` files, not in the HTML.

## Rules

- Never invent facts. Titles, author lists, venues, years, awards, positions, and links must come from what the person gives you or from a source you can cite (DOI page, ACM DL, the CV). If something is missing, ask or leave the field out. Never publish placeholder text such as "[TBD]".
- `_data/publications.yml` is ordered newest year first. Insert new papers at the top of their year. Keep the author string exactly as published; the site bolds "Yubo Kou" automatically.
- Use these short `venue` tags: CHI, CHI PLAY, CSCW (PACM HCI CSCW papers), JCSCW (the CSCW journal), DIS, IDC, SOUPS, USENIX Security, IEEE S&P, CCS, GROUP, FDG, HICSS, AMIA, INTERACT, iConference, MedInfo, CHI Workshop, IDC Workshop, CSCW Companion, DIS Companion. Add a new tag only when none fits.
- About six papers have `featured: true` (shown on the homepage). When featuring a new paper, remove the flag from the oldest featured one.
- Awards: add `award: "Best Paper Honorable Mention"` (or the exact award name) to the paper. The site shows it as a small note under that paper only; Yubo prefers a low-key site, so do not add a separate awards or honors section.
- Students: `_data/people.yml`. Graduates move from `current` to `former` with `year` and `next`.
- After every update, set `last_updated` in `_data/profile.yml` to today's date, e.g. "Nov 2, 2026".
- Keep the style: game-UI labels (QUEST LOG, PARTY, SAVE POINT) are small accents; headings and content stay plain and academic.
- Accessibility: keep alt text on images, visible focus states, and text contrast at WCAG AA.

## Checking a change

YAML must stay valid: two-space indentation, strings in double quotes, inner double quotes escaped as `\"`. Before committing, run `python3 -c "import yaml,glob;[yaml.safe_load(open(f)) for f in glob.glob('_data/*.yml')]"` (or an equivalent check). Use a short commit message that says what changed, e.g. "Add CHI 2027 paper on teen streaming".
