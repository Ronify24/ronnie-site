# ronnie-website
My Personal Website

## Interface gallery

Put current screenshots in `gallery/v2/` and older screenshots in `gallery/v1/`.
Supported formats: PNG, JPG/JPEG, WebP, AVIF, and GIF. Use unique filenames.
Commit the images and publish to `main` as usual. GitHub Pages builds
`gallery/manifest.json` from these folders automatically; no JavaScript image
list needs editing. Removed or renamed images are reflected on the next publish.
V2 opens by default. Workspace, Shots, Cut, Assets, and Reference stay first;
other images follow in natural filename order. V1 uses natural filename order.

For the plain local preview server, run `python3 scripts/build_gallery_manifest.py`
after adding/moving images, then refresh the page. Commit its generated fallback
(`gallery/local-manifest.js`) too. The published site uses the automatic manifest.
The manifest requires the existing GitHub Pages Jekyll build; do not add `.nojekyll`.
