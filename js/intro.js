/**
 * SHREE MANGLAM — SIGNATURE LUXURY STARTUP ANIMATION CONTROLLER
 * Indian ethnic-fashion luxury splash, paisley/floral SVG motion,
 * silk wave sheen, and seamless homepage dissolve.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'shree_manglam_intro_played';
  const INTRO_DURATION_MS = 2300;
  const FALLBACK_TIMEOUT_MS = 2700;

  const IntroAnimation = {
    overlay: null,
    dismissTimer: null,
    fallbackTimer: null,
    hasDismissed: false,

    init() {
      this.overlay = document.getElementById('smIntroOverlay');
      if (!this.overlay) return;

      // 1. Accessibility: Check for prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        this.instantSkip();
        return;
      }

      // 2. Session check: Run only on first visit in the current browser session
      const alreadyPlayed = sessionStorage.getItem(STORAGE_KEY) === 'true';
      if (alreadyPlayed) {
        this.instantSkip();
        return;
      }

      // 3. Deep link check: If user arrives with a direct product hash (#product-...), skip intro immediately
      if (window.location.hash && window.location.hash.startsWith('#product-')) {
        this.instantSkip();
        return;
      }

      // 4. Lock scrolling while intro plays
      document.body.classList.add('intro-playing');
      document.body.style.overflow = 'hidden';

      // 5. Bind User Interactions to dismiss early (Skip button, click anywhere, Escape key)
      this.bindControls();

      // 6. Schedule normal sequence dissolve at target duration (2.2s - 2.4s)
      this.dismissTimer = setTimeout(() => {
        this.dismiss();
      }, INTRO_DURATION_MS);

      // 7. Resilient Fallback safety timer: guaranteed removal
      this.fallbackTimer = setTimeout(() => {
        if (!this.hasDismissed) {
          this.dismiss();
        }
      }, FALLBACK_TIMEOUT_MS);
    },

    bindControls() {
      // Skip Button
      const skipBtn = document.getElementById('smIntroSkipBtn');
      if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.dismiss();
        });
      }

      // Tap / Click overlay to skip
      if (this.overlay) {
        this.overlay.addEventListener('click', () => {
          this.dismiss();
        });
      }

      // Escape key to dismiss
      const onKeyDown = (e) => {
        if (e.key === 'Escape' && !this.hasDismissed) {
          this.dismiss();
          document.removeEventListener('keydown', onKeyDown);
        }
      };
      document.addEventListener('keydown', onKeyDown);
    },

    dismiss() {
      if (this.hasDismissed) return;
      this.hasDismissed = true;

      if (this.dismissTimer) clearTimeout(this.dismissTimer);
      if (this.fallbackTimer) clearTimeout(this.fallbackTimer);

      sessionStorage.setItem(STORAGE_KEY, 'true');

      if (!this.overlay) {
        this.cleanup();
        return;
      }

      // Add smooth fade & blur dissolve class
      this.overlay.classList.add('dismissing');

      setTimeout(() => {
        this.cleanup();
      }, 480);
    },

    cleanup() {
      if (this.overlay) {
        this.overlay.classList.add('is-hidden');
        this.overlay.setAttribute('aria-hidden', 'true');
      }
      document.body.classList.remove('intro-playing');
      document.body.style.overflow = '';

      // Notify other components (Hero, catalogue, scroll reveal) that intro is complete
      window.dispatchEvent(new CustomEvent('sm-intro-complete', { detail: { timestamp: Date.now() } }));
    },

    instantSkip() {
      this.hasDismissed = true;
      if (this.overlay) {
        this.overlay.classList.add('is-hidden');
        this.overlay.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('sm-intro-complete', { detail: { skipped: true } }));
    }
  };

  // Expose to window for testing / manual triggering if desired
  window.IntroAnimation = IntroAnimation;

  // Initialize as soon as DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => IntroAnimation.init());
  } else {
    IntroAnimation.init();
  }
})();
