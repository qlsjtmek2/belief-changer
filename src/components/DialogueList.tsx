import type { Dialogue } from '../types';
import './DialogueList.css';

interface DialogueListProps {
  dialogues: Dialogue[];
  selectedDialogueId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  isGenerating?: boolean;
}

export function DialogueList({
  dialogues,
  selectedDialogueId,
  onSelect,
  onDelete,
  onAddNew,
  isGenerating = false,
}: DialogueListProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dialogue-list">
      <div className="dialogue-list__header">
        <span className="dialogue-list__title">대화 목록</span>
        <span className="dialogue-list__count">{dialogues.length}개</span>
      </div>

      <div className="dialogue-list__items">
        {dialogues.map((dialogue, index) => {
          const isSelected = dialogue.id === selectedDialogueId;
          const previewText = dialogue.lines[0]?.text || '대화 내용 없음';

          return (
            <button
              key={dialogue.id}
              type="button"
              className={`dialogue-list__item ${isSelected ? 'dialogue-list__item--selected' : ''}`}
              onClick={() => onSelect(dialogue.id)}
            >
              <div className="dialogue-list__item-header">
                <span className="dialogue-list__item-number">
                  대화 {dialogues.length - index}
                </span>
                <span className="dialogue-list__item-date">
                  {formatDate(dialogue.createdAt)}
                </span>
              </div>
              <p className="dialogue-list__item-preview">{previewText}</p>
              <div className="dialogue-list__item-meta">
                <span className="dialogue-list__item-lines">
                  {dialogue.lines.length}개 라인
                </span>
                {isSelected && (
                  <button
                    type="button"
                    className="dialogue-list__item-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(dialogue.id);
                    }}
                    aria-label="대화 삭제"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="dialogue-list__add-btn"
        onClick={onAddNew}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <span className="dialogue-list__spinner" />
            생성 중...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            새 대화 생성
          </>
        )}
      </button>
    </div>
  );
}
