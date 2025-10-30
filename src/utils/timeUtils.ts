/**
 * Format a timestamp to relative time (e.g., "1h ago", "3min ago", "2 weeks ago")
 * @param timestamp - ISO string, Date object, or number (milliseconds)
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (timestamp: string | Date | number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);
  
    if (diffInSeconds < 5) {
      return 'just now';
    } else if (diffInSeconds < 60) {
      return `${diffInSeconds}sec ago`;
    } else if (diffInMinutes === 1) {
      return '1min ago';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}min ago`;
    } else if (diffInHours === 1) {
      return '1h ago';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return '1 day ago';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInWeeks === 1) {
      return '1 week ago';
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks} weeks ago`;
    } else if (diffInMonths === 1) {
      return '1 month ago';
    } else if (diffInMonths < 12) {
      return `${diffInMonths} months ago`;
    } else if (diffInYears === 1) {
      return '1 year ago';
    } else {
      return `${diffInYears} years ago`;
    }
  };
  
  /**
   * Format timestamp to a more detailed relative time
   * @param timestamp - ISO string, Date object, or number (milliseconds)
   * @returns Detailed relative time string
   */
  export const formatDetailedRelativeTime = (timestamp: string | Date | number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
  
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = diffInHours;
      const minutes = diffInMinutes % 60;
      if (minutes > 0) {
        return `${hours}h ${minutes}m ago`;
      }
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return formatDate(timestamp);
    }
  };
  
  /**
   * Format date to readable string (e.g., "Jan 15, 2024")
   * @param timestamp - ISO string, Date object, or number (milliseconds)
   * @returns Formatted date string
   */
  export const formatDate = (timestamp: string | Date | number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  /**
   * Format date and time (e.g., "Jan 15, 2024 at 2:30 PM")
   * @param timestamp - ISO string, Date object, or number (milliseconds)
   * @returns Formatted date and time string
   */
  export const formatDateTime = (timestamp: string | Date | number): string => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} at ${timeStr}`;
  };
  
  /**
   * Check if a timestamp is today
   * @param timestamp - ISO string, Date object, or number (milliseconds)
   * @returns boolean
   */
  export const isToday = (timestamp: string | Date | number): boolean => {
    const date = new Date(timestamp);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  /**
   * Check if a timestamp is yesterday
   * @param timestamp - ISO string, Date object, or number (milliseconds)
   * @returns boolean
   */
  export const isYesterday = (timestamp: string | Date | number): boolean => {
    const date = new Date(timestamp);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  };