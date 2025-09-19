// EXISTING CODE: Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // NEW CODE: Smooth scrolling para sa mga anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // === ADDED: safe register (kept behavior, avoids errors if CDN missing) ===
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // Initial load animation para sa hero section
    gsap.from('.hero-section .card', {
        y: 100,
        opacity: 0,
        stagger: 0.3,
        duration: 1.2,
        ease: 'power3.out'
    });

    // Animation para sa bawat section kapag nag-s-scroll
    gsap.utils.toArray('section').forEach(section => {
        // Iba-iba ang animation depende sa ID ng section
        let animation;
        let triggerElement = section;
        
        // Simpler, more reliable animation for all sections including about-us and contacts
        animation = gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power2.out'
        });

        // Specific, simpler animation for about-us
        if (section.id === 'about-us') {
            animation = gsap.timeline()
                .from(section.querySelector('.content-text'), {
                    x: -100,
                    opacity: 0,
                    duration: 1,
                    ease: 'power2.out'
                })
                .from(section.querySelector('.content-img'), {
                    x: 100,
                    opacity: 0,
                    duration: 1,
                    ease: 'power2.out'
                }, '-=0.5'); // Start a bit earlier
        }

        // Specific, simpler animation for contacts
        if (section.id === 'contacts') {
             animation = gsap.timeline()
                .from(section.querySelector('.contact-details'), {
                    x: -50,
                    opacity: 0,
                    duration: 1,
                    ease: 'power2.out'
                }, 'start')
                .from(section.querySelector('.contact-form-container'), {
                    x: 50,
                    opacity: 0,
                    duration: 1,
                    ease: 'power2.out'
                }, 'start')
                .from(section.querySelector('.map-container'), {
                    y: 50,
                    opacity: 0,
                    duration: 1,
                    ease: 'power2.out'
                }, 'start+=0.5');
        }


        ScrollTrigger.create({
            trigger: triggerElement,
            animation: animation,
            start: 'top 95%', 
            toggleActions: 'play reverse play reverse'
        });
    });

    // Animation para sa footer
    gsap.from('.footer-container', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.footer',
            start: 'top 85%',
            toggleActions: 'play reverse play reverse'
        }
    });

    // Back to Top button functionality
    const toTopButton = document.querySelector('.to-top-btn');
    if (toTopButton) {
        toTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
// === Page Transition (additions) ===
(function () {
    // Helper to run the wipe transition then navigate
    function runPageTransition(direction, url) {
        const overlay = document.createElement('div');
        overlay.className = `page-transition from-${direction}`;
        document.body.appendChild(overlay);

        // next frame → trigger the slide-in
        requestAnimationFrame(() => {
            overlay.classList.add('is-active');
            overlay.addEventListener('transitionend', () => {
                window.location.href = url;
            }, { once: true });
        });
    }

    // Bind for links that declare a transition
    document.querySelectorAll('a[data-transition="wipe-left"]').forEach(a => {
        a.addEventListener('click', (e) => {
            // allow middle-click / new tab without blocking
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            runPageTransition('left', a.href);
        });
    });

    document.querySelectorAll('a[data-transition="wipe-right"]').forEach(a => {
        a.addEventListener('click', (e) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            runPageTransition('right', a.href);
        });
    });
})();
// --- Footer helpers ---
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('copyright-year');
  if (y) y.textContent = new Date().getFullYear();

  const toTop = document.querySelector('.footer__to-top');
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});