// ==UserScript==
// @name           Open the F**king URL Right Now
// @description    自动跳转某些网站不希望用户直达的外链
// @author         OldPanda
// @match          http://t.cn/*
// @match          https://weibo.cn/sinaurl?*
// @match          https://www.jianshu.com/go-wild?*
// @match          http*://link.zhihu.com/?*
// @match          https://www.douban.com/link2/?url=*
// @match          https://link.ld246.com/forward?goto=*
// @match          https://mp.weixin.qq.com/*
// @match          http://redir.yy.duowan.com/warning.php?url=*
// @match          https://weixin110.qq.com/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi*
// @match          https://link.csdn.net/?target=*
// @match          https://steamcommunity.com/linkfilter/?url=*
// @match          https://game.bilibili.com/linkfilter/?url=*
// @match          https://www.oschina.net/action/GoToLink?url=*
// @match          https://developers.weixin.qq.com/community/middlepage/href?href=*
// @match          https://docs.qq.com/scenario/link.html?url=*
// @match          https://www.pixiv.net/jump.php?url=*
// @match          https://www.chinaz.com/go.shtml?url=*
// @match          http://www.360doc.com/content/*
// @match          https://nga.178.com/read.php?*
// @match          https://bbs.nga.cn/read.php?*
// @match          http*://c.pc.qq.com/*
// @match          https://www.yuque.com/r/goto?url=*
// @match          https://www.mcbbs.net/plugin.php?id=link_redirect&target=*
// @match          https://link.juejin.cn/?target=*
// @match          http*://www.360doc.cn/outlink.html?url=*
// @match          https://jump2.bdimg.com/safecheck/index?url=*
// @match          http*://iphone.myzaker.com/zaker/link.php?*
// @match          https://www.tianyancha.com/security?target=*
// @match          https://afdian.net/link?target=*
// @match          https://mail.qq.com/cgi-bin/readtemplate*
// @match          https://link.logonews.cn/?*
// @match          https://link.uisdc.com/?redirect=*
// @match          https://gitee.com/link?target=*
// @match          https://xie.infoq.cn/link?target=*
// @match          https://leetcode.cn/link/?target=*
// @match          https://www.kookapp.cn/go-wild.html?url=*
// @match          https://blog.51cto.com/transfer?*
// @version        0.18.1
// @run-at         document-idle
// @namespace      https://old-panda.com/
// @require        https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @license        GPLv3 License
// ==/UserScript==

const $ = jQuery.noConflict(true);
(function () {
  'use strict';

  const curURL = window.location.href

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
      return html.replace(url, `<a target="_blank" rel="noopener noreferrer" href="${url}">${url}</a>`);
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

    let content = $("#js_content").text();
    let urls = content.matchAll(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
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

    // Replace loading image with actual one
    $("img").each(function (i, obj) {
      if ($(obj)[0].currentSrc === "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==") {
          $(obj).attr("src", $(obj)[0].dataset.src)
      }
    })
  }

  function redirect(fakeURLStr, trueURLParam, enableBase64 = false) {
    let fakeURL = new URL(fakeURLStr);
    let trueURL = fakeURL.searchParams.get(trueURLParam);
    if (enableBase64) trueURL = window.atob(trueURL);
    if (trueURL.indexOf("http://") !== 0 && trueURL.indexOf("https://") !== 0) {
      trueURL = "https://" + trueURL;
    }
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

  /**
   * @enum {string}
   * @name fuckers
   * @description all link pattern needed deal with
   */
  const fuckers = {
    weibo: { match: 'http://t.cn/', redirect: function () { const link = $(".wrap .link").first().text() || document.querySelector('.open-url').children[0].href; window.location.replace(link); } }, // 微博网页版
    weibo2: { match: 'https://weibo.cn/sinaurl?', redirect: function () { const link = $(".wrap .link").first().text() || document.querySelector('.open-url').children[0].href; window.location.replace(link); } },
    // http://t.cn/RgAKoPE
    // https://weibo.cn/sinaurl?u=https%3A%2F%2Fwww.freebsd.org%2F
    // https://weibo.cn/sinaurl?toasturl=https%3A%2F%2Ftime.geekbang.org%2F
    // https://weibo.cn/sinaurl?luicode=10000011&lfid=230259&u=http%3A%2F%2Ft.cn%2FA6qHeVlf
    jianshu: { match: 'https://www.jianshu.com/go-wild?', redirect: "url" },
    zhihu: { match: 'https://link.zhihu.com/?', redirect: "target" },
    // https://link.zhihu.com/?target=https%3A%2F%2Ftime.geekbang.org%2F
    // https://link.zhihu.com/?utm_oi=35221042888704&target=https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/import
    douban: { match: 'https://www.douban.com/link2/?url=', redirect: "url" },
    dilian: { match: 'https://link.ld246.com/forward?goto=', redirect: "goto" },
    theWorst: { match: 'https://mp.weixin.qq.com/', redirect: enableURLs },
    theWorst2: { match: 'https://weixin110.qq.com/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi', redirect: function () { window.location.replace($(".weui-msg__desc").first().text()) } },
    yy: { match: 'http://redir.yy.duowan.com/warning.php?url=', redirect: "url" },
    csdn: { match: 'https://link.csdn.net/?target=', redirect: "target" },
    steam: { match: 'https://steamcommunity.com/linkfilter/?url=', redirect: "url" },
    gamebilibili: { match: 'https://game.bilibili.com/linkfilter/?url=', redirect: "url" },
    oschina: { match: 'https://www.oschina.net/action/GoToLink?url=', redirect: "url" },
    weixindev: { match: 'https://developers.weixin.qq.com/community/middlepage/href?href=', redirect: "href" },
    qqdocs: { match: 'https://docs.qq.com/scenario/link.html?url=', redirect: "url" },
    pixiv: { match: 'https://www.pixiv.net/jump.php?url=', redirect: "url" },
    chinaz: { match: 'https://www.chinaz.com/go.shtml?url=', redirect: "url" },
    doc360: { match: 'http://www.360doc.com/content/', redirect: function () { $("#articlecontent table tbody tr td#artContent").find("a").off("click") } },
    nga: { match: 'https://nga.178.com/read.php?', redirect: function () { $("#m_posts #m_posts_c a").prop("onclick", null).off("click") } },
    nga2: { match: 'https://bbs.nga.cn/read.php?', redirect: function () { $("#m_posts #m_posts_c a").prop("onclick", null).off("click") } },
    qq: { match: 'https://c.pc.qq.com/(middlem|index).html', redirect: "pfurl", enableRegex: true },
    yuque: { match: 'https://www.yuque.com/r/goto?url=', redirect: "url" },
    mcbbs: { match: 'https://www.mcbbs.net/plugin.php?id=link_redirect&target=', redirect: "target" },
    juejin: { match: 'https://link.juejin.cn/?target=', redirect: "target" },
    doc360_2: { match: 'http://www.360doc.cn/outlink.html?url=', redirect: "url" },
    tieba: { match: 'https://jump2.bdimg.com/safecheck/index?url=', redirect: function () { window.location.replace(document.getElementsByClassName('btn')[0].getAttribute('href')) } },
    zaker: { match: 'http://iphone.myzaker.com/zaker/link.php?', redirect: function () { redirect(curURL, "url", true) } },
    tianyancha: { match: 'https://www.tianyancha.com/security?target=', redirect: "target" },
    afdian: { match: 'https://afdian.net/link?target=', redirect: "target" },
    qqmail: { match: 'https://mail.qq.com/cgi-bin/readtemplate', redirect: "gourl" },
    logonews: { match: 'https://link.logonews.cn/?', redirect: "url" },
    uisdc: { match: 'https://link.uisdc.com/?redirect=', redirect: "redirect" },
    gitee: { match: 'https://gitee.com/link?target=', redirect: "target" },
    infoq: { match: 'https://xie.infoq.cn/link?target=', redirect: "target" },
    leetcode: { match: 'https://leetcode.cn/link/?target', redirect: "target" },
    kook: { match: 'https://www.kookapp.cn/go-wild.html?url=', redirect: "url" },
    cto51: { match: 'https://blog.51cto.com/transfer?', redirect: function(){window.location.href = window.location.href.replace("https://blog.51cto.com/transfer?", "")} }
  }

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
