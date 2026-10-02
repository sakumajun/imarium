# 北海道ライブカメラ拡充調査（2026-10-02）

既存 IM-0001〜IM-0046 と照合。下記は新規候補であり、**配信中・埋め込み可の検証前なので公開しない**。

| 候補 | 地域 | 情報源 | 検証項目 |
|---|---|---|---|
| 岩見沢駅中央口前（HBC） | 岩見沢市 | https://hokkaidodo.jp/live-camera/ | HBC公式の現行LIVE動画ID・channelId・埋め込み |
| いわみざわ公園バラ園（岩見沢市公式） | 岩見沢市 | https://hokkaidodo.jp/live-camera/ | 市公式配信の現行LIVE動画ID・channelId・埋め込み |
| 喜茂別町から見た羊蹄山 | 喜茂別町 | https://hokkaidodo.jp/live-camera/ | 既存ニセコの羊蹄山カメラと配信元・画角が異なるか確認 |
| 函館ベイエリア・金森赤レンガ倉庫（HBC） | 函館市 | https://hokkaidodo.jp/live-camera/ | 現行LIVE動画ID・channelId・埋め込み |
| きじひき高原（北斗市公式） | 北斗市 | https://hokkaidodo.jp/live-camera/ | 市公式配信の現行LIVE動画ID・channelId・埋め込み |
| 江差港（HBC） | 江差町 | https://hokkaidodo.jp/live-camera/ | 現行LIVE動画ID・channelId・埋め込み |
| 札幌・宮の森（ラジオカロス） | 札幌市 | https://www.live-tengoku.jp/hokkaido_b.html | 現行LIVE動画ID・channelId・埋め込み |
| 小樽運河（HBC） | 小樽市 | https://hokkaidodo.jp/live-camera/ | 現行LIVE動画ID・channelId・埋め込み |

## 公開ゲート
1. 公式配信元を直接確認し、現行YouTube LIVE URL/videoIdとchannelIdを取得。
2. 埋め込み許可、ライブ状態、所在地、既存cameraId/videoId重複を検証。
3. 検証済みのみ src/data/camera-candidates.json に登録し、既存の ingest と WINDOW HEALTH フローで追加。
4. 公開後も既存の1日2回チェックで後継LIVEを追跡。未検証候補は公開データに入れない。

## 追加検証結果（公式情報との照合）
- 岩見沢市公式 https://www.city.iwamizawa.hokkaido.jp/soshiki/johoseisakuka/ict/12208.html がYouTubeライブ3地点を案内。
- 市道南3線・南利根別川交差地点: https://youtube.com/live/XX3C94YMVTo は既存 IM-0038 と **videoId一致**。新規登録禁止。IM-0038 の表示名・所在地を別途公式と照合して改善候補。
- いわみざわ公園バラ園: https://www.youtube.com/live/OYMhRUP1AT4 は既存46件と videoId 非重複。**未検証候補**。YouTube APIで現在のLIVE、channelId、埋め込み許可を確認するまで cameras.json/camera-candidates.json に投入しない。
- 岩見沢市役所北村支所: https://youtube.com/live/gKUzyD2SAU4 は既存46件と videoId 非重複。**未検証候補**。同上。
- **利用条件注意**: 岩見沢市公式ページは無許可で他サイトへの映像転載を禁止と明記。通常のYouTube公式埋め込みが許可されるかを配信元に確認し、許可が確認できなければIMARIUM内再生ではなく公式ページへのリンク紹介のみ検討。
- HBC公式 https://www.hbc.co.jp/info-cam/ に函館ベイエリア・江差・小樽・岩見沢等があるが、各地点は独自配信/静止画像の可能性がある。YouTube動画IDを推測・創作しない。公式ページへのリンクと埋め込み可否を個別確認する。
- 現状: 公開追加 **0件**。安全な掲載条件を満たす新規LIVEは未確定。既存の自動公開フローは変更しない。
