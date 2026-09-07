/**
 * A single polite live region for the whole app.
 *
 * Day transitions, event outcomes, and refused actions all announce through here, so a
 * screen-reader user is never left wondering why a button appeared to do nothing.
 */

let sink: ((text: string) => void) | null = null;

export function announce(text: string): void {
  sink?.(text);
}

/** Wired up by `LiveRegion`; not part of the public surface. */
export function bindAnnouncer(setter: ((text: string) => void) | null): void {
  sink = setter;
}
