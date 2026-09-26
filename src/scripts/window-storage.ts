export const FAVORITES_KEY = 'imarium:favorites';
export const MULTIVIEW_KEY = 'imarium:multiview';
export const MULTIVIEW_LIMIT = 9;
export const WINDOW_STORAGE_EVENT = 'imarium:window-storage';

export type WindowStorageDetail = {
  key: string;
  ids: string[];
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function readWindowIds(key: string): string[] {
  if (!canUseStorage()) return [];
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function writeWindowIds(key: string, ids: string[]): string[] {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!canUseStorage()) return unique;
  localStorage.setItem(key, JSON.stringify(unique));
  window.dispatchEvent(new CustomEvent<WindowStorageDetail>(WINDOW_STORAGE_EVENT, { detail: { key, ids: unique } }));
  return unique;
}

export function toggleWindowId(key: string, id: string, limit?: number) {
  const current = readWindowIds(key);
  const selected = current.includes(id);
  if (selected) return { ids: writeWindowIds(key, current.filter((item) => item !== id)), selected: false, full: false };
  if (typeof limit === 'number' && current.length >= limit) return { ids: current, selected: false, full: true };
  return { ids: writeWindowIds(key, [...current, id]), selected: true, full: false };
}

export function subscribeWindowStorage(key: string, listener: (ids: string[]) => void) {
  if (typeof window === 'undefined') return () => {};
  const onCustom = (event: Event) => {
    const detail = (event as CustomEvent<WindowStorageDetail>).detail;
    if (detail?.key === key) listener(detail.ids);
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) listener(readWindowIds(key));
  };
  window.addEventListener(WINDOW_STORAGE_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(WINDOW_STORAGE_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}

export const readFavorites = () => readWindowIds(FAVORITES_KEY);
export const toggleFavorite = (id: string) => toggleWindowId(FAVORITES_KEY, id);
export const subscribeFavorites = (listener: (ids: string[]) => void) => subscribeWindowStorage(FAVORITES_KEY, listener);
export const readMultiview = () => readWindowIds(MULTIVIEW_KEY);
export const toggleMultiview = (id: string) => toggleWindowId(MULTIVIEW_KEY, id, MULTIVIEW_LIMIT);
export const subscribeMultiview = (listener: (ids: string[]) => void) => subscribeWindowStorage(MULTIVIEW_KEY, listener);
