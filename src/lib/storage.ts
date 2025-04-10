// src/lib/storage.ts

export function saveToStorage(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadFromStorage<T>(key: string): T | null {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}
