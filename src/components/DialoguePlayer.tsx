import { useEffect, useRef } from 'react';
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
}

export function DialoguePlayer({
  lines,
  currentLineIndex,
  playbackStatus,
  onPlay,
  onPause,
  onStop,
}: DialoguePlayerProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

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

          return (
            <div
              key={index}
              ref={isActive ? activeLineRef : undefined}
              className={`dialogue-player__line ${isActive ? 'dialogue-player__line--active' : ''} ${isPast ? 'dialogue-player__line--past' : ''}`}
            >
              <span
                className="dialogue-player__speaker"
                style={{ color: getSpeakerColor(line.speaker) }}
              >
                {line.speaker}
              </span>
              <p className="dialogue-player__text">{line.text}</p>
              {isActive && (
                <span className="dialogue-player__indicator" aria-hidden="true">
                  <span className="dialogue-player__wave" />
                  <span className="dialogue-player__wave" />
                  <span className="dialogue-player__wave" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="dialogue-player__controls">
        <div className="dialogue-player__status">
          {playbackStatus === 'idle' ? (
            '재생 대기'
          ) : (
            <>
              {currentLineIndex + 1} / {lines.length}
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
