import { getRuntimeEnv } from "@/lib/runtime-env";

const DEFAULT_SITE_URL = "https://kinshi-navi.com/";

export const SITE_NAME = "Kinshi Navi";
export const SITE_DESCRIPTION =
  "Kinshi Naviは長野県長野高等学校の文化祭「金鵄祭」の公式Webアプリです。";

export function getSiteUrl(): URL {
  const rawUrl =
    getRuntimeEnv("NEXT_PUBLIC_SITE_URL") ??
    getRuntimeEnv("SITE_URL") ??
    DEFAULT_SITE_URL;

  try {
    return new URL(rawUrl);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}
