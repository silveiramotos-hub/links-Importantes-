import { INITIAL_LINKS, LaunchpadLink, PaletteVariant } from '../data/linksData';

export type ColumnFilter = 'all' | 1 | 2 | 3 | 4 | 5 | 6 | 'favorites';

export interface CustomLinkOverride {
  label?: string;
  url?: string;
  domain?: string;
  description?: string;
  palette?: PaletteVariant;
}

export interface PaletteStyleConfig {
  bgClass: string;
  textClass: string;
  subtextClass: string;
  borderClass: string;
  glowColor: string;
  badgeTextClass: string;
}

/**
 * Normalizes and validates a user-entered URL.
 * Returns `{ valid: true, url, domain }` or `{ valid: false, error }`.
 */
export function validateAndNormalizeUrl(rawInput: string): {
  valid: boolean;
  url: string;
  domain: string;
  error?: string;
} {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      valid: false,
      url: '',
      domain: '',
      error: 'Informe uma URL válida para o link.',
    };
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return {
        valid: false,
        url: '',
        domain: '',
        error: 'O domínio informado parece incompleto (ex: site.com.br).',
      };
    }
    const cleanHost = parsed.hostname.replace(/^www\./i, '');
    return {
      valid: true,
      url: parsed.toString(),
      domain: cleanHost,
    };
  } catch {
    return {
      valid: false,
      url: '',
      domain: '',
      error: 'Formato de URL inválido. Exemplo: https://www.site.com.br',
    };
  }
}

/**
 * Merges default 96 links with any custom user overrides saved in localStorage.
 */
export function mergeLinksWithOverrides(
  baseLinks: LaunchpadLink[],
  overrides: Record<string, CustomLinkOverride>
): LaunchpadLink[] {
  return baseLinks.map((item) => {
    const custom = overrides[item.id];
    if (!custom) return item;
    return {
      ...item,
      label: custom.label?.trim() ? custom.label.trim() : item.label,
      url: custom.url?.trim() ? custom.url.trim() : item.url,
      domain: custom.domain?.trim() ? custom.domain.trim() : item.domain,
      description: custom.description?.trim() ? custom.description.trim() : item.description,
      palette: custom.palette ?? item.palette,
    };
  });
}

/**
 * Filters links by search query, column filter, or favorites set.
 */
export function filterLaunchpadLinks(
  links: LaunchpadLink[],
  searchQuery: string,
  columnFilter: ColumnFilter,
  favoriteIds: string[]
): LaunchpadLink[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const favSet = new Set(favoriteIds);

  return links.filter((link) => {
    if (columnFilter === 'favorites') {
      if (!favSet.has(link.id)) return false;
    } else if (columnFilter !== 'all') {
      if (link.column !== columnFilter) return false;
    }

    if (!normalizedQuery) return true;

    const matchLabel = link.label.toLowerCase().includes(normalizedQuery);
    const matchDomain = link.domain.toLowerCase().includes(normalizedQuery);
    const matchCategory = link.category.toLowerCase().includes(normalizedQuery);
    const matchDesc = link.description.toLowerCase().includes(normalizedQuery);
    const matchCoord = `c${link.column} r${link.row}`.includes(normalizedQuery);

    return matchLabel || matchDomain || matchCategory || matchDesc || matchCoord;
  });
}

/**
 * Organizes links into the 6 columns (1..6), each sorted by row (1..16).
 */
export function groupLinksByColumn(
  links: LaunchpadLink[]
): Record<1 | 2 | 3 | 4 | 5 | 6, LaunchpadLink[]> {
  const grouped: Record<1 | 2 | 3 | 4 | 5 | 6, LaunchpadLink[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };

  for (const link of links) {
    grouped[link.column].push(link);
  }

  for (const col of [1, 2, 3, 4, 5, 6] as const) {
    grouped[col].sort((a, b) => a.row - b.row);
  }

  return grouped;
}

/**
 * Verify matrix completeness invariants on INITIAL_LINKS.
 */
export function verifyMatrixIntegrity(links: LaunchpadLink[] = INITIAL_LINKS): {
  totalCount: number;
  columnCounts: Record<1 | 2 | 3 | 4 | 5 | 6, number>;
  allUrlsValid: boolean;
} {
  const grouped = groupLinksByColumn(links);
  const columnCounts = {
    1: grouped[1].length,
    2: grouped[2].length,
    3: grouped[3].length,
    4: grouped[4].length,
    5: grouped[5].length,
    6: grouped[6].length,
  };
  const allUrlsValid = links.every((l) => /^https?:\/\/.+/i.test(l.url));
  return {
    totalCount: links.length,
    columnCounts,
    allUrlsValid,
  };
}

/**
 * Returns refined executive surface styling for each palette variant from the reference screenshot.
 */
export function getPaletteStyles(palette: PaletteVariant): PaletteStyleConfig {
  switch (palette) {
    case 'olive-green':
      return {
        bgClass: 'bg-gradient-to-b from-[#457809] to-[#345C05] hover:from-[#4F8A0B] hover:to-[#3D6B07]',
        textClass: 'text-white',
        subtextClass: 'text-lime-100/80',
        borderClass: 'border-[#65A30D]/50 hover:border-lime-300/70',
        glowColor: 'rgba(101, 163, 13, 0.35)',
        badgeTextClass: 'text-lime-200',
      };
    case 'vivid-purple':
      return {
        bgClass: 'bg-gradient-to-b from-[#7E22CE] to-[#6416A8] hover:from-[#9333EA] hover:to-[#701AC0]',
        textClass: 'text-white',
        subtextClass: 'text-purple-100/80',
        borderClass: 'border-purple-400/45 hover:border-purple-300/80',
        glowColor: 'rgba(147, 51, 234, 0.35)',
        badgeTextClass: 'text-purple-200',
      };
    case 'deep-navy':
      return {
        bgClass: 'bg-gradient-to-b from-[#233252] to-[#17223B] hover:from-[#2C3F68] hover:to-[#1E2C4C]',
        textClass: 'text-slate-50',
        subtextClass: 'text-slate-300/80',
        borderClass: 'border-indigo-400/35 hover:border-indigo-300/70',
        glowColor: 'rgba(99, 102, 241, 0.28)',
        badgeTextClass: 'text-indigo-200',
      };
    case 'royal-blue':
      return {
        bgClass: 'bg-gradient-to-b from-[#2E62E8] to-[#214BC2] hover:from-[#3B71F7] hover:to-[#2856D6]',
        textClass: 'text-white',
        subtextClass: 'text-blue-100/85',
        borderClass: 'border-blue-400/50 hover:border-blue-200/80',
        glowColor: 'rgba(59, 130, 246, 0.38)',
        badgeTextClass: 'text-blue-100',
      };
    case 'olive-taupe':
      return {
        bgClass: 'bg-gradient-to-b from-[#6B6A49] to-[#545338] hover:from-[#7A7954] hover:to-[#616042]',
        textClass: 'text-stone-50',
        subtextClass: 'text-stone-200/80',
        borderClass: 'border-stone-400/40 hover:border-stone-200/75',
        glowColor: 'rgba(168, 162, 158, 0.25)',
        badgeTextClass: 'text-stone-200',
      };
    case 'crimson-red':
      return {
        bgClass: 'bg-gradient-to-b from-[#A8201A] to-[#871712] hover:from-[#BF261F] hover:to-[#991B15]',
        textClass: 'text-white',
        subtextClass: 'text-red-100/85',
        borderClass: 'border-red-400/45 hover:border-red-300/80',
        glowColor: 'rgba(220, 38, 38, 0.35)',
        badgeTextClass: 'text-red-200',
      };
    case 'charcoal-dark':
      return {
        bgClass: 'bg-gradient-to-b from-[#2A2931] to-[#1D1C22] hover:from-[#35343E] hover:to-[#25242C]',
        textClass: 'text-slate-100',
        subtextClass: 'text-slate-300/75',
        borderClass: 'border-slate-500/40 hover:border-slate-300/70',
        glowColor: 'rgba(148, 163, 184, 0.22)',
        badgeTextClass: 'text-slate-300',
      };
    case 'magenta-gold':
      return {
        bgClass: 'bg-gradient-to-b from-[#61104C] to-[#470A37] hover:from-[#75145C] hover:to-[#570D44]',
        textClass: 'text-[#FDE047]',
        subtextClass: 'text-amber-200/80',
        borderClass: 'border-fuchsia-400/45 hover:border-yellow-300/75',
        glowColor: 'rgba(217, 70, 239, 0.32)',
        badgeTextClass: 'text-yellow-300',
      };
    case 'metallic-silver':
      return {
        bgClass: 'bg-gradient-to-b from-[#1A1C20] via-[#717885] to-[#E2E8F0] hover:from-[#23262B] hover:via-[#838B99] hover:to-[#F1F5F9]',
        textClass: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]',
        subtextClass: 'text-slate-900 font-semibold',
        borderClass: 'border-slate-300/60 hover:border-white',
        glowColor: 'rgba(226, 232, 240, 0.35)',
        badgeTextClass: 'text-slate-900',
      };
    case 'cerulean-blue':
      return {
        bgClass: 'bg-gradient-to-b from-[#1E88B8] to-[#156C96] hover:from-[#2499CE] hover:to-[#197BA9]',
        textClass: 'text-white',
        subtextClass: 'text-sky-100/85',
        borderClass: 'border-sky-300/45 hover:border-sky-200/85',
        glowColor: 'rgba(14, 165, 233, 0.35)',
        badgeTextClass: 'text-sky-100',
      };
    case 'amber-dark-text':
      return {
        bgClass: 'bg-gradient-to-b from-[#FACC15] to-[#EAB308] hover:from-[#FDE047] hover:to-[#FACC15]',
        textClass: 'text-slate-950 font-extrabold',
        subtextClass: 'text-slate-900/80 font-medium',
        borderClass: 'border-yellow-200/70 hover:border-white',
        glowColor: 'rgba(250, 204, 21, 0.35)',
        badgeTextClass: 'text-slate-950',
      };
    case 'olive-bronze':
      return {
        bgClass: 'bg-gradient-to-b from-[#5E5211] to-[#473E0B] hover:from-[#706215] hover:to-[#574C0E]',
        textClass: 'text-amber-50',
        subtextClass: 'text-amber-200/80',
        borderClass: 'border-yellow-600/45 hover:border-yellow-400/75',
        glowColor: 'rgba(202, 138, 4, 0.28)',
        badgeTextClass: 'text-amber-200',
      };
    case 'sage-taupe':
      return {
        bgClass: 'bg-gradient-to-b from-[#696D56] to-[#525642] hover:from-[#787C63] hover:to-[#5E634C]',
        textClass: 'text-stone-50',
        subtextClass: 'text-stone-200/85',
        borderClass: 'border-stone-400/40 hover:border-stone-200/75',
        glowColor: 'rgba(168, 162, 158, 0.25)',
        badgeTextClass: 'text-stone-200',
      };
    case 'stone-dark-text':
      return {
        bgClass: 'bg-gradient-to-b from-[#989584] to-[#827F6F] hover:from-[#A8A593] hover:to-[#918E7D]',
        textClass: 'text-slate-950 font-extrabold',
        subtextClass: 'text-slate-900/80 font-medium',
        borderClass: 'border-stone-300/60 hover:border-white',
        glowColor: 'rgba(214, 211, 209, 0.28)',
        badgeTextClass: 'text-slate-950',
      };
    case 'sand-dark-text':
      return {
        bgClass: 'bg-gradient-to-b from-[#CDBB8E] to-[#B8A576] hover:from-[#D9C89C] hover:to-[#C4B182]',
        textClass: 'text-slate-950 font-extrabold',
        subtextClass: 'text-slate-900/80 font-medium',
        borderClass: 'border-amber-200/65 hover:border-white',
        glowColor: 'rgba(253, 230, 138, 0.3)',
        badgeTextClass: 'text-slate-950',
      };
    case 'ochre-bronze':
      return {
        bgClass: 'bg-gradient-to-b from-[#7E6B23] to-[#635319] hover:from-[#917B29] hover:to-[#75621E]',
        textClass: 'text-amber-50',
        subtextClass: 'text-amber-100/80',
        borderClass: 'border-amber-400/40 hover:border-amber-200/75',
        glowColor: 'rgba(217, 119, 6, 0.28)',
        badgeTextClass: 'text-amber-100',
      };
    case 'obsidian-dark':
      return {
        bgClass: 'bg-gradient-to-b from-[#170F12] to-[#0D080A] hover:from-[#261A1E] hover:to-[#171013]',
        textClass: 'text-slate-100',
        subtextClass: 'text-slate-400',
        borderClass: 'border-slate-700/70 hover:border-slate-400/80',
        glowColor: 'rgba(148, 163, 184, 0.22)',
        badgeTextClass: 'text-slate-300',
      };
    case 'cornflower-blue':
      return {
        bgClass: 'bg-gradient-to-b from-[#6082E3] to-[#4B6CD1] hover:from-[#7191EC] hover:to-[#5879DC]',
        textClass: 'text-white',
        subtextClass: 'text-blue-100/85',
        borderClass: 'border-blue-300/50 hover:border-white/85',
        glowColor: 'rgba(96, 165, 250, 0.35)',
        badgeTextClass: 'text-blue-100',
      };
    case 'indigo-purple':
      return {
        bgClass: 'bg-gradient-to-b from-[#5533CC] to-[#4324B2] hover:from-[#6542DE] hover:to-[#4F2DC4]',
        textClass: 'text-white',
        subtextClass: 'text-indigo-100/85',
        borderClass: 'border-indigo-400/50 hover:border-indigo-200/85',
        glowColor: 'rgba(99, 102, 241, 0.35)',
        badgeTextClass: 'text-indigo-200',
      };
    case 'lime-dark-text':
      return {
        bgClass: 'bg-gradient-to-b from-[#98E600] to-[#7AC200] hover:from-[#A6F20E] hover:to-[#8CE000]',
        textClass: 'text-slate-950 font-extrabold',
        subtextClass: 'text-slate-900/80 font-medium',
        borderClass: 'border-lime-200/75 hover:border-white',
        glowColor: 'rgba(132, 204, 22, 0.4)',
        badgeTextClass: 'text-slate-950',
      };
    case 'pine-charcoal':
      return {
        bgClass: 'bg-gradient-to-b from-[#162114] to-[#0E160C] hover:from-[#21311E] hover:to-[#152013]',
        textClass: 'text-emerald-50',
        subtextClass: 'text-emerald-200/75',
        borderClass: 'border-emerald-700/50 hover:border-emerald-400/75',
        glowColor: 'rgba(16, 185, 129, 0.25)',
        badgeTextClass: 'text-emerald-300',
      };
    case 'metallic-gold':
      return {
        bgClass: 'bg-gradient-to-b from-[#33220A] via-[#855B1E] to-[#CA9335] hover:from-[#422C0D] hover:via-[#996923] hover:to-[#DBA242]',
        textClass: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]',
        subtextClass: 'text-amber-100 font-medium',
        borderClass: 'border-amber-400/55 hover:border-amber-200/90',
        glowColor: 'rgba(217, 119, 6, 0.35)',
        badgeTextClass: 'text-amber-100',
      };
    case 'aubergine-dark':
      return {
        bgClass: 'bg-gradient-to-b from-[#2E2236] to-[#201726] hover:from-[#3C2D47] hover:to-[#2B1F33]',
        textClass: 'text-purple-50',
        subtextClass: 'text-purple-200/75',
        borderClass: 'border-purple-500/40 hover:border-purple-300/75',
        glowColor: 'rgba(168, 85, 247, 0.25)',
        badgeTextClass: 'text-purple-200',
      };
    case 'espresso-dark':
      return {
        bgClass: 'bg-gradient-to-b from-[#381C11] to-[#26120A] hover:from-[#4A2517] hover:to-[#33180E]',
        textClass: 'text-orange-50',
        subtextClass: 'text-orange-200/75',
        borderClass: 'border-amber-700/45 hover:border-amber-400/75',
        glowColor: 'rgba(217, 119, 6, 0.25)',
        badgeTextClass: 'text-orange-200',
      };
    case 'obsidian-gold-text':
      return {
        bgClass: 'bg-gradient-to-b from-[#172110] to-[#0E1509] hover:from-[#223018] hover:to-[#151F0E]',
        textClass: 'text-[#FACC15] font-extrabold',
        subtextClass: 'text-yellow-200/80',
        borderClass: 'border-lime-600/45 hover:border-yellow-400/80',
        glowColor: 'rgba(250, 204, 21, 0.28)',
        badgeTextClass: 'text-yellow-300',
      };
    case 'pistachio-crimson-text':
      return {
        bgClass: 'bg-gradient-to-b from-[#B5E576] to-[#9ED45B] hover:from-[#C2EE88] hover:to-[#ACE069]',
        textClass: 'text-[#7F1D1D] font-extrabold',
        subtextClass: 'text-red-950/80 font-medium',
        borderClass: 'border-lime-300/75 hover:border-white',
        glowColor: 'rgba(163, 230, 53, 0.35)',
        badgeTextClass: 'text-[#7F1D1D]',
      };
    case 'metallic-burgundy':
      return {
        bgClass: 'bg-gradient-to-b from-[#1C1214] via-[#4A2229] to-[#7A3541] hover:from-[#26181B] hover:via-[#5C2B33] hover:to-[#8F3F4D]',
        textClass: 'text-rose-50',
        subtextClass: 'text-rose-200/85',
        borderClass: 'border-rose-400/45 hover:border-rose-200/80',
        glowColor: 'rgba(225, 29, 72, 0.28)',
        badgeTextClass: 'text-rose-200',
      };
    case 'metallic-champagne':
      return {
        bgClass: 'bg-gradient-to-b from-[#2B1D12] via-[#8C7A65] to-[#E6DEC8] hover:from-[#382618] hover:via-[#9E8B74] hover:to-[#F2ECE1]',
        textClass: 'text-slate-950 font-extrabold drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]',
        subtextClass: 'text-stone-900 font-semibold',
        borderClass: 'border-amber-200/60 hover:border-white',
        glowColor: 'rgba(231, 229, 228, 0.32)',
        badgeTextClass: 'text-stone-950',
      };
    case 'mint-dark-text':
      return {
        bgClass: 'bg-gradient-to-b from-[#82B875] to-[#6CA35F] hover:from-[#91C684] hover:to-[#7AB26D]',
        textClass: 'text-slate-950 font-extrabold',
        subtextClass: 'text-slate-900/80 font-medium',
        borderClass: 'border-emerald-200/65 hover:border-white',
        glowColor: 'rgba(74, 222, 128, 0.3)',
        badgeTextClass: 'text-slate-950',
      };
    case 'terracotta-burgundy':
      return {
        bgClass: 'bg-gradient-to-b from-[#6E342E] to-[#572722] hover:from-[#823E37] hover:to-[#69302A]',
        textClass: 'text-amber-200 font-bold',
        subtextClass: 'text-amber-100/80',
        borderClass: 'border-rose-400/40 hover:border-amber-300/75',
        glowColor: 'rgba(244, 63, 94, 0.28)',
        badgeTextClass: 'text-amber-200',
      };
    case 'leaf-green':
      return {
        bgClass: 'bg-gradient-to-b from-[#5C9E31] to-[#498223] hover:from-[#6AB23B] hover:to-[#55942A]',
        textClass: 'text-white',
        subtextClass: 'text-lime-100/85',
        borderClass: 'border-lime-300/50 hover:border-white/85',
        glowColor: 'rgba(132, 204, 22, 0.32)',
        badgeTextClass: 'text-lime-100',
      };
    case 'plum-gold-text':
      return {
        bgClass: 'bg-gradient-to-b from-[#5E164B] to-[#450E36] hover:from-[#731B5C] hover:to-[#571244]',
        textClass: 'text-[#FDE047] font-extrabold',
        subtextClass: 'text-amber-200/85',
        borderClass: 'border-fuchsia-400/45 hover:border-yellow-300/80',
        glowColor: 'rgba(232, 121, 249, 0.32)',
        badgeTextClass: 'text-yellow-300',
      };
    case 'sky-dark-text':
      return {
        bgClass: 'bg-gradient-to-b from-[#1DA1F2] to-[#0D8BD9] hover:from-[#38B2FF] hover:to-[#1599EB]',
        textClass: 'text-slate-950 font-extrabold',
        subtextClass: 'text-slate-950/80 font-semibold',
        borderClass: 'border-sky-200/75 hover:border-white',
        glowColor: 'rgba(56, 189, 248, 0.38)',
        badgeTextClass: 'text-slate-950',
      };
    case 'cobalt-blue':
      return {
        bgClass: 'bg-gradient-to-b from-[#2338C6] to-[#1A2AA0] hover:from-[#2C44E0] hover:to-[#2134B8]',
        textClass: 'text-white',
        subtextClass: 'text-indigo-100/85',
        borderClass: 'border-indigo-400/50 hover:border-indigo-200/85',
        glowColor: 'rgba(79, 70, 229, 0.38)',
        badgeTextClass: 'text-indigo-100',
      };
  }
}
