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

### Reel sources

The `videos` array near the top of `app.js` supports both local MP4 and Vimeo
entries. The first entry is the default selection (playback starts on Play).
The Generative Media reel uses `assets/GenAI_Animation_HDR_v2.mp4` in the native
HTML video player. This is a 59.7 MB HEVC/HDR file; playback requires browser
HEVC support, and HDR presentation depends on the device/display. An SDR source
can be added later for broader compatibility. Keep uploaded files below GitHub's
100 MiB per-file push limit and publish files over 25 MiB using Git/Desktop.

To migrate another reel, replace its Vimeo entry with:
`{ type: 'mp4', src: './assets/your-reel.mp4', title: 'Your reel title' }`.
The count and navigation automatically follow the array length. Vimeo entries
use `{ type: 'vimeo', src: 'https://player.vimeo.com/video/ID', title: 'Title' }`.

VFX and Feature Film follow Animation as `placeholder` entries. Replace their
type with `vimeo` or `mp4` and add a `src` to connect each finished reel.

Animation has a `sources` map for HDR/SDR selection. Keep `sdr: null` until the
SDR file is published, then set it to the relative MP4 URL. Auto prefers HDR
when the display reports high dynamic range and the browser reports HEVC
support; otherwise it prefers SDR. While SDR is absent, only HDR is served.
Manual switching retains playback position. Download controls are hidden where
supported; this does not prevent saving publicly accessible video files.
