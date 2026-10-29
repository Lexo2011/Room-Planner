# Room Planner

Draw a floor plan, move furniture around, and plan any wall in front view (handy for kitchens) — all in the browser. No install, no account, no build step.

## Features

- **Floor plan** – rooms with draggable corners and walls, L-shapes via extra corners, doors and windows, live wall lengths and room area.
- **Furniture** – catalog for living room, bedroom, kitchen and bathroom; move, rotate, resize, recolour, duplicate. Items snap to the grid, to walls and to each other; overlaps are outlined in red.
- **Wall view** – double-click a wall to see it from the front. Slide cabinets along the wall, drag them up or down to set the mounting height, and read the dimension chains. Changes show up in the floor plan and vice versa.
- **Paint calculator** – paintable area and litres per wall (doors and windows subtracted, also those placed on the neighbouring room's side of a shared wall), per room and in total, so each wall can get its own colour. Click a wall in the list to highlight it. Tick *Paint ceiling* on a room to list its ceiling separately; untick *Paint walls* to leave a room out (e.g. a balcony). Tick *Count in paint total* on an object (a chimney, a shaft, a partition) to paint its sides too; the parts against a wall are left out. *Wall piece* and *Pillar* in the Structure catalog are counted automatically.
- **Work together** – start a session, share the six-character project code (or the invite link), and edit the same plan live with others, including each other's cursors.
- **Extras** – walls with or without thickness, measure tool, clearance to walls for the selected item, undo/redo, autosave in the browser, save/open as file, PNG export, print, share link, light/dark theme, touch support.

All dimensions are in centimetres.

## Shortcuts

| Key | Action |
| --- | --- |
| `R` / `Shift+R` | Rotate 90° / 15° |
| `Ctrl+D` | Duplicate |
| `Del` | Delete |
| Arrow keys (`Shift` = 10 cm) | Nudge |
| `Ctrl+Z` / `Ctrl+Y` | Undo / redo |
| `M` | Measure |
| `F` | Fit to screen |
| `Shift` while dragging | Ignore snapping |
| `Ctrl` while dragging in wall view | Keep the mounting height |
| `Space` + drag, or middle mouse | Pan |

## How working together works

Sessions are peer-to-peer (WebRTC, via [PeerJS](https://peerjs.com) and its free public connection server), so there is no backend to run and the plan is not stored on a server.

- The person who starts the session is the host. Their page has to stay open; when they leave, the session ends and everyone keeps a copy of the plan.
- Joining replaces the plan currently open in your browser with the shared one.
- On some restrictive networks (strict company firewalls) a direct connection cannot be established.

## Run locally

Open `index.html` in a browser.

## Publish on GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.

The site is then served at `https://<user>.github.io/<repository>/`.
