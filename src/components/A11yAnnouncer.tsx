import { useState, useEffect } from 'react';

export function ScreenReaderAnnouncer() {
  const [announcement, setAnnouncement] = useState('');

  // Example listener for a custom event
  useEffect(() => {
    const handleAnnounce = (e: CustomEvent<string>) => {
      setAnnouncement(e.detail);
    };

    window.addEventListener('a11y-announce' as any, handleAnnounce);
    return () => window.removeEventListener('a11y-announce' as any, handleAnnounce);
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only" // visually hidden element
    >
      {announcement}
    </div>
  );
}

export const announceAsScreenReader = (message: string) => {
  const event = new CustomEvent('a11y-announce', { detail: message });
  window.dispatchEvent(event);
};
