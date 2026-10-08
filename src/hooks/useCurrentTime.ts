import { useState, useEffect } from 'react';

/**
 * useCurrentTime — Reactive hook for real-time live clock updates
 * Updates every second so the date and time badge stays synchronized with real-time.
 */
export function useCurrentTime(): Date {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return currentTime;
}

export default useCurrentTime;
