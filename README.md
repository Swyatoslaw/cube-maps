# cube-maps

A 3D cube "planet" floating in a starry space scene, built with [Three.js](https://threejs.org/). Rotate by dragging (or swiping), zoom by scrolling (or pinching). Works on desktop and mobile. Pure static HTML/CSS/JS — no build step, ready for GitHub Pages.

## Structure

- `index.html` — page markup and Three.js import map (loaded from CDN)
- `css/style.css` — layout, HUD, loading screen
- `js/main.js` — scene setup: starfield, lit cube, OrbitControls (rotate/zoom), resize handling
- `textures/face-*.svg` — one square placeholder image per cube face (`px`/`nx`/`py`/`ny`/`pz`/`nz` = +X/-X/+Y/-Y/+Z/-Z)

## Replacing the placeholder images

Swap in your own square images and keep the same filenames (or update the paths in `js/main.js`'s `FACE_URLS` list):

- `textures/face-px.svg` → right face (+X)
- `textures/face-nx.svg` → left face (-X)
- `textures/face-py.svg` → top face (+Y)
- `textures/face-ny.svg` → bottom face (-Y)
- `textures/face-pz.svg` → front face (+Z)
- `textures/face-nz.svg` → back face (-Z)

Any square image format (PNG, JPG, SVG, WebP) works.

## Running locally

Because the page uses ES module imports, open it through a local server rather than as a `file://` URL, e.g.:

```bash
python -m http.server 4173
```

Then visit `http://localhost:4173`.

## Deploying to GitHub Pages

Push to GitHub and enable Pages in the repo settings (Settings → Pages → Source: deploy from the `main` branch, root folder). No build step required.
