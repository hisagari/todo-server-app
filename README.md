# ToDo Server App

Node.js + Express + EJS + Prisma + PostgreSQL で作った、サーバーサイドレンダリングの ToDo アプリです。

## できること

- `GET /` で ToDo 一覧を表示
- `POST /todos` で ToDo を追加
- `POST /todos/:id/toggle` で完了状態を切り替え
- `POST /todos/:id/delete` で ToDo を削除
- Prisma の `Todo` モデルで PostgreSQL に保存
- EJS で HTML をサーバー側レンダリング

## 必要なファイル

このアプリを動かすために必要な主なファイルは次の通りです。

```text
todo-server-app/
├─ server.js
├─ package.json
├─ package-lock.json
├─ .env.example
├─ .gitignore
├─ prisma.config.ts
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
│     └─ 20260607120000_init/
│        └─ migration.sql
├─ views/
│  └─ index.ejs
└─ public/
   └─ styles.css
```

`.env` はローカル環境用の秘密情報なので、Git にコミットしません。`.env.example` をコピーして作成してください。

確認した範囲では、アプリの起動に必要なファイルはそろっています。

## 事前に必要なもの

- Node.js 20.19 以上
- npm
- PostgreSQL のデータベース

Render にデプロイする場合は、Render PostgreSQL を作成しておくと簡単です。

## ローカルで起動する手順

1. 依存パッケージをインストールします。

```bash
npm install
```

PowerShell で `npm` が実行ポリシーに止められる場合は、代わりに次のように実行できます。

```powershell
npm.cmd install
```

2. `.env.example` を参考に `.env` を作ります。

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
PORT=3000
```

`PORT` はローカル起動用です。Render では自動で `PORT` が設定されるため、Render 側で手動設定しなくても動きます。

3. Prisma Client を生成します。

```bash
npx prisma generate
```

PowerShell で止まる場合:

```powershell
npx.cmd prisma generate
```

4. データベースにテーブルを作成します。

初回開発環境では、次のコマンドを使えます。

```bash
npx prisma migrate dev
```

すでにある migration をそのまま適用したい場合は、次のコマンドでも大丈夫です。

```bash
npm run prisma:migrate
```

5. 開発サーバーを起動します。

```bash
npm run dev
```

PowerShell で止まる場合:

```powershell
npm.cmd run dev
```

ブラウザで次を開きます。

```text
http://localhost:3000
```

## npm scripts

```json
{
  "dev": "nodemon server.js",
  "start": "node server.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate deploy"
}
```

## Prisma モデル

`prisma/schema.prisma` に `Todo` モデルがあります。

```prisma
model Todo {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

## Render にデプロイする手順

1. Render で PostgreSQL を作成します。
2. Web Service を作成し、このリポジトリを接続します。
3. Environment Variables に `DATABASE_URL` を追加します。
   `PORT` は Render が自動で設定するため、通常は追加しなくて大丈夫です。
4. Build Command に次を設定します。

```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

5. Start Command に次を設定します。

```bash
npm start
```

Render PostgreSQL の External Database URL を使う場合、このアプリは接続先に `render.com` が含まれていれば SSL を有効にします。

## 補足

- `.env` は `.gitignore` に入っているため、Git に含めません。
- Prisma 7 に合わせて `@prisma/adapter-pg` と `pg` を使っています。
- 画面は `views/index.ejs`、CSS は `public/styles.css` に分けています。
