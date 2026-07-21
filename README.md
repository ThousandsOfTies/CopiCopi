# CopiCopi

**見本を見ながら描き、AIの先生と一緒に振り返るイラスト練習アプリ**

CopiCopiは、PDFや画像のお手本をA面に表示し、B面へ模写していくブラウザベースの練習環境です。完成したA/B画面をGoogle Geminiへ送り、ピクセル単位の一致ではなく、シルエット・比率・ポーズ・雰囲気を中心にフィードバックします。

## 🎨 Launch

### **[CopiCopiをひらく →](https://thousandsofties.github.io/CopiCopi/)**

インストール不要で、PC・iPadなどのブラウザから利用できます。データは基本的に端末内のIndexedDBへ保存されます。

## ✨ 主な機能

### A/B左右表示の模写キャンバス

- A面にPDFのお手本、B面に描画キャンバスを表示
- A面とB面を個別にズーム・パン
- 現在見えているA/B画面をそのまま採点用画像としてキャプチャー
- お手本ページ内の別作例や説明文を評価対象にしないようAIへ指示

### 描画ツール

- えんぴつ・マーカー・筆
- くっきり（不透明）・水彩（半透明）
- マウスやペンの移動速度に応じて太さが変化する筆
- 消しゴム・Undo・全消去・テキスト入力
- 初期色は黒。選択中の描き味と透明度をツールバーアイコンへ反映

### AI先生による振り返り

| 先生 | 方針 | 利用状態 |
|---|---|---|
| KIND | よかった点を先に伝え、改善点を絞る | 常時利用可能 |
| BALANCED | よい点と改善点をバランスよく伝える | Premium向け |
| HARD | 形・比率・重心まで細かく確認する | Premium向け |

Teacher Settingsでは、利用可能な先生のON/OFFとデフォルト先生を設定できます。未解放の先生も選択メニューに薄く表示され、利用できるフィードバックスタイルを確認できます。

> Premiumの画面とロック制御は実装済みですが、Stripeによる正式課金はiPadでの動作確認後に有効化する予定です。

### Progress

採点結果を単なるログではなく、上達を振り返るポートフォリオとして保存します。

- 採点時のA/Bキャプチャー
- 練習日時・PDF名・挑戦回数
- 先生レベル・5段階評価
- よかったところ
- 次に直すポイント
- 次の一枚へのアドバイス

## 🖌️ 基本的な使い方

1. Admin画面からPDFまたは画像を取り込む
2. Enjoy画面で練習するページを開く
3. A面のお手本を見ながらB面へ描く
4. A/B面の位置と大きさを、比較したい状態へ調整する
5. 先生ボタンを押してフィードバックを受ける
6. Progressで過去の作品と改善点を振り返る

## 📦 リポジトリ構成

このリポジトリは、CopiCopiの統合・ビルド・デプロイを管理するメタリポジトリです。依存リポジトリはGit submoduleとして、使用するコミットを固定しています。

```text
CopiCopi/
├── .github/workflows/      # GitHub Pages自動デプロイ
├── Makefile                # 統合ビルド・開発コマンド
└── repos/
    ├── drawing-common/     # 描画共通ライブラリ
    ├── home-teacher-common/ # 共通UI・IndexedDB・認証
    └── copicopi-app/       # CopiCopi本体・APIサーバー
```

| リポジトリ | 説明 |
|---|---|
| [drawing-common](https://github.com/ThousandsOfTies/drawing-common) | Canvas描画の共通処理 |
| [home-teacher-common](https://github.com/ThousandsOfTies/home-teacher-common) | PDF・Admin・Progressなどの共通UI |
| [copicopi-app](https://github.com/ThousandsOfTies/copicopi-app) | CopiCopiフロントエンドとExpress API |

独立した`VERSIONS`ファイルは使用せず、メタリポジトリのgitlinkで各submoduleのコミットを管理します。

## 🚀 ローカル開発

### 初回セットアップ

```bash
git clone --recurse-submodules https://github.com/ThousandsOfTies/CopiCopi.git
cd CopiCopi
make setup
```

既存のチェックアウトでsubmoduleを初期化する場合：

```bash
git submodule update --init --recursive
```

### 開発サーバー

ターミナルを2つ使用します。

```bash
# フロントエンド（http://localhost:3000）
make dev

# CopiCopi API（http://localhost:3003）
make dev-server
```

APIサーバーの環境変数は`repos/copicopi-app/server/.env.example`、Firebaseを含むフロント設定は`repos/copicopi-app/.env.example`を参照してください。秘密情報をGitへコミットしないでください。

### よく使うコマンド

```bash
make setup      # submodule初期化・依存関係インストール・共通ライブラリビルド
make install    # 全リポジトリの依存関係をインストール
make build      # フロントエンドとAPIをビルド
make status     # メタ・全submoduleのGit状態を表示
make test       # 利用可能なテストを実行
make clean      # ビルド成果物を削除
```

## ☁️ デプロイ

### フロントエンド

`main`ブランチへpushすると、GitHub Actionsがsubmoduleを含めてビルドし、GitHub Pagesへ自動デプロイします。

- 公開先：<https://thousandsofties.github.io/CopiCopi/>
- Workflow：`.github/workflows/deploy.yml`

### APIサーバー

Express APIはGoogle Cloud Runで稼働しています。

- リージョン：`asia-northeast1`
- サービス：`copicopi-api`
- URL：<https://copicopi-api-958638932518.asia-northeast1.run.app>
- Gemini APIキー：Google Secret Managerで管理

GitHub ActionsのRepository variable `COPICOPI_API_URL` が、フロントエンドのAPI接続先として使用されます。

## 🔧 技術スタック

- React 18 + TypeScript
- Vite / vite-plugin-pwa
- PDF.js
- Canvas API / drawing-common
- IndexedDB
- Google Gemini 3.6 Flash
- Express
- Google Cloud Run / Secret Manager
- GitHub Actions / GitHub Pages

## 🔄 submoduleの更新

変更したsubmodule側を先にコミット・pushし、その後メタリポジトリでgitlinkを更新します。

```bash
cd repos/copicopi-app
git checkout main
git pull --ff-only

cd ../..
git add repos/copicopi-app
git commit -m "Update CopiCopi app"
git push
```

`make update`は各submoduleを`.gitmodules`で指定したブランチの最新コミットへ移動します。内容を確認してからgitlinkをコミットしてください。

## 🆘 Issues

- [CopiCopi全体・デプロイ](https://github.com/ThousandsOfTies/CopiCopi/issues)
- [CopiCopiアプリ](https://github.com/ThousandsOfTies/copicopi-app/issues)
- [描画共通ライブラリ](https://github.com/ThousandsOfTies/drawing-common/issues)
