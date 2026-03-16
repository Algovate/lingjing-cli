# lingjing-cli

[![npm version](https://img.shields.io/npm/v/lingjing-cli)](https://www.npmjs.com/package/lingjing-cli)
[![npm downloads](https://img.shields.io/npm/dm/lingjing-cli)](https://www.npmjs.com/package/lingjing-cli)

CLI & MCP Server for JDCloud Lingjing image and video generation APIs. 

## 📦 Installation

```bash
# Install globally
npm install -g lingjing-cli

# Or use directly via npx
npx lingjing-cli
```

*If you are running from the source code locally, you can use `npm run build` and then run `node dist/cli.js` instead of `lingjing`.*

## ⚙️ Configuration

Set your API key via environment variables:

```bash
export LINGJING_API_KEY="your_api_key_here"
# Alternatively, you can use JDCLOUD_API_KEY
```

You can also use a `.env` file in the current directory, or specify one via `--env-file <path>`.

### Global CLI Options

```bash
lingjing [global-options] <command> [options]
```

- `--env-file <path>`: Load env vars from a specific file
- `--skip-env`: Disable auto-loading `.env`
- `--api-key <key>`, `-k`: Override API Key
- `--base-url <url>`: Override API base URL (default: `https://model.jdcloud.com`)
- `--request-id <id>`: Specify a custom `x-jdcloud-request-id` header
- `--json`: Output pure JSON (useful for pipelines and parsing)

## 🚀 CLI Commands

### 1. Model Presets (`preset`)

See the available, ready-to-use model presets:

```bash
# List all presets
lingjing preset list

# Filter by type (image | video)
lingjing preset list --type image

# Filter by provider (e.g., kling, doubao, vidu, hailuo)
lingjing preset list --provider kling --type video

# View details of a specific preset
lingjing preset show doubao-seedream-4-0
```

### 2. Image Generation (`image`)

Submit an image generation task and wait for the result automatically:

```bash
# Doubao SeedDream 4.0
lingjing image \
  --preset doubao-seedream-4-0 \
  --params '{"prompt":"一只戴墨镜的猫","size":"2048x2048","taskNum":1}'

# Kling Image Generation
lingjing image \
  --preset kling-v2-1-image \
  --params '{"prompt":"城市夜景，赛博朋克风格","aspect_ratio":"16:9"}'

# Submit only (without waiting/polling), returns genTaskId
lingjing image \
  --preset doubao-seedream-4-0 \
  --params '{"prompt":"山间晨雾"}' \
  --no-wait
```

### 3. Video Generation (`video`)

Submit a video generation task and wait for the result:

```bash
# Text-to-Video: Kling V3
lingjing video \
  --preset kling-v3-ttv \
  --params '{"prompt":"海边日落，海浪轻拍礁石","duration":"5","mode":"pro","aspect_ratio":"16:9"}'

# Text-to-Video: Doubao Seedance 1.5 Pro
lingjing video \
  --preset doubao-seedance-1-5-pro-ttv \
  --params '{"prompt":"雪山脚下奔跑的骏马","aspect_ratio":"16:9"}'

# Image-to-Video: Kling V3 (Requires a reference image)
lingjing video \
  --preset kling-v3-ptv \
  --params '{"prompt":"人物转身微笑","image_url":"https://example.com/ref.jpg","duration":"5"}'

# Custom polling interval and timeout
lingjing video \
  --preset vidu-q2-ttv \
  --params '{"prompt":"极光下的雪原"}' \
  --interval 10 --timeout 300
```

**Overriding specific parameters inline (`--set`)**:
You can use `--set key=value` to override `params` fields easily:
```bash
lingjing video \
  --preset kling-v3-ttv \
  --params '{"prompt":"星空延时摄影"}' \
  --set duration=10 \
  --set aspect_ratio=9:16
```

### 4. Task Management (`task`)

If you submitted a task using `--no-wait`, you can query or poll its status later using its `genTaskId`:

```bash
# Query the current status of a task
lingjing task get <genTaskId>

# Polling a task until it completes or times out
lingjing task wait <genTaskId> --interval 5 --timeout 600
```

Task Status Reference:
- `taskStatus=4`: Success
- `taskStatus=2`: Failure

---

## 🤖 MCP Server

`lingjing-cli` can operate as an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server via stdio.

### Start MCP Server
```bash
# Run globally installed version:
LINGJING_API_KEY=your_key lingjing-mcp

# Or via the CLI subcommand:
LINGJING_API_KEY=your_key lingjing mcp

# Load from an explicitly defined .env file:
LINGJING_ENV_FILE=/path/to/.env lingjing-mcp
```

### Claude Desktop Integration

You can easily add the MCP server to Claude Code or Claude Desktop.

**For Claude Code:**
```bash
claude mcp add lingjing-cli -- npx -y lingjing-cli mcp
```
*(Make sure to configure your `LINGJING_API_KEY` in your environment or via the `LINGJING_ENV_FILE` variable)*

**For Claude Desktop `claude_desktop_config.json`:**
```json
{
  "mcpServers": {
    "lingjing": {
      "command": "npx",
      "args": ["-y", "lingjing-cli", "mcp"],
      "env": {
        "LINGJING_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|---|---|
| `list_presets` | List and find available models, can be filtered by `capability` and `provider`. |
| `generate_image` | Submit an image generation task and wait for the result automatically. |
| `generate_video` | Submit a video generation task and wait for the result automatically (default timeout 600s). |

#### `list_presets`
| Parameter | Type | Description |
|---|---|---|
| `capability` | `image` \| `text-to-video` \| `image-to-video` \| `reference-to-video` | Filter by capability (optional) |
| `provider` | `doubao` \| `hailuo` \| `kling` \| `paiwo` \| `vidu` | Filter by provider (optional) |

#### `generate_image` / `generate_video`
| Parameter | Type | Default | Description |
|---|---|---|---|
| `preset` | string | — | The preset key, e.g., `doubao-seedream-4-0` |
| `params` | object | — | Task parameter object (e.g., prompt, aspect_ratio) |
| `interval` | number | 5 | Polling interval in seconds |
| `timeout` | number | 300 / 600 | Max waiting time in seconds |

Returns: `{ submit, result, urls }`, where `urls` easily provides the extracted direct links to the generated media.

## License
MIT
