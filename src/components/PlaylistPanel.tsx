import { useState, useRef, useEffect } from 'react';
import type { Affirmation, PlaybackStatus } from '../types';
import './PlaylistPanel.css';

interface PlaylistPanelProps {
  affirmations: Affirmation[];
  currentIndex: number;
  playbackStatus: PlaybackStatus;
  isNewItem: (id: string) => boolean;
  onSelect: (index: number) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onReorder: (ids: string[]) => void;
}

export function PlaylistPanel({
  affirmations,
  currentIndex,
  playbackStatus,
  isNewItem,
  onSelect,
  onDelete,
  onUpdate,
  onReorder,
}: PlaylistPanelProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // 편집 모드 시 input에 포커스
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleDoubleClick = (affirmation: Affirmation) => {
    if (playbackStatus === 'playing') return; // 재생 중에는 편집 불가
    setEditingId(affirmation.id);
    setEditText(affirmation.text);
  };

  const handleEditSave = () => {
    if (editingId && editText.trim()) {
      onUpdate(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add('playlist-item--dragging');
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDragOverIndex(null);

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('playlist-item--dragging');
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);

    if (dragIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const newAffirmations = [...affirmations];
    const [removed] = newAffirmations.splice(dragIndex, 1);
    newAffirmations.splice(dropIndex, 0, removed);

    onReorder(newAffirmations.map((a) => a.id));
    setDragOverIndex(null);
  };

  if (affirmations.length === 0) {
    return null;
  }

  return (
    <div className="playlist-panel" ref={dragRef}>
      {/* 헤더 */}
      <div className="playlist-header">
        <span className="playlist-info">{affirmations.length}개 확언</span>
      </div>

      {/* 확언 목록 */}
      <div className="playlist-items">
        {affirmations.map((affirmation, index) => (
          <div
            key={affirmation.id}
            className={`playlist-item ${
              index === currentIndex ? 'playlist-item--current' : ''
            } ${dragOverIndex === index ? 'playlist-item--drag-over' : ''} ${
              editingId === affirmation.id ? 'playlist-item--editing' : ''
            } ${isNewItem(affirmation.id) ? 'playlist-item--new' : ''}`}
            draggable={editingId !== affirmation.id}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => editingId !== affirmation.id && onSelect(index)}
            onDoubleClick={() => handleDoubleClick(affirmation)}
          >
            {/* 드래그 핸들 */}
            <div className="playlist-item__handle" aria-label="드래그하여 순서 변경">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="6" r="1.5" />
                <circle cx="15" cy="6" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="18" r="1.5" />
                <circle cx="15" cy="18" r="1.5" />
              </svg>
            </div>

            {/* 확언 텍스트 / 편집 모드 */}
            <div className="playlist-item__content">
              {editingId === affirmation.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  className="playlist-item__edit-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={handleEditSave}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="playlist-item__text">
                  {affirmation.text}
                </span>
              )}
            </div>

            {/* 재생 중 표시 */}
            {index === currentIndex && playbackStatus === 'playing' && (
              <div className="playlist-item__playing" aria-label="재생 중">
                <span className="playlist-item__wave"></span>
                <span className="playlist-item__wave"></span>
                <span className="playlist-item__wave"></span>
              </div>
            )}

            {/* 삭제 버튼 */}
            <button
              className="playlist-item__delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(affirmation.id);
              }}
              aria-label="삭제"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
