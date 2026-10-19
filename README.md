# Open-the-F-king-URL-Right-Now
自动跳转某些网站不希望用户直达的外链。

这个仓库是油猴插件 [Open the F**king URL Right Now](https://greasyfork.org/zh-CN/scripts/412612-open-the-f-king-url-right-now) 的源码。

## 简介
很多时候，在网上读到一篇好文章，我们被作者思想的深度，逻辑论证的缜密，内容的旁征博引所折服，这时我们往往也想去作者给出的相关链接上看看是怎样的奇文给了作者启发，写出了这样一篇振聋发聩的好文，于是点击链接，但是很多时候会突然跳出来一行字，要用户手动复制该链接贴到地址栏访问才行，被网站这样一折腾，刚刚提起来的求知欲一下子烟消云散了。

一次两次也倒罢了，但最近此风甚长，还有愈演愈烈之势，好好的超链接变成了一个个的『超不链接』，其他网站为了留存用户，延长用户停留时间，不惜以暴制暴，进行恶性竞争，结果就是互联网的用户体验变成了各大公司利益的牺牲品，在夹缝中艰难地生存，昔日的信息高速公路上就这样被人为地挖了许多坑。

为了把互联网体验变回我们熟悉的样子，为了让超链接能痛快地把用户送到终点，就写了这样一个简单的脚本，欢迎大家试用！

## 安装

在 Tampermonkey 中安装 [Greasy Fork 发布版本](https://greasyfork.org/zh-CN/scripts/412612-open-the-f-king-url-right-now)，或将仓库根目录的 [`userscript.js`](userscript.js) 内容复制到新建脚本中。

## 项目结构

```text
src/
  index.js                  # 浏览器入口及 document-ready 初始化
  userscript.meta.txt       # Tampermonkey 元数据、站点范围及版本号
  core/
    url.js                  # URL 提取、校验、Base64 解码及文本 URL 拆分
    runner.js               # 规则匹配及可注入的浏览器上下文
  rules/
    query.js                # 从查询参数提取目标地址的规则
    custom.js               # DOM、路径编码及站点交互规则
    index.js                # 统一规则注册表
  handlers/
    redirects.js            # 特殊跳转页处理
    forums.js               # 论坛及问卷外链处理
    wechat.js               # 微信文章链接与图片处理
scripts/
  build.js                  # 将模块打包为单文件 userscript
test/
  helpers/browser.js        # jsdom + jQuery 浏览器环境及导航记录
  *.test.js                 # URL、规则、DOM 和构建产物测试
.github/workflows/ci.yml    # 自动测试及构建一致性检查
userscript.js               # 提交到仓库的安装产物，由构建生成
```

## 开发

需要 Node.js 22.8 或更新版本及 npm。

```sh
npm ci
npm test
npm run build
npm run check
```

修改 `src/` 下的源码，运行 `npm run build` 后将源码和生成的 `userscript.js` 一起提交。根目录的安装文件路径保持不变，请勿直接编辑生成文件。esbuild 只打包项目代码；运行时仍由 Tampermonkey 的 `@require` 加载 jQuery，npm 中的 jQuery 和 jsdom 用于测试。

`npm run check` 运行所有测试、检查覆盖率，并确认安装产物与源码一致；产物过期时会失败，不会覆盖文件。`npm run test:coverage` 只统计 `src/**/*.js` 的覆盖率，要求整体行覆盖率、分支覆盖率和函数覆盖率均达到 95%，任何一项不足都会返回非零退出码。CI 使用相同的覆盖率检查及构建一致性检查。测试不访问真实站点，所有导航及新窗口操作均通过记录调用验证。

## 添加站点支持

1. 在 `src/userscript.meta.txt` 中添加 `@match`。查询参数可能改变顺序，使用 `?*target=*` 等模式；语法参考 [Tampermonkey 官方文档](https://www.tampermonkey.net/documentation.php?q=include)。
2. 普通跳转在 `src/rules/query.js` 中添加唯一的 `id`、`host`、`path` 和 `param`；Base64 参数加上 `base64: true`。`host` 支持一个域名或域名数组，`path` 支持精确路径或带首尾锚点的正则表达式。
3. 特殊行为放在 `src/handlers/`，并在 `src/rules/custom.js` 注册。处理函数接收 `{ window, document, url, $, navigate, logger }`；通过 `navigate()` 跳转，无法处理时返回 `false`。匹配器仅执行第一个匹配规则。
4. 在 `test/` 添加真实 URL 格式或 DOM 样例，覆盖正常情况和缺失/无效输入，然后运行 `npm run build` 和 `npm run check`。

发布时同步修改 `package.json` 和 `src/userscript.meta.txt` 的版本号，再重新构建。构建会检查两个版本是否一致。

### QQ 中转页参数边界

`c.pc.qq.com` 的 `ios.html`、`pc.html` 和 `android.html` 支持两种 `url=` 格式：

- 已编码目标地址按外层查询参数解析，保留目标内部的编码，忽略其后的外层参数。
- 以 `http://` 或 `https://` 开头的未编码目标地址，从 `url=` 起保留完整剩余内容，包括 `&`、`+`、百分号编码和片段。未编码格式无法可靠区分目标参数与中转页尾部参数，因此不猜测删除 `level`、`sublevel` 等字段。

目标地址的尾斜杠保持原样；不会按域名或路径猜测删除，以免改变合法地址。

### 2libra 站内外链确认

`2libra.com` 的帖子与评论直接使用目标地址作为 `href`，由页面点击事件弹出站外链接确认框。脚本在捕获阶段阻止外部 HTTP(S) 链接进入该处理，保留浏览器原生打开行为以及链接的查询参数、片段、`target` 和 `rel`。委托监听也适用于动态加载的评论和站内切换后的内容；站内链接及非 HTTP(S) 链接仍交给页面处理。
