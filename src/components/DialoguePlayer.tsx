import { useEffect, useRef, useState, type DragEvent } from 'react';
import type { DialogueLine, PlaybackStatus, VoiceSettings } from '../types';
import './DialoguePlayer.css';

export interface DialoguePlayerProps {
  lines: DialogueLine[];
  currentLineIndex: number;
  playbackStatus: PlaybackStatus;
  voiceSettings?: VoiceSettings;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;

  // 편집 기능
  editable?: boolean;
  onDeleteLine?: (lineId: string) => void;
  onReorderLines?: (lineIds: string[]) => void;

  // 플레이리스트 정보
  playlistInfo?: {
    current: number;
    total: number;
  };
}

export function DialoguePlayer({
  lines,
  currentLineIndex,
  playbackStatus,
  onPlay,
  onPause,
  onStop,
  editable = false,
  onDeleteLine,
  onReorderLines,
  playlistInfo,
}: DialoguePlayerProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const [draggedLineId, setDraggedLineId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // 현재 재생 중인 라인으로 자동 스크롤
  useEffect(() => {
    if (playbackStatus === 'playing' && activeLineRef.current && listRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentLineIndex, playbackStatus]);

  const isPlaying = playbackStatus === 'playing';
  const progress = lines.length > 0 ? ((currentLineIndex + 1) / lines.length) * 100 : 0;
  const canEdit = editable && playbackStatus === 'idle';

  // 화자별 고유 색상 할당
  const speakers = [...new Set(lines.map((line) => line.speaker))];
  const getSpeakerColor = (speaker: string) => {
    const index = speakers.indexOf(speaker);
    const colors = [
      'var(--color-primary-light)',
      'var(--color-accent-cyan)',
      'var(--color-accent-teal)',
      'var(--color-accent-pink)',
      'var(--color-accent-violet)',
    ];
    return colors[index % colors.length];
  };

  // 드래그앤드롭 핸들러
  const handleDragStart = (e: DragEvent<HTMLDivElement>, lineId: string) => {
    if (!canEdit) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lineId);
    setDraggedLineId(lineId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, lineId: string) => {
    if (!canEdit || !draggedLineId || draggedLineId === lineId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetId(lineId);
  };

  const handleDragLeave = () => {
    setDropTargetId(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetLineId: string) => {
    e.preventDefault();
    if (!canEdit || !draggedLineId || !onReorderLines) return;

    const currentOrder = lines.map((l) => l.id);
    const draggedIndex = currentOrder.indexOf(draggedLineId);
    const targetIndex = currentOrder.indexOf(targetLineId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // 새 순서 계산
    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedLineId);

    onReorderLines(newOrder);
    setDraggedLineId(null);
    setDropTargetId(null);
  };

  const handleDragEnd = () => {
    setDraggedLineId(null);
    setDropTargetId(null);
  };

  const handleDeleteLine = (lineId: string) => {
    if (!canEdit || !onDeleteLine) return;
    if (lines.length <= 1) return; // 최소 1개 라인 유지
    onDeleteLine(lineId);
  };

  return (
    <div className="dialogue-player">
      {/* Progress Bar */}
      <div className="dialogue-player__progress">
        <div
          className="dialogue-player__progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Dialogue Lines */}
      <div className="dialogue-player__list" ref={listRef}>
        {lines.map((line, index) => {
          const isActive = index === currentLineIndex && playbackStatus !== 'idle';
          const isPast = index < currentLineIndex && playbackStatus !== 'idle';
          const isDragging = draggedLineId === line.id;
          const isDropTarget = dropTargetId === line.id;

          return (
            <div
              key={line.id}
              ref={isActive ? activeLineRef : undefined}
              className={`dialogue-player__line ${isActive ? 'dialogue-player__line--active' : ''} ${isPast ? 'dialogue-player__line--past' : ''} ${canEdit ? 'dialogue-player__line--editable' : ''} ${isDragging ? 'dialogue-player__line--dragging' : ''} ${isDropTarget ? 'dialogue-player__line--drop-target' : ''}`}
              draggable={canEdit}
              onDragStart={(e) => handleDragStart(e, line.id)}
              onDragOver={(e) => handleDragOver(e, line.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, line.id)}
              onDragEnd={handleDragEnd}
            >
              {/* 드래그 핸들 */}
              {canEdit && (
                <span className="dialogue-player__drag-handle" aria-label="드래그하여 순서 변경">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="6" r="2" />
                    <circle cx="12" cy="6" r="2" />
                    <circle cx="19" cy="6" r="2" />
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                    <circle cx="5" cy="18" r="2" />
                    <circle cx="12" cy="18" r="2" />
                    <circle cx="19" cy="18" r="2" />
                  </svg>
                </span>
              )}

              <div className="dialogue-player__line-content">
                <span
                  className="dialogue-player__speaker"
                  style={{ color: getSpeakerColor(line.speaker) }}
                >
                  {line.speaker}
                </span>
                <p className="dialogue-player__text">{line.text}</p>
              </div>

              {/* 재생 중 표시 */}
              {isActive && (
                <span className="dialogue-player__indicator" aria-hidden="true">
                  <span className="dialogue-player__wave" />
                  <span className="dialogue-player__wave" />
                  <span className="dialogue-player__wave" />
                </span>
              )}

              {/* 삭제 버튼 */}
              {canEdit && lines.length > 1 && (
                <button
                  type="button"
                  className="dialogue-player__delete-btn"
                  onClick={() => handleDeleteLine(line.id)}
                  aria-label="라인 삭제"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="dialogue-player__controls">
        <div className="dialogue-player__status">
          {playbackStatus === 'idle' ? (
            canEdit ? '편집 모드' : '재생 대기'
          ) : (
            <>
              {playlistInfo && (
                <span className="dialogue-player__playlist-info">
                  대화 {playlistInfo.current}/{playlistInfo.total} ·{' '}
                </span>
              )}
              라인 {currentLineIndex + 1}/{lines.length}
            </>
          )}
        </div>

        <div className="dialogue-player__buttons">
          {/* Stop Button */}
          <button
            type="button"
            className="dialogue-player__btn dialogue-player__btn--stop"
            onClick={onStop}
            disabled={playbackStatus === 'idle'}
            aria-label="중지"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>

          {/* Play/Pause Button */}
          <button
            type="button"
            className="dialogue-player__btn dialogue-player__btn--primary"
            onClick={isPlaying ? onPause : onPlay}
            aria-label={isPlaying ? '일시정지' : '재생'}
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11-7.36a1 1 0 0 0 0-1.72l-11-7.36a1 1 0 0 0-1.5.86z" />
              </svg>
            )}
          </button>
        </div>

        <div className="dialogue-player__spacer" />
      </div>
    </div>
  );
}
