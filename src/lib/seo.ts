const DEFAULT_SITE_URL = "https://gakusai-hub.jp";

export const SITE_NAME = "Gakusai Hub";
export const SITE_DESCRIPTION =
  "Gakusai Hubは、学校の文化祭向けの総合Webサービス。インストール不要、教育機関なら無料で利用可能。チケット機能、商品管理機能、運営管理機能など、豊富な機能で文化祭を簡単サポート。";

export function getSiteUrl(): URL {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    DEFAULT_SITE_URL;

  try {
    return new URL(rawUrl);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}
