// ==UserScript==
// @name           Open the F**king URL Right Now
// @description    自动跳转某些网站不希望用户直达的外链
// @author         OldPanda
// @match          http*://c.pc.qq.com/*
// @match          http*://iphone.myzaker.com/zaker/link.php?*
// @match          http*://link.zhihu.com/?*
// @match          http*://t.cn/*
// @match          http*://www.360doc.cn/outlink.html?url=*
// @match          http://redir.yy.duowan.com/warning.php?url=*
// @match          http://www.360doc.com/content/*
// @match          https://afdian.com/link?target=*
// @match          https://afdian.net/link?target=*
// @match          https://api.himcbbs.com/refer/?url=*
// @match          https://ask.latexstudio.net/go/index?url=*
// @match          https://bbs.acgrip.com/*
// @match          https://bbs.nga.cn/read.php?*
// @match          https://blog.51cto.com/transfer?*
// @match          https://blzxteam.com/gowild.htm?url=*
// @match          https://cloud.tencent.com/developer/tools/blog-entry?target=*
// @match          https://developers.weixin.qq.com/community/middlepage/href?href=*
// @match          https://developer.aliyun.com/redirect?target=*
// @match          https://docs.qq.com/scenario/link.html?u=*
// @match          https://docs.qq.com/scenario/link.html?url=*
// @match          https://forum.mczwlt.net/outgoing?url=*
// @match          https://gamebanana.com/linkfilter?url=*
// @match          https://game.bilibili.com/linkfilter/?url=*
// @match          https://gitee.com/link?target=*
// @match          https://hd.nowcoder.com/link.html?target=*
// @match          https://hellogithub.com/periodical/statistics/click?target=*
// @match          https://jump2.bdimg.com/safecheck/index?url=*
// @match          https://leetcode.cn/link/?target=*
// @match          https://link.csdn.net/?*target=*
// @match          https://link.gitcode.com/?target=*
// @match          https://link.juejin.cn/?target=*
// @match          https://link.ld246.com/forward?goto=*
// @match          https://link.logonews.cn/?*
// @match          https://link.mcmod.cn/target/*
// @match          https://link.uisdc.com/?redirect=*
// @match          https://mail.qq.com/cgi-bin/readtemplate*
// @match          https://mp.weixin.qq.com/s/*
// @match          https://mp.weixin.qq.com/s?*
// @match          https://nga.178.com/read.php?*
// @match          https://open.work.weixin.qq.com/wwopen/uriconfirm?uri=*
// @match          https://ref.gamer.com.tw/redir.php/url=*
// @match          https://ref.gamer.com.tw/redir.php?url=*
// @match          https://shimo.im/outlink/black?url=*
// @match          https://shimo.im/outlink/gray?url=*
// @match          https://sspai.com/link?target=*
// @match          https://steamcommunity.com/linkfilter/?url=*
// @match          https://steamcommunity.com/linkfilter/?u=*
// @match          https://support.qq.com/product/*/link-jump?jump=*
// @match          https://support.qq.com/products/*/link-jump?jump=*
// @match          http*://t.techlife.app/*
// @match          https://t.me/iv?url=*
// @match          https://tieba.baidu.com/mo/q/checkurl?url=*
// @match          https://txc.qq.com/product/*/link-jump?jump=*
// @match          https://txc.qq.com/products/*/link-jump?jump=*
// @match          https://unsafelink.com/*
// @match          https://weibo.cn/sinaurl?*
// @match          https://weixin110.qq.com/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi*
// @match          https://wx.mail.qq.com/xmspamcheck/xmsafejump?*
// @match          https://www.bookmarkearth.com/view/*
// @match          https://www.chinaz.com/go.shtml?url=*
// @match          https://www.coolapk.com/link?url=*
// @match          https://www.curseforge.com/linkout?remoteUrl=*
// @match          https://www.douban.com/link2/?url=*
// @match          https://www.gcores.com/link?target=*
// @match          https://www.google.com/url?q=*
// @match          https://www.instagram.com/linkshim/?u=*
// @match          https://www.jianshu.com/go-wild?*
// @match          https://www.kdocs.cn/etapps/query/link?target=*
// @match          https://www.kookapp.cn/go-wild.html?url=*
// @match          https://www.linkedin.com/safety/go?url=*
// @match          https://www.luogu.com.cn/discuss/*
// @match          https://www.luogu.com.cn/paste/*
// @match          https://www.luogu.com.cn/article/*
// @match          https://www.mczwlt.net/go-external?url=*
// @match          https://www.nodeseek.com/jump?to=*
// @match          https://www.oschina.net/action/GoToLink?url=*
// @match          https://www.pixiv.net/jump.php?*
// @match          https://www.qcc.com/web/transfer-link?link=*
// @match          https://www.skland.com/third-link?target=*
// @match          https://www.tianyancha.com/security?target=*
// @match          https://www.yuque.com/r/goto?url=*
// @match          https://*.infoq.cn/link?target=*
// @match          https://www.baike.com/redirect_link?url=*
// @match          https://www.youtube.com/redirect?*
// @exclude        https://mp.weixin.qq.com/cgi-bin/*
// @version        1.14.4
// @run-at         document-idle
// @namespace      https://old-panda.com/
// @require        https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @license        GPLv3 License
// ==/UserScript==

const $ = jQuery.noConflict(true);

/**
   * @enum {string}
   * @name fuckers
   * @description all link pattern needed deal with
   */
const fuckers = {
  acgrip: { match: 'https://bbs.acgrip.com/', redirect: removeFwinDialog },
  afdian: { match: 'https://afdian.net/link?target=', redirect: "target" },
  afdian2: { match: 'https://afdian.com/link?target=', redirect: "target" },
  baike: { match: 'https://www.baike.com/redirect_link?url=', redirect: "url" },
  blzxteam: { match: 'https://blzxteam.com/gowild.htm?url=', redirect: function () { const url = $("div._2VEbEOHfDtVWiQAJxSIrVi_0").first().attr("title"); window.location.href = url } },
  bookmarkearth: { match: 'https://www.bookmarkearth.com/view/', redirect: function () { window.location.replace(document.querySelector("p.link").innerHTML) } },
  chinaz: { match: 'https://www.chinaz.com/go.shtml?url=', redirect: "url" },
  coolapk: { match: 'https://www.coolapk.com/link?url=', redirect: "url" },
  csdn: { match: 'https://link.csdn.net/?*target=', redirect: "target" },
  cto51: { match: 'https://blog.51cto.com/transfer?', redirect: function () { window.location.href = window.location.href.replace("https://blog.51cto.com/transfer?", "") } },
  curseforge: { match: 'https://www.curseforge.com/linkout?remoteUrl=', redirect: function () { redirect(decodeURIComponent(curURL), 'remoteUrl') } },
  dilian: { match: 'https://link.ld246.com/forward?goto=', redirect: "goto" },
  developeraliyun: { match: 'https://developer.aliyun.com/redirect?target=', redirect: "target" },
  doc360_2: { match: 'http://www.360doc.cn/outlink.html?url=', redirect: "url" },
  doc360: { match: 'http://www.360doc.com/content/', redirect: function () { $("#articlecontent table tbody tr td#artContent").find("a").off("click") } },
  douban: { match: 'https://www.douban.com/link2/?url=', redirect: "url" },
  gamebanana: { match: 'https://gamebanana.com/linkfilter?url=', redirect: "url" },
  gamebilibili: { match: 'https://game.bilibili.com/linkfilter/?url=', redirect: "url" },
  gamertw: { match: 'https://ref.gamer.com.tw/redir.php/?url=', redirect: "url" },
  gamertw_2: { match: 'https://ref.gamer.com.tw/redir.php?url=', redirect: "url" },
  gcores: { match: 'https://www.gcores.com/link?target=', redirect: "target" },
  gitcode: { match: 'https://link.gitcode.com/?target=', redirect: "target" },
  gitee: { match: 'https://gitee.com/link?target=', redirect: "target" },
  google: { match: 'https://www.google.com/url?q=', redirect: "q" },
  hellogithub: { match: 'https://hellogithub.com/periodical/statistics/click?target=', redirect: "target" },
  himcbbs: { match: 'https://api.himcbbs.com/refer/?url=', redirect: "url" },
  infoq: { match: 'https://(xie.infoq.cn/link|www.infoq.cn/link)?target=', redirect: "target", enableRegex: true },
  instagram: { match: 'https://www.instagram.com/linkshim/?u=', redirect: "url" },
  jianshu: { match: 'https://www.jianshu.com/go-wild?', redirect: "url" },
  juejin: { match: 'https://link.juejin.cn/?target=', redirect: "target" },
  kdocs: { match: 'https://www.kdocs.cn/etapps/query/link?target=', redirect: "target" },
  kook: { match: 'https://www.kookapp.cn/go-wild.html?url=', redirect: "url" },
  latexstudio: { match: 'https://ask.latexstudio.net/go/index?url=', redirect: "url" },
  leetcode: { match: 'https://leetcode.cn/link/?target', redirect: "target" },
  linkedin: { match: 'https://www.linkedin.com/safety/go?url=', redirect: "url" },
  logonews: { match: 'https://link.logonews.cn/?', redirect: "url" },
  luogu: { match: 'https://www.luogu.com.cn/paste/', redirect: function () { if (document.getElementById("url")) { window.location.href = $("#url").text() } } },
  luogu_2: { match: 'https://www.luogu.com.cn/discuss/', redirect: function () { if (document.getElementById("url")) { window.location.href = $("#url").text() } } },
  luogu_3: { match: 'https://www.luogu.com.cn/article/', redirect: function () { if (document.getElementById("url")) { window.location.href = $("#url").text() } } },
  mcmod: { match: 'https://link.mcmod.cn/target/', redirect: function () { window.location.href = atob(window.location.href.replace("https://link.mcmod.cn/target/", "")) } },
  mczwlt: { match: 'https://www.mczwlt.net/go-external?url=', redirect: "url" },
  mczwlt2: { match: 'https://forum.mczwlt.net/outgoing?url=', redirect: "url" },
  nga: { match: 'https://nga.178.com/read.php?', redirect: function () { ubbcode.showUrlAlert = (...args) => window.open(args[1].href) } },
  nga2: { match: 'https://bbs.nga.cn/read.php?', redirect: function () { ubbcode.showUrlAlert = (...args) => window.open(args[1].href) } },
  nodeseek: { match: 'https://www.nodeseek.com/jump?to=', redirect: "to" },
  nowcoder: { match: 'https://hd.nowcoder.com/link.html?target=', redirect: "target" },
  oschina: { match: 'https://www.oschina.net/action/GoToLink?url=', redirect: "url" },
  pixiv: { match: 'https://www.pixiv.net/jump.php?', redirect: function () { window.location.href = decodeURIComponent(curURL.match(/jump.php\?[url=]*(.*)/)[1].replace(/=$/, '')) } },
  qcc: { match: 'https://www.qcc.com/web/transfer-link?link=', redirect: "link" },
  qq: { match: 'https://c.pc.qq.com/(middleb|middlect|middlem|index).html', redirect: "pfurl", enableRegex: true },
  qq2: { match: 'https://c.pc.qq.com/(ios|pc|android).html', redirect: "url", enableRegex: true },
  qqdocs: { match: 'https://docs.qq.com/scenario/link.html?url=', redirect: "url" },
  qqmail: { match: 'https://mail.qq.com/cgi-bin/readtemplate', redirect: "gourl" },
  qqmailwx: { match: 'https://wx.mail.qq.com/xmspamcheck/xmsafejump', redirect: "url" },
  skland: { match: 'https://www.skland.com/third-link?target=', redirect: "target" },
  shimo: { match: 'https://shimo.im/outlink/black', redirect: "url" },
  shimo_2: { match: 'https://shimo.im/outlink/gray', redirect: "url" },
  sspai: { match: 'https://sspai.com/link?target=', redirect: "target" },
  steam: { match: 'https://steamcommunity.com/linkfilter/?url=', redirect: "url" },
  steam2: { match: 'https://steamcommunity.com/linkfilter/?u=', redirect: "u" },
  techlife: { match: 'https://t.techlife.app/#/', redirect: function () { window.location.href = atob(window.location.href.replace("https://t.techlife.app/#/", "")) } },
  telegram: { match: 'https://t.me/iv?url=', redirect: "url" },
  tencentclouddev: { match: 'https://cloud.tencent.com/developer/tools/blog-entry?target=', redirect: "target" },
  tianyancha: { match: 'https://www.tianyancha.com/security?target=', redirect: "target" },
  tieba: { match: 'https://jump2.bdimg.com/safecheck/index?url=', redirect: function () { window.location.replace(document.getElementsByClassName('btn')[0].getAttribute('href')) } },
  tieba_2: { match: 'https://tieba.baidu.com/mo/q/checkurl?url=', redirect: "url" },
  txc: { match: 'https://(txc|support).qq.com/products?/(\\d+)/link-jump', enableRegex: true, redirect: 'jump' },
  uisdc: { match: 'https://link.uisdc.com/?redirect=', redirect: "redirect" },
  unsafelink: { match: 'https://unsafelink.com/', redirect: function () { window.location.href = window.location.href.replace("https://unsafelink.com/", "") } },
  wechat1: { match: 'https://mp.weixin.qq.com/s/', redirect: enableURLs },
  wechat2: { match: 'https://weixin110.qq.com/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi', redirect: function () { window.location.replace($(".weui-msg__desc").first().text()) } },
  wechat3: { match: 'https://mp.weixin.qq.com/s?', redirect: function () { let elem = $("#js_access_msg"); if (elem !== undefined && elem.attr("href") !== undefined) { window.location.replace(elem.attr("href")); } } },
  // https://t.cn/RgAKoPE
  // https://weibo.cn/sinaurl?luicode=10000011&lfid=230259&u=http%3A%2F%2Ft.cn%2FA6qHeVlf
  // https://weibo.cn/sinaurl?toasturl=https%3A%2F%2Ftime.geekbang.org%2F
  // https://weibo.cn/sinaurl?u=https%3A%2F%2Fwww.freebsd.org%2F
  weibo_1: {
    match: 'https://t.cn/', redirect: function () {
      const link = $(".wrap .link").first().text() || document.querySelector('.open-url').children[0].href;
      const url = new URL(link);
      url.searchParams.delete("continueFlag");
      window.location.replace(url.toString());
    }
  }, // 微博网页版
  weibo_2: { match: 'https://weibo.cn/sinaurl?u', redirect: "u" },
  weibo_3: { match: 'https://weibo.cn/sinaurl?toasturl', redirect: "toasturl" },
  weibo_4: {
    match: 'https://weibo.cn/sinaurl?', redirect: function () {
      const url = new URL(link);
      url.searchParams.delete("continueFlag");
      window.location.replace(url.toString());
    }
  },
  weixindev: { match: 'https://developers.weixin.qq.com/community/middlepage/href?href=', redirect: "href" },
  work_weixin: { match: 'https://open.work.weixin.qq.com/wwopen/uriconfirm?uri=', redirect: "uri" },
  yuque: { match: 'https://www.yuque.com/r/goto?url=', redirect: "url" },
  youtube: { match: 'https://www.youtube.com/redirect?', redirect: "q" },
  yy: { match: 'http://redir.yy.duowan.com/warning.php?url=', redirect: "url" },
  zaker: { match: 'http://iphone.myzaker.com/zaker/link.php?', redirect: function () { redirect(curURL, "url", true) } },
  // https://link.zhihu.com/?target=https%3A%2F%2Ftime.geekbang.org%2F
  // https://link.zhihu.com/?utm_oi=35221042888704&target=https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/import
  zhihu: { match: 'https://link.zhihu.com/?', redirect: "target" },
}

const curURL = window.location.href;
const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

/**
 * Return URL without "http://" or "https://" at the beginning
 * @param {String} str
 */
function removeProtocol(str) {
  return str.replace(/^https?\??:\/\//gm, '');
}

function rstrip(str, regex) {
  let i = str.length - 1;
  while (i >= 0) {
    if (!str[i].match(regex)) {
      break;
    }
    i--;
  }
  return str.substring(0, i + 1);
}

/**
 * Split concatenated URL string into separate URLs.
 * @param {String} str
 */
function splitMultiURLs(str) {
  //TODO: add comments
  let results = new Array();
  let entry = "";
  while (str.length > 0) {
    if (str.indexOf("http:") === -1 && str.indexOf("https:") === -1) {
      entry += str;
      str = "";
      results.push(rstrip(entry, /[@:%_\+~#?&=,$^\*]/g));
      break;
    }

    if (str.startsWith("http:")) {
      entry += "http:";
      str = str.substring("http:".length);
    } else if (str.startsWith("https:")) {
      entry += "https:";
      str = str.substring("https:".length);
    } else {
      return results;
    }

    let nextIndex = Math.min(
      str.indexOf("https:") === -1 ? Number.MAX_SAFE_INTEGER : str.indexOf("https:"),
      str.indexOf("http:") === -1 ? Number.MAX_SAFE_INTEGER : str.indexOf("http:")
    );
    if (nextIndex > 0) {
      entry += str.substring(0, nextIndex);
      str = str.substring(nextIndex);
    }
    results.push(rstrip(entry, /[@:%_\+~#?&=,$^\*]/g));
    entry = "";
  }
  return results;
}

/**
 * Replace url with clickable `<a>` tag in html content.
 * @param {String} url
 */
function replaceSingleURL(url) {
  $("#js_content").html((_, html) => {
    return html.replaceAll(url, `<a target="_blank" rel="noopener noreferrer" href="${url}">${url}</a>`);
  });
}

/**
 * Make urls clickable again on Weixin Media Platform.
 */
function enableURLs() {
  let existingLinks = new Set();
  $("a").each(function () {
    existingLinks.add(this.href);
  });

  $("#js_content > section").each(function (_, obj) {
    // Don't do anything on code blocks
    let className = $(obj).attr('class');
    if (className != undefined && className.indexOf("code-snippet__js") != -1) {
      return;
    }
    let content = $(obj).text();
    let urls = content.matchAll(urlPattern);
    let replaced = new Set();
    for (let value of urls) {
      let urlStr = $.trim(value[0]);
      for (let url of splitMultiURLs(urlStr)) {
        if (!url || replaced.has(url) || url.includes("localhost") || url.includes("127.0.0.1") || existingLinks.has(url)) {
          continue;
        }
        if (url.endsWith(".") && url[url.length - 2].match(/\d/g)) {
          url = url.substring(0, url.length - 2);
        }
        replaceSingleURL(url);
        replaced.add(url);
      }
    }
  });

  // Replace loading image with actual one
  $("img").each(function (_, obj) {
    if ($(obj)[0].currentSrc === "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==") {
      $(obj).attr("src", $(obj)[0].dataset.src);
    } else {
      $(obj).attr("src", $(obj).attr("data-src"));
      $(obj).attr("style", "width: 100% !important; height: auto !important; display: initial; visibility: visible !important;");
    }
  });
  $("span.js_img_placeholder").remove();
}

/**
 * Remove the fwin_dialog when clicking external links on Anime Subtitle Club
 */
function removeFwinDialog() {
  $("a").each((_, elem) => {
    if (elem.href && elem.href.startsWith("http") && !elem.href.includes(window.location.host)) {
      elem.addEventListener("click", (_) => {
        window.open(elem.href, "_blank");
        hideMenu('fwin_dialog', 'dialog');
      })
    }
  })
}

function redirect(fakeURLStr, trueURLParam, enableBase64 = false) {
  let fakeURL = new URL(fakeURLStr);
  let trueURL = fakeURL.searchParams.get(trueURLParam);
  if (trueURL.startsWith(fuckers.wechat1.match)) {
    // there could be multiple `&`s in url of a wechat link, so all of them
    // have to be included in the trueURL.
    trueURL = fakeURL.search.split(`${trueURLParam}=`).pop();
  } else {
    if (enableBase64) trueURL = window.atob(trueURL);
    if (trueURL.indexOf("http://") !== 0 && trueURL.indexOf("https://") !== 0) {
      trueURL = "https://" + trueURL;
    }
  }
  trueURL = decodeURIComponent(trueURL)
  window.location.replace(trueURL);
}

/**
 * @function
 * @name match
 * @param {...string} pattern
 * @param {...boolean} enableRegex
 * @param {...boolean} checkProtocol
 * @description check if current URL matchs given patterns
 */
function match(pattern, enableRegex = false, checkProtocol = false) {
  var curURLProto;
  if (checkProtocol) { curURLProto = curURL; }
  else {
    curURLProto = removeProtocol(curURL);
    pattern = removeProtocol(pattern);
  }
  if (enableRegex) {
    return curURLProto.search(pattern) > -1
  }
  else {
    return curURLProto.indexOf(pattern) === 0//Not Sure
  }
}

(function () {
  'use strict';

  $(document).ready(function () {
    for (var i in fuckers) {
      if (match(fuckers[i].match, fuckers[i].enableRegex, fuckers[i].checkProtocol)) {
        switch (typeof (fuckers[i].redirect)) {
          case 'string':
            redirect(curURL, fuckers[i].redirect); break;
          case 'function':
            fuckers[i].redirect(); break;
          default:
            console.log(i + " redirect rule error!"); break;
        }
      }
    }
  });

})();
