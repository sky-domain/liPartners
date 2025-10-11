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
/* this is script_local.js
    for testing locally
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
  
  /* do not need the following, because, used absolute urls, 
      e.g. https://www.lipartners.ca/index.html
          https://www.lipartners.ca/zh/index.html
  */
    /* ------------------ Language toggle setup ------------------ */
// function setupLanguageToggle() {
//   const toggles = Array.from(document.querySelectorAll('.lang-toggle'));
//   if (!toggles.length) return;

//   toggles.forEach(toggle => {
//     const computedHref = computeLanguageCounterpartPath();
//     if (computedHref) {
//       toggle.setAttribute('href', computedHref);
//     }

//     // Save preferred language
//     toggle.addEventListener('click', (e) => {
//       const href = toggle.getAttribute('href') || '';
//       const lang = href.includes('/zh/') ? 'zh' : 'en';
//       try { localStorage.setItem('preferredLanguage', lang); } catch (err) {}
//     });
//   });

//   function computeLanguageCounterpartPath() {
//     const path = window.location.pathname;       // e.g. "/aboutUs.html" or "/zh/aboutUs.html"
//     const parts = path.split('/').filter(Boolean);
  
//     // --- English â†’ Chinese ---
//     if (!parts.length || !path.startsWith('/zh/')) {
//       // remove leading "/" then prepend "/zh/"
//       const targetFile = parts.length ? parts.join('/') : 'index.html';
//       return `/zh/${targetFile}`;
//     }
  
//     // --- Chinese â†’ English ---
//     if (path.startsWith('/zh/')) {
//       // remove the "zh/" prefix
//       const targetFile = parts.length > 1 ? parts.slice(1).join('/') : 'index.html';
//       return `/${targetFile}`;
//     }
  
//     // fallback
//     return '/zh/index.html';
//   }
  
// }

  
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

  /* Automatically select the path to language switch
    locally, use relative path zh/index.html
    from lipartners.ca, it is lipartners.ca/zh/index.html
    or lipartners.ca/index.html
    
    otherwise, if use relative urls, it works locally
    online it becomes lipartners.ca/index.html/zh/index.html
  */
 
  /* do not need the following, because, used absolute urls, 
      e.g. https://www.lipartners.ca/index.html
          https://www.lipartners.ca/zh/index.html
  */
  // const langSwitch = document.getElementById('lang-switch');
  // langSwitch.addEventListener('click', function (e) {
  //   e.preventDefault();
  //   const current = window.location.pathname;
  //   const isLocal = window.location.protocol === 'file:';
  //   const zhPath = (isLocal ? 'zh/' : '/zh/');
  //   const enPath = (isLocal ? '../' : '/');

  //   if (current.includes('/zh/')) {
  //     // currently in Chinese site → go to English version
  //     window.location.href = isLocal ? '../index.html' : '/index.html';
  //   } else {
  //     // currently in English site → go to Chinese version
  //     window.location.href = isLocal ? 'zh/index.html' : '/zh/index.html';
  //   }
  // });
  