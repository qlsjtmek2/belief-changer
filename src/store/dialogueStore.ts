import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dialogue, DialogueLine, PlaybackStatus, RawDialogueLine } from '../types';

interface DialogueState {
  dialogues: Dialogue[];
  currentDialogueIndex: number;
  currentLineIndex: number;
  playbackStatus: PlaybackStatus;

  // Actions
  addDialogue: (sourceAffirmation: string, lines: RawDialogueLine[]) => Dialogue;
  addDialogues: (
    sourceAffirmation: string,
    dialoguesData: RawDialogueLine[][]
  ) => Dialogue[];
  deleteDialogue: (id: string) => void;
  clearAllDialogues: () => void;
  reorderDialogues: (dialogueIds: string[]) => void;

  // Getters
  getCurrentDialogue: () => Dialogue | null;

  // Line editing actions
  deleteLine: (dialogueId: string, lineId: string) => void;
  reorderLines: (dialogueId: string, lineIds: string[]) => void;

  // Playback controls
  setCurrentDialogue: (index: number) => void;
  advanceToNextDialogue: () => boolean;
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

// 기존 affirmationId를 sourceAffirmation으로 마이그레이션
const migrateToSourceAffirmation = (dialogues: unknown[]): Dialogue[] => {
  // 기존 확언 데이터 가져오기
  let affirmationMap: Record<string, string> = {};
  try {
    const oldAffirmations = localStorage.getItem('belief-changer-affirmations');
    if (oldAffirmations) {
      const parsed = JSON.parse(oldAffirmations);
      const affirmations = parsed.state?.affirmations || parsed.affirmations || [];
      affirmationMap = affirmations.reduce(
        (acc: Record<string, string>, aff: { id: string; text: string }) => {
          acc[aff.id] = aff.text;
          return acc;
        },
        {}
      );
    }
  } catch {
    // 파싱 실패 시 무시
  }

  return dialogues.map((dialogue: unknown) => {
    const d = dialogue as {
      id: string;
      affirmationId?: string;
      sourceAffirmation?: string;
      lines: DialogueLine[];
      createdAt: number;
    };

    // 이미 sourceAffirmation이 있으면 그대로 사용
    if (d.sourceAffirmation) {
      return d as Dialogue;
    }

    // affirmationId가 있으면 변환
    const sourceText = d.affirmationId
      ? affirmationMap[d.affirmationId] || '(이전 확언)'
      : '(알 수 없음)';

    return {
      id: d.id,
      sourceAffirmation: sourceText,
      lines: d.lines,
      createdAt: d.createdAt,
    };
  });
};

export const useDialogueStore = create<DialogueState>()(
  persist(
    (set, get) => ({
      dialogues: [],
      currentDialogueIndex: 0,
      currentLineIndex: 0,
      playbackStatus: 'idle',

      addDialogue: (sourceAffirmation: string, lines: RawDialogueLine[]) => {
        const linesWithId = addIdsToLines(lines);
        const newDialogue: Dialogue = {
          id: crypto.randomUUID(),
          sourceAffirmation,
          lines: linesWithId,
          createdAt: Date.now(),
        };
        set((state) => ({
          dialogues: [...state.dialogues, newDialogue],
        }));
        return newDialogue;
      },

      addDialogues: (
        sourceAffirmation: string,
        dialoguesData: RawDialogueLine[][]
      ) => {
        const newDialogues: Dialogue[] = dialoguesData.map((lines) => ({
          id: crypto.randomUUID(),
          sourceAffirmation,
          lines: addIdsToLines(lines),
          createdAt: Date.now(),
        }));
        set((state) => ({
          dialogues: [...state.dialogues, ...newDialogues],
        }));
        return newDialogues;
      },

      deleteDialogue: (id: string) => {
        set((state) => {
          const newDialogues = state.dialogues.filter((d) => d.id !== id);
          const deletedIndex = state.dialogues.findIndex((d) => d.id === id);

          // 현재 재생 중인 대화가 삭제된 경우 인덱스 조정
          let newIndex = state.currentDialogueIndex;
          if (deletedIndex <= state.currentDialogueIndex) {
            newIndex = Math.max(0, state.currentDialogueIndex - 1);
          }
          if (newDialogues.length === 0) {
            newIndex = 0;
          }

          return {
            dialogues: newDialogues,
            currentDialogueIndex: newIndex,
            playbackStatus:
              deletedIndex === state.currentDialogueIndex ? 'idle' : state.playbackStatus,
            currentLineIndex:
              deletedIndex === state.currentDialogueIndex ? 0 : state.currentLineIndex,
          };
        });
      },

      clearAllDialogues: () => {
        set({
          dialogues: [],
          currentDialogueIndex: 0,
          currentLineIndex: 0,
          playbackStatus: 'idle',
        });
      },

      reorderDialogues: (dialogueIds: string[]) => {
        set((state) => {
          const dialogueMap = new Map(state.dialogues.map((d) => [d.id, d]));
          const reordered = dialogueIds
            .map((id) => dialogueMap.get(id))
            .filter((d): d is Dialogue => d !== undefined);

          // 현재 재생 중인 대화의 새 인덱스 찾기
          const currentDialogue = state.dialogues[state.currentDialogueIndex];
          const newIndex = currentDialogue
            ? reordered.findIndex((d) => d.id === currentDialogue.id)
            : 0;

          return {
            dialogues: reordered,
            currentDialogueIndex: newIndex >= 0 ? newIndex : 0,
          };
        });
      },

      getCurrentDialogue: () => {
        const { dialogues, currentDialogueIndex } = get();
        return dialogues[currentDialogueIndex] ?? null;
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

      // Playback controls
      setCurrentDialogue: (index: number) => {
        const { dialogues } = get();
        if (index >= 0 && index < dialogues.length) {
          set({
            currentDialogueIndex: index,
            currentLineIndex: 0,
            playbackStatus: 'idle',
          });
        }
      },

      advanceToNextDialogue: () => {
        const { dialogues, currentDialogueIndex } = get();
        const nextIndex = currentDialogueIndex + 1;

        if (nextIndex >= dialogues.length) {
          // 마지막 대화 → 처음으로 돌아가기 (반복 재생)
          set({
            currentDialogueIndex: 0,
            currentLineIndex: 0,
          });
          return false; // 더 이상 다음 대화 없음 (한 사이클 완료)
        }

        set({
          currentDialogueIndex: nextIndex,
          currentLineIndex: 0,
        });
        return true;
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
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<DialogueState> | undefined;
        let dialogues = persisted?.dialogues ?? [];

        // 마이그레이션: affirmationId → sourceAffirmation
        dialogues = migrateToSourceAffirmation(dialogues);

        // 마이그레이션: 라인에 id 추가
        dialogues = migrateDialogues(dialogues);

        return {
          ...currentState,
          dialogues,
        };
      },
    }
  )
);
