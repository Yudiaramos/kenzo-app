'use client';

interface UploadProgressProps {
  progress: number; // 0 to 100
  status: 'idle' | 'compressing' | 'uploading' | 'success' | 'error';
  currentFileIndex?: number;
  totalFiles?: number;
  errorMessage?: string;
}

export default function UploadProgress({
  progress,
  status,
  currentFileIndex = 0,
  totalFiles = 0,
  errorMessage,
}: UploadProgressProps) {
  if (status === 'idle') return null;

  const fileLabel = totalFiles > 1 && currentFileIndex > 0
    ? ` ${currentFileIndex} de ${totalFiles}`
    : '';

  const statusLabels: Record<string, string> = {
    compressing: `Comprimindo${fileLabel}...`,
    uploading: `Enviando${fileLabel}...`,
    success: totalFiles > 1
      ? `${totalFiles} arquivos enviados com sucesso!`
      : 'Enviado com sucesso!',
    error: errorMessage || 'Erro ao enviar.',
  };

  const statusColors: Record<string, string> = {
    compressing: 'bg-amber-400',
    uploading: 'bg-[#c9a84c]',
    success: 'bg-emerald-500',
    error: 'bg-red-500',
  };

  return (
    <div className="w-full space-y-2 animate-fade-in">
      {/* Progress bar */}
      <div className="w-full h-2 bg-[#f0ebe3] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${statusColors[status]}`}
          style={{ width: `${status === 'success' ? 100 : progress}%` }}
        />
      </div>

      {/* Status text */}
      <div className="flex items-center justify-between">
        <p className={`text-sm font-medium ${
          status === 'error' ? 'text-red-600' :
          status === 'success' ? 'text-emerald-600' :
          'text-[#777]'
        }`}>
          {statusLabels[status]}
        </p>
        {(status === 'uploading' || status === 'compressing') && (
          <span className="text-sm text-[#999]">{Math.round(progress)}%</span>
        )}
      </div>
    </div>
  );
}
