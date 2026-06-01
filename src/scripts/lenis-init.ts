import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;

export function initLenis(): Lenis | null {
  if (typeof window === 'undefined') return null;
  if (lenisInstance) return lenisInstance;

  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (mobile || reducedMotion) return null;

  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  function raf(time: number) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  document.documentElement.classList.add('lenis-smooth');
  lenisInstance = lenis;

  if (import.meta.hot) {
    import.meta.hot.dispose(destroyLenis);
  }

  return lenis;
}

export function destroyLenis(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('lenis-smooth');
  }
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
