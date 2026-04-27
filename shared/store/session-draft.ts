import { create } from 'zustand';

export type SessionMood = '맑음' | '흐림' | '안개' | '비' | '폭풍' | '눈';
export type SessionDuration = 3 | 5 | 10;

type SessionDraftState = {
  mood: SessionMood;
  energy: number;
  note: string;
  duration: SessionDuration;
  audioUri: string | null;
  sessionId: string | null;
  setMood: (mood: SessionMood) => void;
  setEnergy: (energy: number) => void;
  setNote: (note: string) => void;
  setDuration: (duration: SessionDuration) => void;
  setAudioUri: (uri: string | null) => void;
  setSessionId: (id: string | null) => void;
  reset: () => void;
};

const DEFAULT_STATE = {
  mood: '맑음' as SessionMood,
  energy: 40,
  note: '',
  duration: 5 as SessionDuration,
  audioUri: null,
  sessionId: null,
};

function clampEnergy(energy: number) {
  return Math.max(0, Math.min(100, Math.round(energy)));
}

export const useSessionDraftStore = create<SessionDraftState>((set) => ({
  ...DEFAULT_STATE,
  setMood: (mood) => set({ mood }),
  setEnergy: (energy) => set({ energy: clampEnergy(energy) }),
  setNote: (note) => set({ note }),
  setDuration: (duration) => set({ duration }),
  setAudioUri: (uri) => set({ audioUri: uri }),
  setSessionId: (id) => set({ sessionId: id }),
  reset: () => set(DEFAULT_STATE),
}));
