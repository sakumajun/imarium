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
