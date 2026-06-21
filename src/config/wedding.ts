import { WeddingConfig, Stage } from '@/types';

export const WEDDING_CONFIG: WeddingConfig = {
  coupleName: "Giullie & Kenzo",
  weddingDate: "2026-06-21",
  welcomeText: "Compartilhe aqui suas fotos e vídeos desse dia especial.",
  stages: [
    {
      id: "reception",
      label: "Recepção",
      startTime: "",
      endTime: "",
    },
    {
      id: "ceremony",
      label: "Cerimônia",
      startTime: "",
      endTime: "",
    },
    {
      id: "party",
      label: "Festa",
      startTime: "",
      endTime: "",
    },
    {
      id: "after_wedding",
      label: "Pós-casamento",
      startTime: "",
      endTime: "",
    },
  ],
};

/**
 * Returns the current wedding stage based on the configured start/end times.
 * If no times are configured, returns null (user picks manually).
 */
export function getCurrentStage(): Stage | null {
  const now = new Date();

  for (const stage of WEDDING_CONFIG.stages) {
    if (!stage.startTime || !stage.endTime) continue;

    const start = new Date(`${WEDDING_CONFIG.weddingDate}T${stage.startTime}`);
    const end = new Date(`${WEDDING_CONFIG.weddingDate}T${stage.endTime}`);

    if (now >= start && now <= end) {
      return stage.id;
    }
  }

  return null;
}

/**
 * Returns the label for a given stage ID.
 */
export function getStageLabel(stageId: Stage): string {
  const stage = WEDDING_CONFIG.stages.find((s) => s.id === stageId);
  return stage?.label ?? stageId;
}

/**
 * Format file size in human-readable format.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
