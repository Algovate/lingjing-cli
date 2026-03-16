# lingjing-cli

[![npm version](https://img.shields.io/npm/v/lingjing-cli)](https://www.npmjs.com/package/lingjing-cli)
[![npm downloads](https://img.shields.io/npm/dm/lingjing-cli)](https://www.npmjs.com/package/lingjing-cli)

按资源拆分的命令体系：

- `image`: 图片生成
- `video`: 视频生成
- `preset`: 模型预设查询
- `task`: 任务查询与轮询
- `mcp`: 以 stdio MCP 服务器模式启动（供 Claude Desktop / claude mcp add 使用）

## 安装

```bash
npm install
npm run build
```

## 全局参数

```bash
node dist/cli.js [global-options] <command> [options]
```

- `--env-file <path>`: 指定 env 文件
- `--skip-env`: 禁用自动加载 `.env`
- `--api-key <key>`: 覆盖 API Key
- `--base-url <url>`: 覆盖域名（默认 `https://model.jdcloud.com`）
- `--request-id <id>`: 指定请求 ID
- `--json`: JSON 输出模式

环境变量：

- `LINGJING_API_KEY` / `JDCLOUD_API_KEY`
- `LINGJING_BASE_URL`

## image

提交图片任务并等待结果：

```bash
# 豆包 SeedDream 4.0
node dist/cli.js image \
  --preset doubao-seedream-4-0 \
  --params '{"prompt":"一只戴墨镜的猫","size":"2048x2048","taskNum":1}'

# Kling 图像生成
node dist/cli.js image \
  --preset kling-v2-1-image \
  --params '{"prompt":"城市夜景，赛博朋克风格","aspect_ratio":"16:9"}'

# 只提交不等待（返回 genTaskId）
node dist/cli.js image \
  --preset doubao-seedream-4-0 \
  --params '{"prompt":"山间晨雾"}' \
  --no-wait
```

## video

提交视频任务并等待结果：

```bash
# 文生视频：Kling V3
node dist/cli.js video \
  --preset kling-v3-ttv \
  --params '{"prompt":"海边日落，海浪轻拍礁石","duration":"5","mode":"pro","aspect_ratio":"16:9"}'

# 文生视频：豆包 Seedance
node dist/cli.js video \
  --preset doubao-seedance-1-5-pro-ttv \
  --params '{"prompt":"雪山脚下奔跑的骏马","aspect_ratio":"16:9"}'

# 图生视频：Kling V3（需提供参考图）
node dist/cli.js video \
  --preset kling-v3-ptv \
  --params '{"prompt":"人物转身微笑","image_url":"https://example.com/ref.jpg","duration":"5"}'

# 自定义轮询间隔和超时
node dist/cli.js video \
  --preset vidu-q2-ttv \
  --params '{"prompt":"极光下的雪原"}' \
  --interval 10 --timeout 300

# 只提交不等待
node dist/cli.js video \
  --preset kling-v3-ttv \
  --params '{"prompt":"瀑布飞流直下"}' \
  --no-wait
```

## preset

```bash
node dist/cli.js preset list
node dist/cli.js preset list --type image
node dist/cli.js preset list --type video --provider kling
node dist/cli.js preset show doubao-seedream-4-0
```

## task

```bash
node dist/cli.js task get <genTaskId>
node dist/cli.js task wait <genTaskId> --interval 5 --timeout 600
```

状态规则：

- `taskStatus=4` 成功
- `taskStatus=2` 失败

## params 说明

- `--params` / `--params-file` 是 API body 里的 `params` 对象。
- CLI 会自动组装成 `{ apiId, params }` 调用提交接口。
- 使用 `--preset` 时，会自动补 `model` 或 `model_name`（若未提供）。
- `--set key=value` 可覆盖 `params` 字段（可重复）：

```bash
node dist/cli.js video \
  --preset kling-v3-ttv \
  --params '{"prompt":"星空延时摄影"}' \
  --set duration=10 \
  --set aspect_ratio=9:16
```

## MCP 服务器

### 启动方式

```bash
# 直接运行
LINGJING_API_KEY=xxx node dist/mcp.js

# 或通过 CLI 子命令
LINGJING_API_KEY=xxx node dist/cli.js mcp
```

### 注册到 Claude Code

```bash
claude mcp add lingjing -- node /path/to/dist/mcp.js
```

在 MCP 服务器的环境变量中设置 `LINGJING_API_KEY`，也可通过 `LINGJING_ENV_FILE` 指定 env 文件路径：

```bash
LINGJING_ENV_FILE=/path/to/.env node dist/mcp.js
```

### MCP Tools

| Tool | 说明 |
|---|---|
| `list_presets` | 列出预设，可按 `capability` / `provider` 过滤 |
| `generate_image` | 提交图片任务并等待结果 |
| `generate_video` | 提交视频任务并等待结果（默认超时 600s）|

#### `list_presets`

| 参数 | 类型 | 说明 |
|---|---|---|
| `capability` | `image` \| `text-to-video` \| `image-to-video` \| `reference-to-video` | 按能力过滤（可选） |
| `provider` | `doubao` \| `hailuo` \| `kling` \| `paiwo` \| `vidu` | 按供应商过滤（可选） |

#### `generate_image` / `generate_video`

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `preset` | string | — | 预设 key，如 `doubao-seedream-4-0` |
| `params` | object | — | 任务参数对象 |
| `interval` | number | 5 | 轮询间隔（秒） |
| `timeout` | number | 300 / 600 | 最大等待秒数 |

返回结构：`{ submit, result, urls }`，`urls` 为提取出的图片/视频直链列表。
