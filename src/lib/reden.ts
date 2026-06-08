export interface RedenEventPayload {
  eventType: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
  productId?: string;
  category?: string;
  searchQuery?: string;
  metadata?: Record<string, any>;
}

export const trackRedenEvent = (event: RedenEventPayload): void => {
  if (typeof window === 'undefined') return;

  if ((window as any).reden && (window as any).reden.track) {
    (window as any).reden.track(event);
  }
};

export const getRedenSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (window as any).redenSessionId || null;
};
