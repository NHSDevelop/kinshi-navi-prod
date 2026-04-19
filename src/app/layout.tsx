import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { PwaClient } from "@/features/push/pwa-client";

const SITE_DESCRIPTION =
  "Gakusai Hubは、学校の文化祭向けの総合Webサービス。インストール不要、教育機関なら無料で利用可能。チケット機能、商品管理機能、運営管理機能など、豊富な機能で文化祭を簡単サポート。";
const siteUrl = "https://gakusai-hub.jp";
const SITE_NAME = "Gakusai Hub";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/images/screenshot-wide.png",
        alt: `${SITE_NAME} のプレビュー画像`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/images/screenshot-wide.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/images/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/images/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  keywords:
    "文化祭, イベント, 学園祭, 学校, 高校, 中学校, アプリ, Web, サービス, Webアプリ, 無料, 管理, チケット, 整理券, レジ, 会計",
};

export const viewport: Viewport = {
  themeColor: "#79a1d4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <PwaClient />
        <main>{children}</main>
        <footer className="mt-auto bg-main-50 w-full ">
          <div className="px-8 lg:px-16 py-6 lg:py-8">
            <div className="md:flex md:justify-between ">
              <div className="mb-6 md:mb-0">
                <Link href="/" className="flex items-center">
                  <span className="text-heading self-center text-2xl font-semibold whitespace-nowrap">
                    Gakusai Hub
                  </span>
                </Link>
              </div>
              <div className="flex gap-8 md:gap-16  me-4">
                <div>
                  <h2 className="mb-6 md:text-lg font-semibold text-heading uppercase">
                    サイトマップ
                  </h2>
                  <ul className="flex flex-col font-medium gap-2">
                    <li>
                      <Link href={"/"} className="text-sm md:text-base">
                        サイトトップ
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h2 className="mb-6 md:text-lg font-semibold text-heading uppercase">
                    ガイド
                  </h2>
                  <ul className="flex flex-col font-medium gap-2">
                    <li>
                      <Link href={"/help"} className="text-sm md:text-base">
                        使い方ガイド
                      </Link>
                    </li>
                    <li>
                      <Link href={"/terms"} className="text-sm md:text-base">
                        利用規約
                      </Link>
                    </li>
                    <li>
                      <Link href={"/policy"} className="text-sm md:text-base">
                        プライバシーポリシー
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h2 className="mb-6 md:text-lg font-semibold text-heading uppercase">
                    管理者の方へ
                  </h2>
                  <ul className="flex flex-col font-medium gap-2">
                    <li>
                      <Link
                        href={"/dashboard"}
                        className="text-sm md:text-base"
                      >
                        管理者ページ
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={"/application-form"}
                        className="text-sm md:text-base"
                      >
                        利用申し込み
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={"/help/admin"}
                        className="text-sm md:text-base"
                      >
                        管理者向けガイド
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <hr className="my-6 border-default sm:mx-auto lg:my-8" />
            <div className="sm:flex sm:items-center sm:justify-between">
              <span className="text-sm text-body sm:text-center">
                © 2026 Gakusai Hub
              </span>
              <div className="flex mt-4 sm:justify-center sm:mt-0"></div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
