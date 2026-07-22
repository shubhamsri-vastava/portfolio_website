/* ================================================================
   PHASE 4A: NAVIGATION INTERACTION
   Smooth scrolling, active navigation, and navbar scroll state.
   ================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  /**
   * Returns the browser-supported scroll preference at the moment it is needed.
   * This keeps interaction comfortable for users who prefer reduced motion.
   */
  const getScrollBehavior = () => (reduceMotionQuery.matches ? "auto" : "smooth");

  /**
   * Scrolls same-page anchor links to their target section without inline code.
   */
  const enableSmoothScrolling = () => {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");
        const target = targetId ? document.querySelector(targetId) : null;

        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
        history.replaceState(null, "", targetId);
      });
    });
  };

  /**
   * Updates the active navigation state for both visual styling and screen readers.
   */
  const setActiveLink = (sectionId) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;

      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  /**
   * Observes the sections represented in the navigation instead of polling scroll position.
   */
  const observeNavigationSections = () => {
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

        if (visibleSections.length) {
          setActiveLink(visibleSections[0].target.id);
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0, 0.15, 0.35, 0.6],
      }
    );

    sections.forEach((section) => observer.observe(section));
  };

  /**
   * Reveals major content sections once as they enter the viewport.
   * The Web Animations API keeps this behaviour inside JavaScript, as requested.
   */
  const observeScrollReveals = () => {
    const revealSelectors = [
      ".about-section",
      ".education-section",
      ".skills-section",
      ".projects-section",
      ".certifications-section",
      ".achievements-section",
      ".roadmap-section",
      ".contact-section",
    ];

    const revealSections = revealSelectors
      .map((selector) => document.querySelector(selector))
      .filter(Boolean);

    if (!revealSections.length || !("IntersectionObserver" in window)) {
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const section = entry.target;
          revealObserver.unobserve(section);
          section.dataset.revealed = "true";

          if (reduceMotionQuery.matches) {
            return;
          }

          section.animate(
            [
              { opacity: 0, transform: "translateY(2rem)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            {
              duration: 700,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "both",
            }
          );
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12,
      }
    );

    revealSections.forEach((section) => revealObserver.observe(section));
  };

  /**
   * Applies the CSS-ready compact glass state after the page has meaningfully moved.
   */
  const updateNavbarScrollState = () => {
    if (!header) {
      return;
    }

    header.classList.toggle("is-scrolled", window.scrollY > 50);
  };

  enableSmoothScrolling();
  observeNavigationSections();
  observeScrollReveals();
  updateNavbarScrollState();

  window.addEventListener("scroll", updateNavbarScrollState, { passive: true });
});
