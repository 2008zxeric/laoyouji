import { useState, useEffect } from 'react';

const LS_KEY = 'lyj_tgo_avatars';

export type AvatarEntry = { url: string; fileID: string; name: string; updatedAt: string };

function readLocal(): Record<string, AvatarEntry> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function useTgoAvatars(): Record<string, AvatarEntry> {
  const [avatars, setAvatars] = useState<Record<string, AvatarEntry>>(readLocal);

  useEffect(() => {
    fetch('/api/tgo-avatars')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.success && d.avatars && Object.keys(d.avatars).length) {
          setAvatars(d.avatars);
          try {
            localStorage.setItem(LS_KEY, JSON.stringify(d.avatars));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  return avatars;
}

export function tgoAvatarUrl(
  avatars: Record<string, AvatarEntry>,
  tgoId: string,
  fallback?: string
): string {
  if (avatars && avatars[tgoId] && avatars[tgoId].url) {
    return avatars[tgoId].url;
  }
  return fallback || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
}
