import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const INTERACTIVE_SELECTOR = 'a, button, [data-cursor="hover"], input, textarea, label, summary';

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    if (typeof window === 'undefined') return;

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) {
      dot.style.display = 'none';
      ring.style.display = 'none';
      return;
    }

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    const moveDot = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
    const moveDotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
    const moveRing = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3.out' });
    const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3.out' });

    let revealed = false;
    const onMove = (event: PointerEvent) => {
      if (!revealed) {
        revealed = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.2, ease: 'power2.out' });
      }
      moveDot(event.clientX);
      moveDotY(event.clientY);
      moveRing(event.clientX);
      moveRingY(event.clientY);
    };

    const setHover = (active: boolean) => {
      const scale = active ? 2.2 : 1;
      gsap.to(ring, { scale, duration: 0.3, ease: 'power3.out' });
      gsap.to(dot, { scale: active ? 0.6 : 1, duration: 0.3, ease: 'power3.out' });
      ring.classList.toggle('cursor__ring--active', active);
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target && target.closest(INTERACTIVE_SELECTOR)) setHover(true);
    };
    const onOut = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target && target.closest(INTERACTIVE_SELECTOR)) setHover(false);
    };

    const onLeave = () => gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    const onEnter = () => gsap.to([dot, ring], { opacity: 1, duration: 0.2 });

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerover', onOver);
    window.addEventListener('pointerout', onOut);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    document.documentElement.classList.add('has-custom-cursor');

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerout', onOut);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.documentElement.classList.remove('has-custom-cursor');
      gsap.killTweensOf([dot, ring]);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor__ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor__dot" aria-hidden="true" />
      <style>{`
        .cursor__dot,
        .cursor__ring {
          position: fixed;
          left: 0;
          top: 0;
          pointer-events: none;
          z-index: var(--z-cursor);
          mix-blend-mode: difference;
          will-change: transform;
        }
        .cursor__dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-bone);
        }
        .cursor__ring {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--color-bone);
          transition: border-color 0.2s ease;
        }
        .cursor__ring--active {
          border-color: var(--color-brass);
        }
        html.has-custom-cursor,
        html.has-custom-cursor body,
        html.has-custom-cursor a,
        html.has-custom-cursor button {
          cursor: none;
        }
      `}</style>
    </>
  );
}
