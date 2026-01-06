import { useState, useRef } from 'react';
import type { Affirmation, PlaybackStatus } from '../types';
import './PlaylistPanel.css';

interface PlaylistPanelProps {
  affirmations: Affirmation[];
  currentIndex: number;
  playbackStatus: PlaybackStatus;
  onSelect: (index: number) => void;
  onDelete: (id: string) => void;
  onReorder: (ids: string[]) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

export function PlaylistPanel({
  affirmations,
  currentIndex,
  playbackStatus,
  onSelect,
  onDelete,
  onReorder,
  onPlay,
  onPause,
  onStop,
}: PlaylistPanelProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

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

  const handlePlayPause = () => {
    if (playbackStatus === 'playing') {
      onPause();
    } else {
      onPlay();
    }
  };

  if (affirmations.length === 0) {
    return null;
  }

  return (
    <div className="playlist-panel" ref={dragRef}>
      {/* 재생 컨트롤 */}
      <div className="playlist-controls">
        <button
          className={`playlist-control-btn playlist-control-btn--play ${
            playbackStatus === 'playing' ? 'playlist-control-btn--active' : ''
          }`}
          onClick={handlePlayPause}
          aria-label={playbackStatus === 'playing' ? '일시정지' : '재생'}
        >
          {playbackStatus === 'playing' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button
          className="playlist-control-btn"
          onClick={onStop}
          disabled={playbackStatus === 'idle'}
          aria-label="정지"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        </button>
        <span className="playlist-info">
          {affirmations.length}개 확언
        </span>
      </div>

      {/* 확언 목록 */}
      <div className="playlist-items">
        {affirmations.map((affirmation, index) => (
          <div
            key={affirmation.id}
            className={`playlist-item ${
              index === currentIndex ? 'playlist-item--current' : ''
            } ${dragOverIndex === index ? 'playlist-item--drag-over' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => onSelect(index)}
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

            {/* 확언 텍스트 */}
            <div className="playlist-item__content">
              <span className="playlist-item__text">
                {affirmation.text}
              </span>
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
