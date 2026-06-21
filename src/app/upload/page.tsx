'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';
import { Stage } from '@/types';
import { getCurrentStage } from '@/config/wedding';
import StageSelector from '@/components/StageSelector';
import FilePreview from '@/components/FilePreview';
import UploadProgress from '@/components/UploadProgress';
import SuccessAnimation from '@/components/SuccessAnimation';

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

type UploadStatus = 'idle' | 'compressing' | 'uploading' | 'success' | 'error';

function getFileValidationError(file: File): string | null {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    return 'Tipo de arquivo não suportado. Envie uma foto ou vídeo.';
  }

  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    return `Arquivo muito grande. Máximo: ${maxMB} MB.`;
  }

  return null;
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [guestName, setGuestName] = useState('');
  const [selectedStage, setSelectedStage] = useState<Stage | null>(getCurrentStage());
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [successfulUploads, setSuccessfulUploads] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const isBusy = uploadStatus === 'uploading' || uploadStatus === 'compressing';

  const clearInputValues = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const resetUploadState = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setCurrentFileIndex(0);
    setSuccessfulUploads(0);
    setErrorMessage('');
    setShowSuccess(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';

    if (files.length === 0) return;

    const validFiles: File[] = [];
    const invalidMessages: string[] = [];

    for (const file of files) {
      const validationError = getFileValidationError(file);
      if (validationError) {
        invalidMessages.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage(invalidMessages[0] || 'Nenhum arquivo válido selecionado.');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setShowSuccess(false);
    setUploadStatus('idle');
    setUploadProgress(0);
    setCurrentFileIndex(0);
    setSuccessfulUploads(0);
    setErrorMessage(
      invalidMessages.length > 0
        ? `${invalidMessages.length} arquivo(s) ignorado(s). ${invalidMessages[0]}`
        : ''
    );
  };

  const handleRemoveFile = (index: number) => {
    const nextFiles = selectedFiles.filter((_, fileIndex) => fileIndex !== index);
    setSelectedFiles(nextFiles);
    resetUploadState();
  };

  const uploadSingleFile = async (file: File, index: number, totalFiles: number) => {
    let fileToUpload = file;
    setCurrentFileIndex(index + 1);

    if (file.type.startsWith('image/') && !file.type.includes('gif')) {
      try {
        setUploadStatus('compressing');
        setUploadProgress(0);

        const compressedFile = await imageCompression(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 2048,
          useWebWorker: true,
          fileType: 'image/jpeg',
          onProgress: (progress) => {
            setCurrentFileIndex(index + 1);
            setUploadProgress(progress);
          },
        });

        fileToUpload = new File([compressedFile], file.name, {
          type: compressedFile.type,
          lastModified: file.lastModified,
        });
      } catch (err) {
        console.warn('Compression failed, uploading original:', err);
        fileToUpload = file;
      }
    }

    setUploadStatus('uploading');
    setUploadProgress(0);
    setCurrentFileIndex(index + 1);

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('stage', selectedStage!);
    if (guestName.trim()) {
      formData.append('guest_name', guestName.trim());
    }

    const xhr = new XMLHttpRequest();

    await new Promise<void>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setCurrentFileIndex(index + 1);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            reject(new Error(response.error || 'Erro ao enviar.'));
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

    setUploadProgress(100);
    setCurrentFileIndex(Math.min(index + 1, totalFiles));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !selectedStage) return;

    resetUploadState();

    let uploadedCount = 0;

    try {
      for (let index = 0; index < selectedFiles.length; index += 1) {
        await uploadSingleFile(selectedFiles[index], index, selectedFiles.length);
        uploadedCount += 1;
        setSuccessfulUploads(uploadedCount);
      }

      setUploadStatus('success');
      setUploadProgress(100);
      setCurrentFileIndex(selectedFiles.length);

      setTimeout(() => setShowSuccess(true), 500);
    } catch (err) {
      const baseMessage = err instanceof Error ? err.message : 'Erro ao enviar.';
      setUploadStatus('error');
      setCurrentFileIndex(Math.min(uploadedCount + 1, selectedFiles.length));
      setSuccessfulUploads(uploadedCount);
      if (uploadedCount > 0) {
        setSelectedFiles((prev) => prev.slice(uploadedCount));
      }
      setErrorMessage(
        uploadedCount > 0
          ? `${uploadedCount} arquivo(s) enviados. Os demais continuam selecionados. ${baseMessage}`
          : baseMessage
      );
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    clearInputValues();
    resetUploadState();
  };

  return (
    <main className="flex-1 flex flex-col bg-[#faf8f4] min-h-screen">
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

        <div className="animate-fade-in-up delay-100">
          <label className="block text-sm font-medium text-[#555] mb-2">
            Etapa do casamento
          </label>
          <StageSelector selected={selectedStage} onSelect={setSelectedStage} />
          {!selectedStage && (
            <p className="text-xs text-amber-600 mt-1.5">
              Selecione uma etapa para continuar.
            </p>
          )}
        </div>

        <div className="animate-fade-in-up delay-200 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-[#555]">
              Selecione uma ou mais fotos e vídeos
            </label>
            {selectedFiles.length > 0 && (
              <span className="text-xs font-medium text-[#c9a84c]">
                {selectedFiles.length} arquivo(s)
              </span>
            )}
          </div>

          {selectedFiles.length === 0 ? (
            <div className="space-y-3">
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
                    <p className="text-xs text-[#aaa] mt-1">Selecione várias fotos ou vídeos</p>
                  </div>
                </div>
              </button>

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
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e0d5c1] bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[#555]">
                    {selectedFiles.length} arquivo(s) prontos para envio
                  </p>
                  <p className="text-xs text-[#999]">
                    Você pode adicionar mais arquivos antes de enviar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isBusy}
                  className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  Limpar
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {selectedFiles.map((file, index) => (
                  <FilePreview
                    key={`${file.name}-${file.size}-${index}`}
                    file={file}
                    onRemove={() => handleRemoveFile(index)}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBusy}
                  className="py-3 px-4 rounded-xl border border-[#e0d5c1] bg-white text-sm font-medium text-[#555]
                             hover:bg-[#f8f5f0] hover:border-[#c9a84c]/40 transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Galeria
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isBusy}
                  className="py-3 px-4 rounded-xl border border-[#e0d5c1] bg-white text-sm font-medium text-[#555]
                             hover:bg-[#f8f5f0] hover:border-[#c9a84c]/40 transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Foto
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isBusy}
                  className="py-3 px-4 rounded-xl border border-[#e0d5c1] bg-white text-sm font-medium text-[#555]
                             hover:bg-[#f8f5f0] hover:border-[#c9a84c]/40 transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Vídeo
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
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

          <p className="text-xs text-[#bbb] text-center">
            Foto até 15 MB • Vídeo até 200 MB
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in">
            {errorMessage}
          </div>
        )}

        <UploadProgress
          progress={uploadProgress}
          status={uploadStatus}
          currentFileIndex={currentFileIndex}
          totalFiles={selectedFiles.length}
          errorMessage={errorMessage}
        />

        {selectedFiles.length > 0 && uploadStatus !== 'success' && (
          <button
            onClick={handleUpload}
            disabled={!selectedStage || isBusy}
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
                : selectedFiles.length > 1
                  ? `Enviar ${selectedFiles.length} arquivos`
                  : 'Enviar'}
          </button>
        )}
      </div>

      {showSuccess && (
        <SuccessAnimation
          uploadedCount={successfulUploads}
          onSendMore={resetForm}
          onGoHome={() => router.push('/')}
        />
      )}
    </main>
  );
}
