'use client';

import { useEffect, useMemo } from 'react';
import { formatFileSize } from '@/config/wedding';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export default function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const url = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [url]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#f8f5f0] border border-[#e0d5c1] shadow-sm">
      <div className="aspect-[4/3] relative">
        {isImage && url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        )}
        {isVideo && url && (
          <video
            src={url}
            className="w-full h-full object-cover"
            controls
            playsInline
          />
        )}

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`
            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
            backdrop-blur-md
            ${isImage
              ? 'bg-emerald-500/80 text-white'
              : 'bg-purple-500/80 text-white'
            }
          `}>
            {isImage ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Foto
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Vídeo
              </>
            )}
          </span>
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md
                     text-white flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* File info */}
      <div className="px-4 py-3 flex items-center justify-between text-sm">
        <span className="text-[#777] truncate max-w-[200px]">{file.name}</span>
        <span className="text-[#999] font-medium flex-shrink-0 ml-2">{formatFileSize(file.size)}</span>
      </div>
    </div>
  );
}
