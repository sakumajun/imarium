export const FAVORITES_KEY = 'imarium:favorites';
export const MULTIVIEW_KEY = 'imarium:multiview';
export const MULTIVIEW_LIMIT = 9;

export function readWindowIds(key: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function writeWindowIds(key: string, ids: string[]): string[] {
  const unique = [...new Set(ids.filter(Boolean))];
  localStorage.setItem(key, JSON.stringify(unique));
  return unique;
}

export function toggleWindowId(key: string, id: string, limit?: number) {
  const current = readWindowIds(key);
  const selected = current.includes(id);
  if (selected) return { ids: writeWindowIds(key, current.filter((item) => item !== id)), selected: false, full: false };
  if (typeof limit === 'number' && current.length >= limit) return { ids: current, selected: false, full: true };
  return { ids: writeWindowIds(key, [...current, id]), selected: true, full: false };
}

export const readFavorites = () => readWindowIds(FAVORITES_KEY);
export const toggleFavorite = (id: string) => toggleWindowId(FAVORITES_KEY, id);
export const readMultiview = () => readWindowIds(MULTIVIEW_KEY);
export const toggleMultiview = (id: string) => toggleWindowId(MULTIVIEW_KEY, id, MULTIVIEW_LIMIT);
