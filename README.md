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

1. Push to `main` -> Vercel auto deploys.
2. Vercel project binds `jacky-zhong.com` (apex) and `www.jacky-zhong.com` (301 to apex, defined in `vercel.json`).
3. DNS keeps existing MX records so `me@jacky-zhong.com` workplace inbox keeps working.

## Implementation phases

| Phase | Scope | Status |
| :---- | :---- | :----- |
| 0 | Bootstrap, deps, design tokens | in review |
| 1 | Foundation layer (Base layout, BlueprintGrid, Cursor, Header, Footer, crest SVG) | planned |
| 2 | Generative layer (Guilloche crest, hatched thumbs, 404 sketch) | planned |
| 3 | Content layout (Hero, Manifesto, About, Projects, Community, Experience, Now, Contact) | planned |
| 4 | HTML in Canvas progressive enhancement | planned |
| 5 | gpt-image-2 build pipeline | planned |
| 6 | Lighthouse tune + SEO + launch | planned |

## Tools and process colophon

Type: Bodoni Moda + Cormorant Garamond + JetBrains Mono via Google Fonts.
Color: ink black `#0F0E0C`, bone white `#F2EDE0`, brass `#B08D57`, oxblood `#5B1A1A`, moss green `#3D4E3A`, faded indigo `#2A3A55`, copper `#D77A3A`. Brass and copper combined stay under 10% of any viewport.
Shaders: Guilloche envelope generator (custom), cross hatching adapted from Jaume Sanchez Elias.
Imagery: gpt-image-2 prompts in `src/content/images.yaml`, post processed with sharp.
License: MIT (see `LICENSE`).
