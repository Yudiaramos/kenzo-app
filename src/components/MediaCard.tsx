'use client';

import { Media } from '@/types';
import { getStageLabel, formatFileSize } from '@/config/wedding';

interface MediaCardProps {
  media: Media;
  onApprove: (id: string) => void;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (media: Media) => void;
}

export default function MediaCard({ media, onApprove, onHide, onDelete, onDownload }: MediaCardProps) {
  const isImage = media.media_type === 'image';
  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aprovado' },
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendente' },
    hidden: { bg: 'bg-red-100', text: 'text-red-700', label: 'Oculto' },
  };

  const statusInfo = statusColors[media.status] || statusColors.pending;

  return (
    <div className="bg-white rounded-xl border border-[#e8e0d4] shadow-sm overflow-hidden
                    hover:shadow-md transition-shadow duration-300 group">
      {/* Preview */}
      <div className="aspect-square relative bg-[#f8f5f0]">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.file_url || ''}
            alt={media.original_filename || 'Mídia'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="relative w-full h-full">
            <video
              src={media.file_url || ''}
              className="w-full h-full object-cover"
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#333] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
            {isImage ? '📷 Foto' : '🎥 Vídeo'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#c9a84c] uppercase tracking-wide">
            {getStageLabel(media.stage)}
          </span>
          <span className="text-xs text-[#999]">
            {media.size_bytes ? formatFileSize(media.size_bytes) : ''}
          </span>
        </div>

        {media.guest_name && (
          <p className="text-sm text-[#555] truncate">
            👤 {media.guest_name}
          </p>
        )}

        <p className="text-xs text-[#aaa]">
          {new Date(media.created_at).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {media.status !== 'approved' && (
            <button
              onClick={() => onApprove(media.id)}
              className="py-2 px-2 text-xs font-medium rounded-lg
                         bg-emerald-50 text-emerald-600 hover:bg-emerald-100
                         transition-colors"
              title="Aprovar"
            >
              ✅ Aprovar
            </button>
          )}
          {media.status !== 'hidden' && (
            <button
              onClick={() => onHide(media.id)}
              className="py-2 px-2 text-xs font-medium rounded-lg
                         bg-amber-50 text-amber-600 hover:bg-amber-100
                         transition-colors"
              title="Ocultar"
            >
              👁️ Ocultar
            </button>
          )}
          <button
            onClick={() => onDownload(media)}
            className="py-2 px-2 text-xs font-medium rounded-lg
                       bg-blue-50 text-blue-600 hover:bg-blue-100
                       transition-colors"
            title="Baixar"
          >
            ⬇️ Baixar
          </button>
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja excluir esta mídia?')) {
                onDelete(media.id);
              }
            }}
            className="py-2 px-2 text-xs font-medium rounded-lg
                       bg-red-50 text-red-600 hover:bg-red-100
                       transition-colors"
            title="Excluir"
          >
            🗑️ Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
