// ==UserScript==
// @name           Open the F**king URL Right Now
// @description    自动跳转某些网站不希望用户直达的外链
// @author         OldPanda
// @match          *://c.pc.qq.com/*
// @match          *://iphone.myzaker.com/zaker/link.php?*
// @match          *://link.zhihu.com/?*
// @match          *://t.cn/*
// @match          *://t.techlife.app/*
// @match          *://www.360doc.cn/outlink.html?*url=*
// @match          http://redir.yy.duowan.com/warning.php?*url=*
// @match          http://www.360doc.com/content/*
// @match          https://*.infoq.cn/link?*target=*
// @match          https://aiqicha.baidu.com/safetip?*target=*
// @match          https://www.aiqicha.com/safetip?*target=*
// @match          https://afdian.com/link?*target=*
// @match          https://afdian.net/link?*target=*
// @match          https://api.himcbbs.com/refer/?*url=*
// @match          https://ask.latexstudio.net/go/index?*url=*
// @match          https://atcoder.jp/jump?*url=*
// @match          https://bbs.acgrip.com/*
// @match          https://bbs.nga.cn/read.php?*
// @match          https://blog.51cto.com/transfer?*
// @match          https://blzxteam.com/gowild.htm?*url=*
// @match          https://cloud.tencent.com/developer/tools/blog-entry?*target=*
// @match          https://cnb.cool/110?*url=*
// @match          https://cnb.cool/goto?*url=*
// @match          https://developers.weixin.qq.com/community/middlepage/href?*href=*
// @match          https://developer.aliyun.com/redirect?*target=*
// @match          https://docs.qq.com/scenario/link.html?*u=*
// @match          https://docs.qq.com/scenario/link.html?*url=*
// @match          https://forum.mczwlt.net/outgoing?*url=*
// @match          https://gamebanana.com/linkfilter?*url=*
// @match          https://game.bilibili.com/linkfilter/?*url=*
// @match          https://gitee.com/link?*target=*
// @match          https://hd.nowcoder.com/link.html?*target=*
// @match          https://hellogithub.com/periodical/statistics/click?*target=*
// @match          https://jump2.bdimg.com/safecheck/index?*url=*
// @match          https://leetcode.cn/link/?*target=*
// @match          https://link.csdn.net/?*target=*
// @match          https://link.gitcode.com/?*target=*
// @match          https://link.juejin.cn/?*target=*
// @match          https://link.ld246.com/forward?*goto=*
// @match          https://link.logonews.cn/?*
// @match          https://link.mcmod.cn/target/*
// @match          https://link.uisdc.com/?*redirect=*
// @match          https://mail.qq.com/cgi-bin/readtemplate*
// @match          https://mp.weixin.qq.com/s/*
// @match          https://mp.weixin.qq.com/s?*
// @match          https://nga.178.com/read.php?*
// @match          https://open.work.weixin.qq.com/wwopen/uriconfirm?*uri=*
// @match          https://ref.gamer.com.tw/redir.php/url=*
// @match          https://ref.gamer.com.tw/redir.php?*url=*
// @match          https://shimo.im/outlink/black?*url=*
// @match          https://shimo.im/outlink/gray?*url=*
// @match          https://sspai.com/link?*target=*
// @match          https://steamcommunity.com/linkfilter/?*url=*
// @match          https://steamcommunity.com/linkfilter/?*u=*
// @match          https://support.qq.com/product/*/link-jump?*jump=*
// @match          https://support.qq.com/products/*/link-jump?*jump=*
// @match          https://t.me/iv?*url=*
// @match          https://tieba.baidu.com/mo/q/checkurl?*url=*
// @match          https://txc.qq.com/product/*/link-jump?*jump=*
// @match          https://txc.qq.com/products/*/link-jump?*jump=*
// @match          https://unsafelink.com/*
// @match          https://weibo.cn/sinaurl?*
// @match          https://weixin110.qq.com/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi*
// @match          https://wj.qq.com/s2/*
// @match          https://www.baike.com/redirect_link?*url=*
// @match          https://www.bilibili.com/york/link-middle-page*
// @match          https://www.bookmarkearth.com/view/*
// @match          https://www.chinaz.com/go.shtml?*url=*
// @match          https://www.coolapk.com/link?*url=*
// @match          https://www.curseforge.com/linkout?*remoteUrl=*
// @match          https://www.douban.com/link2/?*url=*
// @match          https://www.gcores.com/link?*target=*
// @match          https://www.google.com/url?*
// @match          https://www.iplaysoft.com/link/?*url=*
// @match          https://www.instagram.com/linkshim/?*u=*
// @match          https://www.jianshu.com/go-wild?*
// @match          https://www.kdocs.cn/etapps/query/link?*target=*
// @match          https://www.kookapp.cn/go-wild.html?*url=*
// @match          https://www.linkedin.com/safety/go?*url=*
// @match          https://www.luogu.com.cn/article/*
// @match          https://www.luogu.com.cn/discuss/*
// @match          https://www.luogu.com.cn/paste/*
// @match          https://www.mczwlt.net/go-external?*url=*
// @match          https://www.nodeseek.com/jump?*to=*
// @match          https://www.oschina.net/action/GoToLink?*url=*
// @match          https://www.pixiv.net/jump.php?*
// @match          https://www.qcc.com/web/transfer-link?*link=*
// @match          https://www.skland.com/third-link?*target=*
// @match          https://www.tianyancha.com/security?*target=*
// @match          https://www.xgw4.com/qqdl.html?*url=*
// @match          https://www.yuque.com/r/goto?*url=*
// @match          https://www.youtube.com/redirect?*
// @match          https://wx.mail.qq.com/xmspamcheck/xmsafejump?*
// @exclude        https://mp.weixin.qq.com/cgi-bin/*
// @version        1.14.8
// @run-at         document-idle
// @namespace      https://old-panda.com/
// @require        https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @license        GPLv3 License
// ==/UserScript==

// Generated by npm run build. Edit src/ instead.
(() => {
  // src/core/url.js
  function normalizeDestination(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    let target = value.trim();
    for (let i = 0; i < 3 && /^https?%(?:25)*3a/i.test(target); i++) {
      try {
        target = decodeURIComponent(target);
      } catch {
        return null;
      }
    }
    if (target.startsWith("//")) target = `https:${target}`;
    const hostWithPort = /^(?:localhost|(?:[a-z\d-]+\.)+[a-z\d-]+):\d+(?:[/?#]|$)/i.test(target);
    if (!/^[a-z][a-z\d+.-]*:/i.test(target) || hostWithPort) target = `https://${target}`;
    try {
      const url = new URL(target);
      return ["http:", "https:"].includes(url.protocol) && url.hostname ? target : null;
    } catch {
      return null;
    }
  }
  function getDestination(url, parameter, { base64 = false, decodeBase64 = atob } = {}) {
    let target = url.searchParams.get(parameter);
    if (!target) return null;
    if (base64) {
      try {
        target = decodeBase64(target);
      } catch {
        return null;
      }
    }
    return normalizeDestination(target);
  }
  function splitMultiURLs(text) {
    if (!/^https?:/.test(text)) return [];
    return (text.match(/https?:.*?(?=https?:|$)/g) ?? []).map((url) => url.replace(/[@:%_+~#?&=,$^*]+$/, "")).filter(Boolean);
  }

  // src/core/runner.js
  function matchesRule(url, rule) {
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const hosts = Array.isArray(rule.host) ? rule.host : [rule.host];
    if (!hosts.includes(url.hostname)) return false;
    if (rule.param && !url.searchParams.has(rule.param)) return false;
    if (rule.path instanceof RegExp) return rule.path.test(url.pathname);
    return url.pathname === rule.path;
  }
  function createContext(window2, $2, logger = console) {
    return {
      window: window2,
      document: window2.document,
      url: new URL(window2.location.href),
      $: $2,
      logger,
      navigate(value) {
        const target = normalizeDestination(value);
        if (!target) return false;
        window2.location.replace(target);
        return true;
      }
    };
  }
  function runRules(context, rules2) {
    for (const rule of rules2) {
      if (!matchesRule(context.url, rule)) continue;
      try {
        if (rule.param) {
          const target = getDestination(context.url, rule.param, {
            base64: rule.base64,
            decodeBase64: (value) => context.window.atob(value)
          });
          return target ? context.navigate(target) : false;
        }
        return rule.handler(context) !== false;
      } catch (error) {
        context.logger.warn(`[Open URL] ${rule.id} failed`, error);
        return false;
      }
    }
    return false;
  }

  // src/rules/query.js
  var queryRules = [
    { id: "aiqicha", host: "aiqicha.baidu.com", path: "/safetip", param: "target" },
    { id: "aiqicha_2", host: "www.aiqicha.com", path: "/safetip", param: "target" },
    { id: "afdian", host: "afdian.net", path: "/link", param: "target" },
    { id: "afdian2", host: "afdian.com", path: "/link", param: "target" },
    { id: "atcoder", host: "atcoder.jp", path: "/jump", param: "url" },
    { id: "baike", host: "www.baike.com", path: "/redirect_link", param: "url" },
    { id: "bilibiliYork", host: "www.bilibili.com", path: "/york/link-middle-page", param: "redirect_url" },
    { id: "chinaz", host: "www.chinaz.com", path: "/go.shtml", param: "url" },
    { id: "coolapk", host: "www.coolapk.com", path: "/link", param: "url" },
    { id: "csdn", host: "link.csdn.net", path: "/", param: "target" },
    { id: "cnb", host: "cnb.cool", path: "/goto", param: "url" },
    { id: "cnb2", host: "cnb.cool", path: "/110", param: "url" },
    { id: "dilian", host: "link.ld246.com", path: "/forward", param: "goto" },
    { id: "developeraliyun", host: "developer.aliyun.com", path: "/redirect", param: "target" },
    { id: "doc360_2", host: "www.360doc.cn", path: "/outlink.html", param: "url" },
    { id: "douban", host: "www.douban.com", path: "/link2/", param: "url" },
    { id: "gamebanana", host: "gamebanana.com", path: "/linkfilter", param: "url" },
    { id: "gamebilibili", host: "game.bilibili.com", path: "/linkfilter/", param: "url" },
    { id: "gamertw_2", host: "ref.gamer.com.tw", path: "/redir.php", param: "url" },
    { id: "gcores", host: "www.gcores.com", path: "/link", param: "target" },
    { id: "gitcode", host: "link.gitcode.com", path: "/", param: "target" },
    { id: "gitee", host: "gitee.com", path: "/link", param: "target" },
    { id: "google", host: "www.google.com", path: "/url", param: "q" },
    { id: "hellogithub", host: "hellogithub.com", path: "/periodical/statistics/click", param: "target" },
    { id: "himcbbs", host: "api.himcbbs.com", path: "/refer/", param: "url" },
    { id: "infoq", host: ["xie.infoq.cn", "www.infoq.cn"], path: "/link", param: "target" },
    { id: "instagram", host: "www.instagram.com", path: "/linkshim/", param: "u" },
    { id: "jianshu", host: "www.jianshu.com", path: "/go-wild", param: "url" },
    { id: "juejin", host: "link.juejin.cn", path: "/", param: "target" },
    { id: "kdocs", host: "www.kdocs.cn", path: "/etapps/query/link", param: "target" },
    { id: "kook", host: "www.kookapp.cn", path: "/go-wild.html", param: "url" },
    { id: "latexstudio", host: "ask.latexstudio.net", path: "/go/index", param: "url" },
    { id: "linkedin", host: "www.linkedin.com", path: "/safety/go", param: "url" },
    { id: "logonews", host: "link.logonews.cn", path: "/", param: "url" },
    { id: "mczwlt", host: "www.mczwlt.net", path: "/go-external", param: "url" },
    { id: "mczwlt2", host: "forum.mczwlt.net", path: "/outgoing", param: "url" },
    { id: "nodeseek", host: "www.nodeseek.com", path: "/jump", param: "to" },
    { id: "nowcoder", host: "hd.nowcoder.com", path: "/link.html", param: "target" },
    { id: "oschina", host: "www.oschina.net", path: "/action/GoToLink", param: "url" },
    { id: "qcc", host: "www.qcc.com", path: "/web/transfer-link", param: "link" },
    { id: "qq", host: "c.pc.qq.com", path: /^\/(middleb|middlect|middlem|index)\.html$/, param: "pfurl" },
    { id: "qq2", host: "c.pc.qq.com", path: /^\/(ios|pc|android)\.html$/, param: "url" },
    { id: "qqmail", host: "mail.qq.com", path: "/cgi-bin/readtemplate", param: "gourl" },
    { id: "qqmailwx", host: "wx.mail.qq.com", path: "/xmspamcheck/xmsafejump", param: "url" },
    { id: "skland", host: "www.skland.com", path: "/third-link", param: "target" },
    { id: "shimo", host: "shimo.im", path: "/outlink/black", param: "url" },
    { id: "shimo_2", host: "shimo.im", path: "/outlink/gray", param: "url" },
    { id: "sspai", host: "sspai.com", path: "/link", param: "target" },
    { id: "steam", host: "steamcommunity.com", path: "/linkfilter/", param: "url" },
    { id: "steam2", host: "steamcommunity.com", path: "/linkfilter/", param: "u" },
    { id: "telegram", host: "t.me", path: "/iv", param: "url" },
    { id: "tencentclouddev", host: "cloud.tencent.com", path: "/developer/tools/blog-entry", param: "target" },
    { id: "tianyancha", host: "www.tianyancha.com", path: "/security", param: "target" },
    { id: "tieba_2", host: "tieba.baidu.com", path: "/mo/q/checkurl", param: "url" },
    { id: "uisdc", host: "link.uisdc.com", path: "/", param: "redirect" },
    { id: "weixindev", host: "developers.weixin.qq.com", path: "/community/middlepage/href", param: "href" },
    { id: "work_weixin", host: "open.work.weixin.qq.com", path: "/wwopen/uriconfirm", param: "uri" },
    { id: "yuque", host: "www.yuque.com", path: "/r/goto", param: "url" },
    { id: "youtube", host: "www.youtube.com", path: "/redirect", param: "q" },
    { id: "yy", host: "redir.yy.duowan.com", path: "/warning.php", param: "url" },
    { id: "zhihu", host: "link.zhihu.com", path: "/", param: "target" },
    { id: "txc", host: ["txc.qq.com", "support.qq.com"], path: /^\/products?\/\d+\/link-jump$/, param: "jump" },
    { id: "curseforge", host: "www.curseforge.com", path: "/linkout", param: "remoteUrl" },
    { id: "leetcode", host: "leetcode.cn", path: "/link/", param: "target" },
    { id: "xgw4", host: "www.xgw4.com", path: "/qqdl.html", param: "url", base64: true },
    { id: "zaker", host: "iphone.myzaker.com", path: "/zaker/link.php", param: "url", base64: true }
  ];

  // src/handlers/redirects.js
  function redirectFromElement(selector, attribute) {
    return ({ document: document2, navigate }) => {
      const element = document2.querySelector(selector);
      return navigate(attribute ? element?.getAttribute(attribute) : element?.textContent);
    };
  }
  function redirectQQDocs({ url, navigate }) {
    return navigate(getDestination(url, "url") || getDestination(url, "u"));
  }
  function redirectWeibo({ url, document: document2, navigate }) {
    const target = getDestination(url, "u") || getDestination(url, "toasturl") || document2.querySelector("#textline")?.textContent.trim() || document2.querySelector(".wrap .link")?.textContent.trim() || document2.querySelector(".open-url a")?.href;
    if (!target) return false;
    const destination = new URL(target);
    destination.searchParams.delete("continueFlag");
    return navigate(destination.href);
  }
  function redirectPixiv({ url, navigate }) {
    const parameter = getDestination(url, "url");
    if (parameter) return navigate(parameter);
    const target = decodeURIComponent(url.search.slice(1).replace(/=$/, ""));
    return navigate(target);
  }
  function redirectBase64Path(prefix, { hash = false } = {}) {
    return ({ url, window: window2, navigate }) => {
      const encoded = hash ? url.hash.slice(2) : url.pathname.slice(prefix.length);
      if (hash && !url.hash.startsWith("#/")) return false;
      return navigate(window2.atob(encoded));
    };
  }
  function redirectGamerPath({ url, navigate }) {
    return navigate(decodeURIComponent(url.href.split("/redir.php/url=")[1]));
  }

  // src/handlers/forums.js
  function removeFwinDialog({ document: document2, window: window2, url }) {
    for (const link of document2.querySelectorAll("a[href]")) {
      if (!/^https?:/.test(link.href) || new URL(link.href).host === url.host) continue;
      link.addEventListener("click", () => {
        window2.open(link.href, "_blank");
        if (typeof window2.hideMenu === "function") window2.hideMenu("fwin_dialog", "dialog");
      });
    }
  }
  function enableNgaLinks({ window: window2 }) {
    if (!window2.ubbcode) return false;
    window2.ubbcode.showUrlAlert = (...args) => window2.open(args[1].href);
  }
  function enable360DocLinks({ $: $2 }) {
    $2("#articlecontent table tbody tr td#artContent").find("a").off("click");
  }
  function enableQQSurveyLinks({ document: document2 }) {
    document2.addEventListener("click", (event) => {
      if (event.target.classList?.contains("pe-link")) event.stopPropagation();
    }, true);
  }

  // src/handlers/wechat.js
  var urlPattern = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,63}\b[-a-zA-Z0-9@:%_+.~#?&/=,$^*()-]*/g;
  var excluded = "a, pre, code, script, style, .code-snippet__js";
  function linkifySection(section, document2, window2) {
    const walker = document2.createTreeWalker(section, window2.NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      if (!walker.currentNode.parentElement.closest(excluded)) nodes.push(walker.currentNode);
    }
    for (const node of nodes) {
      const text = node.textContent;
      const fragment = document2.createDocumentFragment();
      let offset = 0;
      for (const match of text.matchAll(urlPattern)) {
        let innerOffset = 0;
        for (let url of splitMultiURLs(match[0])) {
          const start = match.index + match[0].indexOf(url, innerOffset);
          innerOffset = start - match.index + url.length;
          url = url.replace(/\.$/, "");
          let parsed;
          try {
            parsed = new URL(url);
          } catch {
            continue;
          }
          if (["localhost", "127.0.0.1"].includes(parsed.hostname)) continue;
          fragment.append(text.slice(offset, start));
          const link = document2.createElement("a");
          link.href = url;
          link.textContent = url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          fragment.append(link);
          offset = start + url.length;
        }
      }
      if (offset > 0) {
        fragment.append(text.slice(offset));
        node.replaceWith(fragment);
      }
    }
  }
  function enableWechatURLs({ document: document2, window: window2 }) {
    for (const section of document2.querySelectorAll("#js_content > section")) {
      if (!section.closest(excluded)) linkifySection(section, document2, window2);
    }
    for (const image of document2.querySelectorAll("img[data-src]")) {
      if (!image.dataset.src) continue;
      image.src = image.dataset.src;
      image.style.cssText = "width: 100% !important; height: auto !important; display: initial; visibility: visible !important;";
    }
    for (const placeholder of document2.querySelectorAll("span.js_img_placeholder")) {
      placeholder.remove();
    }
  }

  // src/rules/custom.js
  var customRules = [
    { id: "acgrip", host: "bbs.acgrip.com", path: /^\//, handler: removeFwinDialog },
    { id: "blzxteam", host: "blzxteam.com", path: "/gowild.htm", handler: redirectFromElement("div._2VEbEOHfDtVWiQAJxSIrVi_0", "title") },
    { id: "bookmarkearth", host: "www.bookmarkearth.com", path: /^\/view\//, handler: redirectFromElement("p.link") },
    { id: "cto51", host: "blog.51cto.com", path: "/transfer", handler: ({ url, navigate }) => navigate(decodeURIComponent(url.href.split("/transfer?")[1] ?? "")) },
    { id: "doc360", host: "www.360doc.com", path: /^\/content\//, handler: enable360DocLinks },
    { id: "gamertw", host: "ref.gamer.com.tw", path: /^\/redir\.php\/url=/, handler: redirectGamerPath },
    { id: "iplaysoft", host: "www.iplaysoft.com", path: "/link/", handler: redirectFromElement("#targetUrl a", "href") },
    { id: "luogu", host: "www.luogu.com.cn", path: /^\/(paste|discuss|article)\//, handler: redirectFromElement("#url") },
    { id: "mcmod", host: "link.mcmod.cn", path: /^\/target\//, handler: redirectBase64Path("/target/") },
    { id: "nga", host: ["nga.178.com", "bbs.nga.cn"], path: "/read.php", handler: enableNgaLinks },
    { id: "pixiv", host: "www.pixiv.net", path: "/jump.php", handler: redirectPixiv },
    { id: "qqdocs", host: "docs.qq.com", path: "/scenario/link.html", handler: redirectQQDocs },
    { id: "techlife", host: "t.techlife.app", path: "/", handler: redirectBase64Path("", { hash: true }) },
    { id: "tieba", host: "jump2.bdimg.com", path: "/safecheck/index", handler: redirectFromElement(".btn", "href") },
    { id: "unsafelink", host: "unsafelink.com", path: /^\//, handler: ({ url, navigate }) => navigate(url.href.slice(url.origin.length + 1)) },
    { id: "wechat-article", host: "mp.weixin.qq.com", path: /^\/s\//, handler: enableWechatURLs },
    { id: "wechat-warning", host: "weixin110.qq.com", path: "/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi", handler: redirectFromElement(".weui-msg__desc") },
    { id: "wechat-access", host: "mp.weixin.qq.com", path: "/s", handler: redirectFromElement("#js_access_msg", "href") },
    { id: "weibo-short", host: "t.cn", path: /^\//, handler: redirectWeibo },
    { id: "weibo", host: "weibo.cn", path: "/sinaurl", handler: redirectWeibo },
    { id: "wj_qq", host: "wj.qq.com", path: /^\/s2\//, handler: enableQQSurveyLinks }
  ];

  // src/rules/index.js
  var rules = [...queryRules, ...customRules];

  // src/index.js
  var $ = jQuery.noConflict(true);
  $(document).ready(() => runRules(createContext(window, $), rules));
})();
