import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getRuntimeEnv(key: string): string | undefined {
  try {
    const { env } = getCloudflareContext();
    const value = (env as unknown as Record<string, string | undefined>)[key];

    if (value !== undefined) {
      return value;
    }
  } catch {
    // Fallback to process.env when Cloudflare context is unavailable.
  }

  return process.env[key];
}
