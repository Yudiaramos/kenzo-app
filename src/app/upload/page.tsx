'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stage } from '@/types';
import { getCurrentStage } from '@/config/wedding';
import StageSelector from '@/components/StageSelector';
import FilePreview from '@/components/FilePreview';
import UploadProgress from '@/components/UploadProgress';
import SuccessAnimation from '@/components/SuccessAnimation';
import imageCompression from 'browser-image-compression';

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

type UploadStatus = 'idle' | 'compressing' | 'uploading' | 'success' | 'error';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [guestName, setGuestName] = useState('');
  const [selectedStage, setSelectedStage] = useState<Stage | null>(getCurrentStage());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setErrorMessage('Tipo de arquivo não suportado. Envie uma foto ou vídeo.');
      return;
    }

    // Validate size
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      setErrorMessage(`Arquivo muito grande. Máximo: ${maxMB} MB.`);
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedStage) return;

    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');

    let fileToUpload = selectedFile;

    // Compress images
    if (selectedFile.type.startsWith('image/') && !selectedFile.type.includes('gif')) {
      try {
        setUploadStatus('compressing');
        setUploadProgress(30);

        const compressedFile = await imageCompression(selectedFile, {
          maxSizeMB: 2,
          maxWidthOrHeight: 2048,
          useWebWorker: true,
          fileType: 'image/jpeg',
        });

        fileToUpload = new File([compressedFile], selectedFile.name, {
          type: compressedFile.type,
        });

        setUploadProgress(100);
      } catch (err) {
        console.warn('Compression failed, uploading original:', err);
        fileToUpload = selectedFile;
      }
    }

    // Upload
    try {
      setUploadStatus('uploading');
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('stage', selectedStage);
      if (guestName.trim()) {
        formData.append('guest_name', guestName.trim());
      }

      const xhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = (e.loaded / e.total) * 100;
            setUploadProgress(pct);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            try {
              const resp = JSON.parse(xhr.responseText);
              reject(new Error(resp.error || 'Erro ao enviar.'));
            } catch {
              reject(new Error('Erro ao enviar.'));
            }
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Erro de conexão.')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelado.')));

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      setUploadStatus('success');
      setUploadProgress(100);

      // Show success animation
      setTimeout(() => setShowSuccess(true), 500);
    } catch (err) {
      setUploadStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao enviar.');
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
    setShowSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return (
    <main className="flex-1 flex flex-col bg-[#faf8f4] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#e0d5c1]/50 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#555] hover:text-[#c9a84c] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Voltar</span>
          </Link>
          <h1
            className="text-lg font-light text-[#2a2a2a]"
            style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
          >
            Enviar mídia
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-6">
        {/* Guest name */}
        <div className="animate-fade-in-up">
          <label className="block text-sm font-medium text-[#555] mb-2">
            Seu nome ou apelido <span className="text-[#ccc]">(opcional)</span>
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Ex: Maria, Tio João..."
            className="w-full px-4 py-3 rounded-xl border border-[#e0d5c1] bg-white
                       text-[#2a2a2a] placeholder-[#ccc]
                       focus:outline-none focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/20
                       transition-all"
          />
        </div>

        {/* Stage selector */}
        <div className="animate-fade-in-up delay-100">
          <label className="block text-sm font-medium text-[#555] mb-2">
            Etapa do casamento
          </label>
          <StageSelector
            selected={selectedStage}
            onSelect={setSelectedStage}
          />
          {!selectedStage && (
            <p className="text-xs text-amber-600 mt-1.5">
              Selecione uma etapa para continuar.
            </p>
          )}
        </div>

        {/* File input */}
        <div className="animate-fade-in-up delay-200">
          <label className="block text-sm font-medium text-[#555] mb-2">
            Selecione uma foto ou vídeo
          </label>

          {!selectedFile ? (
            <div className="space-y-3">
              {/* Gallery picker */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 px-4 rounded-2xl border-2 border-dashed border-[#e0d5c1]
                           bg-white hover:bg-[#f8f5f0] hover:border-[#c9a84c]/40
                           transition-all duration-300 group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-[#f8f5f0] group-hover:bg-[#c9a84c]/10
                                  flex items-center justify-center transition-colors">
                    <svg className="w-7 h-7 text-[#c9a84c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-[#555]">Escolher da galeria</p>
                    <p className="text-xs text-[#aaa] mt-1">Foto ou vídeo</p>
                  </div>
                </div>
              </button>

              {/* Camera buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-4 px-3 rounded-xl border border-[#e0d5c1] bg-white
                             hover:bg-[#f8f5f0] hover:border-[#c9a84c]/40
                             transition-all duration-300 flex flex-col items-center gap-2"
                >
                  <svg className="w-6 h-6 text-[#c9a84c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs font-medium text-[#555]">Tirar foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="py-4 px-3 rounded-xl border border-[#e0d5c1] bg-white
                             hover:bg-[#f8f5f0] hover:border-[#c9a84c]/40
                             transition-all duration-300 flex flex-col items-center gap-2"
                >
                  <svg className="w-6 h-6 text-[#c9a84c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium text-[#555]">Gravar vídeo</span>
                </button>
              </div>

              {/* Hidden inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Size limits */}
              <p className="text-xs text-[#bbb] text-center">
                Foto até 15 MB • Vídeo até 200 MB
              </p>
            </div>
          ) : (
            <FilePreview file={selectedFile} onRemove={resetForm} />
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in">
            {errorMessage}
          </div>
        )}

        {/* Upload progress */}
        <UploadProgress
          progress={uploadProgress}
          status={uploadStatus}
          errorMessage={errorMessage}
        />

        {/* Submit button */}
        {selectedFile && uploadStatus !== 'success' && (
          <button
            onClick={handleUpload}
            disabled={!selectedStage || uploadStatus === 'uploading' || uploadStatus === 'compressing'}
            className="w-full py-4 px-6 gold-gradient text-white rounded-2xl font-medium text-lg
                       shadow-lg shadow-[#c9a84c]/25
                       hover:shadow-xl hover:shadow-[#c9a84c]/30
                       active:scale-[0.98] transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                       animate-fade-in-up"
          >
            {uploadStatus === 'compressing'
              ? 'Comprimindo...'
              : uploadStatus === 'uploading'
                ? 'Enviando...'
                : 'Enviar'}
          </button>
        )}
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <SuccessAnimation
          onSendMore={resetForm}
          onGoHome={() => router.push('/')}
        />
      )}
    </main>
  );
}
