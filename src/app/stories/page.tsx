'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Media, Stage } from '@/types';
import { WEDDING_CONFIG } from '@/config/wedding';
import StoriesViewer from '@/components/StoriesViewer';

export default function StoriesPage() {
  const router = useRouter();
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<Stage | 'all'>('all');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);

  // Fetch media
  useEffect(() => {
    async function fetchMedia() {
      try {
        const params = new URLSearchParams();
        if (selectedStage !== 'all') {
          params.set('stage', selectedStage);
        }
        const res = await fetch(`/api/media?${params}`);
        const data = await res.json();
        setMediaList(data.media || []);
      } catch (error) {
        console.error('Failed to fetch media:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, [selectedStage]);

  // Derive filtered media from state (no effect needed)
  const filteredMedia = useMemo(() => {
    if (selectedStage === 'all') return mediaList;
    return mediaList.filter((m) => m.stage === selectedStage);
  }, [mediaList, selectedStage]);

  const openViewer = (index: number) => {
    setViewerStartIndex(index);
    setViewerOpen(true);
  };

  if (viewerOpen && filteredMedia.length > 0) {
    return (
      <StoriesViewer
        mediaList={filteredMedia}
        startIndex={viewerStartIndex}
        onClose={() => setViewerOpen(false)}
      />
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-[#faf8f4] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#e0d5c1]/50 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-[#555] hover:text-[#c9a84c] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <h1
            className="text-lg font-light text-[#2a2a2a]"
            style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
          >
            Stories
          </h1>
          <div className="w-16" />
        </div>

        {/* Stage filter */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setSelectedStage('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border
                ${selectedStage === 'all'
                  ? 'bg-[#c9a84c] text-white border-[#c9a84c] shadow-md shadow-[#c9a84c]/25'
                  : 'bg-white text-[#555] border-[#e0d5c1] hover:border-[#c9a84c]'
                }`}
            >
              Todos
            </button>
            {WEDDING_CONFIG.stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border
                  ${selectedStage === stage.id
                    ? 'bg-[#c9a84c] text-white border-[#c9a84c] shadow-md shadow-[#c9a84c]/25'
                    : 'bg-white text-[#555] border-[#e0d5c1] hover:border-[#c9a84c]'
                  }`}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#e0d5c1] border-t-[#c9a84c] animate-spin" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#f0ebe3] flex items-center justify-center">
              <span className="text-3xl">📷</span>
            </div>
            <h2
              className="text-xl font-light text-[#555] mb-2"
              style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
            >
              Nenhuma mídia ainda
            </h2>
            <p className="text-sm text-[#999]">
              As fotos e vídeos aparecerão aqui conforme forem enviados.
            </p>
          </div>
        ) : (
          <>
            {/* Play all button */}
            <button
              onClick={() => openViewer(0)}
              className="w-full mb-6 py-4 px-6 gold-gradient text-white rounded-2xl font-medium
                         shadow-lg shadow-[#c9a84c]/25 hover:shadow-xl
                         active:scale-[0.98] transition-all duration-300
                         flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Ver stories ({filteredMedia.length})
            </button>

            {/* Grid of thumbnails */}
            <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
              {filteredMedia.map((media, index) => (
                <button
                  key={media.id}
                  onClick={() => openViewer(index)}
                  className="aspect-square relative overflow-hidden bg-[#f0ebe3]
                             hover:opacity-80 transition-opacity group"
                >
                  {media.media_type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.file_url || ''}
                      alt=""
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
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                          <svg className="w-4 h-4 text-[#333] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Guest name overlay */}
                  {media.guest_name && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-[10px] truncate block">{media.guest_name}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
