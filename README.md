# GameFolio

GameFolio is a static, interactive developer portfolio built from the PRD in `GameFolio_PRD.docx`. It pairs every portfolio section with a playable mini-game while keeping the actual portfolio content readable without requiring game progress.

## Builder Decisions

### 1. Tech stack

The build uses Vite + vanilla TypeScript. React and Svelte are both productive, but the PRD's gameplay work benefits from direct ownership of requestAnimationFrame loops, canvas state, and pointer input without a component runtime between the game engine and the pixels. Vite keeps the static deployment target simple and gives clean code splitting for the lazy Three.js hero.

### 2. Animation library

GSAP is the primary animation library for entrances and scroll-linked polish because it is mature, predictable, and easy to disable for `prefers-reduced-motion`. CSS transitions are the fallback for reduced-motion users and for all essential UI states.

### 3. Game renderers

Hero uses lazy-loaded Three.js WebGL points so the warp field can scale to thousands of particles. Pong, Tetris, Runner, Snake, and Shooter use Canvas2D because their rules are simple, their visual language is pixel/arcade based, and native canvas keeps the bundle smaller than a full game framework.

### 4. Scroll strategy

The page uses native CSS scroll-snap and IntersectionObserver. It avoids scroll hijacking, keeps iOS momentum scrolling intact, and makes every section reachable by keyboard, touch, wheel, or browser search.

### 5. Performance budget

The initial app loads static HTML, CSS, TypeScript, and GSAP. Three.js is dynamically imported only for the hero canvas and capped by device memory and pixel ratio. Canvas games start only when their section is visible, so off-screen sections do not keep rendering.

## Commands

```bash
npm.cmd install
npm.cmd run dev
npm.cmd run build
```

Portfolio content is centralized in `src/data/portfolio.ts`.
