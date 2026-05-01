/* =====================================================
   GRADIENT ARCHIVE — gallery.js
   Homepage only: tag filtering + thumbnail fade-in.
   ===================================================== */

(function () {
  "use strict";

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

  // ── Helpers ───────────────────────────────────────
  function allBtns()  { return tagBar.querySelectorAll("sp-button[data-tag]"); }
  function allBtn()   { return tagBar.querySelector('sp-button[data-tag="all"]'); }
  function setActive(btn)   { btn.setAttribute("variant", "primary"); }
  function clearActive(btn) { btn.removeAttribute("variant"); }

  // ── Init from ?tag= URL param ─────────────────────
  const initTag = new URLSearchParams(window.location.search).get("tag");
  if (initTag) {
    const btn = tagBar.querySelector(`sp-button[data-tag="${initTag}"]`);
    if (btn) {
      clearActive(allBtn());
      setActive(btn);
      activeTags.add(initTag);
      applyFilter();
    }
  }

  // ── Tag click handling ────────────────────────────
  tagBar.addEventListener("click", e => {
    const btn = e.target.closest("sp-button[data-tag]");
    if (!btn) return;
    const tag = btn.dataset.tag;

    if (tag === "all") {
      activeTags.clear();
      allBtns().forEach(clearActive);
      setActive(btn);
    } else {
      clearActive(allBtn());
      activeTags.has(tag) ? activeTags.delete(tag) : activeTags.add(tag);
      activeTags.has(tag) ? setActive(btn) : clearActive(btn);
      if (activeTags.size === 0) setActive(allBtn());
    }

    const url = new URL(window.location);
    activeTags.size === 1
      ? url.searchParams.set("tag", [...activeTags][0])
      : url.searchParams.delete("tag");
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
