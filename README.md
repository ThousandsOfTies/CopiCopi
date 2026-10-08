# CopiCopi

PDFや画像のお手本を見ながら模写し、AIの先生と上達を振り返るイラスト練習アプリです。

[CopiCopiを開く](https://thousandsofties.github.io/CopiCopi/)

## 主な機能

- お手本のA面と描画用のB面を切り替え・左右分割して表示。
- ペン・筆・消しゴム・文字入力・レイヤー・Undoで描画。
- A/Bの画面をAIへ送り、形・比率・雰囲気などのフィードバックを取得。
- 先生の選択と、作品・評価を保存するProgress。
- Googleログイン、Premiumの課金連携、日本語・英語表示。

PDFや作品は主に端末内のIndexedDB `CopiCopiDB` に保存します。AI評価にはネットワーク接続が必要です。

## 構成

このメタリポジトリが、Gitサブモジュールの使用コミットとビルド・公開を管理します。

| 場所 | 役割 |
|---|---|
| `repos/copicopi-app` | CopiCopiのフロントエンド |
| `repos/copicopi-app/server` | CopiCopi専用のExpress API |
| `repos/home-teacher-common` | 共通UI・PDF表示・保存・認証 |
| `repos/drawing-common` | 描画基盤 |

API・Firebase・課金設定はCopiCopi専用です。TutoTuto・DoriDoriの共有APIとは別に管理します。

## ローカル開発

Node.js 20（CIと同じ）、npm、Gitを使用します。Makeの利用にはGNU MakeとUnix系シェルが必要です。

```bash
git clone --recurse-submodules https://github.com/ThousandsOfTies/CopiCopi.git
cd CopiCopi
make setup
```

[フロントの設定例](https://github.com/ThousandsOfTies/copicopi-app/blob/main/.env.example) を参考に `repos/copicopi-app/.env.local`、[APIの設定例](https://github.com/ThousandsOfTies/copicopi-app/blob/main/server/.env.example) を参考に `repos/copicopi-app/server/.env` を用意します。
フロントの `VITE_API_URL` は `http://localhost:3003` のようなベースURLとし、末尾に `/api` を付けません。APIキーはサーバー側に設定します。

別々のターミナルで起動します。

```bash
make dev         # フロント: http://localhost:3000
make dev-server  # API: http://localhost:3003
```

Makeなしの場合は、描画・共通UI・アプリ・アプリ内の `server` で `npm install`、描画で `npm run build` を実行します。
以降はアプリ内の `npm run dev` / `npm run dev:server` で起動できます。PowerShellで `npm.ps1` が拒否される場合は `npm.cmd` を使用します。

`make build` でフロントとAPIをビルドします。アプリ内では `npm run typecheck` と `npm test`、ビルド後は `npm run test:bundle` で確認できます。

## 更新・公開

サブリポジトリを先にcommit・pushし、その後このリポジトリのgitlinkを更新します。手順と翻訳ルールは [AGENTS.md](AGENTS.md) を参照してください。
`make init` は固定コミットを復元し、`make update` は追従ブランチへ進めます。gitlink更新前の検証は各サブリポジトリで直接行います。

このリポジトリの `main` へのpushでGitHub Pagesへ公開します。Cloud Run APIは別途公開します。
接続先はRepository variable `COPICOPI_API_URL`、Firebase設定は `COPICOPI_FIREBASE_*` で指定します。
詳しくは [デプロイガイド](.agent/workflows/deployment.md)、課金・独立化の作業履歴は [HANDOVER.md](HANDOVER.md) を参照してください。
