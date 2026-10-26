import { useState, useEffect, useCallback } from 'react';

export function useWakeLock() {
  const [isSupported, setIsSupported] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [sentinel, setSentinel] = useState<WakeLockSentinel | null>(null);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return false;

    try {
      const lock = await navigator.wakeLock.request('screen');
      setSentinel(lock);
      setIsLocked(true);

      lock.addEventListener('release', () => {
        setIsLocked(false);
        setSentinel(null);
      });

      return true;
    } catch (err) {
      console.warn('Wake Lock request error:', err);
      setIsLocked(false);
      return false;
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (sentinel) {
      try {
        await sentinel.release();
        setSentinel(null);
        setIsLocked(false);
      } catch (err) {
        console.warn('Wake Lock release error:', err);
      }
    }
  }, [sentinel]);

  // Re-acquire lock if visibility changes back to visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isLocked && !sentinel) {
        await requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLocked, sentinel, requestLock]);

  return {
    isSupported,
    isLocked,
    requestLock,
    releaseLock,
  };
}
