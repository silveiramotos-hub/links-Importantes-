import React, { useState } from 'react';
import { Check, Copy, Download, FileCode, FileJson, Globe, X } from 'lucide-react';
import { LaunchpadLink } from '../data/linksData';
import { generateStandaloneSiteHtml } from '../utils/exportStandaloneHtml';

interface DownloadSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: LaunchpadLink[];
  favoriteIds: string[];
  onTriggerHtmlDownload: () => void;
}

export const DownloadSiteModal: React.FC<DownloadSiteModalProps> = ({
  isOpen,
  onClose,
  links,
  favoriteIds,
  onTriggerHtmlDownload,
}) => {
  const [copiedHtml, setCopiedHtml] = useState(false);

  if (!isOpen) return null;

  const handleCopyFullHtml = async () => {
    const html = generateStandaloneSiteHtml(links, favoriteIds);
    try {
      await navigator.clipboard.writeText(html);
      setCopiedHtml(true);
      window.setTimeout(() => setCopiedHtml(false), 2500);
    } catch {
      // Fallback textarea copy
      const textarea = document.createElement('textarea');
      textarea.value = html;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedHtml(true);
      window.setTimeout(() => setCopiedHtml(false), 2500);
    }
  };

  const handleDownloadJsonBackup = () => {
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalLinks: links.length,
        favoriteIds,
        links,
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus-launchpad-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-download-site-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-[#0E131F] text-slate-100 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h2 id="modal-download-site-title" className="text-base font-bold text-white">
              Baixar Site Completo — Nexus Launchpad Pro
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Exporte sua página com todas as 96 ferramentas e suas personalizações salvas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de download"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Primary Option: Standalone HTML File */}
          <div className="rounded-xl border border-sky-500/40 bg-slate-900/90 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                <h3 className="text-sm font-bold text-white">
                  1. Arquivo Único Pronto para Uso (.HTML)
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Baixa o site inteiro em um único arquivo{' '}
                <code className="text-sky-300 font-mono">nexus-launchpad-pro.html</code>. Basta
                dar dois cliques para abrir no navegador (PC/Celular) ou enviar para{' '}
                <strong>Netlify</strong> ou <strong>HostGator</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={onTriggerHtmlDownload}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar .HTML Agora</span>
            </button>
          </div>

          {/* Secondary Options: Copy HTML for WordPress / HostGator & JSON Backup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                  <h3 className="text-xs font-bold text-white">
                    Copiar Código HTML (WordPress)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Ideal para colar diretamente em uma página HTML personalizada no{' '}
                  <strong>Painel WP Admin</strong> ou cPanel.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyFullHtml}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                {copiedHtml ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Código HTML Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código HTML</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-amber-400 shrink-0" />
                  <h3 className="text-xs font-bold text-white">Backup de Links (.JSON)</h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Salva a lista estruturada com todas as 96 URLs, categorias, cores e seus
                  atalhos favoritos.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadJsonBackup}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar JSON (96 Links)</span>
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 px-3.5 py-2.5 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Dica para Projeto React Completo (.ZIP):</strong>{' '}
            Você também pode baixar o pacote completo do código-fonte (React + TypeScript + Vite)
            clicando no ícone de download/exportação no canto superior direito da barra do Google AI Studio.
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
