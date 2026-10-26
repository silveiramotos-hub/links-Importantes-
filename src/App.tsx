/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, RotateCcw, SearchX, Star } from 'lucide-react';
import {
  COLUMNS_METADATA,
  INITIAL_LINKS,
  LaunchpadLink,
} from './data/linksData';
import {
  ColumnFilter,
  CustomLinkOverride,
  filterLaunchpadLinks,
  groupLinksByColumn,
  mergeLinksWithOverrides,
} from './utils/launchpadLogic';
import { TopCommandBar } from './components/TopCommandBar';
import { LinkButtonCard } from './components/LinkButtonCard';
import { LinkEditModal } from './components/LinkEditModal';
import { DownloadSiteModal } from './components/DownloadSiteModal';
import { generateStandaloneSiteHtml } from './utils/exportStandaloneHtml';

const STORAGE_OVERRIDES_KEY = 'nexus_launchpad_overrides_v1';
const STORAGE_FAVORITES_KEY = 'nexus_launchpad_favorites_v1';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [columnFilter, setColumnFilter] = useState<ColumnFilter>('all');
  const [viewMode, setViewMode] = useState<'matrix' | 'detailed'>('matrix');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLink, setEditingLink] = useState<LaunchpadLink | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const [overrides, setOverrides] = useState<Record<string, CustomLinkOverride>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_OVERRIDES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FAVORITES_KEY);
      return saved
        ? JSON.parse(saved)
        : [
            'c1-r1-whatsapp',
            'c2-r1-crm-loja',
            'c2-r3-mercado-livre',
            'c3-r2-chatgpt',
            'c3-r4-gemini',
            'c4-r2-canva',
          ];
    } catch {
      return ['c1-r1-whatsapp', 'c2-r3-mercado-livre', 'c3-r4-gemini'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_OVERRIDES_KEY, JSON.stringify(overrides));
    } catch {
      // Ignore storage quota errors
    }
  }, [overrides]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(favoriteIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [favoriteIds]);

  const showTransientNotice = (msg: string) => {
    setStatusNotice(msg);
    window.setTimeout(() => {
      setStatusNotice((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const allLinks = useMemo(
    () => mergeLinksWithOverrides(INITIAL_LINKS, overrides),
    [overrides]
  );

  const filteredLinks = useMemo(
    () => filterLaunchpadLinks(allLinks, searchQuery, columnFilter, favoriteIds),
    [allLinks, searchQuery, columnFilter, favoriteIds]
  );

  const groupedByColumn = useMemo(
    () => groupLinksByColumn(filteredLinks),
    [filteredLinks]
  );

  const visibleColumnsMeta = useMemo(() => {
    if (columnFilter === 'all') {
      if (!searchQuery.trim()) return COLUMNS_METADATA;
      return COLUMNS_METADATA.filter((col) => groupedByColumn[col.column].length > 0);
    }
    if (columnFilter === 'favorites') {
      return COLUMNS_METADATA.filter((col) => groupedByColumn[col.column].length > 0);
    }
    return COLUMNS_METADATA.filter((col) => col.column === columnFilter);
  }, [columnFilter, searchQuery, groupedByColumn]);

  const handleToggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      return next;
    });
  };

  const handleSaveOverride = (id: string, override: CustomLinkOverride) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: override,
    }));
    showTransientNotice(`Atalho "${override.label || id}" atualizado com sucesso.`);
  };

  const handleResetSingle = (id: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    showTransientNotice('Atalho restaurado para o link padrão original.');
  };

  const handleResetAllOverrides = () => {
    setOverrides({});
    showTransientNotice('Todos os 96 links foram restaurados para o padrão original.');
  };

  const handleCopyUrl = async (link: LaunchpadLink) => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopiedId(link.id);
      showTransientNotice(`Link de ${link.label} copiado para a área de transferência.`);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === link.id ? null : prev));
      }, 1800);
    } catch {
      showTransientNotice(`URL: ${link.url}`);
    }
  };

  const handleTriggerHtmlDownload = () => {
    const htmlContent = generateStandaloneSiteHtml(allLinks, favoriteIds);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus-launchpad-pro.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showTransientNotice('Download de "nexus-launchpad-pro.html" iniciado!');
  };

  const handleOpenDownloadModal = () => {
    handleTriggerHtmlDownload();
    setIsDownloadModalOpen(true);
  };

  const handleRecordClick = (_id: string) => {
    // Lightweight click handler
  };

  const hasCustomOverrides = Object.keys(overrides).length > 0;

  return (
    <div id="top" className="h-screen w-screen overflow-hidden flex flex-col bg-[#090B10] text-slate-100">
      {/* Top Navigation & Filter Bar */}
      <TopCommandBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        columnFilter={columnFilter}
        onColumnFilterChange={setColumnFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode((prev) => !prev)}
        onOpenDownloadModal={handleOpenDownloadModal}
        totalVisible={filteredLinks.length}
        favoritesCount={favoriteIds.length}
        hasCustomOverrides={hasCustomOverrides}
        onResetAllOverrides={handleResetAllOverrides}
      />

      {/* Contextual Edit Mode Banner */}
      {isEditMode && (
        <div className="animate-view-transition shrink-0 bg-amber-500/10 border-b border-amber-400/30 px-4 sm:px-6 py-1.5 flex items-center justify-between gap-4 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Pencil className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Modo de Personalização ativo: clique em qualquer botão abaixo para editar o nome, a URL da sua loja ou a cor.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditMode(false)}
            className="text-xs font-semibold text-amber-300 hover:text-white underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sair da edição
          </button>
        </div>
      )}

      {/* Main Static Scrollbar Workspace */}
      <main className="static-scroll-container flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-5 lg:px-6 py-2">
        <div className="max-w-[1920px] mx-auto h-full flex flex-col justify-between">
          {filteredLinks.length === 0 ? (
            /* Empty State */
            <div className="animate-view-transition my-auto mx-auto max-w-md text-center py-12 px-6 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-300">
                {columnFilter === 'favorites' ? (
                  <Star className="w-5 h-5 text-amber-400" />
                ) : (
                  <SearchX className="w-5 h-5 text-sky-400" />
                )}
              </div>
              <h2 className="text-base font-bold text-white">
                {columnFilter === 'favorites' && !searchQuery
                  ? 'Nenhum atalho fixado nos favoritos'
                  : 'Nenhuma ferramenta encontrada'}
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {columnFilter === 'favorites' && !searchQuery
                  ? 'Passe o mouse sobre qualquer botão na matriz e clique no ícone de estrela para fixar seus links mais usados aqui.'
                  : `Não encontramos resultados para "${searchQuery}". Tente buscar por outro nome, domínio ou exiba todas as 6 colunas.`}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setColumnFilter('all');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mostrar Matriz Completa (96 Links)</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'matrix' ? (
            /* 6x16 Professional Reference Matrix View */
            <div
              key={`matrix-${columnFilter}`}
              className={`animate-view-transition grid gap-2.5 sm:gap-3 lg:gap-3.5 ${
                visibleColumnsMeta.length === 1
                  ? 'grid-cols-1 max-w-xl mx-auto w-full'
                  : visibleColumnsMeta.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto w-full'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full'
              }`}
            >
              {visibleColumnsMeta.map((colMeta) => {
                const colLinks = groupedByColumn[colMeta.column];
                return (
                  <section
                    key={colMeta.column}
                    aria-label={`Coluna ${colMeta.column}: ${colMeta.title}`}
                    className="flex flex-col min-w-0"
                  >
                    {/* Subtle Column Header */}
                    <div className="flex items-center justify-between gap-2 pb-1 mb-1 border-b border-slate-800/80 px-0.5">
                      <h2 className="text-[11px] font-bold text-slate-300 truncate">
                        0{colMeta.column}. {colMeta.title}
                      </h2>
                      <span className="text-[10px] font-mono tabular-nums text-slate-400 shrink-0">
                        {colLinks.length}
                      </span>
                    </div>

                    {/* 16 Vertical Rows per Column */}
                    <div className="flex flex-col gap-[4px]">
                      {colLinks.map((link) => (
                        <LinkButtonCard
                          key={link.id}
                          link={link}
                          viewMode="matrix"
                          isFavorite={favoriteIds.includes(link.id)}
                          isEditMode={isEditMode}
                          copiedId={copiedId}
                          onToggleFavorite={handleToggleFavorite}
                          onEditLink={setEditingLink}
                          onCopyUrl={handleCopyUrl}
                          onRecordClick={handleRecordClick}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            /* Detailed Directory Card Grid View */
            <div
              key={`detailed-${columnFilter}`}
              className="animate-view-transition space-y-6 pb-6"
            >
              {visibleColumnsMeta.map((colMeta) => {
                const colLinks = groupedByColumn[colMeta.column];
                if (colLinks.length === 0) return null;
                return (
                  <section
                    key={colMeta.column}
                    aria-label={`Setor ${colMeta.column}: ${colMeta.title}`}
                    className="space-y-2.5"
                  >
                    <div className="flex items-baseline justify-between border-b border-slate-800 pb-2">
                      <div>
                        <h2 className="text-sm font-bold text-white">
                          0{colMeta.column}. {colMeta.title}
                        </h2>
                        <p className="text-xs text-slate-400">{colMeta.subtitle}</p>
                      </div>
                      <span className="text-xs font-mono tabular-nums text-slate-400">
                        {colLinks.length} ferramentas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {colLinks.map((link) => (
                        <LinkButtonCard
                          key={link.id}
                          link={link}
                          viewMode="detailed"
                          isFavorite={favoriteIds.includes(link.id)}
                          isEditMode={isEditMode}
                          copiedId={copiedId}
                          onToggleFavorite={handleToggleFavorite}
                          onEditLink={setEditingLink}
                          onCopyUrl={handleCopyUrl}
                          onRecordClick={handleRecordClick}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Quiet Toast Feedback */}
      {statusNotice && (
        <div
          role="status"
          className="animate-view-transition fixed bottom-4 right-4 z-40 rounded-lg border border-slate-700 bg-slate-900/95 px-3.5 py-2 text-xs font-medium text-slate-100 shadow-xl"
        >
          {statusNotice}
        </div>
      )}

      {/* Link Customization Modal */}
      <LinkEditModal
        link={editingLink}
        onClose={() => setEditingLink(null)}
        onSaveOverride={handleSaveOverride}
        onResetSingle={handleResetSingle}
      />

      {/* Download & Export Site Modal */}
      <DownloadSiteModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        links={allLinks}
        favoriteIds={favoriteIds}
        onTriggerHtmlDownload={handleTriggerHtmlDownload}
      />
    </div>
  );
}
