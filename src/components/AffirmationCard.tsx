import { useState, useRef, useEffect } from 'react';
import type { Affirmation } from '../types';
import './AffirmationCard.css';

export interface AffirmationCardProps {
  affirmation: Affirmation;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (id: string, newText: string) => void;
  onDelete?: (id: string) => void;
}

export function AffirmationCard({
  affirmation,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
}: AffirmationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(affirmation.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleCardClick = () => {
    if (!isEditing) {
      onSelect?.(affirmation.id);
    }
  };

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditText(affirmation.text);
    setIsEditing(true);
  };

  const handleEditSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== affirmation.text) {
      onEdit?.(affirmation.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditText(affirmation.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(affirmation.id);
  };

  const formattedDate = new Date(affirmation.createdAt).toLocaleDateString(
    'ko-KR',
    { month: 'short', day: 'numeric' }
  );

  return (
    <article
      className={`affirmation-card ${isSelected ? 'affirmation-card--selected' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
    >
      <div className="affirmation-card__glow" aria-hidden="true" />

      {isEditing ? (
        <div className="affirmation-card__edit">
          <textarea
            ref={textareaRef}
            className="affirmation-card__textarea"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleEditSave}
            maxLength={200}
          />
          <div className="affirmation-card__edit-hint">
            Enter로 저장 · Esc로 취소
          </div>
        </div>
      ) : (
        <>
          <p className="affirmation-card__text">{affirmation.text}</p>

          <div className="affirmation-card__footer">
            <time className="affirmation-card__date">{formattedDate}</time>

            <div className="affirmation-card__actions">
              <button
                type="button"
                className="affirmation-card__action"
                onClick={handleEditStart}
                aria-label="편집"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                type="button"
                className="affirmation-card__action affirmation-card__action--danger"
                onClick={handleDelete}
                aria-label="삭제"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
