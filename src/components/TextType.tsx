import React, { useEffect, useMemo, useRef, useState } from 'react';

type TextTypeProps = {
  text: string[];
  typingSpeed?: number; // ms per character
  pauseDuration?: number; // ms between phrases
  showCursor?: boolean;
  cursorCharacter?: string;
  className?: string;
};

const TextType: React.FC<TextTypeProps> = ({
  text,
  typingSpeed = 75,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = '|',
  className,
}) => {
  const phrases = useMemo(() => text.filter(Boolean), [text]);
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (phrases.length === 0) return;
    const current = phrases[phraseIndex % phrases.length];
    const currentLen = displayText.length;
    const targetLen = isDeleting ? 0 : current.length;

    const atTarget = currentLen === targetLen;
    const baseDelay = isDeleting
      ? Math.max(typingSpeed * 0.6, 30)
      : typingSpeed;

    const schedule = (delay: number, fn: () => void) => {
      timeoutRef.current = window.setTimeout(fn, delay);
    };

    if (!atTarget) {
      const nextLen = isDeleting ? currentLen - 1 : currentLen + 1;
      schedule(baseDelay, () => setDisplayText(current.slice(0, nextLen)));
    } else {
      if (!isDeleting) {
        schedule(pauseDuration, () => setIsDeleting(true));
      } else {
        schedule(Math.max(typingSpeed, 100), () => {
          setIsDeleting(false);
          setPhraseIndex(i => (i + 1) % phrases.length);
        });
      }
    }

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [
    phrases,
    phraseIndex,
    displayText,
    isDeleting,
    typingSpeed,
    pauseDuration,
  ]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && <span className='ml-1 opacity-90'>{cursorCharacter}</span>}
    </span>
  );
};

export default TextType;
