# Kinshi Navi

学校の文化祭運営を支援する Web アプリです。来場者向けの整理券発行、店舗向けの会計・在庫、管理者向けの運営管理を 1 つの基盤で提供します。

## 利用者向け導線

- 使い方ガイド: `/help`
- イベント一覧: `/event-list`
- 利用規約: `/terms`
- プライバシーポリシー: `/policy`

## 技術スタック

- Next.js (App Router)
- Better Auth
- Drizzle ORM
- Cloudflare D1
- OpenNext + Cloudflare Workers

## ローカル開発

```bash
npm install
npm run dev
```

### DB マイグレーション

```bash
npm run db:generate
npm run db:migrate:local
```

## 環境変数

最低限必要な環境変数は次の通りです。

```env
# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Invite
INVITE_TOKEN_PEPPER=
NEXT_PUBLIC_APP_URL=

# Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# SEO / Canonical URL
NEXT_PUBLIC_SITE_URL=
SITE_URL=
```

### 設定時の注意

- `BETTER_AUTH_URL` は本番の公開 URL と完全一致させる
- Google OAuth の許可済みリダイレクト URL は `BETTER_AUTH_URL` と整合させる
- `INVITE_TOKEN_PEPPER` は未設定時に `BETTER_AUTH_SECRET` を利用するが、運用では明示設定を推奨
- Push 通知は `NEXT_PUBLIC_VAPID_PUBLIC_KEY` と `VAPID_PRIVATE_KEY` のペアが必要

## Cloudflare / Wrangler 設定

`wrangler.jsonc` で D1 バインディング名が `DB` になっていることを確認してください。

- マイグレーションディレクトリ: `drizzle/migrations`
- D1 binding: `DB`

## 本番デプロイ

```bash
npm run deploy
```

プレビュー確認は次を使用します。

```bash
npm run preview
```

## 一般公開前チェックリスト

1. `/help`、`/terms`、`/policy` が公開状態で閲覧できる
2. ログイン、招待受諾、ロール別画面遷移が通る
3. 整理券発行・呼び出し・完了が想定通りに遷移する
4. 模擬店レジで在庫減算と売上ログが記録される
5. Push 通知の購読登録・通知送信・解除が動作する
6. サイトマップに公開ページが含まれている

## ドキュメント

- 統合マニュアル: `documents/gakusai-hub-unified-manual-ja.md`
- 仕様書: `documents/product-spec-ja.md`
- 管理ロールチェックリスト: `documents/admin-role-checklists-ja.md`
