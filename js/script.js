/**
 * /js/script.js
 * Complete client interactions for bilingual site:
 * - slideshow
 * - testimonial rotator
 * - language-toggle auto mapping (en <-> zh)
 * - active nav highlighting
 * - close dropdowns on outside click
 * - auto-collapse mobile menu on link click / resize
 */

(function () {
    'use strict';
  
    document.addEventListener('DOMContentLoaded', () => {
      initSlideshow({ selector: '.slideshow-container', slideSelector: '.slide', interval: 4000, pauseOnHover: true });
      initTestimonials({ selector: '.testimonial-container', slideSelector: '.testimonial-slide', interval: 6000 });
      setupLanguageToggle();
      highlightActiveNav();
      closeDropdownsOnOutsideClick();
      autoCollapseMobileMenuOnNavClick();
      setupResponsiveCleanup();
      setupKeyboardShortcuts();
    });
  
    /* ------------------ Slideshow ------------------ */
    function initSlideshow({ selector = '.slideshow-container', slideSelector = '.slide', interval = 4000, pauseOnHover = true } = {}) {
      const container = document.querySelector(selector);
      const slides = container ? Array.from(container.querySelectorAll(slideSelector)) : Array.from(document.querySelectorAll(slideSelector));
      if (!slides.length) return;
  
      let current = 0;
      let timer = null;
  
      function show(index) {
        slides.forEach((s, i) => {
          s.style.display = i === index ? 'block' : 'none';
        });
      }
  
      function next() {
        current = (current + 1) % slides.length;
        show(current);
      }
  
      function start() {
        if (!timer) timer = setInterval(next, interval);
      }
  
      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }
  
      // init
      show(current);
      start();
  
      // pause on hover
      if (pauseOnHover && container) {
        container.addEventListener('mouseenter', stop);
        container.addEventListener('mouseleave', start);
      }
  
      // expose for debugging if needed
      window.__siteSlideshow = { start, stop, next };
    }
  
    /* ------------------ Testimonial rotator ------------------ */
    function initTestimonials({ selector = '.testimonial-container', slideSelector = '.testimonial-slide', interval = 6000 } = {}) {
      const container = document.querySelector(selector);
      if (!container) return;
      const slides = Array.from(container.querySelectorAll(slideSelector));
      if (!slides.length) return;
  
      let idx = 0;
      let timer = null;
  
      function show(i) {
        slides.forEach((s, n) => s.style.display = n === i ? 'block' : 'none');
      }
  
      function next() {
        idx = (idx + 1) % slides.length;
        show(idx);
      }
  
      show(idx);
      timer = setInterval(next, interval);
  
      // Pause on hover
      container.addEventListener('mouseenter', () => {
        if (timer) { clearInterval(timer); timer = null; }
      });
      container.addEventListener('mouseleave', () => {
        if (!timer) timer = setInterval(next, interval);
      });
  
      window.__testimonials = { start: () => { if (!timer) timer = setInterval(next, interval); }, stop: () => { if (timer) { clearInterval(timer); timer = null; } } };
    }
  
    /* ------------------ Language toggle setup ------------------ */
    function setupLanguageToggle() {
      const toggles = Array.from(document.querySelectorAll('.lang-toggle'));
      if (!toggles.length) return;
  
      toggles.forEach(toggle => {
        const computedHref = computeLanguageCounterpartPath();
        if (computedHref) {
          toggle.setAttribute('href', computedHref);
        }
  
        // store preference when user clicks
        toggle.addEventListener('click', (e) => {
          // read the target href to infer language
          const href = toggle.getAttribute('href') || '';
          const lang = href.includes('/zh/') || href.match(/\/zh($|\/|\/index\.html$)/i) ? 'zh' : 'en';
          try { localStorage.setItem('preferredLanguage', lang); } catch (err) { /* ignore storage errors */ }
          // allow navigation to occur normally
        });
      });
  
      // helper: compute counterpart path by swapping the first 'en' or 'zh' path segment,
      // or by prefixing the counterpart if no segment found.
      function computeLanguageCounterpartPath() {
        const path = window.location.pathname || '/';
        // normalize: ensure leading slash
        let p = path;
        if (!p.startsWith('/')) p = '/' + p;
  
        // Split preserving segments; filter removes empty but we need to detect root
        const rawParts = p.split('/'); // leading '' then segments
        const parts = rawParts.filter(Boolean); // e.g. ['en','about.html'] or ['project','en','about.html']
  
        // find 'en' or 'zh' as whole path segment (case-insensitive)
        const enIndex = parts.findIndex(seg => seg.toLowerCase() === 'en');
        const zhIndex = parts.findIndex(seg => seg.toLowerCase() === 'zh');
  
        if (enIndex >= 0) {
          const newParts = parts.slice();
          newParts[enIndex] = 'zh';
          return '/' + newParts.join('/');
        } else if (zhIndex >= 0) {
          const newParts = parts.slice();
          newParts[zhIndex] = 'en';
          return '/' + newParts.join('/');
        } else {
          // no explicit lang segment — decide based on <html lang> or saved preference
          const htmlLang = (document.documentElement && document.documentElement.lang) ? document.documentElement.lang.toLowerCase() : null;
          const saved = (() => { try { return localStorage.getItem('preferredLanguage'); } catch (e) { return null; } })();
          const currentLang = saved || htmlLang || 'en';
          const counterpart = currentLang.startsWith('zh') ? 'en' : 'zh';
  
          // Build counterpart path:
          // If current path is root or index.html -> direct counterpart index
          if (parts.length === 0) {
            return `/${counterpart}/index.html`;
          } else {
            // prefix counterpart as the first segment (keeps any other subfolders)
            return '/' + [counterpart, ...parts].join('/');
          }
        }
      }
    }
  
    /* ------------------ Active nav highlighting ------------------ */
    function highlightActiveNav() {
      const nav = document.getElementById('myTopnav') || document.querySelector('nav.topnav');
      if (!nav) return;
      const links = Array.from(nav.querySelectorAll('a'));
  
      const currentFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  
      links.forEach(link => {
        const href = (link.getAttribute('href') || '').split('?')[0].split('#')[0];
        const linkFile = (href.split('/').pop() || '').toLowerCase();
  
        if (linkFile === currentFile || (linkFile === '' && currentFile === 'index.html')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  
    /* ------------------ Close dropdowns when clicking outside (useful for mobile) ------------------ */
    function closeDropdownsOnOutsideClick() {
      document.addEventListener('click', (evt) => {
        // If click inside a dropdown or on a dropbtn, do nothing
        const target = evt.target;
        if (closest(target, '.dropdown') || closest(target, '.dropbtn')) return;
  
        // Close any open dropdown-content .show
        document.querySelectorAll('.dropdown-content.show').forEach(el => {
          el.classList.remove('show');
        });
      });
  
      // helper to find nearest ancestor matching selector
      function closest(elem, selector) {
        while (elem) {
          if (elem.matches && elem.matches(selector)) return elem;
          elem = elem.parentElement;
        }
        return null;
      }
    }
  
    /* ------------------ Auto close mobile menu on link click ------------------ */
    function autoCollapseMobileMenuOnNavClick() {
      const nav = document.getElementById('myTopnav') || document.querySelector('nav.topnav');
      if (!nav) return;
      nav.addEventListener('click', (e) => {
        const target = e.target;
        // If a nav link (not the hamburger), collapse responsive menu
        if (target.tagName === 'A' && nav.classList.contains('responsive')) {
          // keep dropdown toggle behavior in menu.js (toggleDropdown) intact;
          // simply collapse the nav after a short delay so link navigation still runs.
          setTimeout(() => { nav.className = 'topnav'; }, 200);
        }
      });
    }
  
    /* ------------------ Responsive cleanup on resize ------------------ */
    function setupResponsiveCleanup() {
      window.addEventListener('resize', () => {
        const nav = document.getElementById('myTopnav') || document.querySelector('nav.topnav');
        if (!nav) return;
        // If switching to desktop width, ensure nav isn't left open
        if (window.innerWidth > 650 && nav.classList.contains('responsive')) {
          nav.className = 'topnav';
        }
        // remove any mobile dropdown-content.show when resizing to larger
        if (window.innerWidth > 650) {
          document.querySelectorAll('.dropdown-content.show').forEach(el => el.classList.remove('show'));
        }
      });
    }
  
    /* ------------------ Keyboard shortcuts ------------------ */
    function setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
          // close open dropdowns
          document.querySelectorAll('.dropdown-content.show').forEach(el => el.classList.remove('show'));
          // close mobile nav
          const nav = document.getElementById('myTopnav') || document.querySelector('nav.topnav');
          if (nav && nav.classList.contains('responsive')) nav.className = 'topnav';
        }
      });
    }
  
  })();
  