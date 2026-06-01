# jacky-zhong.com

Personal portfolio of Jacky Zhong. Vancouver based builder of AI agents, organizer of developer communities, creative coder.

Live: https://jacky-zhong.com (production), `pnpm dev` (local).

## Stack

| Layer | Tools |
| :---- | :---- |
| Framework | Astro 6 + React islands + TypeScript strict |
| 3D / shader | Three.js, @react-three/fiber, @react-three/drei |
| Creative coding | p5.js 2.x (instance mode, dynamic import) |
| Animation | GSAP 3, motion, Lenis smooth scroll |
| Image pipeline | OpenAI gpt-image-2 -> sharp post-process |
| Hosting | Vercel + GitHub auto deploy |

## Commands

| Command | Action |
| :------ | :----- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Local dev server at http://localhost:4321 |
| `pnpm build` | Static build to `./dist/` |
| `pnpm preview` | Serve the build locally |
| `pnpm check` | TypeScript + Astro diagnostics |
| `pnpm generate-images` | Call gpt-image-2 for every slot in `src/content/images.yaml` (Phase 5) |
| `pnpm post-process` | Apply sharp LUT + grain + chromatic aberration (Phase 5) |
| `pnpm build-og` | Satori OG image render (Phase 5) |

## Environment

Copy `.env.example` to `.env` and fill in the values. The OpenAI key is loaded from a file path so it never lands in the repo.

```sh
cp .env.example .env
```

## Deploy

`main` auto deploys to Vercel. The first deploy requires the manual steps below; nothing else is automatic.

### Owner action checklist (one time)

The following live outside the repo and need Jacky to run them in order.

1. **Import the repo into Vercel** at https://vercel.com/new. Pick the personal scope, framework preset Astro, root directory the repo root. Confirm install command `pnpm install --frozen-lockfile` and build command `pnpm build` (already declared in `vercel.json`).
2. **Add the production domains** under Vercel project Settings -> Domains: add both `jacky-zhong.com` (apex, primary) and `www.jacky-zhong.com` (let Vercel handle the 301 to apex; `vercel.json` redirect is a backup).
3. **Update DNS at the registrar** (preserve existing MX records so `me@jacky-zhong.com` keeps working):

   | Type | Host | Value |
   | :--- | :--- | :---- |
   | A | `@` | `76.76.21.21` (Vercel anycast apex) |
   | CNAME | `www` | `cname.vercel-dns.com` |
   | MX | `@` | keep existing Google Workspace records (do not touch) |
   | TXT | `@` | keep SPF / DKIM / DMARC if present |

   Vercel will provision a Let's Encrypt cert automatically once both records propagate. SSL takes ~5 minutes after DNS resolves.
4. **Add the OpenAI key** to Vercel project Settings -> Environment Variables only if cloud image generation is wanted in the build. Local generation reads the path declared in `.env`; production currently checks in the post processed PNGs under `public/generated/treated/` so the build does not call OpenAI.
5. **Apply for the Chrome Origin Trial** at https://developer.chrome.com/origintrials/ for the `canvas-draw-element` trial, domain `jacky-zhong.com`. Token gets pasted into `.env` as `ORIGIN_TRIAL_CANVAS_DRAW_ELEMENT`. Phase 4 wires the meta tag.

### Maintenance reminders

- Origin Trial tokens expire every ~6 months; calendar a renewal reminder.
- Lighthouse CI lives in `.github/workflows/` (added in Phase 6); failed perf budgets block deploy.

## Implementation phases

| Phase | Scope | Status |
| :---- | :---- | :----- |
| 0 | Bootstrap, deps, design tokens | merged |
| 1 | Foundation layer (Base layout, BlueprintGrid, Cursor, Header, Footer, crest SVG) | merged |
| 2 | Generative layer (Guilloche crest, hatched thumbs, 404 sketch) | in progress |
| 3 | Content layout (Hero, Manifesto, About, Projects, Community, Experience, Now, Contact) | planned |
| 4 | HTML in Canvas progressive enhancement | planned |
| 5 | gpt-image-2 build pipeline | planned |
| 6 | Lighthouse tune + SEO + launch | planned |

## Tools and process colophon

### Type

- **Bodoni Moda** (display, H1 / H2 / wordmark, italic accents). Google Fonts variable, Open Font License 1.1. Designed by Indestructible Type, after Giambattista Bodoni's 18th century romans.
- **Cormorant Garamond** (body, lede paragraphs). Google Fonts, Open Font License 1.1. Designed by Catharsis Fonts.
- **JetBrains Mono** (micro / mono — coordinates, version stamps, frame labels). Google Fonts, Apache License 2.0. Designed by JetBrains.

### Color

Ink black `#0F0E0C`, bone white `#F2EDE0`, brass `#B08D57`, oxblood `#5B1A1A`, moss green `#3D4E3A`, faded indigo `#2A3A55`, copper `#D77A3A`. Brass and copper combined stay under 10% of any viewport.

### Shaders

- Living Guilloche crest: hand authored fragment shader (`src/shaders/guilloche.frag.glsl`), rose curve envelopes modulated by cursor.
- Cross hatching project thumbs: adapted from Jaume Sánchez Elias' Real Time Hatching shader, port to React Three Fiber + LYGIA helpers.
- 404 page: p5.js sketch, simplex noise field disintegrating Bodoni glyphs into copper engraving line art.

### Imagery

Every hero texture, project thumbnail base, section divider, and OG card is generated build time via the OpenAI Images API. Slot prompts live in `src/content/images.yaml`; the runner is `pnpm generate-images`. Raw PNGs land in `public/generated/raw/`, then `pnpm post-process` runs them through `sharp` for brass-on-ink LUT, film grain overlay, and a 1 to 2 pixel chromatic aberration before the site references the treated copies under `public/generated/treated/`.

Model: `gpt-image-2`, quality medium (~$0.053 per image), 2000 x 1200 hero textures, 1024 x 1024 thumbnails. Cache key is `hash(prompt + size + model)`, so re-running the script skips slots whose source has not changed.

### HTML in Canvas progressive enhancement

Chrome 146+ ships the `drawElementImage` Canvas 2D method behind an Origin Trial. The site applies for the `canvas-draw-element` trial bound to `jacky-zhong.com` and uses it to feed the SVG crest directly into the p5.js shader pipeline for sharper rendering. Browsers without the trial degrade silently to the standalone shader. The trial token rotates roughly every six months.

### License

MIT (see `LICENSE`). The crest mark and the photographed likeness of Jacky Zhong are All Rights Reserved.
