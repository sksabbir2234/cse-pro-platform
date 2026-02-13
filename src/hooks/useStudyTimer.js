import { useState, useEffect } from 'react';

export function useStudyTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsActive((prev) => !prev);
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  return { seconds, isActive, toggleTimer, resetTimer, formatTime };
}