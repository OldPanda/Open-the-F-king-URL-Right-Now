import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runRules } from '../src/core/runner.js';
import { rules } from '../src/rules/index.js';
import { queryRules } from '../src/rules/query.js';

// Public interstitial formats, kept independent of the implementation's registry.
const interstitials = [
  'https://aiqicha.baidu.com/safetip?target=',
  'https://www.aiqicha.com/safetip?target=',
  'https://afdian.net/link?target=',
  'https://afdian.com/link?target=',
  'https://atcoder.jp/jump?url=',
  'https://www.baike.com/redirect_link?url=',
  'https://www.bilibili.com/york/link-middle-page?redirect_url=',
  'https://www.chinaz.com/go.shtml?url=',
  'https://www.coolapk.com/link?url=',
  'https://link.csdn.net/?target=',
  'https://cnb.cool/goto?url=',
  'https://cnb.cool/110?url=',
  'https://link.ld246.com/forward?goto=',
  'https://developer.aliyun.com/redirect?target=',
  'http://www.360doc.cn/outlink.html?url=',
  'https://www.douban.com/link2/?url=',
  'https://gamebanana.com/linkfilter?url=',
  'https://game.bilibili.com/linkfilter/?url=',
  'https://ref.gamer.com.tw/redir.php?url=',
  'https://www.gcores.com/link?target=',
  'https://link.gitcode.com/?target=',
  'https://gitee.com/link?target=',
  'https://www.google.com/url?q=',
  'https://hellogithub.com/periodical/statistics/click?target=',
  'https://api.himcbbs.com/refer/?url=',
  'https://www.infoq.cn/link?target=',
  'https://xie.infoq.cn/link?target=',
  'https://www.instagram.com/linkshim/?u=',
  'https://www.jianshu.com/go-wild?url=',
  'https://link.juejin.cn/?target=',
  'https://www.kdocs.cn/etapps/query/link?target=',
  'https://www.kookapp.cn/go-wild.html?url=',
  'https://ask.latexstudio.net/go/index?url=',
  'https://www.linkedin.com/safety/go?url=',
  'https://link.logonews.cn/?url=',
  'https://www.mczwlt.net/go-external?url=',
  'https://forum.mczwlt.net/outgoing?url=',
  'https://www.nodeseek.com/jump?to=',
  'https://hd.nowcoder.com/link.html?target=',
  'https://www.oschina.net/action/GoToLink?url=',
  'https://www.qcc.com/web/transfer-link?link=',
  ...['middleb', 'middlect', 'middlem', 'index'].map((page) => `https://c.pc.qq.com/${page}.html?pfurl=`),
  ...['ios', 'pc', 'android'].map((page) => `https://c.pc.qq.com/${page}.html?url=`),
  'https://mail.qq.com/cgi-bin/readtemplate?gourl=',
  'https://wx.mail.qq.com/xmspamcheck/xmsafejump?url=',
  'https://www.skland.com/third-link?target=',
  'https://shimo.im/outlink/black?url=',
  'https://shimo.im/outlink/gray?url=',
  'https://sspai.com/link?target=',
  'https://steamcommunity.com/linkfilter/?url=',
  'https://steamcommunity.com/linkfilter/?u=',
  'https://t.me/iv?url=',
  'https://cloud.tencent.com/developer/tools/blog-entry?target=',
  'https://www.tianyancha.com/security?target=',
  'https://tieba.baidu.com/mo/q/checkurl?url=',
  'https://link.uisdc.com/?redirect=',
  'https://developers.weixin.qq.com/community/middlepage/href?href=',
  'https://open.work.weixin.qq.com/wwopen/uriconfirm?uri=',
  'https://www.yuque.com/r/goto?url=',
  'https://www.youtube.com/redirect?q=',
  'http://redir.yy.duowan.com/warning.php?url=',
  'https://link.zhihu.com/?target=',
  'https://www.curseforge.com/linkout?remoteUrl=',
  'https://leetcode.cn/link/?target=',
  'https://docs.qq.com/scenario/link.html?url=',
  'https://docs.qq.com/scenario/link.html?u=',
  ...['txc', 'support'].flatMap((host) => ['product', 'products'].map((path) => `https://${host}.qq.com/${path}/123/link-jump?jump=`)),
];

const metadata = readFileSync(new URL('../src/userscript.meta.txt', import.meta.url), 'utf8');
const matchPatterns = [...metadata.matchAll(/^\/\/ @match\s+(.+)$/gm)].map((match) => {
  const escaped = match[1].replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*');
  return new RegExp(`^${escaped}$`);
});

for (const prefix of interstitials) {
  test(`redirects ${prefix} with reordered query parameters`, () => {
    const target = 'https://example.com/path?value=a%26b&next=two#section';
    const url = new URL(prefix.replace('?', '?tracking=1&') + encodeURIComponent(target));
    assert.ok(matchPatterns.some((pattern) => pattern.test(url.href)), 'Tampermonkey metadata must allow this URL');
    const navigations = [];
    assert.equal(runRules({ url, navigate: (value) => { navigations.push(value); return true; } }, rules), true);
    assert.deepEqual(navigations, [target]);
  });
}

for (const prefix of ['https://www.xgw4.com/qqdl.html?url=', 'http://iphone.myzaker.com/zaker/link.php?url=']) {
  test(`redirects base64 wrapper ${prefix}`, () => {
    const target = 'https://example.com/?a=1&b=2';
    const navigations = [];
    const context = { url: new URL(prefix + encodeURIComponent(btoa(target))), window: { atob }, navigate: (value) => { navigations.push(value); return true; } };
    assert.equal(runRules(context, rules), true);
    assert.deepEqual(navigations, [target]);
    context.url = new URL(prefix + '%%%');
    assert.equal(runRules(context, rules), false);
  });
}

test('site IDs are unique and all query rules have an independent fixture', () => {
  assert.equal(new Set(rules.map((rule) => rule.id)).size, rules.length);
  const urls = interstitials.map((prefix) => new URL(prefix + 'https%3A%2F%2Fexample.com'));
  for (const rule of queryRules.filter((rule) => !rule.base64)) {
    assert.ok(urls.some((url) => {
      const hosts = Array.isArray(rule.host) ? rule.host : [rule.host];
      return hosts.includes(url.hostname) && (rule.path instanceof RegExp ? rule.path.test(url.pathname) : rule.path === url.pathname)
        && url.searchParams.has(rule.param);
    }), `Missing fixture for ${rule.id}`);
  }
});
