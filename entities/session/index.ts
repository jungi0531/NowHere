export type MeditationSessionStatus = 'idle' | 'pending' | 'ready' | 'failed';

export type MeditationSession = {
  id: string;
  title: string;
  durationMinutes: 3 | 5 | 10;
  audioUrl?: string;
  script?: string;
  status: MeditationSessionStatus;
};
