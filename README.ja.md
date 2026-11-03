# Rinder: ResearchMatch

[English](README.md) | **日本語**

## プロジェクト概要

Rinder は、ISSE の学生と研究者の研究参加や連携を支援するプラットフォームです。研究プロジェクトの募集情報やアンケートを一か所で公開し、参加者とのやり取りを効率化することで、研究参加者の募集に伴う課題の解決を目指しています。また、1・2年生が3年次の研究室選択に向けて準備できるよう、ISSE 内で進められている研究を知り、フィードバックを提供しながら各研究室への理解を深める機会を提供します [1]。Rinder: ResearchMatch の主な目的は、参加者募集の効率化、学生の研究の認知度向上、そして ISSE 内での開かれた協力的な研究環境づくりです。PBL4 での実装範囲には、アンケートや研究募集投稿の作成・共有、アンケートへの回答、研究プロジェクトへの参加希望の登録、一覧・カレンダー形式での研究情報の閲覧が含まれます。今後は通知機能の拡充を予定しています。

## 最終レポート

要件、すべての図、実装の詳細、記録されたテスト結果、開発を通じて得た知見、参考文献、付録は、[Group J の最終レポート（英語）](docs/final-report.md)をご覧ください。ローカル環境の構築手順は、この README の後半に記載しています。

## 主な機能

- セッション認証によるアカウント登録、ログイン、ログアウト。
- 実験の一覧表示と、研究内容・参加条件の確認。
- 実験への参加登録と参加者一覧の表示。
- アンケートの閲覧、回答の送信、集計結果の確認。
- 実験やアンケートの募集情報の作成。
- アンケートと実験の情報を共通のカレンダーで表示。
- プロフィールページでの参加履歴の確認。

## 使用技術

| 構成 | 技術 |
| --- | --- |
| フロントエンド | React 18、React Router 6、Vite 5、CSS |
| バックエンド | Python、Flask、Flask-CORS、Flask-MySQLdb、Werkzeug |
| データベース | MySQL。付属のダンプファイルは MySQL 8 の照合順序の構文を使用しています。 |

## ディレクトリ構成

```text
src/                       メインの React アプリ、ページ、コンポーネント
backend/flask_app.py       メインのフロントエンドが使用する API
backend/rinder_*.sql       メインの API 用のテーブルダンプ
backend/requirements.txt   Python の依存パッケージ
backend/flask_backend/     別のバックエンド実装と SQL ダンプ
backend/old/               旧バージョンのテーブルダンプ
frontend/public/           別のフロントエンド実装
index.html                 Vite のエントリーページ
vite.config.js             Vite の設定
package.json               フロントエンドのスクリプトと依存パッケージ
package-lock.json          フロントエンドの依存関係を固定するロックファイル
docs/final-report.md       すべての図とテスト結果を含む最終レポート
docs/diagrams/             最終レポートに掲載された元の図
.env.example               ローカル環境向けのバックエンド設定テンプレート
```

プロジェクトのルートにあるフロントエンドと `backend/flask_app.py` を組み合わせて使用してください。別のフロントエンド・バックエンド実装は、この手順では使用しません。

### 必要な環境

- Vite 5 の要件を満たす Node.js 18 以降と npm。現在サポートされている Node.js の LTS バージョンを使用してください。
- `venv` と pip を利用できる Python 3。
- 起動済みの MySQL 8 互換サーバーと、ローカル開発用のデータベースアカウント。
- Flask-MySQLdb の依存パッケージである `mysqlclient` のインストールに必要な場合は、OS に対応した MySQL クライアント開発ライブラリ、コンパイラーなどのビルドツール、`pkg-config`。

以下のコマンドは、プロジェクトのルートディレクトリから実行してください。アプリケーション全体を動かすには、MySQL サーバーとローカル環境の設定が必要です。

### 1. フロントエンドの依存パッケージをインストール

```sh
npm ci
```

### 2. データベースを準備

ローカル開発専用のデータベース `rinder` を作成し、MySQL クライアントを使って以下のファイルを順番にインポートしてください。

1. `backend/rinder_users.sql`
2. `backend/rinder_students.sql`
3. `backend/rinder_professors.sql`
4. `backend/rinder_research_projects.sql`
5. `backend/rinder_survey.sql`
6. `backend/rinder_survey_questions.sql`
7. `backend/rinder_survey_responses.sql`
8. `backend/rinder_experiment_registrations.sql`

各ファイルのインポート例です。`YOUR_LOCAL_USER` は、ローカルのデータベースユーザー名に置き換えてください。

```sh
mysql -u YOUR_LOCAL_USER -p rinder < backend/rinder_users.sql
```

公開しているダンプファイルにはスキーマのみを含めており、エクスポートされたユーザー情報やサンプルデータは削除済みです。ただし、既存テーブルを削除・再作成する SQL が含まれるため、破棄しても問題のない開発用データベースにのみインポートしてください。`backend/flask_backend/rinder.sql` の別スキーマや、旧バージョンのダンプファイルと混在させないでください。

アプリケーション用のデータベースアカウントに `rinder` へのアクセス権限を付与してください。バックエンドの接続ユーザー名は、デフォルトでは `rinder` です。以下の設定で変更できます。

### 3. バックエンドをインストール・設定

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r backend/requirements.txt
cp .env.example .env
```

`.env` にデータベースの認証情報を設定し、`FLASK_SECRET_KEY` に空でない値を指定してください。新しいセッション署名キーは、ローカル環境で以下のように生成できます。

```sh
python -c 'import secrets; print(secrets.token_hex(32))'
```

| 環境変数 | 用途 | デフォルト値 |
| --- | --- | --- |
| `MYSQL_HOST` | データベースのホスト名 | `localhost` |
| `MYSQL_USER` | ローカルのデータベースアカウント | `rinder` |
| `MYSQL_PASSWORD` | データベースアカウントのパスワード | 必須 |
| `MYSQL_DB` | データベース名 | `rinder` |
| `FLASK_SECRET_KEY` | セッション署名キー | 必須・空でない値 |

バックエンドは環境変数を読み取りますが、`.env` ファイルを自動では読み込みません。API を起動する前に、シェルでファイルを読み込んでください。シェルの特殊文字を含む値は引用符で囲んでください。`.env` は Git の追跡対象から除外されています。認証情報を含むため、公開しないでください。

API を起動します。

```sh
set -a
. ./.env
set +a
python backend/flask_app.py
```

API はポート **8080** で動作します。この開発用の起動方法では、Flask のデバッグモードが有効になります。

### 4. フロントエンドを起動

別のターミナルを開き、プロジェクトのルートディレクトリから実行します。

```sh
npm run dev -- --port 5173 --strictPort
```

フロントエンドには、ホスト名 `localhost`、ポート **5173** でアクセスしてください。API は、このフロントエンドのオリジンに限って、認証情報（Cookie）付きの CORS リクエストを許可しています。また、フロントエンドの API リクエスト先は、コード内で `http://localhost:8080` に固定されています。

クラウド上のリモート開発環境を使用する場合、これらの `localhost` はブラウザーが動作している端末自身を指します。リモート環境にブラウザーからアクセスするには、適切なポート転送、または API の URL と CORS 設定の変更が必要です。

## ビルドと動作確認

```sh
npm run build
npm run preview
```

ビルドコマンドは、フロントエンドのファイルを `dist/` に生成します。プレビューはビルド済みのフロントエンドを配信するもので、Flask や MySQL は起動しません。

ルートの `package.json` には、自動テスト、lint、型チェック用のスクリプトは定義されていません。MySQL と Flask を起動した状態で、以下のコマンドにより API の基本的な疎通を確認できます。

```sh
curl --fail http://localhost:8080/api/projects
```

正常に動作すれば、実験の一覧が JSON 形式で返されます。フロントエンドのビルド成功だけでは、データベースへの接続、認証、研究への参加に関する一連の動作は確認できません。アプリケーション全体の動作を確認する際は、アカウント登録、ログイン、実験への参加登録、アンケートへの回答送信、カレンダー表示、プロフィールの参加履歴を手動で確認してください。
