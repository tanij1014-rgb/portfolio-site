/**
 * 記入例（サンプル）— このファイルはサイトでは読み込まれません。
 * 書き方の参考にして、config.js のほうを編集してください。
 * 下記の氏名・アドレス・URLはすべて架空の例です。
 * 料金（pricing）の書き方は config.js の内容をそのまま参考にしてください。
 */
window.SITE_CONFIG = {
  name: "山田 太郎",
  nameEn: "Taro Yamada",
  photo: "assets/images/profile.jpg",
  email: "info@example.com",
  mailSubject: "【お問い合わせ】動画編集について",
  works: [
    {
      // 横型（通常）の例
      url: "https://www.youtube.com/watch?v=XXXXXXXXXXX",
      format: "normal",
      title: "（動画のタイトル）",
      type: "ビジネス系YouTube動画",
      tasks: ["カット編集", "テロップ", "演出", "BGM・効果音", "サムネイル制作"],
    },
    {
      // 縦型（ショート）の例
      url: "https://youtube.com/shorts/XXXXXXXXXXX",
      format: "short",
      title: "（動画のタイトル）",
      type: "ビジネス系ショート動画",
      tasks: ["カット編集", "テロップ", "演出", "BGM・効果音"],
    },
  ],
};
