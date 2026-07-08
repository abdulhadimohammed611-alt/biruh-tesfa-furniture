/**
 * ============================================================
 * BIRUH TESFA FURNITURE — Custom Animation Hooks
 * ============================================================
 * Reusable React hooks for mouse parallax and counter animations.
 * Import from here — never duplicate hook logic.
 */

import { useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * useMouseParallax
 * Returns spring-smoothed MotionValues for x/y, normalized to [-1, 1].
 * Automatically disabled on touch devices.
 *
 * @param {number} stiffness - Spring stiffness (default: 55)
 * @param {number} damping   - Spring damping (default: 18)
 * @returns {{ x: MotionValue, y: MotionValue }}
 */
export function useMouseParallax(stiffness = 55, damping = 18) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const x = useSpring(rawX, { stiffness, damping, mass: 0.6 });
  const y = useSpring(rawY, { stiffness, damping, mass: 0.6 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Disable on touch-primary devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const handleMove = (e) => {
      rawX.set((e.clientX / window.innerWidth  - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [rawX, rawY]);

  return { x, y };
}

/**
 * useCountUp
 * Counts from 0 to `target` using easeOutQuart when the ref element
 * enters the viewport. Returns both the animated count value and a ref
 * to attach to the trigger element.
 *
 * @param {number} target   - Final count value
 * @param {number} duration - Animation duration in ms (default: 2200)
 * @returns {{ count: number, ref: React.RefObject }}
 */
export function useCountUp(target, duration = 2200) {
  const [count, setCount]     = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  // Trigger via IntersectionObserver
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // Animate the counter
  useEffect(() => {
    if (!started) return;

    let rafId;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [started, target, duration]);

  return { count, ref };
}
