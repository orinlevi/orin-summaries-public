# Orin Summaries

Course summaries website for **B.Sc. in Psychology & Computer Science** (emphasis in Neuroscience) at **Tel Aviv University**.

## Overview

A static course summaries platform built with **Next.js 16**, organized as a Turborepo monorepo. Covers 45+ courses across three tracks:

- **Computer Science & Math** -- Discrete Math, Calculus, Linear Algebra, Intro to CS, Algorithms, etc.
- **Psychology** -- Intro to Psychology, Cognitive, Social, Developmental, Psychopathology, etc.
- **Neuroscience** -- Neurobiology, Brain Structure, Perception & Psychophysics, etc.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19 |
| Styling | Tailwind CSS 4 |
| Content | Markdown + KaTeX math + MkDocs admonitions |
| Monorepo | Turborepo |
| LaTeX | XeLaTeX with Hebrew (polyglossia + DavidCLM) |
| Deployment | Static export (Vercel / any CDN) |

## Quick Start

```bash
# Install
npm install

# Dev server (localhost:3000)
npm run dev

# Production build
npm run build
```

## Project Structure

```
orin-summaries/
├── apps/web/                  # Next.js application
│   ├── src/app/               # Pages (App Router)
│   ├── src/components/        # React components
│   ├── src/lib/               # Utilities (courses, content)
│   ├── content/               # Course content (Markdown + JSON)
│   │   ├── courses.json       # Central course configuration
│   │   └── {course}/notes/    # Markdown summaries
│   └── public/assets/         # PDFs, images, notebooks
├── packages/remark-mkdocs/    # Custom MkDocs-to-React plugin
├── CONTRIBUTING.md            # Detailed guide for adding content (Hebrew)
└── scripts/                   # Build & sync utilities
```

## Documentation

All project documentation is in the **[`docs/`](docs/)** folder:

| File | What's inside |
|------|---------------|
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | How to add courses, Markdown, LaTeX, assets (Hebrew) |
| [COUPONS.md](docs/COUPONS.md) | Coupon system - codes, usage tracking, how to create |
| [STORE_LAUNCH_CHECKLIST.md](docs/STORE_LAUNCH_CHECKLIST.md) | Paddle launch checklist (when store is approved) |
| [AUDIT_BACKLOG.md](docs/AUDIT_BACKLOG.md) | Prioritized list of improvements and bug fixes |

## Features

- Full **Hebrew RTL** support
- **KaTeX** math rendering (inline and display)
- **Syntax-highlighted** code blocks
- **MkDocs admonitions** (`!!! info`, `!!! warning`, etc.)
- **Table of Contents** sidebar with scroll-spy
- **Jupyter notebooks** with Colab links (cs1001)
- **Python code files** for download
- **LaTeX PDF** summaries for offline use
- **Dark theme** design

## Author

**Orin Levi** -- Tel Aviv University

## License

All rights reserved.
