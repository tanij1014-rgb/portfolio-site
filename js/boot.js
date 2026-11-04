/**
 * JavaScriptが動く環境であることをCSSに伝える（スクロール時の表示演出用）
 * セキュリティ設定（CSP）でページ内に直接書いたスクリプトを禁止しているため、別ファイルにしています。
 */
document.documentElement.classList.add("js");
