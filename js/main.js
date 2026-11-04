/**
 * config.js の内容をページに反映するスクリプト
 * （通常は編集不要です）
 */
(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var trim = function (v) { return typeof v === "string" ? v.trim() : ""; };

  /* ---------- 氏名 ---------- */
  var name = trim(config.name);
  var nameEn = trim(config.nameEn);
  if (name) {
    document.querySelectorAll("[data-name]").forEach(function (el) { el.textContent = name; });
  }
  document.querySelectorAll("[data-name-en]").forEach(function (el) { el.textContent = nameEn; });
  // ヘッダー・フッターのロゴ部分：ローマ字があればローマ字、なければ氏名
  document.querySelectorAll("[data-brand]").forEach(function (el) {
    if (nameEn) {
      el.textContent = nameEn;
      el.setAttribute("lang", "en");
    } else if (name) {
      el.textContent = name;
    }
  });

  /* ---------- 顔写真 ---------- */
  var photo = trim(config.photo);
  var photoEl = document.querySelector("[data-photo]");
  // サイト内の画像（assets/... などの相対パス）だけを許可する
  var isLocalPath = /^(?!\/\/)(?![a-z][a-z0-9+.-]*:)[\w\-./]+$/i.test(photo) && photo.indexOf("..") === -1;
  if (photoEl && photo && isLocalPath) {
    photoEl.src = photo;
    photoEl.alt = (name || "") + "のプロフィール写真";
  }

  /* ---------- メールボタン ---------- */
  var email = trim(config.email);
  var mailBtn = document.querySelector("[data-mail]");
  var mailNote = document.querySelector("[data-mail-note]");
  // チェック：メールアドレスに使える文字だけで、かつ example.com などの例示用アドレスでないこと
  // （「?」「&」などを含むと、CC・BCCなどの宛先を勝手に追加できてしまうため不可）
  var isValidEmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(email) && !/@example\.(com|org|net|jp)$/i.test(email);
  if (mailBtn && isValidEmail) {
    var subject = trim(config.mailSubject);
    mailBtn.href = "mailto:" + email + (subject ? "?subject=" + encodeURIComponent(subject) : "");
    mailBtn.classList.remove("is-disabled");
    mailBtn.removeAttribute("aria-disabled");
    mailBtn.removeAttribute("role");
    if (mailNote) mailNote.textContent = "メールアプリが起動します（宛先：" + email + "）";
  }

  /* ---------- 動画制作実績 ---------- */
  var worksRoot = document.querySelector("[data-works]");
  var works = Array.isArray(config.works) ? config.works : [];

  // YouTubeのURLから動画IDを取り出す（watch / youtu.be / shorts / embed に対応）
  // https で始まる YouTube のURLだけを受け付ける（それ以外は「動画準備中」の表示になる）
  function getYouTubeId(url) {
    url = trim(url);
    if (!url) return "";
    var m = url.match(/^https:\/\/(?:(?:www\.|m\.)?youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#/]|$)/);
    return m ? m[1] : "";
  }

  // 表示形式：config の format を優先。未指定ならURLから判断（/shorts/ ならショート）
  function getFormat(work) {
    var f = trim(work.format).toLowerCase();
    if (f === "short" || f === "normal") return f;
    return /\/shorts\//.test(trim(work.url)) ? "short" : "normal";
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function createPlaceholder() {
    var box = el("div", "work-placeholder");
    var en = el("span", null, "Coming Soon");
    en.setAttribute("lang", "en");
    box.appendChild(en);
    box.appendChild(el("span", null, "動画準備中"));
    return box;
  }

  // 最初はサムネイル画像だけを表示し、タップされたら動画を読み込む（表示速度対策）
  function createPlayer(id, title) {
    var btn = el("button", "work-play");
    btn.type = "button";
    btn.setAttribute("aria-label", "動画を再生：" + (title || "制作実績"));

    var img = el("img");
    img.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
    img.alt = "";
    img.width = 480;
    img.height = 360;
    img.loading = "lazy";
    img.decoding = "async";
    btn.appendChild(img);
    btn.appendChild(el("span", "work-play-icon"));

    btn.addEventListener("click", function () {
      var iframe = el("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
      iframe.title = title || "制作実績の動画";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      // YouTubeは再生に「どのサイトから埋め込まれたか」の情報が必要なため、サイトのアドレスだけを渡す
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      btn.replaceWith(iframe);
      iframe.focus();
    });
    return btn;
  }

  if (worksRoot) {
    works.forEach(function (work, i) {
      work = work || {};
      var id = getYouTubeId(work.url);
      var title = trim(work.title);
      var format = getFormat(work);

      var card = el("article", "work reveal" + (format === "short" ? " work--short" : ""));
      var media = el("div", "work-media");
      media.appendChild(id ? createPlayer(id, title) : createPlaceholder());
      card.appendChild(media);

      var body = el("div", "work-body");
      var meta = el("p", "work-meta");
      var no = el("span", "work-no", "No." + String(i + 1).padStart(2, "0"));
      no.setAttribute("lang", "en");
      meta.appendChild(no);
      if (trim(work.type)) meta.appendChild(el("span", null, trim(work.type)));
      meta.appendChild(el("span", "work-format", format === "short" ? "縦型・ショート" : "横型・通常"));
      body.appendChild(meta);

      body.appendChild(el("h3", "work-title" + (title ? "" : " is-empty"), title || "タイトル準備中"));

      var tasks = Array.isArray(work.tasks) ? work.tasks.filter(trim) : [];
      if (tasks.length) {
        var dl = el("dl", "work-tasks");
        dl.appendChild(el("dt", null, "担当した編集内容"));
        var dd = el("dd");
        var ul = el("ul");
        tasks.forEach(function (t) { ul.appendChild(el("li", null, t)); });
        dd.appendChild(ul);
        dl.appendChild(dd);
        body.appendChild(dl);
      }

      if (id) {
        var link = el("a", "work-link", "YouTubeで見る");
        // 入力されたURLをそのまま使わず、取り出した動画IDから YouTube の正式なURLを作り直す
        link.href = "https://www.youtube.com/" + (format === "short" ? "shorts/" + id : "watch?v=" + id);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.appendChild(el("span", "arrow"));
        body.appendChild(link);
      }

      card.appendChild(body);
      worksRoot.appendChild(card);
    });
  }

  /* ---------- 料金 ---------- */
  var pricingRoot = document.querySelector("[data-pricing]");
  var pricing = config.pricing;

  // 見出し部分（番号・英字・日本語）を作る
  function createPriceHead(no, en, title, sub) {
    var head = el("div", "price-head");
    var noEl = el("p", "price-no", String(no).padStart(2, "0"));
    noEl.setAttribute("lang", "en");
    noEl.setAttribute("aria-hidden", "true");
    head.appendChild(noEl);
    var enEl = el("p", "price-en", en);
    enEl.setAttribute("lang", "en");
    enEl.setAttribute("aria-hidden", "true");
    head.appendChild(enEl);
    head.appendChild(el("h3", "price-title", title));
    if (sub) head.appendChild(el("p", "price-sub", sub));
    return head;
  }

  // 文章内の「\n」を改行にして追加する
  function appendLines(parent, text) {
    text.split("\n").forEach(function (line, i) {
      if (i > 0) parent.appendChild(el("br"));
      parent.appendChild(document.createTextNode(line));
    });
  }

  // 注記を作る。先頭が「※」なら「※」を分けて、2行目以降を本文の位置にそろえる
  function createNote(className, text) {
    var p = el("p", className);
    var m = trim(text).match(/^※\s*([\s\S]*)$/);
    if (!m) {
      appendLines(p, trim(text));
      return p;
    }
    p.classList.add("note-hang");
    var mark = el("span", "note-mark", "※");
    mark.setAttribute("aria-hidden", "true");
    p.appendChild(mark);
    var body = el("span", "note-body");
    appendLines(body, m[1]);
    p.appendChild(body);
    return p;
  }

  // 「15,000円〜」を数字と単位に分けて表示する（「別途お見積もり」などはそのまま）
  function createPriceValue(text) {
    var td = el("td", "price-value");
    var m = trim(text).match(/^([\d,]+)(.*)$/);
    if (!m) {
      td.appendChild(el("span", "price-text", text));
      return td;
    }
    var num = el("span", "price-num", m[1]);
    num.setAttribute("lang", "en");
    td.appendChild(num);
    td.appendChild(el("span", "price-unit", m[2]));
    return td;
  }

  function createPriceTable(plan) {
    var table = el("table", "price-table");
    var headers = plan.headers || [];
    var thead = el("thead");
    var headRow = el("tr");
    headers.forEach(function (h) {
      var th = el("th", null, h);
      th.scope = "col";
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = el("tbody");
    (plan.rows || []).forEach(function (row) {
      var tr = el("tr");
      tr.appendChild(el("td", "price-label", row[0]));
      tr.appendChild(createPriceValue(row[1]));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  if (pricingRoot && pricing) {
    if (trim(pricing.lead) || trim(pricing.description)) {
      var intro = el("div", "price-intro reveal");
      if (trim(pricing.lead)) intro.appendChild(el("p", "price-lead", pricing.lead));
      if (trim(pricing.description)) intro.appendChild(el("p", "price-desc", pricing.description));
      pricingRoot.appendChild(intro);
    }

    var plans = Array.isArray(pricing.plans) ? pricing.plans : [];
    plans.forEach(function (plan, i) {
      var group = el("article", "price-group reveal");
      group.appendChild(createPriceHead(i + 1, plan.en, plan.title, plan.sub));
      group.appendChild(createPriceTable(plan));
      pricingRoot.appendChild(group);
    });

    var rev = pricing.revision;
    if (rev) {
      var revGroup = el("article", "price-group reveal");
      revGroup.appendChild(createPriceHead(plans.length + 1, rev.en, rev.title));
      var revBody = el("div", "price-revision");
      var revMain = el("p", "price-revision-main");
      revMain.appendChild(document.createTextNode(rev.before || ""));
      revMain.appendChild(el("strong", null, rev.emphasis || ""));
      revMain.appendChild(document.createTextNode(rev.after || ""));
      revBody.appendChild(revMain);
      if (trim(rev.note)) revBody.appendChild(createNote("price-revision-note", rev.note));
      revGroup.appendChild(revBody);
      pricingRoot.appendChild(revGroup);
    }

    var priceNotes = Array.isArray(pricing.notes) ? pricing.notes.filter(trim) : [];
    if (priceNotes.length) {
      var notesBox = el("div", "price-notes reveal");
      if (trim(pricing.notesTitle)) notesBox.appendChild(el("h3", "price-notes-title", pricing.notesTitle));
      var notesList = el("ul");
      priceNotes.forEach(function (n) { notesList.appendChild(el("li", null, n)); });
      notesBox.appendChild(notesList);
      pricingRoot.appendChild(notesBox);
    }
  }

  /* ---------- AI活用・業務効率化のご案内（紹介サイトへのリンク） ---------- */
  var ai = config.ai || {};
  var aiUrl = trim(ai.url);
  var aiLink = document.querySelector("[data-ai-link]");
  var aiNote = document.querySelector("[data-ai-note]");
  // https で始まる正しいURLのときだけボタンを有効にする（暗号化されていない http や javascript: などは不可）
  var aiUrlOk = false;
  try { aiUrlOk = /^https:\/\/[^\s"'<>]+$/.test(aiUrl) && new URL(aiUrl).protocol === "https:"; } catch (e) { aiUrlOk = false; }
  if (aiLink && aiUrlOk) {
    aiLink.href = aiUrl;
    aiLink.target = "_blank";
    aiLink.rel = "noopener noreferrer";
    aiLink.classList.remove("is-disabled");
    aiLink.removeAttribute("aria-disabled");
    aiLink.removeAttribute("role");
    aiLink.setAttribute("aria-label", "AI活用・業務効率化関連はこちら（新しいタブで開きます）");
    if (aiNote) aiNote.textContent = "";
  }

  /* ---------- スクロールで静かに表示 ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-shown");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    reveals.forEach(function (r) { revealObserver.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("is-shown"); });
  }

  /* ---------- 画面下メニュー：表示中のセクションに印を付ける ---------- */
  var dockLinks = document.querySelectorAll(".dock a");
  if ("IntersectionObserver" in window && dockLinks.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        dockLinks.forEach(function (a) {
          if (a.getAttribute("href") === "#" + entry.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    // ファーストビュー（idなし）が見えているときは、どれにも印を付けない
    document.querySelectorAll("main > section").forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- 日本語の改行位置を整える（BudouX） ----------
     単語や意味のまとまりの途中で改行されないよう、区切り位置にだけ改行の候補を入れる。
     動画タイトルや料金表など、上で作った部分も含めてページ全体に適用する。 */
  if (window.BudouXJa) {
    ["main", ".site-footer"].forEach(function (sel) {
      var root = document.querySelector(sel);
      if (!root) return;
      window.BudouXJa.applyToElement(root);
      // 英単語・数字の途中（例：YouTub|e）に入った区切りは取り除く
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      var node;
      while ((node = walker.nextNode())) {
        if (node.data.indexOf("​") === -1) continue;
        node.data = node.data.replace(/([A-Za-z0-9])​(?=[A-Za-z0-9])/g, "$1");
      }
    });
  }

  /* ---------- フッターの年 ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
