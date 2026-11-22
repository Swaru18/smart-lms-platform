/** Device-only notes for contact and demo forms. Not an account system. */
export function readNotes(key: string) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNote(key: string, item: Record<string, string>) {
  const next = readNotes(key).slice(-19);
  next.push(item);
  window.localStorage.setItem(key, JSON.stringify(next));
}
