# Minimum Dependencies App

**Minimum Dependencies APP** is a zero-bloat build tool and dev server for modular web apps. No frameworks, just clean, native.

### Components:
A component is defined via `data-component="welcome"` in your HTML:

```html
<div data-component="welcome"></div>
```

This auto-generates and wires:

```
components/welcome/welcome.html → Injected into the DOM (no Shadow DOM)
components/welcome/welcome.js   → Loaded as a class and initialized
components/welcome/welcome.css  → Scoped styles per component
```

### Pages:
A page is a html file in the public folder, e.g. if we have a welcome-component in `public/play.html`. the component will be fetched from in `components/welcome/play/welcome.html, css and js` if found a /component/welcome/play, otherwise will use components/welcome/welcome.html, css and js.

## Features

- 🔹 **Modular Components** – Self-contained HTML, JS, and CSS
- 🔹 **Live Dev Server** – Lightweight with instant reload
- 🔹 **Auto Templates** – Missing files are scaffolded on the fly

## Getting Started

### Requirements

- Node.js ≥ v14
- npm ≥ v6

### Install

```bash
npm install -g mini-dependencies
```

### Create & Run

```bash
md-app my-app
cd my-app
npm run dev
```

Serves from `defaults/public` with hot reload.

## License

MIT — Open source. Contributions welcome.
