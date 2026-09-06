/* ------------------------------------------------------------------
   Persistence layer.

   The original Claude Artifact build used `window.storage`, an API
   that only exists inside Claude's Artifacts panel. A real deployed
   app has no such global, so this module provides a drop-in
   replacement backed by the browser's localStorage. It keeps the
   same { get(key), set(key, value) } shape (wrapped in a resolved
   value, not a Promise, but `await` works fine on non-Promises) so
   the rest of the app didn't need to change.
   ------------------------------------------------------------------ */

const PREFIX = "opmbbs_";

export const storage = {
  get(key) {
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (raw === null) return null;
      return { key, value: raw };
    } catch (_) {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(PREFIX + key, value);
      return { key, value };
    } catch (_) {
      return null;
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(PREFIX + key);
      return { key };
    } catch (_) {
      return null;
    }
  }
};
