// janitorial.js — Broom sweep (matched feel sa "pabalik") + park sa tabi ng "J" + idle float
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ----- 100vh fix -----
  function setVH() {
    document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
  }
  window.addEventListener("resize", setVH, { passive: true });
  setVH();

  // ----- Footer year -----
  const yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();

  // ----- Smooth anchors -----
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ----- Page wipe -----
  const overlay = $(".page-wipe");
  $$("a[data-wipe]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      e.preventDefault();
      if (overlay) {
        const dir = a.getAttribute("data-wipe");
        if (dir === "right") overlay.classList.add("is-active", "wipe-right");
        else overlay.classList.add("is-active");
        setTimeout(() => (window.location.href = href), 500);
      } else {
        window.location.href = href;
      }
    });
  });

  // ===== Scroll animations =====
  $$("[data-animate-group]").forEach((group) => {
    const items = $$("[data-animate]", group);
    items.forEach((el, i) => el.style.setProperty("--stagger", `${i * 90}ms`));
  });
  $$(".section-title").forEach((t) => t.setAttribute("data-animate", "fade"));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => en.target.classList.toggle("in-view", en.isIntersecting)),
    { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
  );
  $$("[data-animate], .section-title").forEach((el) => io.observe(el));

  setTimeout(() => {
    $$("[data-animate], .section-title").forEach((el) => {
      if (!el.classList.contains("in-view")) {
        el.style.opacity = "1";
        el.style.transform = "none";
      }
    });
  }, 700);

  // ----- Burger -----
  const burger = $(".dcp-burger");
  const nav = $(".dcp-nav");
  burger?.addEventListener("click", () => nav?.classList.toggle("dcp-open"));

  // ======= BROOM: enter right -> sweep text -> park LEFT beside "J" -> idle float =======
  const broom = $(".jt-broom");
  const title = $(".jt-title");
  const titleInner = $(".jt-title-inner");
  const subtitle = $(".jt-subtitle");

  if (broom && title) {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Tunables para pareho ang "feel" ng Phase 2 at Phase 3
    const SWEEP_EASE = "cubic-bezier(.22,.61,.2,1)";
    const SWEEP_DUR  = 2000; // adjust kung kailangan (ms)
    const PARK_EASE  = "cubic-bezier(.22,.61,.2,1)";
    const PARK_DUR   = 2000; // halos kapareho ng SWEEP_DUR

    const compute = () => {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

      const broomBox = broom.getBoundingClientRect();
      const titleBox = title.getBoundingClientRect();

      const centerDeltaY = (titleBox.top + titleBox.height / 2) - (broomBox.top + broomBox.height / 2);

      const enterRight   = Math.min(0.9 * vw, 900);                 // off-screen right
      const toTitleRight = (titleBox.right - broomBox.left) + 12;   // align near right edge of word
      const sweepAcross  = (titleBox.width + 40);                   // cover whole word

      // PARK: broom's RIGHT EDGE just 6px to LEFT of word's LEFT EDGE
      const gap = 6;
      const parkLeft = (titleBox.left - gap) - (broomBox.left + broomBox.width);

      const sweepDip = Math.min(0.04 * vh, 32); // subtle dip

      return { enterRight, toTitleRight, sweepAcross, parkLeft, centerDeltaY, sweepDip };
    };

    const shine = () => {
      titleInner?.classList.add("shine-once");
      subtitle?.classList.add("shine-once");
      titleInner?.addEventListener("animationend", () => titleInner.classList.remove("shine-once"), { once: true });
      subtitle?.addEventListener("animationend", () => subtitle.classList.remove("shine-once"), { once: true });
    };

    const start = () => {
      if (reduce || typeof broom.animate !== "function") {
        // Minimal motion: sweep overlay + shine
        title.style.setProperty("--jtSweepDur", `2000ms`);
        title.style.setProperty("--jtSweepEase", SWEEP_EASE);
        title.classList.add("sweep-run");
        setTimeout(() => { title.classList.remove("sweep-run"); shine(); }, 2000);
        return;
      }

      // reset
      broom.style.transform = "translate(0px,0px) rotate(0deg)";
      broom.style.zIndex = "5";

      // ---- PHASE 1: enter from right (unchanged) ----
      let { enterRight, toTitleRight, sweepAcross, parkLeft, centerDeltaY, sweepDip } = compute();

      const p1 = broom.animate(
        [
          { transform: `translate(${enterRight}px, 0) rotate(6deg)`, opacity: 0, offset: 0 },
          { transform: `translate(${enterRight * .6}px, ${centerDeltaY * .4}px) rotate(5deg)`, opacity: 1, offset: 0.22 },
          { transform: `translate(${toTitleRight}px, ${centerDeltaY}px) rotate(3deg)`, opacity: 1, offset: 1 }
        ],
        { duration: 2600, easing: "cubic-bezier(.25,.8,.2,1)", fill: "forwards" }
      );

      p1.addEventListener("finish", () => {
        ({ enterRight, toTitleRight, sweepAcross, parkLeft, centerDeltaY, sweepDip } = compute());

        // sync gold overlay to Phase 2
        title.style.setProperty("--jtSweepDur", `${SWEEP_DUR}ms`);
        title.style.setProperty("--jtSweepEase", SWEEP_EASE);
        title.classList.add("sweep-run");

        // ---- PHASE 2: sweep LEFT (same “feel” as pabalik) ----
        const midY = centerDeltaY + sweepDip * 0.5; // slight dip
        const p2 = broom.animate(
          [
            { transform: `translate(${toTitleRight}px, ${centerDeltaY}px) rotate(2deg)` },
            { transform: `translate(${toTitleRight - sweepAcross}px, ${midY}px) rotate(-2deg)` }
          ],
          { duration: SWEEP_DUR, easing: SWEEP_EASE, fill: "forwards" }
        );

        p2.addEventListener("finish", () => {
          title.classList.remove("sweep-run");

          ({ parkLeft, centerDeltaY } = compute());

          // ---- PHASE 3: park LEFT (same easing) ----
          const p3 = broom.animate(
            [
              { transform: `translate(${toTitleRight - sweepAcross}px, ${centerDeltaY}px) rotate(-2deg)` },
              { transform: `translate(${parkLeft}px, ${centerDeltaY}px) rotate(0deg)` }
            ],
            { duration: PARK_DUR, easing: PARK_EASE, fill: "forwards" }
          );

          p3.addEventListener("finish", () => {
            broom.style.transform = `translate(${parkLeft}px, ${centerDeltaY}px) rotate(0)`;
            broom.style.setProperty("--parkX", `${parkLeft}px`);
            broom.style.setProperty("--parkY", `${centerDeltaY}px`);
            broom.style.zIndex = "3";
            broom.classList.add("idle-float");
            shine();
          }, { once: true });
        }, { once: true });
      }, { once: true });
    };

    // run after layout
    window.requestAnimationFrame(() => setTimeout(start, 80));
  }
})();
