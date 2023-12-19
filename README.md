# later-url
使用 Cloudflare Worker 的 KV 存储收集和管理链接

## 使用 Wrangler CLI 开发

> wrangler 安装和登录见下方链接：
>
> wdssmq/fadian-cf：[https://github.com/wdssmq/fadian-cf#readme](https://github.com/wdssmq/fadian-cf#readme "wdssmq/fadian-cf")


## 初始配置

### 克隆项目并安装依赖

```bash
git clone git@github.com:wdssmq/later-url.git later-url
cd later-url
pnpm install

```

### 配置 wrangler 及 R2 存储

通过「面板」或者「命令行」创建 KV 命名空间，然后配置 wrangler.toml 文件。

- [文档：通过管理面板创建 KV](https://developers.cloudflare.com/kv/get-started/#create-a-kv-namespace-via-the-dashboard "文档：通过管理面板创建 KV")
- [文档：通过命令行创建 KV](https://developers.cloudflare.com/kv/get-started/#create-a-kv-namespace-via-wrangler "文档：通过命令行创建 KV")
- wrangler.toml 内 `binding` 的值好像只要和 `src/index.js` 内同名即可？


### 设置 Secrets 变量

需要设置 `BEARER_TOKEN` 变量用于鉴权，可以使用 Secrets 变量而不是直接写在代码里；

1、本地开发环境设置 Secrets

- 在项目根目录下创建 `.dev.vars` 文件，内容如下：

```dotenv
BEARER_TOKEN = token_value_here

```

2、线上环境设置 Secrets

```bash
# 依次执行以下命令，输入对应的值；
wrangler secret put BEARER_TOKEN

wrangler secret put other_secret_key

# 查看 Secrets
wrangler secret list

# 删除 Secrets
# wrangler secret delete <KEY> [OPTIONS]

```

### 运行 / 发布

```bash
# 调试运行
npm run dev

# │ [b] open a browser, [d] open Devtools, [l] turn on local mode, [c] clear console, [x] to exit

```

```bash
# 发布
npm run deploy

```

## 文档链接

Get started · Cloudflare Workers KV：

[https://developers.cloudflare.com/kv/get-started/#create-a-kv-namespace-via-the-dashboard](https://developers.cloudflare.com/kv/get-started/#create-a-kv-namespace-via-the-dashboard "Get started · Cloudflare Workers KV")

Environment variables · Cloudflare Workers docs：

[https://developers.cloudflare.com/workers/configuration/environment-variables/](https://developers.cloudflare.com/workers/configuration/environment-variables/ "Environment variables · Cloudflare Workers docs")
