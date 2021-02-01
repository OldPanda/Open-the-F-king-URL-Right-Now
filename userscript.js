// ==UserScript==
// @name           Open the F**king URL Right Now
// @description    自动跳转某些网站不希望用户直达的外链
// @author         OldPanda
// @match          http://t.cn/*
// @match          https://weibo.cn/sinaurl?*
// @match          https://www.jianshu.com/go-wild?*
// @match          https://link.zhihu.com/?target=*
// @match          http://link.zhihu.com/?target=*
// @match          https://www.douban.com/link2/?url=*
// @match          https://link.ld246.com/forward?goto=*
// @match          https://mp.weixin.qq.com/*
// @match          http://redir.yy.duowan.com/warning.php?url=*
// @match          https://weixin110.qq.com/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi*
// @match          https://link.csdn.net/?target=*
// @match          https://steamcommunity.com/linkfilter/?url=*
// @match          https://game.bilibili.com/linkfilter/?url=*
// @match          https://www.oschina.net/action/GoToLink?url=*
// @version        0.7.5
// @run-at         document-idle
// @namespace      https://old-panda.com/
// @require        https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js
// @license        GPLv3 License
// ==/UserScript==

(function () {
  'use strict';

  const curURL = window.location.href

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
    let urls = content.matchAll(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g);
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
  }

  function redirect(fakeURLStr, trueURLParam) {
    let fakeURL = new URL(fakeURLStr);
    let trueURL = fakeURL.searchParams.get(trueURLParam);
    window.location.replace(trueURL);
  }

  /**
   * @function
   * @name match
   * @param {...string} patterns
   * @description check if current URL matchs given patterns
   */
  const match = (...patterns) => patterns.some(p => curURL.includes(p))

  /**
   * @enum {string}
   * @name fuckers
   * @description all link pattern needed deal with
   */
  const fuckers = {
    weibo: 'http://t.cn/', // 微博网页版
    weibo2: 'https://weibo.cn/sinaurl?',
    // http://t.cn/RgAKoPE
    // https://weibo.cn/sinaurl?u=https%3A%2F%2Fwww.freebsd.org%2F 
    // https://weibo.cn/sinaurl?toasturl=https%3A%2F%2Ftime.geekbang.org%2F
    // https://weibo.cn/sinaurl?luicode=10000011&lfid=230259&u=http%3A%2F%2Ft.cn%2FA6qHeVlf
    jianshu: 'https://www.jianshu.com/go-wild?',
    zhihu: 'https://link.zhihu.com/?target=',
    // https://link.zhihu.com/?target=https%3A%2F%2Ftime.geekbang.org%2F
    // https://link.zhihu.com/?target=https%3A%2F%2Fwww.freebsd.org%2F
    zhihu2: 'http://link.zhihu.com/?target=',
    // http://link.zhihu.com/?target=https%3A%2F%2Ftime.geekbang.org%2F
    // http://link.zhihu.com/?target=https%3A%2F%2Fwww.freebsd.org%2F
    douban: 'https://www.douban.com/link2/?url=',
    dilian: 'https://link.ld246.com/forward?goto=',
    theWorst: 'https://mp.weixin.qq.com/',
    theWorst2: 'https://weixin110.qq.com/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi',
    yy: 'http://redir.yy.duowan.com/warning.php?url=',
    csdn: 'https://link.csdn.net/?target=',
    steam: 'https://steamcommunity.com/linkfilter/?url=',
    gamebilibili:'game.bilibili.com/linkfilter/?url=',
    oschina: 'https://www.oschina.net/action/GoToLink?url='
  }

  $(document).ready(function () {
    if (match(fuckers.weibo, fuckers.weibo2)) {
      const link = $(".wrap .link").first().text() || document.querySelector('.open-url').children[0].href
      window.location.replace(link);
    }
    if (match(fuckers.jianshu)) {
      redirect(curURL, "url");
    }
    if (match(fuckers.zhihu, fuckers.zhihu2)) {
      redirect(curURL, "target");
    }
    if (match(fuckers.douban)) {
      redirect(curURL, "url");
    }
    if (match(fuckers.dilian)) {
      redirect(curURL, "goto");
    }
    if (match(fuckers.theWorst)) {
      enableURLs();
    }
    if (match(fuckers.yy)) {
      redirect(curURL, "url");
    }
    if (match(fuckers.theWorst2)) {
      window.location.replace($(".weui-msg__desc").first().text());
    }
    if (match(fuckers.csdn)) {
      redirect(curURL, "target");
    }
    if (match(fuckers.steam)) {
      redirect(curURL, "url");
    }
    if (match(fuckers.gamebilibili)) {
      redirect(curURL, "url");
    }
    if (match(fuckers.oschina)) {
      redirect(curURL, "url");
    }
  });

})();
