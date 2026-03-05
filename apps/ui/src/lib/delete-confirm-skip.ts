const STORAGE_KEY = 'automaker-delete-confirm-skip-until';

export function isDeleteConfirmSkipped(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const expiresAt = Number(raw);
    if (Date.now() < expiresAt) return true;
    localStorage.removeItem(STORAGE_KEY);
    return false;
  } catch {
    return false;
  }
}

export function setDeleteConfirmSkip(minutes: number): void {
  try {
    const expiresAt = Date.now() + minutes * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, String(expiresAt));
  } catch {
    /* ignore storage errors */
  }
}
