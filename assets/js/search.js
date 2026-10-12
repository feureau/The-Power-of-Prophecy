/**
 * Live Client-Side Search Engine for Direct-Markdown Reader
 * Dynamically indexes sections/*.md files in the browser via MiniSearch.
 */
(function () {
  "use strict";

  let miniSearch = null;
  let isIndexing = false;
  let isIndexReady = false;
  let currentCategory = "all";
  let selectedIndex = -1;

  const modalBackdrop = document.getElementById("searchModalBackdrop");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const searchTabs = document.querySelectorAll(".search-tab");
  const triggerBtns = document.querySelectorAll("[data-search-trigger]");
  const closeBtn = document.getElementById("searchCloseBtn");

  if (!modalBackdrop || !searchInput || !searchResults) return;

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Build the in-memory search index by fetching the live .md files
  async function buildLiveIndex() {
    if (isIndexReady || isIndexing) return;
    isIndexing = true;

    const sections = window.__BOOK_SECTIONS__ || [];
    if (!sections.length) {
      isIndexing = false;
      return;
    }

    const MiniSearchLib = window.MiniSearch || (typeof MiniSearch !== "undefined" ? MiniSearch : null);
    if (!MiniSearchLib) {
      console.warn("MiniSearch library not loaded");
      isIndexing = false;
      return;
    }

    miniSearch = new MiniSearchLib({
      fields: ["title", "section", "text"],
      storeFields: ["id", "title", "section", "sectionId", "anchor", "category", "text"],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
        boost: { title: 3, section: 2, text: 1 }
      }
    });

    const docs = [];
    let docId = 0;

    // Index all 38 Markdown sections
    for (const sec of sections) {
      try {
        let text = "";
        if (window.__BOOK_DATA__ && window.__BOOK_DATA__[sec.file]) {
          text = window.__BOOK_DATA__[sec.file];
        } else {
          const res = await fetch(`sections/${sec.file}`);
          if (res.ok) text = await res.text();
        }
        if (!text) continue;
        const lines = text.split("\n");

        let h1 = sec.title;
        let currentSec = h1;
        let currentAnchor = "";
        let chunk = [];

        function flush() {
          const clean = chunk
            .join(" ")
            .replace(/\[\^.*?\]/g, "")
            .replace(/[*#_`>]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          if (clean.length > 30) {
            docs.push({
              id: docId++,
              title: h1,
              section: currentSec,
              sectionId: sec.id,
              anchor: currentAnchor,
              category: sec.category,
              text: clean
            });
          }
          chunk = [];
        }

        for (const line of lines) {
          if (line.startsWith("# ")) {
            flush();
            h1 = line.substring(2).trim();
            currentSec = h1;
            currentAnchor = "";
          } else if (line.startsWith("## ")) {
            flush();
            currentSec = line.substring(3).trim();
            currentAnchor = slugify(currentSec);
          } else {
            chunk.push(line);
          }
        }
        flush();
      } catch (e) {
        console.warn("Failed indexing", sec.file, e);
      }
    }

    miniSearch.addAll(docs);
    isIndexReady = true;
    isIndexing = false;
  }

  function openSearch() {
    modalBackdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
    searchInput.focus();

    if (!isIndexReady && !isIndexing) {
      buildLiveIndex().then(() => {
        if (searchInput.value.trim()) performSearch();
      });
    }
  }

  function closeSearch() {
    modalBackdrop.classList.remove("is-open");
    document.body.style.overflow = "";
    selectedIndex = -1;
  }

  function escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function createSnippet(text, query) {
    if (!text) return "";
    const cleanText = text.replace(/\s+/g, " ").trim();
    if (!query) return escapeHtml(cleanText.slice(0, 150)) + "...";

    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    let matchIndex = -1;

    for (let word of queryWords) {
      const idx = cleanText.toLowerCase().indexOf(word);
      if (idx !== -1) {
        matchIndex = idx;
        break;
      }
    }

    let start = 0;
    let end = 160;
    if (matchIndex > 60) {
      start = matchIndex - 60;
      end = matchIndex + 100;
    }

    let snippet = cleanText.slice(start, end);
    if (start > 0) snippet = "..." + snippet;
    if (end < cleanText.length) snippet = snippet + "...";

    let escaped = escapeHtml(snippet);
    for (let word of queryWords) {
      const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
      escaped = escaped.replace(regex, `<mark class="search-match">$1</mark>`);
    }

    return escaped;
  }

  function renderResults(results, query) {
    selectedIndex = -1;
    if (!results || results.length === 0) {
      searchResults.innerHTML = `
        <div class="search-empty-state">
          No matches found for "<strong>${escapeHtml(query)}</strong>".
          <br><span style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem; display: inline-block;">
            Try checking spelling or searching for historical figures, places, or dates.
          </span>
        </div>`;
      return;
    }

    const html = results.slice(0, 35).map((item, idx) => {
      const snippet = createSnippet(item.text, query);
      const isSelected = idx === 0 ? "is-selected" : "";
      const url = `#/${item.sectionId}${item.anchor ? "#" + item.anchor : ""}`;
      return `
        <a class="search-result-item ${isSelected}" href="${url}" data-index="${idx}">
          <div class="search-result-head">
            <span class="search-badge">${escapeHtml(item.category || "Chapter")}</span>
            <span class="search-result-title">${escapeHtml(item.title)}</span>
            ${item.section && item.section !== item.title ? `<span class="search-result-sec">${escapeHtml(item.section)}</span>` : ""}
          </div>
          <div class="search-snippet">${snippet}</div>
        </a>
      `;
    }).join("");

    searchResults.innerHTML = html;
    if (results.length > 0) selectedIndex = 0;
  }

  function performSearch() {
    const q = searchInput.value.trim();
    if (!q) {
      searchResults.innerHTML = `
        <div class="search-empty-state">
          Type keywords to search across all 1,000 pages of the book.
          <br><span style="font-size:0.85rem; color: var(--text-muted);">
            Live indexing reads directly from the .md files in sections/.
          </span>
        </div>`;
      return;
    }

    if (!miniSearch || !isIndexReady) {
      searchResults.innerHTML = `<div class="search-empty-state">Indexing live Markdown files...</div>`;
      buildLiveIndex().then(() => {
        if (isIndexReady && searchInput.value.trim() === q) {
          performSearch();
        }
      });
      return;
    }

    let filterOpt = undefined;
    if (currentCategory !== "all") {
      filterOpt = (doc) => (doc.category || "").toLowerCase() === currentCategory.toLowerCase();
    }

    try {
      const results = miniSearch.search(q, {
        filter: filterOpt,
        prefix: true,
        fuzzy: 0.2
      });
      renderResults(results, q);
    } catch (err) {
      console.error(err);
    }
  }

  function handleKeydown(e) {
    if (!modalBackdrop.classList.contains("is-open")) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      } else if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        openSearch();
      }
      return;
    }

    if (e.key === "Escape") {
      closeSearch();
      return;
    }

    const items = searchResults.querySelectorAll(".search-result-item");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      updateSelection(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      updateSelection(items);
    } else if (e.key === "Enter" && selectedIndex >= 0 && items[selectedIndex]) {
      e.preventDefault();
      items[selectedIndex].click();
    }
  }

  function updateSelection(items) {
    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add("is-selected");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("is-selected");
      }
    });
  }

  // Event Listeners
  triggerBtns.forEach(btn => btn.addEventListener("click", openSearch));
  document.addEventListener("click", e => {
    if (e.target.matches("[data-search-trigger]") || e.target.closest("[data-search-trigger]")) {
      openSearch();
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeSearch);

  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeSearch();
  });

  searchResults.addEventListener("click", (e) => {
    const item = e.target.closest(".search-result-item");
    if (item) closeSearch();
  });

  let debounceTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(performSearch, 80);
  });

  searchTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      searchTabs.forEach(t => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      currentCategory = tab.getAttribute("data-category") || "all";
      performSearch();
    });
  });

  window.addEventListener("keydown", handleKeydown);

  // Preload and index in background idle time
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => buildLiveIndex());
  } else {
    setTimeout(buildLiveIndex, 1000);
  }
})();
