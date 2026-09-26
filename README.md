# IMARIUM

**日本の「今」を、見にいこう。**

IMARIUMは、日本各地のライブカメラをインタラクティブに探索・視聴するWebサービスです。

## Core experiences
- EXPLORE — 日本 → 地域 → 都市 → WINDOW → LIVE
- MY WINDOWS — お気に入りから直接視聴
- MULTI VIEW — PC最大9画面の同時視聴
- MY SETS — 複数WINDOW構成の保存
- WINDOW HEALTH SYSTEM — 1日2回の自動メンテナンス

## Data policy
`src/data/cameras.json` をライブカメラ情報のSingle Source of Truthとします。
ユーザーのお気に入りやMY SETSはYouTube URLではなく、永続的なIMARIUM `cameraId` を参照します。

## Development
```bash
npm install
npm run dev
```

カメラデータ検証:
```bash
npm run validate:cameras
```
