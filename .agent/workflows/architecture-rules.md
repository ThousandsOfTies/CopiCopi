---
description: CopiCopiの現在の構成・依存管理・データ互換性
---

# CopiCopi アーキテクチャルール

## 修正先と依存管理

このメタリポジトリは `repos/copicopi-app`、`repos/home-teacher-common`、`repos/drawing-common` をGitサブモジュールとして管理する。
定義は `.gitmodules`、使用コミットはgitlinkに記録する。`VERSIONS` は使用しない。

- アプリ固有の修正は `repos/copicopi-app`。
- 共通UI・保存・認証は `repos/home-teacher-common`。描画基盤は `repos/drawing-common`。
- サブモジュール内で状態を確認し、編集前に作業ブランチを選ぶ。共通修正の反映先は `main`。
- 変更したサブリポジトリの検証・commit・pushを先に済ませ、次にメタの該当gitlinkをcommit・pushする。
- サブモジュールを `.gitignore` で除外しない。ソースは子リポジトリ、コミット参照は親リポジトリが追跡する。

## APIと認証

フロントは `.github/workflows/deploy.yml` のRepository variable `COPICOPI_API_URL` を `VITE_API_URL` として使用する。
Firebaseも `COPICOPI_FIREBASE_*` からビルドへ渡す。CopiCopiは独立したAPI・Firebaseプロジェクトを使用する。
API実装は `repos/copicopi-app/server/src/index.ts`。

`VITE_API_URL` は `/api` を付けないベースURL。エンドポイント側で `/api/grade-work` などを追加する。
接続先変更時はデプロイ設定、クライアント、サーバーのCORS、Firebaseプロジェクトの対応を確認する。
旧HomeTeacherのURLや他アプリの接続設定に置き換えない。

## 保存・互換性

IndexedDB名は `CopiCopiDB`。共通ライブラリの既定値 `TutoTutoDB` を各アプリのVite設定で指定・上書きする。
DBは同一オリジン内でURLパスごとには分かれないため、派生アプリのDB名を統一しない。
DB名・スキーマ変更は既存データの移行と後方互換性を確認する。

認証と課金情報は専用Firebaseプロジェクトを使用する。
現行APIとAuthContextは `users/{uid}` の `isPremium`、`stripeCustomerId` 等を使用し、
旧構成の `entitlements.copicopi` は使用しない。TutoTutoのFirebaseを流用すると状態を共有してしまう。

## ビルドと検証

Vite/TypeScriptエイリアスは `../home-teacher-common/src` と `../drawing-common/src` を参照する。
絶対パスを埋め込まない。ビルド設定の変更は本番ビルドで検証する。
採点プロンプト・応答の変更は、クライアントのパースとの互換性も確認する。
`make build` 等は `init` に依存するので、gitlink更新前のコミットはサブリポジトリ内で直接検証する。

運用の詳細は [デプロイガイド](deployment.md) と [更新手順](deployment-workflow.md) を参照。
