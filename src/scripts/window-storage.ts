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

function normalizeIds(ids: unknown, limit?: number): string[] {
  if (!Array.isArray(ids)) return [];
  const unique = [...new Set(ids.filter((id): id is string => typeof id === 'string').map((id) => id.trim()).filter(Boolean))];
  return typeof limit === 'number' ? unique.slice(0, limit) : unique;
}

export function readWindowIds(key: string, limit?: number): string[] {
  if (!canUseStorage()) return [];
  try {
    return normalizeIds(JSON.parse(localStorage.getItem(key) || '[]'), limit);
  } catch {
    return [];
  }
}

export function writeWindowIds(key: string, ids: string[], limit?: number): string[] {
  const unique = normalizeIds(ids, limit);
  if (!canUseStorage()) return unique;
  localStorage.setItem(key, JSON.stringify(unique));
  window.dispatchEvent(new CustomEvent<WindowStorageDetail>(WINDOW_STORAGE_EVENT, { detail: { key, ids: unique } }));
  return unique;
}

export function pruneWindowIds(key: string, isAllowed: (id: string) => boolean, limit?: number): string[] {
  const stored = readWindowIds(key);
  const valid = normalizeIds(stored.filter(isAllowed), limit);
  if (stored.length !== valid.length || stored.some((id, index) => id !== valid[index])) {
    return writeWindowIds(key, valid, limit);
  }
  return valid;
}

export function toggleWindowId(key: string, id: string, limit?: number) {
  const current = readWindowIds(key, limit);
  const selected = current.includes(id);
  if (selected) return { ids: writeWindowIds(key, current.filter((item) => item !== id), limit), selected: false, full: false };
  if (typeof limit === 'number' && current.length >= limit) return { ids: current, selected: false, full: true };
  return { ids: writeWindowIds(key, [...current, id], limit), selected: true, full: false };
}

export function subscribeWindowStorage(key: string, listener: (ids: string[]) => void, limit?: number) {
  if (typeof window === 'undefined') return () => {};
  const onCustom = (event: Event) => {
    const detail = (event as CustomEvent<WindowStorageDetail>).detail;
    if (detail?.key === key) listener(normalizeIds(detail.ids, limit));
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) listener(readWindowIds(key, limit));
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
export const pruneFavorites = (isAllowed: (id: string) => boolean) => pruneWindowIds(FAVORITES_KEY, isAllowed);
export const subscribeFavorites = (listener: (ids: string[]) => void) => subscribeWindowStorage(FAVORITES_KEY, listener);
export const readMultiview = () => readWindowIds(MULTIVIEW_KEY, MULTIVIEW_LIMIT);
export const toggleMultiview = (id: string) => toggleWindowId(MULTIVIEW_KEY, id, MULTIVIEW_LIMIT);
export const pruneMultiview = (isAllowed: (id: string) => boolean) => pruneWindowIds(MULTIVIEW_KEY, isAllowed, MULTIVIEW_LIMIT);
export const subscribeMultiview = (listener: (ids: string[]) => void) => subscribeWindowStorage(MULTIVIEW_KEY, listener, MULTIVIEW_LIMIT);
