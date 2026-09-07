import { useEffect, useState } from 'react';
import { bindAnnouncer } from './announce';

/** The app's single `aria-live` region. Mounted once, at the root. */
export function LiveRegion() {
  const [text, setText] = useState('');
  useEffect(() => {
    bindAnnouncer(setText);
    return () => bindAnnouncer(null);
  }, []);
  return (
    <p className="sr-only" role="status" aria-live="polite">
      {text}
    </p>
  );
}
