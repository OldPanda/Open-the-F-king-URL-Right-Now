// ==UserScript==
// @name           Open the F**king URL Right Now
// @description    自动跳转某些网站不希望用户直达的外链
// @author         OldPanda
// @match          http://t.cn/*
// @match          https://www.jianshu.com/go-wild?*
// @match          https://link.zhihu.com/?target=*
// @match          http://link.zhihu.com/?target=*
// @match          https://www.douban.com/link2/?url=*
// @match          https://link.ld246.com/forward?goto=*
// @match          https://mp.weixin.qq.com/*
// @match          http://redir.yy.duowan.com/warning.php?url=*
// @match          https://weixin110.qq.com/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi*
// @version        0.6.1
// @run-at         document-idle
// @namespace      https://old-panda.com/
// @require        https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js
// @license        GPLv3 License
// ==/UserScript==

(function () {
  'use strict';

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
      let url = $.trim(value[0]);
      if (!url || replaced.has(url) || url.includes("localhost") || url.includes("127.0.0.1") || existingLinks.has(url)) {
        continue;
      }
      $("#js_content").html((_, html) => {
        return html.replace(url, `<a target="_blank" rel="noopener noreferrer" href="${url}">${url}</a>`);
      });
      replaced.add(url);
    }
  }

  $(document).ready(function () {
    if (window.location.href.includes("http://t.cn/")) {
      window.location.replace($(".wrap .link").first().text());
    } else if (window.location.href.includes("https://www.jianshu.com/go-wild?")) {
      let fakeURL = new URL(window.location.href);
      let trueURL = fakeURL.searchParams.get("url");
      window.location.replace(trueURL);
    } else if (window.location.href.includes("https://link.zhihu.com/?target=") || window.location.href.includes("http://link.zhihu.com/?target=")) {
      window.location.replace($(".content .link").first().text());
    } else if (window.location.href.includes("https://www.douban.com/link2/?url=")) {
      let fakeURL = new URL(window.location.href);
      let trueURL = fakeURL.searchParams.get("url");
      window.location.replace(trueURL);
    } else if (window.location.href.includes("https://link.ld246.com/forward?goto=")) {
      let fakeURL = new URL(window.location.href);
      let trueURL = fakeURL.searchParams.get("goto");
      window.location.replace(trueURL);
    } else if (window.location.href.includes("https://mp.weixin.qq.com/")) {
      enableURLs();
    } else if (window.location.href.includes("http://redir.yy.duowan.com/warning.php?url=")) {
      let fakeURL = new URL(window.location.href);
      let trueURL = fakeURL.searchParams.get("url");
      window.location.replace(trueURL);
    } else if (window.location.href.includes("https://weixin110.qq.com/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi")) {
      window.location.replace($(".weui-msg__desc").first().text());
    }
  });
})();
