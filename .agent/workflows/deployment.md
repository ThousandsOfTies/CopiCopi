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
gcloud run deploy copicopi-api --source . --project gen-lang-client-0809048670 --region asia-northeast1
```

環境変数・Secret Manager・サービスアカウントの要件は [API README](../../repos/copicopi-app/server/README.md) を参照。
上のコマンドは既存サービスの構成を使うコード更新用。新規環境では認証・CORS・シークレットを設定する。
ヘルスチェックは `GET /health`。
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
