import { useState, useEffect } from 'react';
import { formatRelativeTime } from '@/utils/timeUtils';

/**
 * Hook that provides live updating relative time
 * @param timestamp - ISO string, Date object, or number (milliseconds)
 * @param updateInterval - Update interval in milliseconds (default: 30000 for 30 seconds)
 * @returns Formatted relative time string that updates automatically
 */
export const useRelativeTime = (
  timestamp: string | Date | number,
  updateInterval: number = 30000
): string => {
  const [relativeTime, setRelativeTime] = useState<string>(() => 
    formatRelativeTime(timestamp)
  );

  useEffect(() => {
    // Update immediately
    setRelativeTime(formatRelativeTime(timestamp));

    // Set up interval for updates
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(timestamp));
    }, updateInterval);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [timestamp, updateInterval]);

  return relativeTime;
};