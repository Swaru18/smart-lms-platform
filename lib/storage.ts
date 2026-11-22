import { STATE_VERSION, type DemoState, type ThemeMode } from "./types";

export const STATE_KEY = "northroom.demo.v1";
export const THEME_KEY = "northroom.theme";

function isTheme(value: unknown): value is ThemeMode {
  return value === "dark" || value === "light";
}

export const demoStorage = {
  read(): DemoState | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STATE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as DemoState;
      if (!parsed || parsed.version !== STATE_VERSION || !Array.isArray(parsed.courses) || !Array.isArray(parsed.users)) return null;
      if (!isTheme(parsed.theme)) parsed.theme = "light";
      if (!Array.isArray(parsed.tickets)) parsed.tickets = [];
      if (typeof parsed.sessionUserId !== "string") parsed.sessionUserId = null;
      if (parsed.settings && (parsed.settings.name === "Northroom Demo" || parsed.settings.shortName === "Northroom")) {
        parsed.settings.name = "Smart LMS";
        parsed.settings.shortName = "Smart LMS";
      }
      return parsed;
    } catch {
      return null;
    }
  },
  write(state: DemoState) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
    window.localStorage.setItem(THEME_KEY, state.theme);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STATE_KEY);
    window.localStorage.removeItem(THEME_KEY);
  },
};
