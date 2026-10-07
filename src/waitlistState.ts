import { useSyncExternalStore } from "react";

// One shared flag so every waitlist form on the page shows the success state after a sign-up.
let joined = false;
const listeners = new Set<() => void>();

export function markJoined() {
  joined = true;
  listeners.forEach((l) => l());
}

export function useJoined() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => joined,
    () => false,
  );
}
