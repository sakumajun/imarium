export type InformationCategory = 'NEWS' | 'UPDATE' | 'MAINTENANCE';

export interface InformationItem {
  slug: string;
  title: string;
  date: string;
  category: InformationCategory;
  summary: string;
  body: string[];
}

export const information: InformationItem[] = [
  {
    slug: '2026-09-30-launch',
    title: 'IMARIUMを公開しました',
    date: '2026-09-30',
    category: 'NEWS',
    summary: '日本各地の「今」をライブ映像で探索するIMARIUMを公開しました。',
    body: [
      'IMARIUMを公開しました。',
      'IMARIUMは、日本各地のライブカメラを地図から探し、その場所の現在の風景をリアルタイムで眺めるためのサイトです。',
      'まずは北海道エリアからスタートし、掲載エリアやライブカメラを順次拡充していきます。',
      '今後の機能追加やメンテナンスなどのお知らせは、このINFORMATIONでご案内します。',
    ],
  },
];

export const latestInformation = [...information]
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 3);
