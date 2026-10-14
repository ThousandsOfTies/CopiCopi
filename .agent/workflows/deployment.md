---
description: CopiCopiのGitHub Pages・API構成とローカル起動
---

# CopiCopi デプロイガイド

## フロントエンド

公開設定先は `https://thousandsofties.github.io/CopiCopi/`。
`.github/workflows/deploy.yml` が `main` のpush、または手動実行で動く。
GitHub PagesのSourceにはGitHub Actionsを使用する。

1. 固定済みサブモジュールを再帰的にcheckout。
2. Node.js 20とnpmで `make install`。
3. `make build` でビルド。
4. `repos/copicopi-app/dist` をPagesの成果物として公開。

`COPICOPI_API_URL` と `COPICOPI_FIREBASE_*` のRepository variablesがビルドへ渡る。
これらは専用のCopiCopi環境を指すこと。

サブモジュールの変更は [更新手順](deployment-workflow.md) に従い、子のpush後にメタのgitlinkを更新する。
PWAは `registerType: 'prompt'` であり、更新通知から適用する。AI採点はオフラインでは利用できない。

## APIサーバー

CopiCopi専用のExpress APIは `repos/copicopi-app/server` にある。
そのディレクトリをCloud Runのビルドコンテキストにする。

```bash
cd repos/copicopi-app/server
npm run build
npm run deploy
```

環境変数・Secret Manager・サービスアカウントの要件は [API README](../../repos/copicopi-app/server/README.md) を参照。
Google Cloud CLI 587.0.0以降を使用し、アプリの変更をcommit・pushしてから実行する。
`server/cloudbuild.yaml` の `workerRelease: regular` でビルドし、成功したイメージのSHA256ダイジェストを既存サービスへ公開する。
作成したリビジョンへ通信の100%と既存タグURLを切り替える。旧リビジョンへ通信やタグが固定されていても、今回のAPI保護を迂回する経路を残さない。
Docker BuildKitが対応しない `docker build --network cloudbuild` を生成する `gcloud run deploy --source` は使わない。
上のコマンドは既存サービスの構成を使うコード更新用。新規環境では認証・CORS・シークレットを設定する。
Cloud Runを変更せずにビルドだけ確認するには `npm run deploy -- --build-only` を使う。
ヘルスチェックは `GET /health`。
認証必須化の公開時は、トークンを送信するフロントを先にPagesへ公開してからAPIを更新する。公開後は採点への未認証リクエストが401になることも確認する。
専用Firebaseの `users/{uid}` に課金情報を保存する。旧 `entitlements.copicopi` 方式ではない。
[HANDOVER.md](../../HANDOVER.md) は作業時点の履歴であり、課金のテスト完了・本番有効化状態は別途確認する。

APIベースURL末尾に `/api` を付けない。フロントが各エンドポイントのパスを付加する。

## ローカル起動

メタで初回 `make setup` 後、別ターミナルで実行：

```bash
make dev
make dev-server
```

フロントは既定 `http://localhost:3000`、APIは `http://localhost:3003`。
フロントの設定は `repos/copicopi-app/.env.local`。
API設定は `repos/copicopi-app/server/.env`。フロント・APIそれぞれの `.env.example` を参照する。
`VITE_API_URL=http://localhost:3003` と必要な `VITE_FIREBASE_*` を設定する。
秘密キーを `VITE_*` として公開しない。

ログは起動ターミナルに出力される。接続に失敗したら、API起動・ベースURL・CORS・Firebaseプロジェクトの対応を確認する。
