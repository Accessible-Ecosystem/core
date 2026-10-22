import { vi } from "vitest";

/**
 * Stubs matchMedia with an EventTarget that can dispatch change events.
 *
 * @param  {boolean} [matches = false] - The initial match state.
 * @return {object}                    - The media query list and matchMedia mock.
 */
export function setupMatchMedia(matches = false) {
  const list = new EventTarget();
  Object.assign(list, { matches, media: "(width <= 768px)" });
  const matchMedia = vi.fn(() => list);
  vi.stubGlobal("matchMedia", matchMedia);
  return { list, matchMedia };
}
