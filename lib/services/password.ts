/** Prototype hash for this browser only. Phase 2 should use Supabase Auth, not this function. */
export async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function newSalt() {
  return crypto.randomUUID();
}
