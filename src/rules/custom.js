import {
  redirectFromElement, redirectQQDocs, redirectQQ, redirectWeibo, redirectPixiv,
  redirectBase64Path, redirectGamerPath,
} from '../handlers/redirects.js';
import {
  removeFwinDialog, enableNgaLinks, enable360DocLinks, enableQQSurveyLinks, enable2LibraLinks,
} from '../handlers/forums.js';
import { enableWechatURLs } from '../handlers/wechat.js';

export const customRules = [
  { id: '2libra', host: '2libra.com', path: /^\//, handler: enable2LibraLinks },
  { id: 'acgrip', host: 'bbs.acgrip.com', path: /^\//, handler: removeFwinDialog },
  { id: 'blzxteam', host: 'blzxteam.com', path: '/gowild.htm', handler: redirectFromElement('div._2VEbEOHfDtVWiQAJxSIrVi_0', 'title') },
  { id: 'bookmarkearth', host: 'www.bookmarkearth.com', path: /^\/view\//, handler: redirectFromElement('p.link') },
  { id: 'cto51', runAt: 'start', host: 'blog.51cto.com', path: '/transfer', handler: ({ url, navigate }) => navigate(decodeURIComponent(url.href.split('/transfer?')[1] ?? '')) },
  { id: 'doc360', host: 'www.360doc.com', path: /^\/content\//, handler: enable360DocLinks },
  { id: 'gamertw', runAt: 'start', host: 'ref.gamer.com.tw', path: /^\/redir\.php\/url=/, handler: redirectGamerPath },
  { id: 'iplaysoft', host: 'www.iplaysoft.com', path: '/link/', handler: redirectFromElement('#targetUrl a', 'href') },
  { id: 'luogu', host: 'www.luogu.com.cn', path: /^\/(paste|discuss|article)\//, handler: redirectFromElement('#url') },
  { id: 'mcmod', runAt: 'start', host: 'link.mcmod.cn', path: /^\/target\//, handler: redirectBase64Path('/target/') },
  { id: 'nga', host: ['nga.178.com', 'bbs.nga.cn'], path: '/read.php', handler: enableNgaLinks },
  { id: 'pixiv', runAt: 'start', host: 'www.pixiv.net', path: '/jump.php', handler: redirectPixiv },
  { id: 'qq2', runAt: 'start', host: 'c.pc.qq.com', path: /^\/(ios|pc|android)\.html$/, handler: redirectQQ },
  { id: 'qqdocs', runAt: 'start', host: 'docs.qq.com', path: '/scenario/link.html', handler: redirectQQDocs },
  { id: 'techlife', runAt: 'start', host: 't.techlife.app', path: '/', handler: redirectBase64Path('', { hash: true }) },
  { id: 'tieba', host: 'jump2.bdimg.com', path: '/safecheck/index', handler: redirectFromElement('.btn', 'href') },
  { id: 'unsafelink', runAt: 'start', host: 'unsafelink.com', path: /^\//, handler: ({ url, navigate }) => navigate(url.href.slice(url.origin.length + 1)) },
  { id: 'wechat-article', host: 'mp.weixin.qq.com', path: /^\/s\//, handler: enableWechatURLs },
  { id: 'wechat-warning', host: 'weixin110.qq.com', path: '/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi', handler: redirectFromElement('.weui-msg__desc') },
  { id: 'wechat-access', host: 'mp.weixin.qq.com', path: '/s', handler: redirectFromElement('#js_access_msg', 'href') },
  { id: 'weibo-short', host: 't.cn', path: /^\//, handler: redirectWeibo },
  { id: 'weibo', host: 'weibo.cn', path: '/sinaurl', handler: redirectWeibo },
  { id: 'wj_qq', host: 'wj.qq.com', path: /^\/s2\//, handler: enableQQSurveyLinks },
];
