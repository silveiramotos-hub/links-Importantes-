import React, { useRef, useEffect } from 'react';
import {
  Check,
  Download,
  Grid,
  LayoutList,
  Pencil,
  RotateCcw,
  Search,
  Star,
  X,
} from 'lucide-react';
import { COLUMNS_METADATA } from '../data/linksData';
import { ColumnFilter } from '../utils/launchpadLogic';

interface TopCommandBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  columnFilter: ColumnFilter;
  onColumnFilterChange: (col: ColumnFilter) => void;
  viewMode: 'matrix' | 'detailed';
  onViewModeChange: (mode: 'matrix' | 'detailed') => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenDownloadModal: () => void;
  totalVisible: number;
  favoritesCount: number;
  hasCustomOverrides: boolean;
  onResetAllOverrides: () => void;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  searchQuery,
  onSearchChange,
  columnFilter,
  onColumnFilterChange,
  viewMode,
  onViewModeChange,
  isEditMode,
  onToggleEditMode,
  onOpenDownloadModal,
  totalVisible,
  favoritesCount,
  hasCustomOverrides,
  onResetAllOverrides,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && searchQuery) {
        onSearchChange('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, onSearchChange]);

  return (
    <div className="shrink-0 bg-[#0B0E17]/95 border-b border-slate-800/90 backdrop-blur-md z-30">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="max-w-[1920px] mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-12 border-b border-slate-800/60">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onColumnFilterChange('all');
            onSearchChange('');
          }}
          className="text-base font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-sky-300 transition-colors"
        >
          Nexus Launchpad
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Navegação rápida por setores"
          className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300"
        >
          <button
            type="button"
            onClick={() => onColumnFilterChange('all')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
              columnFilter === 'all'
                ? 'text-white border-sky-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            Matriz Completa
          </button>
          <button
            type="button"
            onClick={() => onColumnFilterChange(1)}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
              columnFilter === 1 || columnFilter === 2
                ? 'text-white border-sky-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            Operação & Lojas
          </button>
          <button
            type="button"
            onClick={() => onColumnFilterChange(3)}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
              columnFilter === 3
                ? 'text-white border-sky-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            LLMs & TikTok
          </button>
          <button
            type="button"
            onClick={() => onColumnFilterChange(4)}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
              columnFilter === 4 || columnFilter === 5
                ? 'text-white border-sky-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            Design & Vídeo IA
          </button>
          <button
            type="button"
            onClick={() => onColumnFilterChange('favorites')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
              columnFilter === 'favorites'
                ? 'text-amber-300 border-amber-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            Favoritos ({favoritesCount})
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenDownloadModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Site (.HTML)</span>
          </button>
        </div>
      </header>

      {/* Compact Workspace Filter & Column Control Toolbar */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-2 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        {/* Search Input + Active Status */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xl">
          <div className="relative flex-1">
            <label htmlFor="launchpad-search" className="sr-only">
              Pesquisar ferramentas ou links
            </label>
            <Search
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              id="launchpad-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar entre 96 ferramentas (ex: WhatsApp, Shopee, Gemini, Runway)... [Pressione /]"
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900/90 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono tabular-nums whitespace-nowrap shrink-0">
            <span>{totalVisible}/96 ativos</span>
          </div>
        </div>

        {/* Interactive Column Selector + View Switcher + Edit Mode */}
        <div className="flex items-center justify-between lg:justify-end gap-2 overflow-x-auto no-scrollbar">
          {/* Segmented Column Filter Controls */}
          <div
            role="group"
            aria-label="Filtrar por coluna"
            className="flex items-center gap-1 p-0.5 bg-slate-900/90 border border-slate-800 rounded-lg shrink-0"
          >
            <button
              type="button"
              onClick={() => onColumnFilterChange('all')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                columnFilter === 'all'
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Todas (6 Colunas)
            </button>

            {COLUMNS_METADATA.map((colMeta) => (
              <button
                key={colMeta.column}
                type="button"
                onClick={() => onColumnFilterChange(colMeta.column)}
                title={`${colMeta.title}: ${colMeta.subtitle}`}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  columnFilter === colMeta.column
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                Col {colMeta.column}
              </button>
            ))}

            <button
              type="button"
              onClick={() => onColumnFilterChange('favorites')}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                columnFilter === 'favorites'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Star className="w-3 h-3" />
              <span>Fixados ({favoritesCount})</span>
            </button>
          </div>

          {/* View Mode Toggle + Edit Links + Restore Defaults */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div
              role="group"
              aria-label="Modo de visualização"
              className="flex items-center gap-0.5 p-0.5 bg-slate-900/90 border border-slate-800 rounded-lg"
            >
              <button
                type="button"
                onClick={() => onViewModeChange('matrix')}
                aria-label="Visualização Matriz 6 por 16"
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3 h-3" />
                <span className="hidden sm:inline">Matriz 6×16</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('detailed')}
                aria-label="Visualização Detalhada em Cards"
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'detailed'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutList className="w-3 h-3" />
                <span className="hidden sm:inline">Detalhado</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onToggleEditMode}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isEditMode
                  ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300'
                  : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {isEditMode ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Concluir Edição</span>
                </>
              ) : (
                <>
                  <Pencil className="w-3 h-3" />
                  <span>Personalizar</span>
                </>
              )}
            </button>

            {hasCustomOverrides && (
              <button
                type="button"
                onClick={onResetAllOverrides}
                title="Restaurar todos os 96 links para o padrão original"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden xl:inline">Restaurar Padrão</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
