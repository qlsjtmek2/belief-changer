import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Affirmation, PlaybackStatus } from '../types';

interface AffirmationState {
  affirmations: Affirmation[];
  currentIndex: number;
  playbackStatus: PlaybackStatus;

  // Actions
  addAffirmations: (texts: string[]) => Affirmation[];
  deleteAffirmation: (id: string) => void;
  clearAll: () => void;
  reorder: (ids: string[]) => void;

  // Getters
  getCurrent: () => Affirmation | null;

  // Playback controls
  setCurrentIndex: (index: number) => void;
  advanceToNext: () => boolean;
  setPlaybackStatus: (status: PlaybackStatus) => void;
  resetPlayback: () => void;
}

export const useAffirmationStore = create<AffirmationState>()(
  persist(
    (set, get) => ({
      affirmations: [],
      currentIndex: 0,
      playbackStatus: 'idle',

      addAffirmations: (texts: string[]) => {
        const newAffirmations: Affirmation[] = texts.map((text) => ({
          id: crypto.randomUUID(),
          text,
          createdAt: Date.now(),
        }));
        set((state) => ({
          affirmations: [...state.affirmations, ...newAffirmations],
        }));
        return newAffirmations;
      },

      deleteAffirmation: (id: string) => {
        set((state) => {
          const newAffirmations = state.affirmations.filter((a) => a.id !== id);
          const deletedIndex = state.affirmations.findIndex((a) => a.id === id);

          let newIndex = state.currentIndex;
          if (deletedIndex <= state.currentIndex) {
            newIndex = Math.max(0, state.currentIndex - 1);
          }
          if (newAffirmations.length === 0) {
            newIndex = 0;
          }

          return {
            affirmations: newAffirmations,
            currentIndex: newIndex,
            playbackStatus:
              deletedIndex === state.currentIndex ? 'idle' : state.playbackStatus,
          };
        });
      },

      clearAll: () => {
        set({
          affirmations: [],
          currentIndex: 0,
          playbackStatus: 'idle',
        });
      },

      reorder: (ids: string[]) => {
        set((state) => {
          const affirmationMap = new Map(state.affirmations.map((a) => [a.id, a]));
          const reordered = ids
            .map((id) => affirmationMap.get(id))
            .filter((a): a is Affirmation => a !== undefined);

          const currentAffirmation = state.affirmations[state.currentIndex];
          const newIndex = currentAffirmation
            ? reordered.findIndex((a) => a.id === currentAffirmation.id)
            : 0;

          return {
            affirmations: reordered,
            currentIndex: newIndex >= 0 ? newIndex : 0,
          };
        });
      },

      getCurrent: () => {
        const { affirmations, currentIndex } = get();
        return affirmations[currentIndex] ?? null;
      },

      setCurrentIndex: (index: number) => {
        const { affirmations } = get();
        if (index >= 0 && index < affirmations.length) {
          set({
            currentIndex: index,
            playbackStatus: 'idle',
          });
        }
      },

      advanceToNext: () => {
        const { affirmations, currentIndex } = get();
        const nextIndex = currentIndex + 1;

        if (nextIndex >= affirmations.length) {
          set({ currentIndex: 0 });
          return false;
        }

        set({ currentIndex: nextIndex });
        return true;
      },

      setPlaybackStatus: (status: PlaybackStatus) => {
        set({ playbackStatus: status });
      },

      resetPlayback: () => {
        set({ playbackStatus: 'idle' });
      },
    }),
    {
      name: 'belief-changer-affirmations',
      partialize: (state) => ({
        affirmations: state.affirmations,
      }),
    }
  )
);
