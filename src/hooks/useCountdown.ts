import { useState, useEffect } from 'react';

/**
 * Returns a live HH:MM:SS countdown string from the booking time to the 60-hour expiration.
 * Returns '' when no booking is active, or 'Expired' when time has elapsed.
 */
export function useCountdown(bookedAt: string | null | undefined): string {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!bookedAt) {
      setTimeRemaining('');
      return;
    }

    const tick = () => {
      const bookedTime = new Date(bookedAt).getTime();
      const expirationTime = bookedTime + 60 * 60 * 60 * 1000; // 60 hours
      const diff = expirationTime - Date.now();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return false; // signal to stop
      }

      const hours = Math.floor(diff / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);
      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      return true; // keep ticking
    };

    // Initial tick
    const shouldContinue = tick();
    if (!shouldContinue) return;

    const interval = setInterval(() => {
      if (!tick()) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [bookedAt]);

  return timeRemaining;
}
