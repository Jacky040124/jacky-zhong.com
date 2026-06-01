import { useEffect, useRef, useState } from 'react';
import vertSource from '@/shaders/quad.vert.glsl?raw';
import fragSource from '@/shaders/guilloche.frag.glsl?raw';
import crestFallback from '@/assets/crest.svg';

type Props = {
  size?: number;
  fallbackAlt?: string;
};

type P5Instance = {
  remove: () => void;
  canvas?: HTMLCanvasElement;
};

export default function GuillocheCrest({ size = 360, fallbackAlt = 'JZ crest' }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shaderActive, setShaderActive] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    let cleanupSketch: (() => void) | null = null;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

    async function mount() {
      const targetHost = hostRef.current;
      if (!targetHost) return;

      try {
        const { default: P5 } = await import('p5');
        if (cancelled) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const mouse = { x: 0.5, y: 0.5 };
        const seed = Math.random();
        const startedAt = performance.now();

        const sketch = (p: InstanceType<typeof P5>) => {
          // The p5 typings are intentionally loose here — we only call documented APIs.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pAny = p as any;
          let shader: unknown = null;

          pAny.setup = () => {
            pAny.createCanvas(size, size, pAny.WEBGL);
            pAny.pixelDensity(dpr);
            pAny.noStroke();
            shader = pAny.createShader(vertSource, fragSource);
            pAny.shader(shader);
            if (!cancelled) setShaderActive(true);
            if (reducedMotion) pAny.noLoop();
          };

          pAny.draw = () => {
            if (!shader) return;
            const elapsed = (performance.now() - startedAt) / 1000;
            // Time-based 0→1 ramp over 600ms — frame-rate independent.
            const intensity = reducedMotion ? 1 : Math.min(1, elapsed / 0.6);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const s = shader as any;
            s.setUniform('u_resolution', [size * dpr, size * dpr]);
            s.setUniform('u_time', reducedMotion ? 0 : elapsed);
            s.setUniform('u_mouse', [mouse.x, mouse.y]);
            s.setUniform('u_seed', seed);
            s.setUniform('u_intensity', intensity);
            pAny.rect(-size / 2, -size / 2, size, size);
          };
        };

        const instance = new P5(sketch, targetHost) as unknown as P5Instance;

        let onMove: ((event: PointerEvent) => void) | null = null;
        if (!coarsePointer) {
          onMove = (event: PointerEvent) => {
            const rect = targetHost.getBoundingClientRect();
            // Crest's bounding-box left/right edges map to mouse.x = 0/1.
            const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
            const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
            mouse.x = Math.min(1, Math.max(0, dx + 0.5));
            mouse.y = Math.min(1, Math.max(0, dy + 0.5));
          };
          window.addEventListener('pointermove', onMove, { passive: true });
        }

        cleanupSketch = () => {
          if (onMove) window.removeEventListener('pointermove', onMove);
          try {
            instance.remove();
          } catch {
            /* ignore */
          }
        };
      } catch (error) {
        if (!cancelled) {
          console.warn('Guilloche crest failed to mount, leaving SVG fallback in place.', error);
          setShaderActive(false);
        }
      }
    }

    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            mount();
            observer?.disconnect();
            observer = null;
          }
        },
        { rootMargin: '120px' },
      );
      observer.observe(host);
    } else {
      mount();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      cleanupSketch?.();
    };
  }, [size]);

  return (
    <div
      ref={hostRef}
      className="guilloche-crest"
      style={{ width: size, height: size }}
      role="img"
      aria-label={fallbackAlt}
      data-shader-active={shaderActive}
    >
      <img
        src={crestFallback.src}
        width={crestFallback.width}
        height={crestFallback.height}
        alt=""
        aria-hidden="true"
        className="guilloche-crest__fallback"
      />
      <style>{`
        .guilloche-crest {
          position: relative;
          display: block;
          line-height: 0;
          max-width: 100%;
          aspect-ratio: 1 / 1;
        }
        .guilloche-crest canvas {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          display: block;
        }
        .guilloche-crest__fallback {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 1;
          transition: opacity 360ms ease-out;
          pointer-events: none;
        }
        .guilloche-crest[data-shader-active="true"] .guilloche-crest__fallback {
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
