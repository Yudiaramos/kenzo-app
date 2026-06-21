'use client';

import { useState, useEffect, useCallback } from 'react';
import { Media, Stage, MediaStatus } from '@/types';
import { WEDDING_CONFIG } from '@/config/wedding';
import MediaCard from '@/components/MediaCard';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [filterStage, setFilterStage] = useState<Stage | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<MediaStatus | 'all'>('all');

  // Check if already authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth', { cache: 'no-store' });
        if (res.ok) {
          setIsAuthenticated(true);
        }
      } catch {
        // Not authenticated
      } finally {
        setAuthChecked(true);
      }
    }
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    setActionError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setPassword('');
        setIsAuthenticated(true);
      } else {
        const data = await res.json();
        setLoginError(data.error || 'Senha incorreta.');
      }
    } catch {
      setLoginError('Erro de conexão.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleUnauthorized = useCallback((message = 'Sua sessão expirou. Faça login novamente.') => {
    setIsAuthenticated(false);
    setMediaList([]);
    setActionError('');
    setLoginError(message);
  }, []);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setActionError('');
    try {
      const params = new URLSearchParams();
      if (filterStage !== 'all') params.set('stage', filterStage);
      if (filterStatus !== 'all') params.set('status', filterStatus);

      const res = await fetch(`/api/media?${params}`);
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Erro ao carregar mídias.');
        return;
      }

      setMediaList(data.media || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
      setActionError('Não foi possível carregar as mídias.');
    } finally {
      setLoading(false);
    }
  }, [filterStage, filterStatus, handleUnauthorized]);

  useEffect(() => {
    if (isAuthenticated) {
      const timeoutId = window.setTimeout(() => {
        void fetchMedia();
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [isAuthenticated, filterStage, filterStatus, fetchMedia]);

  const handleUpdateStatus = async (id: string, status: MediaStatus) => {
    setActionError('');
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (res.ok) {
        setMediaList((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m))
        );
      } else {
        const data = await res.json();
        setActionError(data.error || 'Não foi possível atualizar a mídia.');
      }
    } catch (error) {
      console.error('Update failed:', error);
      setActionError('Erro de conexão ao atualizar a mídia.');
    }
  };

  const handleDelete = async (id: string) => {
    setActionError('');
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => m.id !== id));
      } else {
        const data = await res.json();
        setActionError(data.error || 'Não foi possível excluir a mídia.');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setActionError('Erro de conexão ao excluir a mídia.');
    }
  };

  const handleDownload = async (media: Media) => {
    try {
      const response = await fetch(media.file_url || '');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = media.original_filename || `media.${media.media_type === 'image' ? 'jpg' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
      });
    } finally {
      setIsAuthenticated(false);
      setMediaList([]);
      setActionError('');
      setPassword('');
      setLoginError('');
    }
  };

  if (!authChecked) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[#faf8f4] min-h-screen px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#e0d5c1] border-t-[#c9a84c] animate-spin" />
          <p className="text-sm text-[#999]">Verificando acesso admin...</p>
        </div>
      </main>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[#faf8f4] min-h-screen px-4">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white border-2 border-[#e0d5c1]
                            flex items-center justify-center shadow-lg shadow-[#c9a84c]/10">
              <span className="text-2xl">🔐</span>
            </div>
            <h1
              className="text-2xl font-light text-[#2a2a2a] mb-1"
              style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
            >
              Área Admin
            </h1>
            <p className="text-sm text-[#999]">
              Digite a senha para acessar.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full px-4 py-3.5 rounded-xl border border-[#e0d5c1] bg-white
                         text-[#2a2a2a] placeholder-[#ccc] text-center text-lg
                         focus:outline-none focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/20
                         transition-all"
              autoFocus
            />

            {loginError && (
              <p className="text-sm text-red-500 text-center animate-fade-in">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={!password || loginLoading}
              className="w-full py-3.5 px-6 gold-gradient text-white rounded-xl font-medium
                         shadow-lg shadow-[#c9a84c]/25
                         hover:shadow-xl active:scale-[0.98] transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Admin dashboard
  const counts = {
    total: mediaList.length,
    approved: mediaList.filter((m) => m.status === 'approved').length,
    pending: mediaList.filter((m) => m.status === 'pending').length,
    hidden: mediaList.filter((m) => m.status === 'hidden').length,
  };

  return (
    <main className="flex-1 flex flex-col bg-[#faf8f4] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#e0d5c1]/50 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <h1
            className="text-lg font-light text-[#2a2a2a]"
            style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
          >
            Admin
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchMedia}
              className="text-sm text-[#c9a84c] hover:text-[#b8963e] font-medium transition-colors"
            >
              Atualizar
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-[#999] hover:text-[#555] font-medium transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 pb-3 grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: counts.total, color: 'text-[#555]' },
            { label: 'Aprovadas', value: counts.approved, color: 'text-emerald-600' },
            { label: 'Pendentes', value: counts.pending, color: 'text-amber-600' },
            { label: 'Ocultas', value: counts.hidden, color: 'text-red-600' },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-2 bg-white rounded-lg border border-[#e8e0d4]">
              <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-[#999] uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 space-y-2">
          {/* Stage filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterStage('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex-shrink-0
                ${filterStage === 'all'
                  ? 'bg-[#c9a84c] text-white border-[#c9a84c]'
                  : 'bg-white text-[#555] border-[#e0d5c1]'
                }`}
            >
              Todas etapas
            </button>
            {WEDDING_CONFIG.stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setFilterStage(stage.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex-shrink-0
                  ${filterStage === stage.id
                    ? 'bg-[#c9a84c] text-white border-[#c9a84c]'
                    : 'bg-white text-[#555] border-[#e0d5c1]'
                  }`}
              >
                {stage.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-2">
            {[
              { value: 'all' as const, label: 'Todos status' },
              { value: 'approved' as const, label: '✅ Aprovadas' },
              { value: 'pending' as const, label: '⏳ Pendentes' },
              { value: 'hidden' as const, label: '👁️ Ocultas' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex-shrink-0
                  ${filterStatus === opt.value
                    ? 'bg-[#2a2a2a] text-white border-[#2a2a2a]'
                    : 'bg-white text-[#555] border-[#e0d5c1]'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Media grid */}
      <div className="flex-1 px-4 py-4">
        {actionError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#e0d5c1] border-t-[#c9a84c] animate-spin" />
          </div>
        ) : mediaList.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0ebe3] flex items-center justify-center">
              <span className="text-2xl">📭</span>
            </div>
            <p className="text-[#999]">Nenhuma mídia encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mediaList.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                onApprove={(id) => handleUpdateStatus(id, 'approved')}
                onHide={(id) => handleUpdateStatus(id, 'hidden')}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
