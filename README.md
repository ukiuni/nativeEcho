(This project serves a tiny static demo that shows live speech-to-text and playback.)

How to publish with GitHub Pages

1. Push your code to a GitHub repository and ensure the default branch is `main`.
2. Enable GitHub Pages to serve the `gh-pages` branch (the workflow will create/update it).
3. The included workflow `./.github/workflows/deploy-pages.yml` will run on pushes to `main` and publish the repository root to the `gh-pages` branch using the built-in `GITHUB_TOKEN`.

Notes
- The site is static: `index.html`, `main.js`, and assets are published as-is.
- If you host on a custom domain, add the domain file to the repo or adjust the workflow settings.

Local testing

Serve locally (recommended) with a simple HTTP server, for example:

```bash
# Python 3
python3 -m http.server 5500

# or using Node.js
npx serve . -p 5500
```

Automate repo creation & push

There's a helper script `scripts/create_and_push_repo.sh` which will create the GitHub repository (using `gh`) and push the current directory to `main`.

Usage:

```bash
chmod +x scripts/create_and_push_repo.sh
./scripts/create_and_push_repo.sh

