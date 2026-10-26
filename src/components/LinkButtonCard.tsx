import React from 'react';
import { Check, Copy, ExternalLink, Pencil, Star } from 'lucide-react';
import { LaunchpadLink } from '../data/linksData';
import { getPaletteStyles } from '../utils/launchpadLogic';

interface LinkButtonCardProps {
  link: LaunchpadLink;
  viewMode: 'matrix' | 'detailed';
  isFavorite: boolean;
  isEditMode: boolean;
  copiedId: string | null;
  onToggleFavorite: (id: string) => void;
  onEditLink: (link: LaunchpadLink) => void;
  onCopyUrl: (link: LaunchpadLink) => void;
  onRecordClick: (id: string) => void;
}

export const LinkButtonCard: React.FC<LinkButtonCardProps> = ({
  link,
  viewMode,
  isFavorite,
  isEditMode,
  copiedId,
  onToggleFavorite,
  onEditLink,
  onCopyUrl,
  onRecordClick,
}) => {
  const style = getPaletteStyles(link.palette);
  const isCopied = copiedId === link.id;

  if (viewMode === 'matrix') {
    return (
      <div
        className={`group relative flex items-center justify-center rounded-[5px] border transition-all duration-150 select-none ${style.bgClass} ${style.borderClass} shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_2px_rgba(0,0,0,0.45)] hover:-translate-y-[1px] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_12px_rgba(0,0,0,0.55)] active:translate-y-0 h-[36px] lg:h-[35px]`}
      >
        {isEditMode ? (
          <button
            type="button"
            onClick={() => onEditLink(link)}
            aria-label={`Editar link ${link.label}`}
            className={`w-full h-full flex items-center justify-between px-2.5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-[4px] cursor-pointer ${style.textClass}`}
          >
            <span className="w-3.5 shrink-0" aria-hidden="true" />
            <span className="text-[11px] sm:text-[11.5px] xl:text-[12px] font-bold tracking-[0.03em] truncate leading-none">
              {link.label}
            </span>
            <Pencil className="w-3.5 h-3.5 shrink-0 opacity-90" />
          </button>
        ) : (
          <>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onRecordClick(link.id)}
              title={`${link.label} — ${link.domain}\n${link.description}`}
              className={`w-full h-full flex items-center justify-center px-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-[4px] ${style.textClass}`}
            >
              <span className="text-[11px] sm:text-[11.5px] xl:text-[12px] font-bold tracking-[0.03em] truncate leading-none">
                {link.label}
              </span>
              <ExternalLink
                className="w-3 h-3 ml-1 shrink-0 opacity-0 group-hover:opacity-85 transition-opacity duration-150"
                aria-hidden="true"
              />
            </a>

            {/* Subtle quick-action controls visible on hover or focus */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex group-focus-within:flex items-center gap-0.5 bg-slate-950/80 backdrop-blur-xs rounded px-1 py-0.5 border border-white/15">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(link.id);
                }}
                aria-label={
                  isFavorite
                    ? `Remover ${link.label} dos favoritos`
                    : `Adicionar ${link.label} aos favoritos`
                }
                title={isFavorite ? 'Remover dos favoritos' : 'Fixar nos favoritos'}
                className="p-0.5 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <Star
                  className={`w-3 h-3 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEditLink(link);
                }}
                aria-label={`Configurar URL de ${link.label}`}
                title="Editar nome ou URL"
                className="p-0.5 text-slate-300 hover:text-sky-300 transition-colors cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>

            {isFavorite && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 group-hover:opacity-0 transition-opacity"
              >
                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  // Detailed card view
  return (
    <div className="group relative flex flex-col justify-between rounded-lg border border-slate-800/90 bg-slate-900/75 hover:bg-slate-900 hover:border-slate-700 transition-all duration-150 p-3.5 shadow-xs">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-xs shrink-0 border ${style.bgClass} ${style.borderClass}`}
              aria-hidden="true"
            />
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onRecordClick(link.id)}
              className="text-sm font-bold text-slate-100 hover:text-sky-300 transition-colors truncate block"
            >
              {link.label}
            </a>
          </div>
          <p className="mt-1 text-xs text-slate-400 line-clamp-1">{link.description}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onToggleFavorite(link.id)}
            aria-label={
              isFavorite
                ? `Remover ${link.label} dos favoritos`
                : `Adicionar ${link.label} aos favoritos`
            }
            className="p-1.5 rounded-md text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => onCopyUrl(link)}
            aria-label={`Copiar URL de ${link.label}`}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onEditLink(link)}
            aria-label={`Editar link ${link.label}`}
            className="p-1.5 rounded-md text-slate-400 hover:text-sky-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 min-w-0 truncate font-mono tabular-nums">
          <span>
            C{link.column}·L{String(link.row).padStart(2, '0')}
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate text-slate-300">{link.domain}</span>
        </div>

        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onRecordClick(link.id)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 whitespace-nowrap shrink-0"
        >
          <span>Abrir site</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
