(This project serves a tiny static demo that shows live speech-to-text and playback.)

How to publish with GitHub Pages

1. Push your code to a GitHub repository and ensure the default branch is `main`.
2. Enable GitHub Pages to serve the `gh-pages` branch (the workflow will create/update it).
3. The included workflow `./.github/workflows/deploy-pages.yml` will run on pushes to `main` and publish the repository root to the `gh-pages` branch using the built-in `GITHUB_TOKEN`.

Notes

Custom domain (GitHub Pages)

If you want to serve the site from `nativecho.ukiuni.com`:

1. Create a DNS A record pointing `nativecho.ukiuni.com` to GitHub Pages' IPv4 addresses:

	- 185.199.108.153
	- 185.199.109.153
	- 185.199.110.153
	- 185.199.111.153

2. Alternatively, if you're using an apex domain, add the required A records; for subdomains you can also use a CNAME to `ukiuni.github.io`.
3. This repo already contains a `CNAME` file with `nativecho.ukiuni.com`. After the workflow publishes to `gh-pages`, GitHub Pages will serve that domain if DNS is configured correctly.

If you see a 404 at the custom domain after deploying, check:

- That the `gh-pages` branch contains the site (the workflow creates/updates it).
- That the `CNAME` file is present on the published branch.
- GitHub Pages settings for the repository show the custom domain and that the certificate is provisioned (may take a few minutes).
- DNS records have propagated (can take up to 48 hours; often much faster).

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

