import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dialogue, PlaybackStatus } from '../types';

interface DialogueState {
  dialogues: Dialogue[];
  currentDialogueId: string | null;
  playbackStatus: PlaybackStatus;
  currentLineIndex: number;

  // Actions
  addDialogue: (affirmationId: string, lines: Dialogue['lines']) => Dialogue;
  deleteDialogue: (id: string) => void;
  getDialoguesByAffirmation: (affirmationId: string) => Dialogue[];
  setCurrentDialogue: (id: string | null) => void;
  getCurrentDialogue: () => Dialogue | null;

  // Playback controls
  setPlaybackStatus: (status: PlaybackStatus) => void;
  setCurrentLineIndex: (index: number) => void;
  resetPlayback: () => void;
}

export const useDialogueStore = create<DialogueState>()(
  persist(
    (set, get) => ({
      dialogues: [],
      currentDialogueId: null,
      playbackStatus: 'idle',
      currentLineIndex: 0,

      addDialogue: (affirmationId: string, lines: Dialogue['lines']) => {
        const newDialogue: Dialogue = {
          id: crypto.randomUUID(),
          affirmationId,
          lines,
          createdAt: Date.now(),
        };
        set((state) => ({
          dialogues: [newDialogue, ...state.dialogues],
          currentDialogueId: newDialogue.id,
        }));
        return newDialogue;
      },

      deleteDialogue: (id: string) => {
        set((state) => ({
          dialogues: state.dialogues.filter((d) => d.id !== id),
          currentDialogueId:
            state.currentDialogueId === id ? null : state.currentDialogueId,
        }));
      },

      getDialoguesByAffirmation: (affirmationId: string) => {
        return get().dialogues.filter((d) => d.affirmationId === affirmationId);
      },

      setCurrentDialogue: (id: string | null) => {
        set({
          currentDialogueId: id,
          playbackStatus: 'idle',
          currentLineIndex: 0,
        });
      },

      getCurrentDialogue: () => {
        const { dialogues, currentDialogueId } = get();
        return dialogues.find((d) => d.id === currentDialogueId) ?? null;
      },

      setPlaybackStatus: (status: PlaybackStatus) => {
        set({ playbackStatus: status });
      },

      setCurrentLineIndex: (index: number) => {
        set({ currentLineIndex: index });
      },

      resetPlayback: () => {
        set({
          playbackStatus: 'idle',
          currentLineIndex: 0,
        });
      },
    }),
    {
      name: 'belief-changer-dialogues',
      partialize: (state) => ({
        dialogues: state.dialogues,
      }),
    }
  )
);
