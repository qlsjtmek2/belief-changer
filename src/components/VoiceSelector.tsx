import { useState, useEffect, useId } from 'react';
import type { Voice } from '../services/tts';
import { getVoices, speak, stop } from '../services/tts';
import './VoiceSelector.css';

export interface VoiceSelectorProps {
  speaker: string;
  selectedVoiceId?: string;
  onVoiceChange: (voiceId: string) => void;
}

export function VoiceSelector({
  speaker,
  selectedVoiceId,
  onVoiceChange,
}: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const selectId = useId();

  useEffect(() => {
    const loadVoices = async () => {
      try {
        const availableVoices = await getVoices();
        setVoices(availableVoices);
      } catch {
        console.error('음성 목록을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadVoices();
  }, []);

  const selectedVoice = voices.find((v) => v.id === selectedVoiceId);

  const handlePreview = async () => {
    if (!selectedVoice || isPreviewing) return;

    setIsPreviewing(true);
    try {
      await speak(`안녕하세요, 저는 ${speaker}입니다.`, {
        voice: selectedVoice.native,
        onEnd: () => setIsPreviewing(false),
        onError: () => setIsPreviewing(false),
      });
    } catch {
      setIsPreviewing(false);
    }
  };

  const handleStopPreview = () => {
    stop();
    setIsPreviewing(false);
  };

  // 언어별 그룹화
  const groupedVoices = voices.reduce(
    (acc, voice) => {
      const lang = voice.lang.split('-')[0];
      const langName = lang === 'ko' ? '한국어' : lang === 'en' ? '영어' : lang;
      if (!acc[langName]) {
        acc[langName] = [];
      }
      acc[langName].push(voice);
      return acc;
    },
    {} as Record<string, Voice[]>
  );

  // 한국어를 최상단에 표시
  const sortedGroups = Object.entries(groupedVoices).sort(([a], [b]) => {
    if (a === '한국어') return -1;
    if (b === '한국어') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="voice-selector">
      <div className="voice-selector__header">
        <span className="voice-selector__speaker">{speaker}</span>
      </div>

      <div className="voice-selector__controls">
        <div className="voice-selector__select-wrapper">
          <select
            id={selectId}
            className="voice-selector__select"
            value={selectedVoiceId || ''}
            onChange={(e) => onVoiceChange(e.target.value)}
            disabled={isLoading}
          >
            {isLoading ? (
              <option value="">로딩 중...</option>
            ) : voices.length === 0 ? (
              <option value="">음성 없음</option>
            ) : (
              <>
                <option value="">음성 선택</option>
                {sortedGroups.map(([langName, langVoices]) => (
                  <optgroup key={langName} label={langName}>
                    {langVoices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </>
            )}
          </select>
          <svg
            className="voice-selector__chevron"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        <button
          type="button"
          className={`voice-selector__preview ${isPreviewing ? 'voice-selector__preview--active' : ''}`}
          onClick={isPreviewing ? handleStopPreview : handlePreview}
          disabled={!selectedVoiceId || isLoading}
          aria-label={isPreviewing ? '미리듣기 중지' : '미리듣기'}
        >
          {isPreviewing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
