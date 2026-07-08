/**
 * ============================================================
 * BIRUH TESFA FURNITURE — Centralized Animation System
 * ============================================================
 * Single source of truth for all Framer Motion variants,
 * motion props, easing curves and transitions.
 * Never duplicate animation code — always import from here.
 */

// ─── Easing Curves ────────────────────────────────────────────────────────────
export const EASE_OUT_QUART = [0.25, 0.46, 0.45, 0.94];
export const EASE_IN_OUT    = [0.43, 0.13, 0.23, 0.96];
export const EASE_OUT_EXPO  = [0.16, 1,    0.3,  1   ];
export const EASE_IN_EXPO   = [0.7,  0,    0.84, 0   ];
export const EASE_BACK      = [0.34, 1.56, 0.64, 1   ];

// ─── Reduced Motion ───────────────────────────────────────────────────────────
export const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

/** Returns empty state objects when reduced motion is preferred */
const safe = (variant) =>
  prefersReducedMotion
    ? { hidden: {}, visible: {}, exit: {}, initial: {}, animate: {} }
    : variant;

// ─── Page Transitions (AnimatePresence) ──────────────────────────────────────
export const pageTransitionVariants = safe({
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.28, ease: EASE_IN_EXPO },
  },
});

// ─── Page Entrance (full page fade) ──────────────────────────────────────────
export const pageVariants = safe({
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: EASE_OUT_QUART } },
});

// ─── Section Reveal (scale + fade + rise) ────────────────────────────────────
export const sectionReveal = safe({
  hidden:  { opacity: 0, y: 52, scale: 0.975 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.75, ease: EASE_OUT_EXPO },
  },
});

// ─── Fade Variants ────────────────────────────────────────────────────────────
export const fadeIn = safe({
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, ease: EASE_OUT_QUART, delay },
  }),
});

export const fadeUp = safe({
  hidden: { opacity: 0, y: 36 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: EASE_OUT_EXPO, delay },
  }),
});

export const fadeDown = safe({
  hidden:  { opacity: 0, y: -28 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: EASE_OUT_QUART },
  },
});

export const fadeLeft = safe({
  hidden: { opacity: 0, x: -52 },
  visible: (delay = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO, delay },
  }),
});

export const fadeRight = safe({
  hidden: { opacity: 0, x: 52 },
  visible: (delay = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO, delay },
  }),
});

// ─── Stagger System ───────────────────────────────────────────────────────────
export const staggerContainer = safe({
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
});

export const staggerItem = safe({
  hidden:  { opacity: 0, y: 32 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
});

export const buttonStaggerItem = safe({
  hidden:  { opacity: 0, y: 22 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_QUART },
  },
});

// ─── Image Reveal ─────────────────────────────────────────────────────────────
export const imageReveal = safe({
  hidden:  { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.75, ease: EASE_OUT_EXPO },
  },
});

// ─── Section Heading ──────────────────────────────────────────────────────────
export const sectionHeadingVariants = safe({
  hidden:  { opacity: 0, y: 28 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: EASE_OUT_EXPO },
  },
});

// ─── Gallery ──────────────────────────────────────────────────────────────────
export const galleryImageVariants = safe({
  hidden:  { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.65, ease: EASE_OUT_EXPO },
  },
});

// ─── Testimonials ─────────────────────────────────────────────────────────────
export const testimonialVariants = safe({
  hidden: { opacity: 0, y: 36 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO, delay },
  }),
});

// ─── Mobile Menu (AnimatePresence) ───────────────────────────────────────────
export const mobileMenuVariants = safe({
  hidden:  { opacity: 0, height: 0 },
  visible: {
    opacity: 1, height: 'auto',
    transition: { duration: 0.38, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0, height: 0,
    transition: { duration: 0.25, ease: EASE_IN_EXPO },
  },
});

// ─── Hover: Product Cards ─────────────────────────────────────────────────────
export const cardHoverProps = prefersReducedMotion
  ? {}
  : {
      whileHover: {
        y: -10,
        boxShadow:
          '0 28px 56px -12px rgba(0,0,0,0.22), 0 0 0 1.5px rgba(217,138,39,0.45)',
        transition: { duration: 0.3, ease: EASE_OUT_QUART },
      },
    };

// ─── Hover: Category Cards (lift + rotation + gold glow) ─────────────────────
export const categoryCardHoverProps = prefersReducedMotion
  ? {}
  : {
      whileHover: {
        y: -12,
        rotate: 0.6,
        boxShadow:
          '0 32px 64px -16px rgba(0,0,0,0.28), 0 0 0 1.5px rgba(217,138,39,0.4)',
        transition: { duration: 0.35, ease: EASE_OUT_QUART },
      },
    };

// ─── Hover: Buttons ───────────────────────────────────────────────────────────
export const buttonMotionProps = prefersReducedMotion
  ? {}
  : {
      whileHover: {
        scale: 1.05,
        transition: { duration: 0.2, ease: EASE_OUT_QUART },
      },
      whileTap: {
        scale: 0.96,
        transition: { duration: 0.1 },
      },
    };

// ─── Hover: Icons (scale + slight rotation) ──────────────────────────────────
export const iconHoverProps = prefersReducedMotion
  ? {}
  : {
      whileHover: {
        scale: 1.18,
        rotate: 6,
        transition: { duration: 0.25, ease: EASE_OUT_QUART },
      },
    };

// ─── Hover: Logo ──────────────────────────────────────────────────────────────
export const logoHoverProps = prefersReducedMotion
  ? {}
  : {
      whileHover: {
        scale: 1.07,
        transition: { duration: 0.2, ease: EASE_OUT_QUART },
      },
    };

// ─── Hover: Social Icons (slight rotation on hover) ──────────────────────────
export const socialIconHoverProps = prefersReducedMotion
  ? {}
  : {
      whileHover: {
        scale: 1.15,
        rotate: 8,
        transition: { duration: 0.22, ease: EASE_BACK },
      },
      whileTap: { scale: 0.9 },
    };
