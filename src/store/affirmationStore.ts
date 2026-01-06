import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Affirmation } from '../types';
import { useDialogueStore } from './dialogueStore';

interface AffirmationState {
  affirmations: Affirmation[];
  selectedId: string | null;

  // Actions
  addAffirmation: (text: string) => Affirmation;
  updateAffirmation: (id: string, text: string) => void;
  deleteAffirmation: (id: string) => void;
  selectAffirmation: (id: string | null) => void;
  getSelectedAffirmation: () => Affirmation | null;
}

export const useAffirmationStore = create<AffirmationState>()(
  persist(
    (set, get) => ({
      affirmations: [],
      selectedId: null,

      addAffirmation: (text: string) => {
        const newAffirmation: Affirmation = {
          id: crypto.randomUUID(),
          text,
          createdAt: Date.now(),
        };
        set((state) => ({
          affirmations: [newAffirmation, ...state.affirmations],
          selectedId: newAffirmation.id,
        }));
        return newAffirmation;
      },

      updateAffirmation: (id: string, text: string) => {
        set((state) => ({
          affirmations: state.affirmations.map((a) =>
            a.id === id ? { ...a, text } : a
          ),
        }));
      },

      deleteAffirmation: (id: string) => {
        // 관련 대화 먼저 삭제
        useDialogueStore.getState().deleteDialoguesByAffirmation(id);

        // 확언 삭제
        set((state) => ({
          affirmations: state.affirmations.filter((a) => a.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        }));
      },

      selectAffirmation: (id: string | null) => {
        set({ selectedId: id });
      },

      getSelectedAffirmation: () => {
        const { affirmations, selectedId } = get();
        return affirmations.find((a) => a.id === selectedId) ?? null;
      },
    }),
    {
      name: 'belief-changer-affirmations',
    }
  )
);
