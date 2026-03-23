# みきのタスク管理アプリ

## セットアップ手順

### Step 1: Notion インテグレーション作成

1. https://www.notion.so/my-integrations にアクセス
2. 「新しいインテグレーション」をクリック
3. 名前を「タスク管理アプリ」にして作成
4. 「インテグレーショントークン」をコピーしておく
5. Notionの「📋 タスク管理」ページを開く
6. ページ右上「...」→「接続」→作ったインテグレーションを追加

### Step 2: Anthropic API Key 取得

1. https://console.anthropic.com/ にアクセス
2. 「API Keys」→「Create Key」
3. キーをコピー

### Step 3: GitHub にアップロード

1. https://github.com にアクセスしてログイン（アカウントがなければ作成）
2. 「New repository」で新しいリポジトリを作成（名前: task-manager）
3. このフォルダをGitHubにアップロード

### Step 4: Vercel にデプロイ

1. https://vercel.com にアクセスしてGitHubでサインイン
2. 「Add New Project」→ GitHubのリポジトリを選択
3. 「Environment Variables」に以下を追加:
   - `NOTION_TOKEN` = Step1のトークン
   - `NOTION_TASKS_DB_ID` = `563017e2bf564fb9b3fcbfb348b8e51c`
   - `NOTION_PROJECTS_DB_ID` = `6679542bf9384c43832896b0e0b77e50`
   - `ANTHROPIC_API_KEY` = Step2のAPIキー
4. 「Deploy」をクリック
5. デプロイ完了後、URLが発行される（例: task-manager-miki.vercel.app）

### Step 5: iPhoneに追加

1. iPhoneのSafariでデプロイされたURLを開く
2. 下のシェアボタン →「ホーム画面に追加」
3. アプリとして使える！

---

## Notion データベース ID (変更不要)

- タスクDB: `563017e2bf564fb9b3fcbfb348b8e51c`
- プロジェクトDB: `6679542bf9384c43832896b0e0b77e50`
