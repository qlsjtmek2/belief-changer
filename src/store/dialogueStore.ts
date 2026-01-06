import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Dialogue,
  DialogueLine,
  PlaybackStatus,
  PlaylistMode,
  RawDialogueLine,
} from '../types';

interface DialogueState {
  dialogues: Dialogue[];
  currentDialogueId: string | null;
  playbackStatus: PlaybackStatus;
  currentLineIndex: number;

  // Playlist state
  playlistMode: PlaylistMode;
  currentPlaylistIndex: number;

  // Actions
  addDialogue: (affirmationId: string, lines: RawDialogueLine[]) => Dialogue;
  deleteDialogue: (id: string) => void;
  getDialoguesByAffirmation: (affirmationId: string) => Dialogue[];
  setCurrentDialogue: (id: string | null) => void;
  getCurrentDialogue: () => Dialogue | null;

  // Line editing actions
  deleteLine: (dialogueId: string, lineId: string) => void;
  reorderLines: (dialogueId: string, lineIds: string[]) => void;

  // Playlist actions
  setPlaylistMode: (mode: PlaylistMode) => void;
  buildPlaylist: () => void;
  advancePlaylist: () => boolean;
  resetPlaylist: () => void;
  getPlaylistDialogues: () => Dialogue[];

  // Playback controls
  setPlaybackStatus: (status: PlaybackStatus) => void;
  setCurrentLineIndex: (index: number) => void;
  resetPlayback: () => void;
}

// 라인에 id 추가하는 헬퍼 함수
const addIdsToLines = (lines: RawDialogueLine[]): DialogueLine[] => {
  return lines.map((line) => ({
    ...line,
    id: crypto.randomUUID(),
  }));
};

// 기존 라인에 id가 없으면 추가하는 마이그레이션 함수
const migrateDialogues = (dialogues: Dialogue[]): Dialogue[] => {
  return dialogues.map((dialogue) => ({
    ...dialogue,
    lines: dialogue.lines.map((line) => ({
      ...line,
      id: line.id || crypto.randomUUID(),
    })),
  }));
};

export const useDialogueStore = create<DialogueState>()(
  persist(
    (set, get) => ({
      dialogues: [],
      currentDialogueId: null,
      playbackStatus: 'idle',
      currentLineIndex: 0,
      playlistMode: 'single',
      currentPlaylistIndex: 0,

      addDialogue: (affirmationId: string, lines: RawDialogueLine[]) => {
        const linesWithId = addIdsToLines(lines);
        const newDialogue: Dialogue = {
          id: crypto.randomUUID(),
          affirmationId,
          lines: linesWithId,
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

      // Line editing actions
      deleteLine: (dialogueId: string, lineId: string) => {
        set((state) => ({
          dialogues: state.dialogues.map((d) =>
            d.id === dialogueId
              ? { ...d, lines: d.lines.filter((l) => l.id !== lineId) }
              : d
          ),
        }));
      },

      reorderLines: (dialogueId: string, lineIds: string[]) => {
        set((state) => ({
          dialogues: state.dialogues.map((d) => {
            if (d.id !== dialogueId) return d;

            const lineMap = new Map(d.lines.map((l) => [l.id, l]));
            const reordered = lineIds
              .map((id) => lineMap.get(id))
              .filter((l): l is DialogueLine => l !== undefined);

            return { ...d, lines: reordered };
          }),
        }));
      },

      // Playlist actions
      setPlaylistMode: (mode: PlaylistMode) => {
        set({ playlistMode: mode });
        if (mode === 'all') {
          get().buildPlaylist();
        }
      },

      buildPlaylist: () => {
        const { dialogues } = get();
        if (dialogues.length === 0) return;

        set({
          currentPlaylistIndex: 0,
          currentDialogueId: dialogues[0].id,
          currentLineIndex: 0,
        });
      },

      advancePlaylist: () => {
        const { dialogues, currentPlaylistIndex, playlistMode } = get();
        if (playlistMode !== 'all') return false;

        const nextIndex = currentPlaylistIndex + 1;
        if (nextIndex >= dialogues.length) {
          return false;
        }

        set({
          currentPlaylistIndex: nextIndex,
          currentDialogueId: dialogues[nextIndex].id,
          currentLineIndex: 0,
        });
        return true;
      },

      resetPlaylist: () => {
        set({
          currentPlaylistIndex: 0,
          playlistMode: 'single',
        });
      },

      getPlaylistDialogues: () => {
        return get().dialogues;
      },

      // Playback controls
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
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<DialogueState> | undefined;
        return {
          ...currentState,
          ...persisted,
          dialogues: persisted?.dialogues
            ? migrateDialogues(persisted.dialogues)
            : [],
        };
      },
    }
  )
);
