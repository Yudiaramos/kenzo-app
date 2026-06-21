export type Stage = 'reception' | 'ceremony' | 'party' | 'after_wedding';
export type MediaType = 'image' | 'video';
export type MediaStatus = 'pending' | 'approved' | 'hidden';

export interface Media {
  id: string;
  stage: Stage;
  guest_name: string | null;
  media_type: MediaType;
  file_path: string;
  file_url: string | null;
  status: MediaStatus;
  size_bytes: number | null;
  original_filename: string | null;
  created_at: string;
}

export interface StageConfig {
  id: Stage;
  label: string;
  startTime: string;
  endTime: string;
}

export interface WeddingConfig {
  coupleName: string;
  weddingDate: string;
  welcomeText: string;
  stages: StageConfig[];
}
