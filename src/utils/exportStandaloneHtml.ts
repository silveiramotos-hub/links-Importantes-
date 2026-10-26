import { COLUMNS_METADATA, LaunchpadLink } from '../data/linksData';
import { getPaletteStyles } from './launchpadLogic';

/**
 * Generates a complete, self-contained, single-file HTML application
 * containing all 96 links (with any user customizations baked in),
 * responsive 6x16 matrix layout, search, column filters, and local customization.
 */
export function generateStandaloneSiteHtml(
  links: LaunchpadLink[],
  favoriteIds: string[]
): string {
  const serializedLinks = JSON.stringify(links, null, 2);
  const serializedFavorites = JSON.stringify(favoriteIds);
  const serializedColumns = JSON.stringify(COLUMNS_METADATA);

  // Pre-collect palette style map so standalone HTML has exact visual fidelity
  const paletteMap: Record<string, ReturnType<typeof getPaletteStyles>> = {};
  for (const item of links) {
    if (!paletteMap[item.palette]) {
      paletteMap[item.palette] = getPaletteStyles(item.palette);
    }
  }
  const serializedPalettes = JSON.stringify(paletteMap);

  return `<!doctype html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nexus Launchpad Pro — Central de Links e IA</title>
  <meta name="description" content="Painel executivo de acesso rápido com 96 ferramentas de e-commerce, gestão, CRM e inteligência artificial." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    html {
      font-family: var(--font-sans);
      scrollbar-gutter: stable;
    }
    body {
      font-family: var(--font-sans);
      background-color: #090B10;
      color: #F1F5F9;
      overflow-x: hidden;
      margin: 0;
    }
    .static-scroll-container {
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(148, 163, 184, 0.28) rgba(15, 23, 42, 0.6);
    }
    .static-scroll-container::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    .static-scroll-container::-webkit-scrollbar-track {
      background: rgba(15, 23, 42, 0.65);
    }
    .static-scroll-container::-webkit-scrollbar-thumb {
      background-color: rgba(148, 163, 184, 0.28);
      border-radius: 4px;
      border: 2px solid rgba(15, 23, 42, 0.65);
    }
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-view-transition {
      animation: fadeSlideIn 160ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  </style>
</head>
<body class="h-screen w-screen overflow-hidden flex flex-col bg-[#090B10] text-slate-100 select-none">
  <div class="shrink-0 bg-[#0B0E17]/95 border-b border-slate-800/90 backdrop-blur-md z-30">
    <header class="max-w-[1920px] mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 h-12 border-b border-slate-800/60">
      <a href="#top" id="brand-reset" class="text-base font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-sky-300 transition-colors">
        Nexus Launchpad
      </a>
      <div class="flex items-center gap-3 flex-1 max-w-xl">
        <input
          id="search-input"
          type="search"
          placeholder="Buscar entre 96 ferramentas (ex: WhatsApp, Shopee, Gemini, Runway)... [Pressione /]"
          class="w-full px-3.5 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900/90 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
        />
        <span id="counter-badge" class="hidden sm:inline text-xs text-slate-400 font-mono whitespace-nowrap">96/96 ativos</span>
      </div>
      <div id="col-filters" class="hidden lg:flex items-center gap-1 p-0.5 bg-slate-900/90 border border-slate-800 rounded-lg shrink-0"></div>
    </header>
  </div>

  <main class="static-scroll-container flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-5 lg:px-6 py-2">
    <div class="max-w-[1920px] mx-auto h-full flex flex-col justify-between">
      <div id="matrix-container" class="animate-view-transition grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 lg:gap-3.5 w-full"></div>
    </div>
  </main>

  <script>
    const LINKS = ${serializedLinks};
    const FAVORITES = new Set(${serializedFavorites});
    const COLUMNS = ${serializedColumns};
    const PALETTES = ${serializedPalettes};

    let currentCol = 'all';
    let searchQuery = '';

    function renderFilters() {
      const container = document.getElementById('col-filters');
      if (!container) return;
      const buttons = [
        { id: 'all', label: 'Todas (6 Colunas)' },
        ...COLUMNS.map(c => ({ id: c.column, label: 'Col ' + c.column })),
        { id: 'favorites', label: 'Fixados (' + FAVORITES.size + ')' }
      ];
      container.innerHTML = buttons.map(b => {
        const active = String(currentCol) === String(b.id);
        const cls = active
          ? 'bg-sky-500 text-slate-950'
          : 'text-slate-400 hover:text-slate-100';
        return '<button type="button" data-col="' + b.id + '" class="px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ' + cls + '">' + b.label + '</button>';
      }).join('');

      container.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-col');
          currentCol = (val === 'all' || val === 'favorites') ? val : Number(val);
          renderFilters();
          renderMatrix();
        });
      });
    }

    function renderMatrix() {
      const container = document.getElementById('matrix-container');
      const badge = document.getElementById('counter-badge');
      const q = searchQuery.trim().toLowerCase();

      const filtered = LINKS.filter(item => {
        if (currentCol === 'favorites' && !FAVORITES.has(item.id)) return false;
        if (currentCol !== 'all' && currentCol !== 'favorites' && item.column !== currentCol) return false;
        if (!q) return true;
        return (
          item.label.toLowerCase().includes(q) ||
          item.domain.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      });

      if (badge) badge.textContent = filtered.length + '/96 ativos';

      const visibleCols = COLUMNS.filter(c => {
        if (currentCol === 'all' && !q) return true;
        return filtered.some(l => l.column === c.column);
      });

      container.innerHTML = visibleCols.map(colMeta => {
        const colLinks = filtered
          .filter(l => l.column === colMeta.column)
          .sort((a, b) => a.row - b.row);

        const rowsHtml = colLinks.map(link => {
          const p = PALETTES[link.palette] || PALETTES['royal-blue'];
          return '<div class="group relative flex items-center justify-center rounded-[5px] border transition-all duration-150 select-none ' + p.bgClass + ' ' + p.borderClass + ' shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_2px_rgba(0,0,0,0.45)] hover:-translate-y-[1px] h-[36px] lg:h-[35px]">' +
            '<a href="' + link.url + '" target="_blank" rel="noopener noreferrer" title="' + link.label + ' — ' + link.domain + '" class="w-full h-full flex items-center justify-center px-2 text-center rounded-[4px] ' + p.textClass + '">' +
              '<span class="text-[11px] sm:text-[11.5px] xl:text-[12px] font-bold tracking-[0.03em] truncate leading-none">' + link.label + '</span>' +
            '</a>' +
          '</div>';
        }).join('');

        return '<section class="flex flex-col min-w-0">' +
          '<div class="flex items-center justify-between gap-2 pb-1 mb-1 border-b border-slate-800/80 px-0.5">' +
            '<h2 class="text-[11px] font-bold text-slate-300 truncate">0' + colMeta.column + '. ' + colMeta.title + '</h2>' +
            '<span class="text-[10px] font-mono text-slate-400 shrink-0">' + colLinks.length + '</span>' +
          '</div>' +
          '<div class="flex flex-col gap-[4px]">' + rowsHtml + '</div>' +
        '</section>';
      }).join('');
    }

    document.getElementById('search-input').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderMatrix();
    });

    document.getElementById('brand-reset').addEventListener('click', (e) => {
      e.preventDefault();
      currentCol = 'all';
      searchQuery = '';
      document.getElementById('search-input').value = '';
      renderFilters();
      renderMatrix();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('search-input').focus();
      }
    });

    renderFilters();
    renderMatrix();
  </script>
</body>
</html>`;
}
