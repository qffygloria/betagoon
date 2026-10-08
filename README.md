# SYNVEIL — Adaptive Visual Interaction System

**SYNVEIL** (Chinese: 序帷) is an *Adaptive Visual Interaction System* concept:
a screen-interaction pipeline built on body-part semantics, composable visual
effects, and a dynamic rules layer — *Perception. Rules. Control.*

This repository hosts the **public web demo** of the concept: a brand site,
an interactive demo, and a control-center console. It is a **personal,
non-commercial software development and technology demonstration project**.

> **Live demo:** https://qffygloria.github.io/betagoon/
> (custom domain `synveil.is-a.dev` pending approval)

## Status

| | |
|---|---|
| Web demo | ✅ Live (this repo) |
| Languages | ✅ English + 简体中文 |
| Godot Runtime connection | ❌ **Not connected.** The website is a self-contained browser demo. It does not connect to, control, or stream from any Godot runtime or local software. |
| Hotscreen V2 1.0 software | Separate local project — not part of this repository |

All figures, events, transactions, and progression on this site are
**simulated demo data**. Nothing leaves your browser: there is no backend,
no accounts, and no telemetry. The only external requests are static assets
such as fonts.

## What the demo includes

### Interactive Demo (`#/demo`)
Try the core idea hands-on: three neutral test patterns (Orbs, Bars, Wave) ×
seven filters (Pixelate, Blur, Solid Cover, Glitch, Cel Shader, Cellular Noise, Oil Painting) × a Global Level slider (0–10).
Everything is computed live on canvas and clearly labeled **DEMO**.

### Control Center (`#/app/*`)
A nine-module console simulating how such a system could be operated:

- **Dashboard** — system overview: censor level, XP, compliance, credits, contracts, zone states, event timeline
- **Body Parts** — neutral mannequin zone editor (HEAD / TORSO / ARM / HAND / LEG), keyboard-operable, zones tinted by exposure state
- **Effects Studio** — filter stack with drag-to-reorder, filter library, per-filter parameters, and a live before/after canvas preview
- **Progression** — XP stages and unlocks (simulated)
- **Economy** — credits ledger (simulated)
- **Contracts** — time-boxed pacts with milestones (simulated)
- **Access** — permission leases (simulated)
- **Profiles** — four profile cards (theme / rule / feedback / effect), saved to `localStorage`
- **Diagnostics** — runtime log, storage inspector, environment report

### Site
- Brand homepage with live status console, capabilities, pipeline diagram (Detection → State → Policy → Effect → Renderer), architecture section, honest roadmap, and FAQ
- Technical documentation (`#/docs`): architecture, data model, effect spec, demo-mode guarantees
- Full **English / 简体中文** UI via a language switcher (no reload; preference saved; browser-language detection on first visit)
- Dark/light themes, reduced-motion support, responsive layouts (desktop / tablet / mobile)

## Architecture

A dependency-free single-page app:

```
index.html      → shell: meta/OG tags, font + stylesheet links, locale scripts, app.js
styles.css      → design system (dark/light themes, responsive breakpoints)
app.js          → hash router + all views (marketing site, demo, 9 control-center modules)
locales/en.js   → English strings (477 keys)
locales/zh-CN.js→ 简体中文 strings (477 keys)
favicon.svg     → brand mark
```

- **Hash router** (`#/` , `#/demo`, `#/docs`, `#/app/*`) — works from any base path, no server rewrites needed
- **i18n core** — `t(key, params)` with English fallback and missing-key warnings; internal data IDs stay language-neutral while display strings translate
- **Demo state** — module-level stores; profile choices persist in `localStorage` under stable IDs (legacy display-name values are migrated on load)
- **No build step, no backend** — static files served as-is by GitHub Pages

## DEMO MODE

Every simulated surface is badged **DEMO MODE**. Stats, ledgers, contracts,
and progression are illustrative fixtures, not real accounts or transactions.
The "control center" controls a simulation, not a device.

## Tech stack

Vanilla HTML + CSS + JavaScript (ES6). Canvas 2D for previews. Google Fonts
(Inter, JetBrains Mono, Noto Sans SC) via CDN. No frameworks, no bundlers,
no analytics.

## Development status

- ✅ Brand site, interactive demo, control center (9 modules), docs, i18n
- 🔄 Domain: `synveil.is-a.dev` application pending (is-a.dev review)
- 🔲 Planned (not started): connecting the web demo to a real runtime

## License & positioning

Personal, non-commercial engineering project. Demo only — no downloads,
no payments, no subscriptions, no advertising.
