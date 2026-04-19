const INVITE_TOKEN_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function getInvitePepper() {
  const pepper =
    process.env.INVITE_TOKEN_PEPPER ?? process.env.BETTER_AUTH_SECRET;
  if (!pepper) {
    throw new Error("INVITE_TOKEN_PEPPER が設定されていません。");
  }
  return pepper;
}

export function generateInviteToken(length = 24) {
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(randomValues)
    .map((value) => INVITE_TOKEN_CHARS[value % INVITE_TOKEN_CHARS.length])
    .join("");
}

export async function hashInviteToken(token: string) {
  const pepper = getInvitePepper();
  const payload = new TextEncoder().encode(`${token}.${pepper}`);
  const digest = await crypto.subtle.digest("SHA-256", payload);
  return toHex(new Uint8Array(digest));
}

export function buildInviteUrl(token: string, path: string) {
  const baseUrl =
    process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  const search = new URLSearchParams({ token }).toString();
  if (!baseUrl) {
    return `${path}?${search}`;
  }
  return `${baseUrl.replace(/\/$/, "")}${path}?${search}`;
}
