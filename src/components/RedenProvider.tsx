'use client';

import { useEffect } from 'react';

interface RedenProviderProps {
  children: React.ReactNode;
  sessionId: string;
}

export default function RedenProvider({ children, sessionId }: RedenProviderProps) {
  useEffect(() => {
    window.redenSessionId = sessionId;

    const script = document.createElement('script');
    script.src = process.env.NEXT_PUBLIC_REDEN_SCRIPT_URL || 'https://cdn.reden.io/sdk/reden.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).reden && (window as any).reden.init) {
        (window as any).reden.init({
          apiKey: process.env.NEXT_PUBLIC_REDEN_API_KEY,
          sessionId,
          environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [sessionId]);

  return <>{children}</>;
}
