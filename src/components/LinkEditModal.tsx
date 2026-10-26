import React, { useEffect, useState } from 'react';
import { ExternalLink, RotateCcw, Save, X } from 'lucide-react';
import { INITIAL_LINKS, LaunchpadLink, PaletteVariant } from '../data/linksData';
import {
  CustomLinkOverride,
  getPaletteStyles,
  validateAndNormalizeUrl,
} from '../utils/launchpadLogic';

interface LinkEditModalProps {
  link: LaunchpadLink | null;
  onClose: () => void;
  onSaveOverride: (id: string, override: CustomLinkOverride) => void;
  onResetSingle: (id: string) => void;
}

const PALETTE_OPTIONS: { value: PaletteVariant; label: string }[] = [
  { value: 'royal-blue', label: 'Azul Royal' },
  { value: 'cerulean-blue', label: 'Azul Cerúleo' },
  { value: 'deep-navy', label: 'Azul Marinho' },
  { value: 'cobalt-blue', label: 'Azul Cobalto' },
  { value: 'olive-green', label: 'Verde Floresta' },
  { value: 'leaf-green', label: 'Verde Folha' },
  { value: 'lime-dark-text', label: 'Verde Lima Neon' },
  { value: 'pistachio-crimson-text', label: 'Pistache Criativo' },
  { value: 'amber-dark-text', label: 'Amarelo Ouro' },
  { value: 'crimson-red', label: 'Vermelho Carmesim' },
  { value: 'vivid-purple', label: 'Roxo Vibrante' },
  { value: 'indigo-purple', label: 'Índigo Profundo' },
  { value: 'magenta-gold', label: 'ameixa & Ouro' },
  { value: 'metallic-silver', label: 'Metálico Prata' },
  { value: 'metallic-gold', label: 'Metálico Bronze' },
  { value: 'metallic-champagne', label: 'Metálico Champagne' },
  { value: 'obsidian-dark', label: 'Obsidiana Escuro' },
  { value: 'charcoal-dark', label: 'Grafite Escuro' },
];

export const LinkEditModal: React.FC<LinkEditModalProps> = ({
  link,
  onClose,
  onSaveOverride,
  onResetSingle,
}) => {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [palette, setPalette] = useState<PaletteVariant>('royal-blue');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (link) {
      setLabel(link.label);
      setUrl(link.url);
      setDescription(link.description);
      setPalette(link.palette);
      setError(null);
    }
  }, [link]);

  if (!link) return null;

  const originalDefault = INITIAL_LINKS.find((item) => item.id === link.id);
  const previewStyle = getPaletteStyles(palette);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      setError('O título do botão não pode ficar em branco.');
      return;
    }

    const validation = validateAndNormalizeUrl(url);
    if (!validation.valid) {
      setError(validation.error || 'URL inválida.');
      return;
    }

    onSaveOverride(link.id, {
      label: trimmedLabel,
      url: validation.url,
      domain: validation.domain,
      description: description.trim() || link.description,
      palette,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-edit-link-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-[#0E131F] text-slate-100 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h2 id="modal-edit-link-title" className="text-base font-bold text-white">
              Personalizar Atalho · Coluna {link.column} (Linha {link.row})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ajuste o nome, link de destino ou estilo visual deste botão.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de edição"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Live Button Preview */}
          <div className="rounded-lg border border-slate-800/90 bg-slate-950/60 p-3 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400 whitespace-nowrap">Pré-visualização:</span>
            <div
              className={`h-9 px-4 rounded-[5px] border flex items-center justify-center min-w-[180px] max-w-[260px] ${previewStyle.bgClass} ${previewStyle.borderClass} ${previewStyle.textClass}`}
            >
              <span className="text-xs font-bold tracking-wider truncate">
                {label.trim() || link.label}
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-link-label"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Nome exibido no botão
            </label>
            <input
              id="edit-link-label"
              type="text"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-sky-400"
              placeholder="Ex: WHATSAPP"
            />
          </div>

          <div>
            <label
              htmlFor="edit-link-url"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              URL de destino (Link original ou personalizado)
            </label>
            <input
              id="edit-link-url"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-700 bg-slate-900 text-sky-300 focus:outline-none focus:border-sky-400"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="edit-link-palette"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Cor / Acabamento
              </label>
              <select
                id="edit-link-palette"
                value={palette}
                onChange={(e) => setPalette(e.target.value as PaletteVariant)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-sky-400"
              >
                {PALETTE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-link-desc"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Nota / Descrição rápida
              </label>
              <input
                id="edit-link-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-sky-400"
                placeholder="Breve descrição da ferramenta"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-950/50 px-3 py-2 text-xs text-red-200"
            >
              {error}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {originalDefault && (
                <button
                  type="button"
                  onClick={() => {
                    onResetSingle(link.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrão</span>
                </button>
              )}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-sky-400 hover:text-sky-300"
              >
                <span>Testar Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
