# GameFolio

GameFolio is a static, interactive developer portfolio where each section includes a lightweight mini-game and readable portfolio content.

## What This Project Includes

1. Hero particle warp scene (Three.js, lazy-loaded)
2. Five canvas mini-games (Pong, Tetris variant, Runner, Snake, Shooter)
3. Scroll-snap single-page portfolio sections
4. Keyboard + touch controls, local high-score persistence, reduced-motion support
5. Static deploy output (`dist/`) with no backend dependency

## Tech Stack

1. Vite + TypeScript (strict mode)
2. GSAP for section and entrance motion
3. Three.js only for hero WebGL effect (code-split)
4. Native Canvas2D for the game modules

## Project Structure

`src/main.ts`: App bootstrap, section wiring, and game setup  
`src/data/portfolio.ts`: Name, bio, skills, projects, experience, socials  
`src/engine/`: Game loop, input manager, sound engine  
`src/style/globals.css`: Design tokens, layout, and section styling  
`vercel.json`: Hosting headers/build settings for Vercel

## Quick Start

```bash
npm.cmd install
npm.cmd run dev
```

Local dev URL is shown by Vite in terminal output.

## Production Build

```bash
npm.cmd run build
npm.cmd run preview
```

## Customize Portfolio Content

Update the content source in [src/data/portfolio.ts](/d:/Github Project/Game/src/data/portfolio.ts):

1. `name`, `role`, `tagline`, `email`, `location`
2. `skills` and radar values
3. `projects` and links
4. `experience` timeline entries
5. social links and stat cards

## Vercel Deployment

This repo is ready for Vercel static hosting.

1. Push this folder to GitHub.
2. Import the repo in Vercel.
3. Keep defaults, or verify:
   `Build Command`: `npm run build`
   `Output Directory`: `dist`
4. Deploy.

`vercel.json` already includes:

1. Build/output settings for Vite static output
2. Long-term caching for `/assets/*`
3. Security headers (CSP, nosniff, referrer policy)

## Notes

1. `index.html` is the main entry.
2. `index.htm` is included for compatibility redirects.
3. If PowerShell blocks `npm`, use `npm.cmd` commands (already used above).
