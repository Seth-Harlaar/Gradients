/* =====================================================
   GRADIENT ARCHIVE — gallery.js
   Homepage only: tag filtering + thumbnail fade-in.
   Detail pages need no JS at all.
   ===================================================== */

(function () {
  "use strict";

  // Only run on homepage (grid exists)
  const grid   = document.getElementById("galleryGrid");
  const tagBar = document.getElementById("tagBar");
  if (!grid || !tagBar) return;

  let activeTags = new Set();

  // ── Thumbnail fade-in ─────────────────────────────
  grid.querySelectorAll(".card-thumb").forEach(img => {
    const skeleton = img.closest(".card-thumb-wrap").querySelector(".card-skeleton");
    const reveal = () => { img.classList.add("loaded"); skeleton.classList.add("hidden"); };
    if (img.complete && img.naturalWidth > 0) { reveal(); }
    else {
      img.addEventListener("load",  reveal, { once: true });
      img.addEventListener("error", () => skeleton.classList.add("hidden"), { once: true });
    }
  });

  // ── Tag filtering ─────────────────────────────────
  // Check for ?tag= param on load (linked from detail page tag pills)
  const params = new URLSearchParams(window.location.search);
  const initTag = params.get("tag");
  if (initTag) {
    const btn = tagBar.querySelector(`[data-tag="${initTag}"]`);
    if (btn) {
      tagBar.querySelector('[data-tag="all"]').classList.remove("active");
      btn.classList.add("active");
      activeTags.add(initTag);
      applyFilter();
    }
  }

  tagBar.addEventListener("click", e => {
    const btn = e.target.closest(".tag-btn");
    if (!btn) return;
    const tag = btn.dataset.tag;

    if (tag === "all") {
      activeTags.clear();
      tagBar.querySelectorAll(".tag-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    } else {
      tagBar.querySelector('[data-tag="all"]').classList.remove("active");
      activeTags.has(tag) ? activeTags.delete(tag) : activeTags.add(tag);
      btn.classList.toggle("active", activeTags.has(tag));
      if (activeTags.size === 0) tagBar.querySelector('[data-tag="all"]').classList.add("active");
    }

    // Update URL without reload so back button works cleanly
    const url = new URL(window.location);
    if (activeTags.size === 1) { url.searchParams.set("tag", [...activeTags][0]); }
    else { url.searchParams.delete("tag"); }
    history.replaceState({}, "", url);

    applyFilter();
  });

  function applyFilter() {
    let visible = 0;
    grid.querySelectorAll(".card").forEach(card => {
      const tags = JSON.parse(card.dataset.tags);
      const show = activeTags.size === 0 || tags.some(t => activeTags.has(t));
      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });

    let empty = grid.querySelector(".empty-state");
    if (visible === 0 && !empty) {
      empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No gradients match the selected tags.";
      grid.appendChild(empty);
    } else if (visible > 0 && empty) {
      empty.remove();
    }
  }

})();
