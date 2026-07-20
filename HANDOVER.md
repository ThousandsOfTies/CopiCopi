# CopiCopi 課金機能テスト・独立化 引き継ぎメモ

作成日: 2026-07-20
背景: codexの使用上限到達により、Cloud Runでの課金機能テスト作業をCopilotが引き継ぎ。
作業中に「CopiCopiをTutoTutoから完全に独立したアプリとしてリリースしたい」という方針が決まり、
Firebase/Firestore/Authを含めてTutoTuto/DoriDoriから完全分離する作業も実施した。

---

## 1. GitHubリポジトリ同期（最初の作業）

CopiCopi / TutoTuto / DoriDori の3メタリポジトリで、submoduleのgitlinkが古いままだったため更新・push済み。

| メタリポジトリ | 更新したsubmodule |
|---|---|
| CopiCopi | `copicopi-app`, `home-teacher-common` |
| TutoTuto | `home-teacher-common`, `tutotuto-app` |
| DoriDori | `doridori-app`, `home-teacher-common` |

すべて `main` ブランチにcommit・push済み。3リポジトリとも `working tree clean` の状態。

---

## 2. gcloud CLI 認証まわり（WSL特有の注意点）

- Windows側にインストールされた `gcloud`（`/mnt/c/Users/yasuchika/AppData/Local/Google/Cloud SDK/...`）をWSLのbashから呼び出しても、**認証情報の保存場所が異なる**ため「認証済みのはずなのに`gcloud auth login`していない扱いになる」問題が発生した。
  - Windows側の設定ディレクトリ: `/mnt/c/Users/yasuchika/AppData/Roaming/gcloud`
  - WSL側の設定ディレクトリ: `~/.config/gcloud`
- **対応**: Windows側で`gcloud init`/`gcloud auth login`を完了させたあと、以下のファイルをWSL側にコピーすることで解決した。
  ```bash
  cp -f "/mnt/c/Users/yasuchika/AppData/Roaming/gcloud/credentials.db" \
        "/mnt/c/Users/yasuchika/AppData/Roaming/gcloud/access_tokens.db" \
        "/mnt/c/Users/yasuchika/AppData/Roaming/gcloud/active_config" \
        "/mnt/c/Users/yasuchika/AppData/Roaming/gcloud/default_configs.db" \
        ~/.config/gcloud/
  cp -rf "/mnt/c/Users/yasuchika/AppData/Roaming/gcloud/configurations" ~/.config/gcloud/
  ```
- WSLから対話的な`gcloud auth login`を直接実行すると、ブラウザURLが正しく表示されない不具合があった（interop起因）。再認証が必要な場合は、上記コピー手順を使うか、Windows側ターミナルで作業すること。

### 関連プロジェクト一覧（`gcloud projects list`）
```
gen-lang-client-0345215684  888182670603   AI-LiveTalk
gen-lang-client-0406786160  1008861485507  PersonalityAnalyzer
gen-lang-client-0741299134  309662700748   MovieFactory
gen-lang-client-0809048670  958638932518   CopiCopi-API   ← CopiCopi専用
gen-lang-client-0940664817  777609839550   Default Gemini Project
history-app-premium         466107255470   History-App-Premium
hometeacher-api             736494768812   HomeTeacher-API ← TutoTuto/DoriDoriが使用（元々CopiCopiもここに間借りしていた）
```

---

## 3. Cloud Run 課金機能（Stripe）の有効化

CopiCopiのバックエンド（`copicopi-api`、asia-northeast1、プロジェクト`gen-lang-client-0809048670`）には
GEMINI_API_KEYしか設定されておらず、Stripe関連の環境変数が未設定だった（`503 Stripe is not configured`になる状態）。

### 実施した内容
- Secret Managerに以下を新規作成し、ローカルの`repos/copicopi-app/server/.env`の値（Stripeテストモードキー）を登録:
  - `copicopi-stripe-secret-key`
  - `copicopi-stripe-price-id`
  - `copicopi-stripe-webhook-secret`
- Cloud RunサービスアカウントSA（`958638932518-compute@developer.gserviceaccount.com`）に各Secretの`roles/secretmanager.secretAccessor`を付与
- `gcloud run services update copicopi-api --update-secrets=...` でリビジョン`copicopi-api-00002-gll`をデプロイ、Stripe設定を反映

### 確認済み事項
- Stripe側Webhookエンドポイント（`we_1Tv9AfRqBTirGmjla5yzMZg1`）は既に`https://copicopi-api-958638932518.asia-northeast1.run.app/api/webhooks/stripe`を指しており、`enabled`状態。イベントは`checkout.session.completed` / `customer.subscription.updated` / `customer.subscription.deleted` / `invoice.payment_succeeded`。
- Stripe Price（`price_1Tv92eRqBTirGmjlFEnYVrlH`）は有効、月額500円(JPY)のサブスクリプション。
- `/api/create-checkout-session`への無認証POSTで`401 Unauthorized`（Stripe未設定エラーではない）を確認済み。

---

## 4. CopiCopiのFirebase/Firestore完全独立化

「TutoTutoから作ったアプリだが別物としてリリースしたい」という方針に基づき、
それまでTutoTuto/DoriDoriと共有していた`hometeacher-api`Firebaseプロジェクトから、
**CopiCopi専用のFirebase環境（Cloud Runと同じ`gen-lang-client-0809048670`プロジェクト内）に完全移行した。**

### 実施した内容（すべて完了済み）
1. `gen-lang-client-0809048670`にFirebaseを追加（Firebase Management API `:addFirebase`）
2. Firestore（Nativeモード、`asia-northeast1`）を新規作成
3. Firebase Web App を新規登録
   - `appId`: `1:958638932518:web:647ba1a754fae370701ce7`
   - `apiKey`: `AIzaSyDbotvFCv-c-OfK4gVwCdY9CtQZdlTS8_Q`
   - `authDomain`: `gen-lang-client-0809048670.firebaseapp.com`
   - `storageBucket`: `gen-lang-client-0809048670.firebasestorage.app`
   - `messagingSenderId` / `projectNumber`: `958638932518`
4. GitHub Actionsのリポジトリ変数（`ThousandsOfTies/CopiCopi`）を上記の値に更新済み:
   - `COPICOPI_FIREBASE_API_KEY`
   - `COPICOPI_FIREBASE_AUTH_DOMAIN`
   - `COPICOPI_FIREBASE_PROJECT_ID`
   - `COPICOPI_FIREBASE_STORAGE_BUCKET`
   - `COPICOPI_FIREBASE_MESSAGING_SENDER_ID`
   - `COPICOPI_FIREBASE_APP_ID`
   - （`COPICOPI_API_URL`は既存のCloud Run URLのまま変更なし）
5. Google Sign-Inプロバイダを有効化（**Firebase Consoleで手動対応**。APIでの自動有効化は
   「Project must belong to an organization」エラーで拒否されたため、個人アカウントのプロジェクトでは
   Firebase Console上での操作が必須と判明）
6. 認証済みドメインに`thousandsofties.github.io`を追加（Identity Toolkit Admin API）
7. Firestoreセキュリティルールを新規作成・リリース（Firebase Rules API）:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
   ※ `home-teacher-common/src/contexts/AuthContext.tsx`の`users/{uid}`ドキュメント読み書きパターンに合わせた最小限のルール。
   Cloud Run側（Admin SDK）はルールを無視してフルアクセスできるため、Stripe Webhookによる`entitlements`更新には影響しない。
8. GitHub Actionsのdeploy.ymlをworkflow_dispatchで2回再実行し、新しいFirebase設定でフロントを再ビルド・デプロイ済み

### 設計上の利点
- Cloud Run（`copicopi-api`）とFirebase/Firestoreが**同一GCPプロジェクト**になったため、
  以前懸念していた「Firebase Admin SDKがADCで別プロジェクト（`hometeacher-api`）のIDトークンを検証できない」
  というクロスプロジェクト問題も自動的に解消された。
- Stripeのキー・Price・Webhookはこの独立化以前から既にCopiCopi専用だったため変更不要。

---

## 5. 現在の状況（このメモ作成時点）

- ユーザーがGoogle Sign-Inでのログインには成功。
- ただし「ロックが外れない」→ ブラウザコンソールに`FirebaseError: Missing or insufficient permissions`。
  → **原因**: Firestore作成直後はデフォルトで全拒否ルールだったため。
  → **対応済み**: 上記4-7のFirestoreルールを作成・リリース済み。反映まで最大1分程度のラグがある可能性あり。

## 6. 次にやるべきこと（未完了・要確認）

1. **ユーザーに再度ブラウザをリロードしてもらい、`Missing or insufficient permissions`エラーが解消したか確認する。**
   - 解消しない場合は、新規作成された`users/{uid}`ドキュメントが実際に書き込めているか、
     Firebase Console → Firestore Database → `users`コレクションで確認する。
   - `request.auth.uid`とドキュメントIDが一致しているか、認証トークンのプロジェクトが正しいか
     （`gen-lang-client-0809048670`）も要確認。
2. Premiumボタン押下 → Stripe Checkout起動 → テストカード（`4242 4242 4242 4242`）で決済 →
   Webhook経由で`entitlements.copicopi.isPremium`が`true`になるかをEnd-to-Endで確認する。
3. 決済後に反映されない場合は、Cloud Runログを確認:
   ```bash
   gcloud run services logs read copicopi-api --region asia-northeast1 \
     --project gen-lang-client-0809048670 --limit 50
   ```
4. `Cross-Origin-Opener-Policy policy would block the window.closed call.` という警告がコンソールに出ているが、
   これはFirebase AuthのポップアップサインインでCOOPヘッダーが影響する既知の警告であり、
   通常はサインイン自体は成功する。動作に支障が出るようであれば、GitHub Pagesのレスポンスヘッダー
   （`Cross-Origin-Opener-Policy`）の調整や、`signInWithRedirect`への切り替えを検討する。
5. 本番運用に進める前に、Stripeを**本番モードキー**に切り替える作業が別途必要（現在はテストモードキーのみ設定）。
   その際はSecret Managerの3つのSecretに新しいバージョンを追加し、Stripeダッシュボードの本番Webhookも
   別途登録・`copicopi-stripe-webhook-secret`を更新すること。
6. 旧`hometeacher-api`プロジェクトに残っているCopiCopi関連の古いテストユーザー・entitlementsデータは、
   今回の独立化で使われなくなったので、必要であれば削除を検討（今回は「既存ユーザーはいない」との回答だったため未対応）。

---

## 7. 参考: 主要な識別子まとめ

| 項目 | 値 |
|---|---|
| Cloud RunサービスURL | `https://copicopi-api-958638932518.asia-northeast1.run.app` |
| GCPプロジェクト（Cloud Run + Firebase） | `gen-lang-client-0809048670`（表示名: CopiCopi-API、プロジェクト番号: 958638932518） |
| Cloud RunサービスアカウントSA | `958638932518-compute@developer.gserviceaccount.com` |
| Firestore | Native mode、`asia-northeast1` |
| Firebase Web App ID | `1:958638932518:web:647ba1a754fae370701ce7` |
| GitHubリポジトリ（フロント/Actions） | `ThousandsOfTies/CopiCopi` |
| Stripe Webhookエンドポイント | `we_1Tv9AfRqBTirGmjla5yzMZg1` |
| Stripe Price | `price_1Tv92eRqBTirGmjlFEnYVrlH`（月額500円） |
