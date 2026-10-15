/**
 * The Power of Prophecy — Direct Markdown Reader
 * Loads, parses, and renders sections/*.md directly at runtime.
 * Themes and layout match feureau.github.io
 */
(function () {
  "use strict";

  // Catalog of all 38 book sections
  const SECTIONS = [
    { id: "01-front-matter", file: "01_Front_Matter.md", title: "Front Matter", badge: "FM", group: "Front Matter", pages: "pp. 1–4", category: "front-matter" },
    { id: "02-contents", file: "02_Contents.md", title: "Contents", badge: "TOC", group: "Front Matter", pages: "pp. 5–10", category: "front-matter" },
    { id: "03-preface", file: "03_Preface.md", title: "Preface", badge: "Pref", group: "Front Matter", pages: "pp. 11–22", category: "front-matter" },
    { id: "04-abbreviations", file: "04_Abbreviations.md", title: "Abbreviations", badge: "Abbr", group: "Front Matter", pages: "pp. 23–24", category: "front-matter" },
    { id: "05-maps", file: "05_Maps.md", title: "Maps of Central and East Java", badge: "Maps", group: "Front Matter", pages: "pp. 25–30", category: "front-matter" },

    { id: "chapter-01", file: "06_Chapter_01_The_South-Central_Javanese_World_circa_1792-1825.md", title: "Chapter I: The South-Central Javanese World, circa 1792-1825", badge: "Ch. I", group: "Chapters (I–XII)", pages: "pp. 31–98", category: "chapter" },
    { id: "chapter-02", file: "07_Chapter_02_Dipanagaras_Youth_and_Upbringing_1785-1803.md", title: "Chapter II: Dipanagara’s Youth and Upbringing, 1785-1803", badge: "Ch. II", group: "Chapters (I–XII)", pages: "pp. 99–126", category: "chapter" },
    { id: "chapter-03", file: "08_Chapter_03_Young_Manhood_1803-1805.md", title: "Chapter III: Young Manhood: Marriage, Education, and Links with the Santri Community, 1803-1805", badge: "Ch. III", group: "Chapters (I–XII)", pages: "pp. 127–156", category: "chapter" },
    { id: "chapter-04", file: "09_Chapter_04_Pilgrimage_to_the_South_Coast_circa_1805.md", title: "Chapter IV: Pilgrimage to the South Coast, circa 1805", badge: "Ch. IV", group: "Chapters (I–XII)", pages: "pp. 157–186", category: "chapter" },
    { id: "chapter-05", file: "10_Chapter_05_The_Beginning_of_the_Ruin_of_the_Land_of_Java_1808.md", title: "Chapter V: The Beginning of the Ruin of the Land of Java: Yogyakarta and Daendels’ New Order, 1808", badge: "Ch. V", group: "Chapters (I–XII)", pages: "pp. 187–234", category: "chapter" },
    { id: "chapter-06", file: "11_Chapter_06_The_Old_Orders_Last_Champion_Raden_Ronggas_Rebellion_1809-1810.md", title: "Chapter VI: The Old Order’s Last Champion: The Origins and Course of Radèn Rongga’s Rebellion, 1809-1810", badge: "Ch. VI", group: "Chapters (I–XII)", pages: "pp. 235–290", category: "chapter" },
    { id: "chapter-07", file: "12_Chapter_07_The_End_of_the_Beginning_1811-1812.md", title: "Chapter VII: The End of the Beginning: The Last Months of the Franco-Dutch Government and the British Rape of Yogyakarta, 1811-1812", badge: "Ch. VII", group: "Chapters (I–XII)", pages: "pp. 291–374", category: "chapter" },
    { id: "chapter-08", file: "13_Chapter_08_Into_a_New_Era_The_British_Interregnum_1812-1816.md", title: "Chapter VIII: Into a New Era: The British Interregnum, 1812-1816", badge: "Ch. VIII", group: "Chapters (I–XII)", pages: "pp. 375–460", category: "chapter" },
    { id: "chapter-09", file: "14_Chapter_09_Binding_on_the_Iron_Yoke_1816-1822.md", title: "Chapter IX: Binding on the Iron Yoke: The Returned Dutch Administration, the Impoverishment of the Peasantry and Rise of Millenarian Expectations, 1816-1822", badge: "Ch. IX", group: "Chapters (I–XII)", pages: "pp. 461–534", category: "chapter" },
    { id: "chapter-10", file: "15_Chapter_10_Waiting_for_the_Just_King_1822-1825.md", title: "Chapter X: Waiting for the ‘Just King’: The Road to War in South-Central Java, 1822-1825", badge: "Ch. X", group: "Chapters (I–XII)", pages: "pp. 535–634", category: "chapter" },
    { id: "chapter-11", file: "16_Chapter_11_The_Last_Stand_of_the_Old_Order_1825-1830.md", title: "Chapter XI: The Last Stand of the Old Order: Reflections on the Java War, 1825-1830", badge: "Ch. XI", group: "Chapters (I–XII)", pages: "pp. 635–686", category: "chapter" },
    { id: "chapter-12", file: "17_Chapter_12_Enduring_the_Unendurable_1830-1855.md", title: "Chapter XII: Enduring the Unendurable: Dipanagara’s Capture at Magelang and Exile in Sulawesi, 1830-1855", badge: "Ch. XII", group: "Chapters (I–XII)", pages: "pp. 687–789", category: "chapter" },

    { id: "appendix-01", file: "18_Appendix_01_Family_Tree_of_the_Yogyakarta_Sultanate.md", title: "Appendix I: Family Tree of the Yogyakarta Sultanate", badge: "App. I", group: "Appendices (I–XVI)", pages: "pp. 790–791", category: "appendix" },
    { id: "appendix-02", file: "19_Appendix_02_Connections_between_Dipanagara_and_the_Danurejan.md", title: "Appendix II: Connections between Dipanagara and the Danurejan", badge: "App. II", group: "Appendices (I–XVI)", pages: "pp. 792–793", category: "appendix" },
    { id: "appendix-03", file: "20_Appendix_03_Connections_between_Dipanagara_and_the_Prawiradirjan.md", title: "Appendix III: Connections between Dipanagara and the Prawiradirjan", badge: "App. III", group: "Appendices (I–XVI)", pages: "pp. 794–795", category: "appendix" },
    { id: "appendix-04", file: "21_Appendix_04_Pangeran_Dipanagaras_Wives_Family_and_Children.md", title: "Appendix IV: Pangéran Dipanagara’s Wives, Family and Children", badge: "App. IV", group: "Appendices (I–XVI)", pages: "pp. 796–799", category: "appendix" },
    { id: "appendix-05a", file: "22_Appendix_05a_Chief_Ministers_of_Yogyakarta_and_Surakarta_1755-1847.md", title: "Appendix Va: Chief Ministers of Yogyakarta and Surakarta, 1755-1847", badge: "App. Va", group: "Appendices (I–XVI)", pages: "pp. 800–801", category: "appendix" },
    { id: "appendix-05b", file: "23_Appendix_05b_Major_Officials_of_the_Yogyakarta_Administration_1755-1825.md", title: "Appendix Vb: Major Officials of the Yogyakarta Administration, 1755-1825", badge: "App. Vb", group: "Appendices (I–XVI)", pages: "pp. 802–807", category: "appendix" },
    { id: "appendix-06", file: "24_Appendix_06_Country_Estates_Hunting_Lodges_and_Pleasure_Gardens.md", title: "Appendix VI: Country Estates, Hunting Lodges and Royal Pleasure Gardens Built in Yogyakarta, 1755-1822", badge: "App. VI", group: "Appendices (I–XVI)", pages: "pp. 808–809", category: "appendix" },
    { id: "appendix-07a", file: "25_Appendix_07a_Religious_Boarding_Schools_Pathok_Negari_and_Pradikan.md", title: "Appendix VIIa: Religious Boarding Schools, Centres of Fiqh Law Scholars, and Tax-Free Areas in Yogyakarta Pre-1832", badge: "App. VIIa", group: "Appendices (I–XVI)", pages: "pp. 810–815", category: "appendix" },
    { id: "appendix-07b", file: "26_Appendix_07b_Kyai_Haji_and_Religious_Officials_Associated_with_Dipanagara.md", title: "Appendix VIIb: Kyai, Haji and Religious Officials Associated with Dipanagara", badge: "App. VIIb", group: "Appendices (I–XVI)", pages: "pp. 816–824", category: "appendix" },
    { id: "appendix-08", file: "27_Appendix_08_Princes_and_Senior_Officials_Landholdings_and_Pensions.md", title: "Appendix VIII: Princes and Senior Officials of Yogyakarta Kraton Showing Landholdings, Pensions, and Allegiance during Java War", badge: "App. VIII", group: "Appendices (I–XVI)", pages: "pp. 825–836", category: "appendix" },
    { id: "appendix-09", file: "28_Appendix_09_Major_Officials_of_VOC_British_and_Netherlands_Indies.md", title: "Appendix IX: Major Officials of the VOC, British Interim Administration, and Netherlands Indies Government, 1780-1856", badge: "App. IX", group: "Appendices (I–XVI)", pages: "pp. 837–840", category: "appendix" },
    { id: "appendix-10", file: "29_Appendix_10_Rice_Prices_in_Yogyakarta_and_Java_1804-1826.md", title: "Appendix X: Rice Prices in Yogyakarta (1804-1826) and throughout Java (1817-1825)", badge: "App. X", group: "Appendices (I–XVI)", pages: "pp. 841–842", category: "appendix" },
    { id: "appendix-11", file: "30_Appendix_11_List_of_Dipanagaras_Heirloom_Weapons.md", title: "Appendix XI: List of Dipanagara’s Heirloom (Pusaka) Weapons", badge: "App. XI", group: "Appendices (I–XVI)", pages: "pp. 843–845", category: "appendix" },
    { id: "appendix-12", file: "31_Appendix_12_List_of_Dipanagaras_Followers_in_Manado_1830-1833.md", title: "Appendix XII: List of Dipanagara’s Followers in Manado, June 1830–June 1833", badge: "App. XII", group: "Appendices (I–XVI)", pages: "pp. 846–851", category: "appendix" },
    { id: "appendix-13", file: "32_Appendix_13_Letters_Written_by_Dipanagara_from_Batavia_and_Makassar.md", title: "Appendix XIII: Letters Written by Dipanagara from Batavia (1830) and Makassar (1837)", badge: "App. XIII", group: "Appendices (I–XVI)", pages: "pp. 852–857", category: "appendix" },
    { id: "appendix-14", file: "33_Appendix_14_Javanese_and_Western_Chronology_AD_1785-1855.md", title: "Appendix XIV: Javanese and Western Chronology, AD 1785-1855", badge: "App. XIV", group: "Appendices (I–XVI)", pages: "pp. 858–860", category: "appendix" },
    { id: "appendix-15", file: "34_Appendix_15_Revenue_Returns_from_Tollgate_Opium_and_Tax_Farms.md", title: "Appendix XV: Revenue Returns from the Tollgate, Opium, and Other Tax Farms in Yogyakarta, 1808-1825", badge: "App. XV", group: "Appendices (I–XVI)", pages: "pp. 861–866", category: "appendix" },
    { id: "appendix-16", file: "35_Appendix_16_Comparative_Values_of_Paper_and_Metal_Currency_in_1811.md", title: "Appendix XVI: Comparative Values of Paper and Metal Currency Circulating in Java in 1811", badge: "App. XVI", group: "Appendices (I–XVI)", pages: "pp. 867–868", category: "appendix" },

    { id: "glossary", file: "36_Glossary_of_Javanese_Words.md", title: "Glossary of Javanese Words", badge: "Gloss", group: "Reference", pages: "pp. 869–874", category: "reference" },
    { id: "bibliography", file: "37_Bibliography.md", title: "Bibliography", badge: "Bib", group: "Reference", pages: "pp. 875–902", category: "reference" },
    { id: "index", file: "38_Index.md", title: "Index of Names and Subjects", badge: "Index", group: "Reference", pages: "pp. 903–1000", category: "reference" }
  ];

  window.__BOOK_SECTIONS__ = SECTIONS;
  let currentActiveSecId = null;

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Find section by ID or filename
  function findSection(identifier) {
    if (!identifier) return null;
    const clean = identifier.replace(/^#\/?/, "").replace(/\.html$/, "").replace(/^sections\//, "");
    return SECTIONS.find(s => s.id === clean || s.file === clean || s.file.replace(/\.md$/, "") === clean);
  }

  // Preprocess Markdown: custom footnotes, heading IDs, and internal link routing
  function processMarkdown(rawMd, currentSec) {
    // 1. Extract and format footnotes [^1]: ...
    const footnotes = {};
    let md = rawMd.replace(/^\[\^(\d+)\]:\s*([\s\S]*?)(?=(?:^\[\^\d+\]:)|(?:\n\n\n)|$)/gm, (m, n, text) => {
      footnotes[n] = text.trim();
      return "";
    });

    // 2. Intercept internal links: [Label](sections/XX_*.md#anchor) -> [Label](#/XX_id#anchor)
    md = md.replace(/\[([^\]]+)\]\((?:sections\/)?([0-9A-Za-z_.-]+\.md)(#[^\)]+)?\)/g, (match, label, fname, anchor) => {
      const targetSec = findSection(fname);
      const targetHash = targetSec ? targetSec.id : fname;
      return `[${label}](#/${targetHash}${anchor || ""})`;
    });

    // Intercept relative asset paths for web reader from root: ../assets/ -> assets/
    md = md.replace(/\.\.\/assets\//g, "assets/");

    // 3. Configure marked to automatically assign IDs to headings
    const renderer = new marked.Renderer();
    const headingsList = [];

    renderer.heading = function ({ text, depth }) {
      const plainText = text.replace(/<[^>]+>/g, "");
      const id = slugify(plainText);
      if (depth === 2 || depth === 3) {
        headingsList.push({ id, title: plainText, depth });
      }
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    };

    marked.use({ renderer, gfm: true, breaks: false });
    let html = marked.parse(md);

    // 4. Transform [^1] references in body into linked superscripts
    const secPrefix = currentSec && currentSec.id ? `#/${currentSec.id}` : "";
    html = html.replace(/\[\^(\d+)\]/g, `<sup id="fnref:$1"><a href="${secPrefix}#fn:$1" class="footnote-ref" data-target="fn:$1">$1</a></sup>`);

    // 5. Append rendered footnotes section if citations exist
    const fnKeys = Object.keys(footnotes);
    if (fnKeys.length > 0) {
      let fnHtml = '<div class="footnote"><hr><ol>';
      fnKeys.sort((a, b) => parseInt(a) - parseInt(b)).forEach(k => {
        const noteHtml = marked.parseInline(footnotes[k]);
        fnHtml += `<li id="fn:${k}"><p>${noteHtml} <a href="${secPrefix}#fnref:${k}" class="footnote-backref" data-target="fnref:${k}" aria-label="Back to citation">↩</a></p></li>`;
      });
      fnHtml += '</ol></div>';
      html += fnHtml;
    }

    return { html, headings: headingsList };
  }

  // Build Left Sidebar Navigation
  function renderSidebar(activeSecId, activeSubsections = []) {
    const sidebar = document.getElementById("bookSidebar");
    if (!sidebar) return;

    // Group items
    const groups = {};
    SECTIONS.forEach(s => {
      if (!groups[s.group]) groups[s.group] = [];
      groups[s.group].push(s);
    });

    let html = "";
    for (const [groupName, items] of Object.entries(groups)) {
      html += `<div class="sidebar-group">`;
      html += `<div class="sidebar-group-title">${groupName}</div>`;
      html += `<ul class="sidebar-nav-list">`;

      items.forEach(item => {
        const isActive = item.id === activeSecId;
        const activeClass = isActive ? "is-active" : "";
        html += `<li>`;
        html += `<a class="sidebar-link ${activeClass}" href="#/${item.id}">`;
        if (item.badge) html += `<span class="sidebar-item-badge">${item.badge}</span>`;
        html += `<span>${item.title.replace(/^Chapter\s+[IVXLCDM]+:\s*|^Appendix\s+[IVXLCDM\w]+:\s*/, "")}</span>`;
        html += `</a>`;

        // Render nested subsections under the active chapter
        if (isActive && activeSubsections.length > 0) {
          html += `<ul class="sidebar-subsections">`;
          activeSubsections.forEach(sub => {
            html += `<li><a class="sidebar-sub-link" href="#/${item.id}#${sub.id}">${sub.title}</a></li>`;
          });
          html += `</ul>`;
        }
        html += `</li>`;
      });

      html += `</ul></div>`;
    }

    sidebar.innerHTML = html;
  }

  // Render Right In-Page TOC ("On this page")
  function renderToc(headings, activeSecId) {
    const tocSidebar = document.getElementById("tocSidebar");
    if (!tocSidebar) return;

    if (!headings || headings.length === 0) {
      tocSidebar.classList.remove("is-visible");
      return;
    }

    tocSidebar.classList.add("is-visible");

    tocSidebar.classList.remove("is-visible");
    let html = `<div class="toc-title">On this page</div><ul class="toc-list">`;
    headings.forEach(h => {
      html += `<li><a class="toc-link" href="#/${activeSecId}#${h.id}">${h.title}</a></li>`;
    });
    html += `</ul>`;
    html += `
      <div class="toc-back-top">
        <a href="#main">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
          <span>Back to top</span>
        </a>
      </div>
    `;
    tocSidebar.innerHTML = html;
    initScrollspy();
  }

  // Render Bottom Chapter Pager (Prev / Next)
  function renderPager(currentSec) {
    const idx = SECTIONS.findIndex(s => s.id === currentSec.id);
    const prev = idx > 0 ? SECTIONS[idx - 1] : null;
    const next = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : null;

    let html = `<nav class="chapter-pager" aria-label="Adjacent Chapters">`;
    if (prev) {
      html += `
        <a class="pager-card pager-prev" href="#/${prev.id}">
          <span class="pager-dir">← Previous</span>
          <span class="pager-title">${prev.title}</span>
        </a>`;
    } else {
      html += `<div></div>`;
    }
    if (next) {
      html += `
        <a class="pager-card pager-next" href="#/${next.id}">
          <span class="pager-dir">Next →</span>
          <span class="pager-title">${next.title}</span>
        </a>`;
    }
    html += `</nav>`;
    return html;
  }

  // Render Home Portal (Overview)
  function renderPortal() {
    currentActiveSecId = null;
    const main = document.getElementById("mainContent");
    const tocSidebar = document.getElementById("tocSidebar");
    if (tocSidebar) tocSidebar.classList.remove("is-visible");

    renderSidebar(null);
    document.getElementById("headerCrumb").textContent = "Home";
    document.title = "The Power of Prophecy — Prince Dipanagara and the end of an old order in Java, 1785-1855";

    const chapters = SECTIONS.filter(s => s.category === "chapter");
    const appendices = SECTIONS.filter(s => s.category === "appendix");
    const references = SECTIONS.filter(s => s.category === "reference");

    let html = `
      <div class="wrap">
        <section class="portal-hero">
          <div class="portal-eyebrow">Digital Edition</div>
          <h1 class="portal-title">The Power of Prophecy</h1>
          <div class="portal-author">Prince Dipanagara and the end of an old order in Java, 1785–1855</div>
          <p class="portal-desc">
            By <strong>Peter Carey</strong>. <br>Complete academic edition converted from the original print volume into a modern, searchable digital archive. Covering the origins, course, and aftermath of the Java War (1825–1830). Posted by permission from the Author.
          </p>
          <div class="portal-actions">
            <a class="btn btn-primary" href="#/chapter-01">Start Chapter I</a>
            <a class="btn btn-secondary" href="#/02-contents">Table of Contents</a>
            <button class="btn btn-secondary" data-search-trigger>Search Book (Ctrl K)</button>
          </div>
        </section>

        <section style="margin-top: 3.5rem; margin-bottom: 5rem;">
          <h2 style="border-top: none; margin-bottom: 1.5rem;">Chapters (I–XII)</h2>
          <div class="portal-grid">
    `;

    chapters.forEach(ch => {
      const clean = ch.title.replace(/^Chapter\s+[IVXLCDM]+:\s*/, "");
      html += `
        <a class="portal-card" href="#/${ch.id}">
          <div class="portal-card-num">${ch.badge}</div>
          <div class="portal-card-title">${clean}</div>
          <div class="portal-card-meta">${ch.pages}</div>
        </a>`;
    });

    html += `</div></section>`;

    html += `
        <section style="margin-bottom: 6rem;">
          <h2 style="margin-bottom: 1.5rem;">Appendices &amp; Reference Materials</h2>
          <div class="portal-grid">
    `;

    appendices.forEach(app => {
      const clean = app.title.replace(/^Appendix\s+[IVXLCDM\w]+:\s*/, "");
      html += `
        <a class="portal-card" href="#/${app.id}">
          <div class="portal-card-num">${app.badge}</div>
          <div class="portal-card-title">${clean}</div>
          <div class="portal-card-meta">${app.pages}</div>
        </a>`;
    });

    references.forEach(ref => {
      html += `
        <a class="portal-card" href="#/${ref.id}">
          <div class="portal-card-num">Reference</div>
          <div class="portal-card-title">${ref.title}</div>
          <div class="portal-card-meta">${ref.pages}</div>
        </a>`;
    });

    html += `</div></section></div>`;
    main.innerHTML = html;
  }

  // Load and render a specific Markdown file directly
  async function loadChapter(sec, anchorId) {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
      <article class="book-article">
        <div style="padding: 4rem 1rem; text-align: center; color: var(--text-muted);">
          Loading <strong>${sec.title}</strong> directly from Markdown...
        </div>
      </article>
    `;

    try {
      let rawMd = "";

      // 1. If running under HTTP/HTTPS, try fetching live .md file first
      if (window.location.protocol === "http:" || window.location.protocol === "https:") {
        try {
          const res = await fetch(`sections/${sec.file}`);
          if (res.ok) rawMd = await res.text();
        } catch (e) {
          // Fall through to embedded book data
        }
      }

      // 2. If running under file:/// or fetch was blocked, use window.__BOOK_DATA__
      if (!rawMd && window.__BOOK_DATA__ && window.__BOOK_DATA__[sec.file]) {
        rawMd = window.__BOOK_DATA__[sec.file];
      }

      // 3. Fallback attempt if not yet loaded
      if (!rawMd) {
        const res = await fetch(`sections/${sec.file}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load sections/${sec.file}`);
        rawMd = await res.text();
      }

      const { html, headings } = processMarkdown(rawMd, sec);

      // Render Left Sidebar with dynamic subsections from this .md file
      renderSidebar(sec.id, headings);

      // Render Right Sidebar TOC with dynamic subsections
      renderToc(headings, sec.id);

      // Update Header breadcrumb and Document Title
      const cleanTitle = sec.title.replace(/^Chapter\s+[IVXLCDM]+:\s*|^Appendix\s+[IVXLCDM\w]+:\s*/, "");
      document.getElementById("headerCrumb").textContent = cleanTitle;
      document.title = `${sec.title} — The Power of Prophecy`;

      // Eyebrow label
      let eyebrow = "";
      if (sec.category === "chapter") eyebrow = `${sec.badge} • ${sec.pages}`;
      else if (sec.category === "appendix") eyebrow = `Appendix • ${sec.pages}`;
      else eyebrow = sec.group;

      main.innerHTML = `
        <article class="book-article">
          ${eyebrow ? `<div class="chapter-eyebrow">${eyebrow}</div>` : ""}
          <div class="prose-body">${html}</div>
          ${renderPager(sec)}
        </article>
      `;

      initFootnotePopovers();

      // Scroll to anchor if provided, or top
      if (anchorId) {
        setTimeout(() => {
          scrollToAnchor(anchorId);
        }, 80);
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }

    } catch (err) {
      console.error(err);
      main.innerHTML = `
        <article class="book-article">
          <div style="padding: 3rem 1.5rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); text-align: center;">
            <h2 style="border:0; margin-top:0;">Unable to load '${sec.file}'</h2>
            <p style="color:var(--text-muted);">${err.message}</p>
            <p style="font-size:0.9rem; color:var(--text-muted); margin-top:1rem;">
              If running locally, please open via a local server (e.g. <code>python -m http.server</code> or double-click <code>preview.bat</code>) because modern browsers block <code>fetch()</code> on <code>file:///</code> URLs.
            </p>
          </div>
        </article>
      `;
    }
  }

  // Smooth scroll and visual highlight for in-page anchors and footnotes
  function scrollToAnchor(anchorId) {
    if (!anchorId) return;
    if (anchorId === "main" || anchorId === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const el = document.getElementById(anchorId);
    if (el) {
      scrollToElement(el);
      return;
    }

    try {
      const decoded = decodeURIComponent(anchorId);
      const decEl = document.getElementById(decoded);
      if (decEl) {
        scrollToElement(decEl);
      }
    } catch (e) {}
  }

  function scrollToElement(el) {
    if (!el) return;
    const isFootnote = el.id.startsWith("fn:") || el.id.startsWith("fnref:") || el.tagName === "LI" || el.tagName === "SUP";
    el.scrollIntoView({
      behavior: "smooth",
      block: isFootnote ? "center" : "start"
    });

    // Flash highlight effect
    el.classList.remove("target-highlight");
    void el.offsetWidth; // force reflow
    el.classList.add("target-highlight");
    setTimeout(() => {
      el.classList.remove("target-highlight");
    }, 2200);
  }

  // Router: listens to URL hash changes
  function handleRoute() {
    let hash = window.location.hash.replace(/^#\/?/, "").trim();
    if (!hash || hash === "home") {
      currentActiveSecId = null;
      renderPortal();
      return;
    }

    // Direct in-page top jumps
    if (hash === "main" || hash === "top") {
      if (currentActiveSecId) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      renderPortal();
      return;
    }

    // Direct in-page footnote anchors like #fn:1 or #fnref:1
    if ((hash.startsWith("fn:") || hash.startsWith("fnref:")) && currentActiveSecId) {
      scrollToAnchor(hash);
      return;
    }

    let [sectionId, anchorId] = hash.split("#");
    const sec = findSection(sectionId);

    if (sec) {
      if (currentActiveSecId === sec.id) {
        // Already on this section: smooth scroll to anchor without re-rendering
        if (anchorId) {
          scrollToAnchor(anchorId);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        currentActiveSecId = sec.id;
        loadChapter(sec, anchorId);
      }
    } else {
      // If not recognized as a section, check if it's an existing DOM ID in current page
      if (currentActiveSecId && document.getElementById(hash)) {
        scrollToAnchor(hash);
        return;
      }
      currentActiveSecId = null;
      renderPortal();
    }
  }

  // Scrollspy for Right TOC
  function initScrollspy() {
    const tocLinks = document.querySelectorAll(".toc-link");
    const headings = Array.from(document.querySelectorAll(".book-article h2, .book-article h3"));
    if (!tocLinks.length || !headings.length) return;

    function onScroll() {
      const scrollPos = window.scrollY + 120;
      let currentId = "";

      for (let i = 0; i < headings.length; i++) {
        if (headings[i].offsetTop <= scrollPos) {
          currentId = headings[i].id;
        } else {
          break;
        }
      }

      tocLinks.forEach(link => {
        const href = link.getAttribute("href") || "";
        if (href.endsWith("#" + currentId)) {
          link.classList.add("is-active");
        } else {
          link.classList.remove("is-active");
        }
      });
    }

    window.removeEventListener("scroll", window._tocScrollHandler);
    window._tocScrollHandler = onScroll;
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Footnote Tooltip Popovers
  let fnPopover = null;
  function initFootnotePopovers() {
    const refs = document.querySelectorAll(".footnote-ref");
    if (!fnPopover) {
      fnPopover = document.createElement("div");
      fnPopover.className = "fn-popover";
      fnPopover.setAttribute("role", "tooltip");
      document.body.appendChild(fnPopover);

      fnPopover.addEventListener("mouseenter", () => fnPopover.classList.add("is-visible"));
      fnPopover.addEventListener("mouseleave", () => fnPopover.classList.remove("is-visible"));
    }

    refs.forEach(ref => {
      const id = ref.getAttribute("data-target") || (ref.getAttribute("href") || "").split("#").pop();
      const fnLi = document.getElementById(id);
      if (!fnLi) return;

      const clone = fnLi.cloneNode(true);
      const backref = clone.querySelector(".footnote-backref");
      if (backref) backref.remove();
      const content = clone.innerHTML.trim();

      ref.addEventListener("mouseenter", () => {
        fnPopover.innerHTML = content;
        fnPopover.classList.add("is-visible");

        const rect = ref.getBoundingClientRect();
        const popRect = fnPopover.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        let top = rect.top + scrollTop - popRect.height - 8;
        let left = rect.left + scrollLeft - (popRect.width / 2) + (rect.width / 2);
        if (rect.top - popRect.height < 10) top = rect.bottom + scrollTop + 8;
        const maxLeft = window.innerWidth - popRect.width - 16;
        if (left < 16) left = 16;
        if (left > maxLeft) left = maxLeft;

        fnPopover.style.top = `${top}px`;
        fnPopover.style.left = `${left}px`;
      });

      ref.addEventListener("mouseleave", () => {
        setTimeout(() => {
          if (!fnPopover.matches(":hover")) fnPopover.classList.remove("is-visible");
        }, 120);
      });
    });
  }

  // Delegated click handler for footnotes, backrefs, and in-page anchor jumps
  document.addEventListener("click", e => {
    // 1. Footnote Reference: click citation in text -> scroll to footnote entry at bottom
    const fnRef = e.target.closest(".footnote-ref");
    if (fnRef) {
      e.preventDefault();
      if (fnPopover) fnPopover.classList.remove("is-visible");
      const targetId = fnRef.getAttribute("data-target") || (fnRef.getAttribute("href") || "").split("#").pop();
      if (currentActiveSecId) {
        history.pushState(null, "", `#/${currentActiveSecId}#${targetId}`);
      }
      scrollToAnchor(targetId);
      return;
    }

    // 2. Footnote Backref: click ↩ at bottom -> scroll back to citation in body
    const fnBack = e.target.closest(".footnote-backref");
    if (fnBack) {
      e.preventDefault();
      const targetId = fnBack.getAttribute("data-target") || (fnBack.getAttribute("href") || "").split("#").pop();
      if (currentActiveSecId) {
        history.pushState(null, "", `#/${currentActiveSecId}#${targetId}`);
      }
      scrollToAnchor(targetId);
      return;
    }

    // 3. In-page TOC links and Sidebar subsection links within active chapter
    const inPageLink = e.target.closest(".toc-link, .sidebar-sub-link");
    if (inPageLink) {
      const href = inPageLink.getAttribute("href") || "";
      const parts = href.replace(/^#\/?/, "").split("#");
      const secId = parts[0];
      const anchorId = parts[1];
      if (secId === currentActiveSecId && anchorId) {
        e.preventDefault();
        history.pushState(null, "", href);
        scrollToAnchor(anchorId);
        return;
      }
    }

    // 4. Back to top or skip links
    const topLink = e.target.closest('a[href="#main"], a[href="#top"], .toc-back-top a');
    if (topLink) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
  });

  // Mobile Drawer Toggle
  const mobileBtn = document.getElementById("mobileToggleBtn");
  const sidebar = document.getElementById("bookSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");

  if (mobileBtn && sidebar && backdrop) {
    function toggle() {
      const open = sidebar.classList.toggle("is-open");
      backdrop.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    }
    function close() {
      sidebar.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    mobileBtn.addEventListener("click", toggle);
    backdrop.addEventListener("click", close);
    sidebar.addEventListener("click", e => {
      if (e.target.tagName === "A" && window.innerWidth < 928) close();
    });
  }

  // Initialize on page load and hash change
  window.addEventListener("hashchange", handleRoute);
  window.addEventListener("DOMContentLoaded", () => {
    handleRoute();
  });

})();
