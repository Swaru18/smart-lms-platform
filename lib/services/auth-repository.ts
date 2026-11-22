import { hashPassword, newSalt } from "./password";

export type AccountCredential = {
  userId: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};

type AuthFile = { accounts: AccountCredential[] };

const ACCOUNTS_KEY = "smartlms.accounts.v1";
const REMEMBER_KEY = "smartlms.session.v1";
const TAB_KEY = "smartlms.session.tab";

function emptyFile(): AuthFile {
  return { accounts: [] };
}

function readFile(): AuthFile {
  if (typeof window === "undefined") return emptyFile();
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return emptyFile();
    const parsed = JSON.parse(raw) as AuthFile;
    if (!parsed || !Array.isArray(parsed.accounts)) return emptyFile();
    return parsed;
  } catch {
    return emptyFile();
  }
}

function writeFile(file: AuthFile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(file));
}

export const authRepository = {
  list() {
    return readFile().accounts;
  },
  findByEmail(email: string) {
    const needle = email.trim().toLowerCase();
    return readFile().accounts.find((account) => account.email === needle) ?? null;
  },
  findByUserId(userId: string) {
    return readFile().accounts.find((account) => account.userId === userId) ?? null;
  },
  async saveCredential(userId: string, email: string, password: string) {
    const file = readFile();
    const normalized = email.trim().toLowerCase();
    if (file.accounts.some((account) => account.email === normalized && account.userId !== userId)) {
      return "An account with this email already exists in this browser.";
    }
    const salt = newSalt();
    const passwordHash = await hashPassword(password, salt);
    const existing = file.accounts.find((account) => account.userId === userId);
    const next: AccountCredential = {
      userId,
      email: normalized,
      passwordHash,
      salt,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    file.accounts = file.accounts.filter((account) => account.userId !== userId);
    file.accounts.push(next);
    writeFile(file);
    return null;
  },
  updateEmail(userId: string, email: string) {
    const file = readFile();
    const account = file.accounts.find((item) => item.userId === userId);
    if (!account) return;
    account.email = email.trim().toLowerCase();
    writeFile(file);
  },
  remove(userId: string) {
    const file = readFile();
    file.accounts = file.accounts.filter((account) => account.userId !== userId);
    writeFile(file);
  },
  async verify(account: AccountCredential, password: string) {
    const hash = await hashPassword(password, account.salt);
    return hash === account.passwordHash;
  },
  readSession(): string | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem(TAB_KEY) || window.localStorage.getItem(REMEMBER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { userId?: string };
      return typeof parsed.userId === "string" ? parsed.userId : null;
    } catch {
      return null;
    }
  },
  writeSession(userId: string, remember: boolean) {
    if (typeof window === "undefined") return;
    const payload = JSON.stringify({ userId });
    if (remember) {
      window.localStorage.setItem(REMEMBER_KEY, payload);
      window.sessionStorage.removeItem(TAB_KEY);
    } else {
      window.sessionStorage.setItem(TAB_KEY, payload);
      window.localStorage.removeItem(REMEMBER_KEY);
    }
  },
  clearSession() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(REMEMBER_KEY);
    window.sessionStorage.removeItem(TAB_KEY);
  },
};
