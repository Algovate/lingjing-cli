# 京东云灵境文档汇总

> 生成时间：2026-03-15 21:39:46 CST

## 目录

1. [jdcloud-lingjing-commoninfo](#01-jdcloud-lingjing-commoninfo)
2. [jdcloud-lingjing-doubaopic](#02-jdcloud-lingjing-doubaopic)
3. [jdcloud-lingjing-doubaoptv](#03-jdcloud-lingjing-doubaoptv)
4. [jdcloud-lingjing-doubaottv](#04-jdcloud-lingjing-doubaottv)
5. [jdcloud-lingjing-hailuoptv](#05-jdcloud-lingjing-hailuoptv)
6. [jdcloud-lingjing-hailuortv](#06-jdcloud-lingjing-hailuortv)
7. [jdcloud-lingjing-hailuottp](#07-jdcloud-lingjing-hailuottp)
8. [jdcloud-lingjing-hailuottv](#08-jdcloud-lingjing-hailuottv)
9. [jdcloud-lingjing-kelingpicture](#09-jdcloud-lingjing-kelingpicture)
10. [jdcloud-lingjing-kelingptv](#10-jdcloud-lingjing-kelingptv)
11. [jdcloud-lingjing-kelingrtv](#11-jdcloud-lingjing-kelingrtv)
12. [jdcloud-lingjing-kelingttv](#12-jdcloud-lingjing-kelingttv)
13. [jdcloud-lingjing-paiwoptv](#13-jdcloud-lingjing-paiwoptv)
14. [jdcloud-lingjing-paiwortv](#14-jdcloud-lingjing-paiwortv)
15. [jdcloud-lingjing-paiwottv](#15-jdcloud-lingjing-paiwottv)
16. [jdcloud-lingjing-viduptv](#16-jdcloud-lingjing-viduptv)
17. [jdcloud-lingjing-vidurpicture](#17-jdcloud-lingjing-vidurpicture)
18. [jdcloud-lingjing-vidurtv](#18-jdcloud-lingjing-vidurtv)
19. [jdcloud-lingjing-viduttv](#19-jdcloud-lingjing-viduttv)

---

## 01. jdcloud-lingjing-commoninfo

# 京东云灵境通用信息

来源：https://docs.jdcloud.com/cn/lingjing/commoninfo

## 1. 基础调用信息

所有模型（包括海螺、拍我、Seedream、Vidu 等）均使用统一的异步任务提交端点。

| 类别 | 内容 |
| --- | --- |
| **请求域名** | `https://model.jdcloud.com` |
| **接口路径** | `/joycreator/openApi/submitTask` |
| **请求方法** | `POST` |
| **数据格式** | `application/json` |

---

## 2. 接口鉴权 (Authentication)

接口通过 HTTP Header 进行鉴权，您需要申请 `ApiKey` 并将其放置在 `Authorization` 字段中。

| Header 字段 | 值说明 |
| --- | --- |
| **Authorization** | 格式为 `Bearer ${your_app_key}` |
| **x-jdcloud-request-id** | 客户端生成的请求唯一 ID (用于链路追踪与排查问题) |
| **Content-Type** | 固定为 `application/json` |

---

## 3. API 结果查询 (Task 结果查询)

该接口用于非开放平台前端调用。后端逻辑将验证 API Key 的合法性，并根据提交任务时返回的 `genTaskId` 查询最终结果。查询结果包含加水印与非水印的资源地址。

### 3.1 快速开始：Curl 调用示例

```bash
curl -X POST "https://{domain}/joycreator/openApi/queryTasKResult" \
  -H "Authorization: Bearer {your_api_key}" \
  -H "Content-Type: application/json" \
  -H "x-jdcloud-request-id: {request_id}" \
  -d '{
    "genTaskId": "1024"
  }'

```

### 3.2 请求参数说明

**Header 参数**
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| **Authorization** | string | 是 | 格式：`Bearer xxx`。xxx 为用户在开放平台中某个应用下的 API Key。 |
| **x-jdcloud-request-id** | string | 是 | 建议使用类 UUID 数据，用于请求追踪。 |
| **Content-Type** | string | 是 | 固定值：`application/json` |

**Body 参数**
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| **genTaskId** | string | 是 | 提交任务接口返回的任务 ID。 |

---

## 4. 返回参数说明

### 4.1 基础响应结构

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| **requestId** | string | 请求唯一标识。 |
| **error** | string | 错误信息（正常时为空）。 |
| **result** | object | 业务结果对象。 |

### 4.2 Result 内部详细字段

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| **id** | string | 任务 ID。 |
| **pin** | string | 此任务归属的云主账号。 |
| **sceneCode** | string | 场景类型（文生视频、图生视频、参考生视频、图片生成、模板生视频）。 |
| **modelCode** | string | 模型 ID。 |
| **reqParam** | string | JSON 格式字符串，为此任务提交时的原始任务参数。 |
| **taskStatus** | int | 父级任务状态：**2 为整体失败、4 为整体成功**。 |
| **billingItemKey** | string | 计费项。 |
| **billingItemValue** | BigDecimal | 计费项数量。 |
| **createTime** | DateTime | 任务创建时间。 |
| **updateTime** | DateTime | 任务更新时间。 |
| **finishedTime** | DateTime | 任务完成时间。 |
| **taskResults** | JsonArray | 子任务详细数据列表。 |
| ∟ **subStatus** | int | 子任务状态：2 为失败、4 为成功。 |
| ∟ **url** | string | 子任务生成内容的**非水印** URL。 |
| ∟ **watermarkUrl** | string | 子任务生成内容的**加水印** URL。 |
| ∟ **errorReason** | string | 子任务错误原因。 |
| **resultNum** | int | 实际有结果生成的子任务数量。 |
| **targetNum** | int | 预期生成的子任务数量。 |
| **appId** | string | 此次任务调用的 App ID。 |
| **apiKey** | string | 此次任务调用的 API Key。 |
| **error** | string | 整体错误原因。 |
| **success** | boolean | 逻辑执行是否成功。 |

---

## 5. 响应示例

```json
{
    "requestId": "s-f27939be9bd24d56b1f4c27746908b1c",
    "error": "",
    "result": {
        "id": "1024",
        "pin": "jd_cloud_user",
        "sceneCode": "文生视频",
        "modelCode": "v5.5",
        "taskStatus": 4,
        "taskResults": [
            {
                "subStatus": 4,
                "url": "https://{domain}/storage/output_raw.mp4",
                "watermarkUrl": "https://{domain}/storage/output_watermarked.mp4",
                "errorReason": ""
            }
        ],
        "resultNum": 1,
        "targetNum": 1,
        "success": true
    }
}

```

---

## 02. jdcloud-lingjing-doubaopic

# 京东云灵境 豆包图片生成

来源：https://docs.jdcloud.com/cn/lingjing/doubaopic

## 1. 快速开始：Curl 调用示例

通过该统一端点提交任务。Seedream 的生图接口支持通过 `image` 数组处理参考图（如为纯文生图，该数组可为空）。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId":"[对应接口ID]",
      "params":{
        "prompt": "在此输入您的图片创意描述",
        "model": "[对应模型名称]",
        "size": "2048x2048",
        "taskNum": 1,
        "image": ["可选：参考图URL"]
      }
  }'


```

---

## 2. 模型版本与参数对照表

根据您的版本需求和生成维度选择对应的配置：

| 模型版本 | 接口 ID | 模型名称 (model) | 支持尺寸 (size) | 生成数量 (taskNum) |
| --- | --- | --- | --- | --- |
| **Seedream 4.0** | `700` | `doubao-seedream-4-0-250828` | 见下文详细尺寸列表 | 1-4 张 |
| **Seedream 4.5** | `701` | `doubao-seedream-4-5-251128` | 见下文详细尺寸列表 | 1-4 张 |

---

## 3. 详细参数说明 (params)

| 字段名 | 类型 | 必填 | 详细说明 |
| --- | --- | --- | --- |
| **prompt** | string | 是 | 图片生成的文字描述。 |
| **model** | string | 是 | 必须填入对应的模型名称。 |
| **size** | string | 是 | 支持：`2048x2048`, `2304x1728`, `1728x2304`, `2560x1440`, `1440x2560`, `2496x1664`, `1664x2496`, `3024x1296`。 |
| **taskNum** | int | 是 | 单次任务生成的图片张数，范围 1-4。 |
| **image** | stringArray | 否 | 参考图 URL 数组。用于图生图或提供视觉特征参考。 |

---

## 4. 输出说明

任务提交成功后，系统返回以下格式的响应结果：

```json
{
  "apiKey":"${your_api_key}",
  "appId":"${your_app_id}",
  "error":"INVALID_API_KEY",
  "errorParamName":"${some one param}",
  "genTaskId":"任务ID:用于查询任务状态",
  "requestId":"${your_request_id}",
  "success":true
}

```

---

## 03. jdcloud-lingjing-doubaoptv

# 京东云灵境 豆包图生视频

来源：https://docs.jdcloud.com/cn/lingjing/doubaoptv

## 1. 快速开始：Curl 调用示例

通过该统一端点提交字节跳动 Seedance 图生视频任务。请根据下表填入对应的 `apiId` 与 `model_name`。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId": "751",
      "params": {
        "image_urls": "图片URL1"
        "prompt": "在此输入您的视频创意描述",
        "model_name": "Doubao-Seedance-1.5-pro",
        "duration": "5",
        "mode": "720p",
        "aspect_ratio": "16:9",
        "generate_audio": true
      }
  }'

```

> **注意**：`image_urls` 为字符串数组格式；`generate_audio` 为布尔值。

---

## 2. 模型版本与参数特征映射

字节系列图生视频模型版本及特有支持如下：

| 模型版本 | 接口 ID (apiId) | 模型名称 (model_name) | 特有参数/模式支持 |
| --- | --- | --- | --- |
| **Seedance 1.5 Pro** | `751` | `Doubao-Seedance-1.5-pro` | 使用 `image_urls` 数组提交参考图 |

---

## 3. 请求参数详细说明 (params)

配置生成任务的具体属性：

| 字段名 | 类型 | 必填 | 详细说明 |
| --- | --- | --- | --- |
| **image_urls** | stringArray | 是 | 参考图片列表，传入图片 URL 地址。 |
| **prompt** | string | 是 | 视频生成提示词。 |
| **model_name** | string | 是 | 必须固定为 `Doubao-Seedance-1.5-pro`。 |
| **duration** | string | 是 | 视频时长，可选值：`"5"`, `"10"`, `"12"`。 |
| **mode** | string | 是 | 视频分辨率：`"480p"`, `"720p"`, `"1080p"`。 |
| **aspect_ratio** | string | 是 | 宽高比：`"16:9"`, `"9:16"`, `"4:3"`, `"1:1"`, `"4:4"`, `"21:9"`。 |
| **generate_audio** | boolean | 否 | 是否同步生成音频：`true` (开启), `false` (关闭)。 |

> **重要提示**：图片 URL 地址必须保证公网可访问。

---

## 4. 输出响应说明 (JSON)

接口提交成功后，将返回统一的任务回执：

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "INVALID_API_KEY",
	"errorParamName": "${some one param}",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 04. jdcloud-lingjing-doubaottv

# 京东云灵境 豆包文生视频

来源：https://docs.jdcloud.com/cn/lingjing/doubaottv

## 1. 快速开始：Curl 调用示例

通过该统一端点提交字节跳动 Seedance 视频生成任务。请根据下表填入对应的 `apiId` 与 `model_name`。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId": "750",
      "params": {
        "prompt": "在此输入您的视频创意描述",
        "model_name": "Doubao-Seedance-1.5-pro",
        "duration": "5",
        "mode": "720p",
        "aspect_ratio": "16:9",
        "generate_audio": true
      }
  }'

```

> **注意**：`generate_audio` 字段为布尔值（`true`/`false`），用于控制是否同步生成音频。

---

## 2. 模型版本与参数特征映射

字节系列文生视频模型版本及特有支持如下：

| 模型版本 | 接口 ID (apiId) | 模型名称 (model_name) | 特有参数/模式支持 |
| --- | --- | --- | --- |
| **Seedance 1.5 Pro** | `750` | `Doubao-Seedance-1.5-pro` | 支持多分辨率 (`mode`)、多种宽高比及同步音频 |

---

## 3. 请求参数详细说明 (params)

配置生成任务的具体属性：

| 字段名 | 类型 | 必填 | 详细说明 |
| --- | --- | --- | --- |
| **prompt** | string | 是 | 视频生成提示词。 |
| **model_name** | string | 是 | 必须固定为 `Doubao-Seedance-1.5-pro`。 |
| **duration** | string | 是 | 视频时长，可选值：`"5"`, `"10"`, `"12"`。 |
| **mode** | string | 是 | 视频分辨率：`"480p"`, `"720p"`, `"1080p"`。 |
| **aspect_ratio** | string | 是 | 宽高比：`"16:9"`, `"9:16"`, `"4:3"`, `"1:1"`, `"4:4"`, `"21:9"`。 |
| **generate_audio** | boolean | 否 | 是否同步生成音频：`true` (开启), `false` (关闭)。 |

> **提示**：若涉及图片参考（如后续扩展图生视频），图片 URL 地址必须保证公网可访问。

---

## 4. 输出响应说明 (JSON)

接口提交成功后，将返回统一的任务回执：

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "INVALID_API_KEY",
	"errorParamName": "${some one param}",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 05. jdcloud-lingjing-hailuoptv

# 京东云灵境 海螺图生视频

来源：https://docs.jdcloud.com/cn/lingjing/hailuoptv

## 1. 快速开始：Curl 调用示例

通过该接口可提交图生视频任务。请根据您的业务需求选择对应的 `apiId` 与 `model` 参数。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId":"[填入 apiId]",
      "params":{
        "first_frame_image": "https://example.com/image1.jpg",
        "last_frame_image": "https://example.com/image2.jpg", 
        "prompt": "在此输入您的视频动态描述",
        "model": "[填入模型名称]",
        "duration": 6,
        "resolution": "1080P"
      }
  }'

```

> **注意**：`last_frame_image` 仅在 **Hailuo-02** 模型下生效。

---

## 2. 模型版本与参数特征映射

各版本模型在功能支持和接口 ID 上存在细微差异：

| 模型版本 | 接口标识 (apiId) | 模型名称 (model) | 特有参数支持 |
| --- | --- | --- | --- |
| **Hailuo-02** | `457` | `MiniMax-Hailuo-02` | 支持首帧+尾帧控制 (`last_frame_image`) |
| **Hailuo-2.3** | `461` | `MiniMax-Hailuo-2.3` | 仅支持首帧控制 |
| **Hailuo-2.3-Fast** | `462` | `MiniMax-Hailuo-2.3-Fast` | 仅支持首帧控制，侧重生成速度 |

---

## 3. 请求参数结构说明

在 `params` 字典中配置以下字段：

| 字段名 | 类型 | 必填 | 详细说明 |
| --- | --- | --- | --- |
| **first_frame_image** | string | 是 | 视频起始帧图片的公网可访问 URL |
| **last_frame_image** | string | 否 | 视频结束帧图片 URL（仅 **Hailuo-02** 支持） |
| **prompt** | string | 是 | 描述视频运动、风格或内容的提示词 |
| **model** | string | 是 | 模型名称，需与版本对应 |
| **duration** | int | 是 | 视频时长：`6` 或 `10` 秒 |
| **resolution** | string | 是 | 视频分辨率：`1080P` 或 `768P` |

---

## 4. 业务逻辑约束 (时长与分辨率)

为了保证生成质量，分辨率的选择受限于视频时长限制：

| 视频时长 (duration) | 允许的分辨率 (resolution) 取值 |
| --- | --- |
| **6 秒** | `768P` (768p) 或 `1080P` (1080p) |
| **10 秒** | 仅支持 `768P` (768p) |

---

## 5. 输出响应说明

接口调用成功后返回任务回执，您需通过 `genTaskId` 查询任务状态。

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "INVALID_API_KEY",
	"errorParamName": "${some one param}",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 06. jdcloud-lingjing-hailuortv

# 京东云灵境 海螺参考生视频

来源：https://docs.jdcloud.com/cn/lingjing/hailuortv

## 1. 快速开始：Curl 调用示例

通过该接口可以提交基于主体参考的视频生成任务。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId":"459",
      "params":{
        "subject_reference": {},
        "prompt": "在此输入您的视频创意描述",
        "model": "S2V-01"
      }
  }'

```

---

## 2. 请求参数详细说明 (params)

配置生成任务的具体属性：

| 字段名 | 类型 | 详细说明 |
| --- | --- | --- |
| **subject_reference** | object | 主体参考对象 |
| **prompt** | string | 视频生成提示词 |
| **model** | string | 固定值为 `S2V-01` |

> **注意**：图片 URL 地址必须保证在公网环境下可访问。

---

## 3. 输出响应说明 (JSON)

接口调用成功后返回任务回执，您需通过 `genTaskId` 查询任务状态。

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "INVALID_API_KEY",
	"errorParamName": "${some one param}",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 07. jdcloud-lingjing-hailuottp

# 京东云灵境 海螺图片生成

来源：https://docs.jdcloud.com/cn/lingjing/hailuottp

## 1. 快速开始：Curl 调用示例

通过该接口可以向服务器提交图片生成任务。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId":"456",
      "params":{
        "subject_reference": ["https://example.com/image.jpg"],
        "prompt": "在此输入您的图片描述词",
        "model": "image-01",
        "aspect_ratio": "16:9"
      }
  }'

```

---

## 2. 请求参数详细说明 (params)

配置图片生成的具体属性：

| 字段名 | 类型 | 详细说明 |
| --- | --- | --- |
| **subject_reference** | stringArray | 主体参考图的 URL 数组 |
| **prompt** | string | 图片生成提示词 |
| **model** | string | 固定值为 `image-01` |
| **aspect_ratio** | string | 生成图片的比例，可选值：`16:9`, `9:16`, `1:1`, `4:3`, `3:4` |

> **注意**：所有参考图片 URL 地址必须保证公网可访问。

---

## 3. 输出响应说明 (JSON)

接口提交成功后，将返回包含任务 ID 的响应报文，用于后续查询生成结果：

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "INVALID_API_KEY",
	"errorParamName": "${some one param}",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 08. jdcloud-lingjing-hailuottv

# 京东云灵境 海螺文生视频

来源：https://docs.jdcloud.com/cn/lingjing/hailuottv

## 1. 快速开始：Curl 调用示例

通过该接口可以向服务器提交视频生成任务。请根据下表选择对应的 `apiId` 与 `model` 字段。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId":"[填入 apiId]",
      "params":{
        "prompt": "在此输入您的视频创意描述",
        "model": "[填入模型名称]",
        "duration": 6,
        "resolution": "1080P"
      }
  }'

```

---

## 2. 模型版本与鉴权参数映射

不同版本的海螺模型对应不同的 API 标识符：

| 模型版本 | 接口标识符 (apiId) | 模型名称 (model) |
| --- | --- | --- |
| **Hailuo-02** | `458` | `MiniMax-Hailuo-02` |
| **Hailuo-2.3**  | `460` | `MiniMax-Hailuo-2.3` |

---

## 3. 请求参数结构说明

在 `params` 字段中，需配置以下视频生成属性：

| 字段名 | 类型 | 详细说明 |
| --- | --- | --- |
| **prompt** | string | 视频生成提示词 |
| **model** | string | 模型名称，需与版本对应 |
| **duration** | int | 视频时长，可选值范围：`6`, `10`（单位：秒） |
| **resolution** | string | 分辨率，可选值：`1080P`, `768P` |

> **开发提示**：若涉及图片参考，图片 URL 地址必须保证在公网环境下可访问。

---

## 4. 业务逻辑与参数约束 (Duration vs Resolution)

视频的分辨率受限于选定的时长，配置时请遵循以下约束：

| 视频时长 (duration) | 允许的分辨率 (resolution) 取值范围 |
| --- | --- |
| **6 秒** | 可选 `768P` 或 `1080P` |
| **10 秒** | 仅支持 `768P` |

---

## 5. 响应报文与任务回执

接口调用后将返回任务回执，您需记录 `genTaskId` 以便后续查询视频生成状态。

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "INVALID_API_KEY",
	"errorParamName": "${some one param}",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 09. jdcloud-lingjing-kelingpicture

# 京东云灵境 可灵图片生成

来源：https://docs.jdcloud.com/cn/lingjing/kelingpicture

## 1. 快速开始：Curl 调用示例

通过该统一端点提交可灵图片生成任务。请根据是否需要参考图选择对应的 `apiId` 与 `model_name`。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId":"[对应接口ID]",
      "params":{
        "prompt": "在此输入您的图片描述词",
        "model_name": "[对应模型名称]",
        "aspect_ratio": "16:9",
        "taskNum": 1,
        "image": "可选：参考图片URL"
      }
  }'

```

---

## 2. 模型版本与参数特征映射

根据您的生成模式（文生图或图生图）选择合适的配置：

| 任务类别 | 模型版本 | 接口 ID (apiId) | 模型名称 (model_name) | 核心特征 |
| --- | --- | --- | --- | --- |
| **文生图** | Kling-V2.1 | `553` | `kling-v2-1` | 纯文本驱动生成 |
| **图生图 (参考生图)** | Kling-V2 | `554` | `kling-v2` | 支持 `image` 参数作为参考 |

---

## 3. 请求参数详细说明 (params)

配置图片生成任务的具体属性：

| 字段名 | 适用模型 | 类型 | 必填 | 详细说明 |
| --- | --- | --- | --- | --- |
| **prompt** | 全部 | string | 是 | 图片生成正向提示词 |
| **model_name** | 全部 | string | 是 | 必须与上方对照表中的名称严格一致 |
| **aspect_ratio** | 全部 | string | 是 | 图片比例：`"16:9"`, `"9:16"`, `"1:1"`, `"4:3"`, `"3:4"` |
| **taskNum** | 全部 | int | 是 | 单次生成的图片数量，范围：`1` ~ `4` |
| **image** | V2 (554) | string | 否 | 参考图片的公网可访问 URL |

> **注意**：参考图片 URL 必须保证在公网环境下可访问。

---

## 4. 输出响应说明 (JSON)

接口提交成功后，将返回统一的任务回执：

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "INVALID_API_KEY",
	"errorParamName": "${some one param}",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 10. jdcloud-lingjing-kelingptv

# 京东云灵境 可灵图生视频

来源：https://docs.jdcloud.com/cn/lingjing/kelingptv

## 1. 快速开始：Curl 调用示例

通过该统一端点提交可灵图生视频任务。请根据所需的模型版本从下表选择对应的 `apiId` 与 `model_name` 填入请求体。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId": "[填入对应 apiId]",
      "params": {
        "image": "首帧图片URL",
        "image_tail": "可选：尾帧图片URL",
        "prompt": "视频内容的描述词",
        "model_name": "[填入模型名称]",
        "duration": "5",
        "mode": "pro",
        "sound": "off",
        "multi_shot": "false",
        "shot_type": "intelligence"
      }
  }'

```

> **注意**：`multi_shot` 与 `shot_type` 仅在 **Kling-V3 (566)** 中生效。

---

## 2. 模型版本与参数特征映射

可灵系列图生视频模型在参数结构上存在差异，请注意 `apiId` 的对应关系：

| 模型版本 | 接口 ID (apiId) | 模型名称 (model_name) | 特有参数/模式支持 |
| --- | --- | --- | --- |
| **Kling-V2.1** | `550` | `kling-v2-1` | 支持首尾帧控制 (`image`, `image_tail`) |
| **Kling-V2.6** | `564` | `kling-v2-6` | 仅支持 `pro` 模式；支持同步音频 `sound` |
| **Kling-O1** | `561` | `kling-video-o1` | 使用 `image_urls` (数组) 代替单图字段 |
| **Kling-V3** | `566` | `Kling-V3` | 支持首尾帧、多镜头 `multi_shot` 及 3-15s 时长 |

---

## 3. 请求参数详细说明 (params)

配置生成任务的具体属性：

| 字段名 | 类型 | 必填 | 详细说明 |
| --- | --- | --- | --- |
| **prompt** | string | 是 | 视频内容描述词 |
| **model_name** | string | 是 | 必须与上方对照表中的名称严格一致 |
| **duration** | string/int | 是 | **V2.x/O1**: `5`, `10`；**V3**: `"3"` 至 `"15"` (字符串) |
| **mode** | string | 是 | 视频模式：`"pro"` (专业) 或 `"std"` (标准) |
| **image** | string | 条件必填 | 首帧图片 URL (适用于 550, 564, 566) |
| **image_tail** | string | 否 | 尾帧图片 URL (适用于 550, 564, 566) |
| **image_urls** | stringArray | 条件必填 | 仅用于 **Kling-O1 (561)** 的参考图片列表 |
| **sound** | string | 否 | 同步音频 (支持 564, 566)：`"on"`, `"off"` |
| **multi_shot** | string | 否 | **仅 V3 (566) 支持**：生成多镜头，可选 `true`, `false` |
| **shot_type** | string | 否 | **仅 V3 (566) 支持**：分镜方式，可选值：`"intelligence"` |

---

## 4. 业务逻辑与约束

* **图片访问**：所有图片 URL 地址必须保证公网可访问。
* **V2.6 限制**：Kling-V2.6 图生视频 (`564`) 仅支持 `"pro"` 模式。
* **V3 灵活性**：Kling-V3 (`566`) 提供最广泛的时长选择（3-15s）及音频同步支持。
* **O1 结构**：Kling-O1 (`561`) 采用数组结构提交参考图，且支持手动调节 `aspect_ratio`。

---

## 5. 输出响应说明 (JSON)

接口提交成功后，返回统一的任务回执：

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "INVALID_API_KEY",
	"errorParamName": "${some one param}",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 11. jdcloud-lingjing-kelingrtv

# 京东云灵境 可灵参考生视频

来源：https://docs.jdcloud.com/cn/lingjing/kelingrtv

## 1. 快速开始：Curl 调用示例

通过该统一端点提交参考生视频任务。请根据所选模型版本配置对应的 `apiId` 与参考参数（`image_references` 或 `ref_video`/`image_list`）。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId":"[对应接口ID]",
      "params":{
        "prompt": "在此输入您的视频创意描述",
        "model_name": "[对应模型名称]",
        "duration": "5",
        "mode": "pro",
        "aspect_ratio": "16:9",
        "image_references": [],
        "ref_video": "视频URL",
        "image_list": []
      }
  }'

```

---

## 2. 模型版本与参数特征映射

可灵参考生视频支持“多图参考”或“视频+图片参考”两种主流模式：

| 模型版本 | 接口 ID (apiId) | 模型名称 (model_name) | 核心参考参数 | 支持时长 (duration) |
| --- | --- | --- | --- | --- |
| **Kling-V1.6** | `552` | `kling-v1-6` | `image_references` (多图) | `"5"`, `"10"` |
| **Kling-O1** | `562` | `kling-video-o1` | `ref_video`, `image_list` | `"3"`, `"5"`, `"8"`, `"10"` |

---

## 3. 请求参数详细说明 (params)

配置生成任务的具体属性：

| 字段名 | 适用模型 | 类型 | 必填 | 详细说明 |
| --- | --- | --- | --- | --- |
| **prompt** | 全部 | string | 是 | 视频生成提示词 |
| **model_name** | 全部 | string | 是 | 必须与上方对照表中的名称严格一致 |
| **duration** | 全部 | string | 是 | 视频时长（注意 O1 模型支持更多档位） |
| **mode** | 全部 | string | 是 | 视频模式：`"pro"` (专业) 或 `"std"` (标准) |
| **aspect_ratio** | 全部 | string | 是 | 宽高比：`"16:9"`, `"9:16"`, `"1:1"` |
| **image_references** | V1.6 | objectArray | 否 | 多张参考图片的对象数组 |
| **ref_video** | O1 | string | 否 | 参考视频 URL |
| **image_list** | O1 | objectArray | 否 | 参考图片列表对象数组 |

> **重要提示**：所有上传的图片和视频 URL 地址必须保证公网可访问。

---

## 4. 输出响应说明 (JSON)

接口提交成功后，将返回统一的任务回执：

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "INVALID_API_KEY",
	"errorParamName": "${some one param}",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 12. jdcloud-lingjing-kelingttv

# 京东云灵境 可灵文生视频

来源：https://docs.jdcloud.com/cn/lingjing/kelingttv

---

## 1. 快速开始：Curl 调用示例

通过该统一端点提交可灵视频生成任务。请根据所需的模型版本从下表选择对应的 `apiId` 与 `model_name`。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId": "[填入 apiId]",
      "params": {
        "prompt": "在此输入您的视频创意描述",
        "model_name": "[填入模型名称]",
        "duration": "5",
        "mode": "pro",
        "aspect_ratio": "16:9",
        "sound": "off",
        "multi_shot": "false",
        "shot_type": "intelligence"
      }
  }'

```

> **注意**：`multi_shot` 与 `shot_type` 字段目前仅在 **apiId: 565 (Kling-V3)** 中生效。

---

## 2. 模型版本与参数特征映射

可灵系列不同版本的接口 ID 及参数支持对照表：

| 模型版本 | 接口 ID (apiId) | 模型名称 (model_name) | 特有参数/模式支持 |
| --- | --- | --- | --- |
| **Kling-V2.5-Turbo** | `551` | `kling-v2-5-turbo` | 支持 `std` (标准) 与 `pro` (专业) 模式 |
| **Kling-O1** | `560` | `kling-video-o1` | 支持 `pro` 与 `std` 模式 |
| **Kling-V2.6** | `563` | `kling-v2-6` | 仅支持 `pro` 模式；支持同步音频 `sound` |
| **Kling-V3** | `565` | `Kling-V3` | 支持多镜头 `multi_shot`、分镜方式 `shot_type` 及 3-15s 时长 |

---

## 3. 请求参数详细说明 (params)

配置生成任务的具体属性：

| 字段名 | 类型 | 必填 | 详细说明 |
| --- | --- | --- | --- |
| **prompt** | string | 是 | 视频生成提示词 |
| **model_name** | string | 是 | 必须与上方对照表中的名称严格一致 |
| **duration** | string | 是 | **V2.x/O1**: `"5"`, `"10"`；<br>

<br>**V3**: 可选 `"3"` 至 `"15"` 之间的字符串 |
| **mode** | string | 是 | 视频模式：`"pro"` (专业) 或 `"std"` (标准) |
| **aspect_ratio** | string | 是 | 宽高比：`"16:9"`, `"9:16"`, `"1:1"` |
| **sound** | string | 否 | 同步音频（仅 **563/565** 支持）：`"on"`, `"off"` |
| **multi_shot** | string | 否 | **仅 V3 支持**：生成多镜头，可选 `true`, `false` |
| **shot_type** | string | 否 | **仅 V3 支持**：分镜方式，可选值：`"intelligence"` |

> **提示**：若涉及图生参考，图片 URL 地址必须保证公网可访问。

---

## 4. 输出响应说明 (JSON)

接口提交成功后，将返回统一的任务回执：

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "INVALID_API_KEY",
	"errorParamName": "${some one param}",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 13. jdcloud-lingjing-paiwoptv

# 京东云灵境 拍我图生视频

来源：https://docs.jdcloud.com/cn/lingjing/paiwoptv

## 1. 快速开始：Curl 调用示例

通过统一端点提交任务，根据所需版本（V5 或 V5.5）以及控制方式（单图或首尾帧）选择对应的 `apiId`。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId":"[对应接口ID]",
      "params":{
        "first_frame_img": "首帧图片URL",
        "last_frame_img": "可选：尾帧图片URL",
        "prompt": "在此描述视频中的动作或变化",
        "model": "[对应模型名称]",
        "duration": 5,
        "quality": "1080p",
        "generate_audio_switch": true
      }
  }'

```

---

## 2. 模型版本与参数对照表

| 模型版本 | 接口 ID | 控制类型 | 模型名称 (model) | 时长 (duration) | 最高分辨率 | 特有功能 |
| --- | --- | --- | --- | --- | --- | --- |
| **Paiwo V5.5** | `402` | 首尾帧/单图 | `v5.5` | `5`, `8` | `1080p` | 同步音频、多镜头控制 |
| **Paiwo V5** | `501` | 首尾帧/单图 | `v5` | `5`, `8` | `1080p` | 经典稳定版本 |
| **Paiwo V5** | `502` | 仅单图 (API专版) | `v5` | `5`, `8` | `1080p` | 使用 `img_id` 传参 |

---

## 3. 详细参数说明 (params)

| 字段名 | 类型 | 必填 | 详细说明 |
| --- | --- | --- | --- |
| **first_frame_img** | string | 是 | 视频起始帧图片的公网可访问 URL。 |
| **last_frame_img** | string | 否 | 视频结束帧图片的 URL。若不传则为单图生成模式。 |
| **img_id** | int | 否 | **仅接口 502 使用**：内部图片资源 ID（通常用于特定集成场景）。 |
| **prompt** | string | 是 | 描述视频中的动态效果、光影变化或动作逻辑。 |
| **model** | string | 是 | 必须填入 `v5` 或 `v5.5`。 |
| **duration** | int | 是 | 视频时长：可选 `5` 或 `8` 秒。 |
| **quality** | string | 是 | 分辨率：可选 `"360p"`, `"540p"`, `"720p"`, `"1080p"`。 |
| **generate_audio_switch** | boolean | 否 | **仅 V5.5 支持**：是否自动为生成的视频匹配音效/配音。 |
| **generate_multi_clip_switch** | boolean | 否 | **仅 V5.5 支持**：是否开启自动剪辑/多镜头模式。 |

---

## 4. 输出响应说明 (JSON)

接口提交成功后，将返回统一的任务回执：

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "SUCCESS",
	"genTaskId": "T123456789",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 14. jdcloud-lingjing-paiwortv

# 京东云灵境 拍我参考生视频

来源：https://docs.jdcloud.com/cn/lingjing/paiwortv

## 2. 快速开始 (Curl 示例)

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId":"503",
      "params":{
        "image_references": [
          {
            "to": "subject",
            "url": "https://example.com/your-image.jpg"
          }
        ],
        "prompt": "一个小男孩在草地上奔跑，阳光明媚，电影质感",
        "model": "v5",
        "duration": 5,
        "quality": "1080p",
        "aspect_ratio": "16:9"
      }
  }'

```

---

## 3. 参数详细说明 (params)

| 参数序号 | 字段名 | 类型 | 必填 | 字段说明与允许值 |
| --- | --- | --- | --- | --- |
| 0 | **image_references** | objectArray | 是 | 参考图配置，包含 `url` (图片地址) 和 `to` (参考维度) |
| 1 | **prompt** | string | 是 | 视频内容的文本描述，建议包含动作和环境细节 |
| 2 | **model** | string | 是 | 必须固定为：`v5` |
| 3 | **duration** | int | 是 | 视频时长。可选值：`5`, `8` (单位：秒) |
| 4 | **quality** | string | 是 | 分辨率。可选：`"360p"`, `"540p"`, `"720p"`, `"1080p"` |
| 5 | **aspect_ratio** | string/int | 是 | 宽高比。可选：`"16:9"`, `"9:16"`, `"4:3"`, `"3:4"`, `"1:1"` |

> **注意**：
> 1. `image_references` 中的图片 URL 必须保证在公网环境下可免密直接访问。
> 2. `to` 字段通常取值为 `"subject"` (主体参考) 或根据具体需求定义的维度。
> 
> 

---

## 4. 输出响应说明 (JSON)

接口提交成功后，将返回统一的任务回执：

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "SUCCESS",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 15. jdcloud-lingjing-paiwottv

# 京东云灵境 拍我文生视频

来源：https://docs.jdcloud.com/cn/lingjing/paiwottv

## 1. 快速开始：Curl 调用示例

使用统一端点提交任务，根据所需功能（如是否需要同步音频或多镜头）选择对应的 `apiId`。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId":"[对应接口ID]",
      "params":{
        "prompt": "描述您的视频画面创意",
        "model": "[对应模型名称]",
        "duration": 5,
        "quality": "1080p",
        "aspect_ratio": "16:9",
        "generate_audio_switch": true,
        "generate_multi_clip_switch": false
      }
  }'

```

---

## 2. 模型版本与参数对照表

拍我系列不同版本的核心差异如下：

| 模型版本 | 接口 ID | 模型名称 (model) | 时长 (duration) | 分辨率 (quality) | 支持比例 (aspect_ratio) | 特有功能 |
| --- | --- | --- | --- | --- | --- | --- |
| **Paiwo V5** | `400` | `v5` | `5`, `8` | `360p` ~ `1080p` | `16:9`, `9:16`, `4:3`, `3:4`, `1:1` | 经典通用版本 |
| **Paiwo V5.5** | `401` | `v5.5` | `5`, `8` | `540p`, `720p`, `1080p` | `16:9` | 同步音频、多镜头控制 |

---

## 3. 核心参数详细说明 (params)

| 字段名 | 类型 | 必填 | 详细说明 |
| --- | --- | --- | --- |
| **prompt** | string | 是 | 视频提示词，描述场景、主体及动作 |
| **model** | string | 是 | 必须与上方对照表一致（`v5` 或 `v5.5`） |
| **duration** | int | 是 | 视频时长：可选 `5` 或 `8` 秒 |
| **quality** | string | 是 | 分辨率：推荐使用 `"1080p"` 以获得最高清晰度 |
| **aspect_ratio** | string/int | 是 | 比例：V5.5 目前仅支持 `"16:9"`；V5 支持多比例切换 |
| **generate_audio_switch** | boolean | 否 | **仅 V5.5 支持**：是否同步生成视频配音/音效 |
| **generate_multi_clip_switch** | boolean | 否 | **仅 V5.5 支持**：是否开启多镜头/剪辑模式 |

---

## 4. 输出响应说明 (JSON)

接口提交成功后，将返回统一的任务回执：

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "SUCCESS",
	"genTaskId": "任务ID:用于后续查询生成进度与结果",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 16. jdcloud-lingjing-viduptv

# 京东云灵境 Vidu图生视频

来源：https://docs.jdcloud.com/cn/lingjing/viduptv

## 1. 快速开始：接口调用示例

通过统一的 API 端点提交 Vidu 图生视频任务。请根据所选模型配置对应的 `apiId` 与 `params`。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId":"[对应接口ID]",
      "params":{
        "images": ["图片URL1"],
        "prompt": "视频内容的动态描述",
        "model": "[对应模型名称]",
        "duration": 4,
        "resolution": "1080p",
        "movement_amplitude": "auto",
        "taskNum": 1,
        "bgm": true
      }
  }'

```

---

## 2. 模型版本与参数特征映射

Vidu 系列图生视频接口根据模型能力划分为以下四个主要版本：

| 模型版本 | 接口 ID | 模型名称 (model) | 支持时长 (duration) | 支持分辨率 (resolution) | 特有参数 |
| --- | --- | --- | --- | --- | --- |
| **Vidu 2.0** | `2` | `vidu2.0` | `4`, `8` | `360p`, `720p`, `1080p` | 支持 `bgm` |
| **Vidu Q1** | `0` | `viduq1` | `5` | `1080p` | 支持 `bgm` |
| **Vidu Q2-pro** | `17` | `viduq2-pro` | `4`, `8` | `720p`, `1080p` | 支持 `taskNum` (1-4) |
| **Vidu Q2-pro(单图)** | `19` | `viduq2-pro` | `4`, `8` | `720p`, `1080p` | 侧重单张图片生成 |

---

## 3. 核心参数详细说明 (params)

| 字段名 | 类型 | 必填 | 详细说明 |
| --- | --- | --- | --- |
| **images** | stringArray | 是 | 参考图片 URL 列表。即便只有单图，也需使用数组格式 `["url"]` |
| **prompt** | string | 是 | 描述视频的动态变化及视觉细节 |
| **model** | string | 是 | 必须与上方对照表中的模型名称严格一致 |
| **duration** | int | 是 | 视频时长（秒）。根据模型不同可选 `4`, `5`, `8` |
| **resolution** | string | 是 | 分辨率：`"1080p"`, `"720p"`, `"540p"`, `"360p"` |
| **movement_amplitude** | string | 否 | 运动幅度：`"auto"`, `"small"`, `"medium"`, `"large"` |
| **bgm** | boolean | 否 | 是否生成背景音乐：`true`, `false` (部分模型支持) |
| **taskNum** | int | 否 | 生成数量 (仅 17 号接口支持)：`1` ~ `4` |

> **安全提示**：所有图片 URL 地址必须保证公网可访问。

---

## 4. 输出响应说明 (JSON)

接口提交成功后，将返回统一的任务回执：

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "SUCCESS",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 17. jdcloud-lingjing-vidurpicture

# 京东云灵境 Vidu图片生成

来源：https://docs.jdcloud.com/cn/lingjing/vidurpicture

## 1. 快速开始：Curl 调用示例

通过该统一端点提交任务。Vidu 的生图接口统一使用 `images` 数组来处理参考图（如为纯文生图，该数组可为空或不传，具体视模型要求而定）。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId":"[对应接口ID]",
      "params":{
        "prompt": "在此输入您的图片创意描述",
        "model": "[对应模型名称]",
        "aspect_ratio": "16:9",
        "taskNum": 1,
        "images": ["可选：参考图URL"],
        "resolution": "1080p"
      }
  }'

```

---

## 2. 模型版本与参数对照表

根据您的画质需求和参考维度选择对应的配置：

| 模型版本 | 接口 ID | 模型名称 (model) | 支持比例 (aspect_ratio) | 分辨率 (resolution) |
| --- | --- | --- | --- | --- |
| **Vidu Q1** | `16` | `viduq1` | `16:9`, `9:16`, `1:1` | 默认高质量输出 |
| **Vidu Q2** | `22` | `viduq2` | `16:9`, `9:16`, `4:3`, `3:4`, `1:1` | `1080p`, `2K`, `4K` |

---

## 3. 详细参数说明 (params)

| 字段名 | 类型 | 必填 | 详细说明 |
| --- | --- | --- | --- |
| **prompt** | string | 是 | 图片生成的提示词 |
| **model** | string | 是 | 必须与上方对照表中的名称严格一致 |
| **aspect_ratio** | string | 是 | 比例。Q2 模型提供了更丰富的传统摄影比例（如 4:3） |
| **taskNum** | int | 是 | 单次生成的图片数量，范围：`1` ~ `4` |
| **images** | stringArray | 否 | 参考图片 URL 数组。格式为 `["http://..."]` |
| **resolution** | string | 否 | **仅 Q2 支持**：可指定 `"1080p"`, `"2K"`, `"4K"` |

> **开发要点**：
> 1. Vidu Q2 支持最高 **4K** 级别的超清图片输出。
> 2. 所有上传的参考图片 URL 必须保证在公网环境下可免密访问。
> 
> 

---

## 4. 输出响应说明 (JSON)

接口提交成功后，将返回统一的任务回执：

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "INVALID_API_KEY",
	"errorParamName": "${some one param}",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 18. jdcloud-lingjing-vidurtv

# 京东云灵境 Vidu参考生视频

来源：https://docs.jdcloud.com/cn/lingjing/vidurtv

## 1. 快速开始：Curl 调用示例

通过该统一端点提交任务，根据需要参考的精细度及模型版本选择对应的 `apiId`。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId":"[对应接口ID]",
      "params":{
        "image_references": [
          {
            "to": "subject",
            "url": "参考图URL"
          }
        ],
        "prompt": "视频内容的详细描述",
        "model": "[对应模型名称]",
        "duration": 5,
        "resolution": "1080p",
        "aspect_ratio": "16:9",
        "bgm": true
      }
  }'

```

---

## 2. 模型版本与参数对照表

Vidu 参考生视频支持多维度控制，不同模型的能力分布如下：

| 模型版本 | 接口 ID | 模型名称 (model) | 支持时长 (duration) | 比例 (aspect_ratio) | 分辨率支持 |
| --- | --- | --- | --- | --- | --- |
| **Vidu 2.0** | `5` | `vidu2.0` | `4` | `16:9`, `9:16`, `1:1` | `360p`, `720p` |
| **Vidu Q1** | `4` | `viduq1` | `5` | `16:9`, `9:16`, `1:1` | `1080p` |
| **Vidu Q2** | `21` | `viduq2` | `5`, `8`, `10` | `16:9`, `9:16`, `4:3`, `3:4`, `1:1` | `540p`, `720p`, `1080p` |

---

## 3. 核心参数详细说明 (params)

| 字段名 | 类型 | 必填 | 详细说明 |
| --- | --- | --- | --- |
| **image_references** | objectArray | 是 | 参考图数组。包含 `url` (图片地址) 和 `to` (参考类型，如 `"subject"`) |
| **prompt** | string | 是 | 视频生成提示词，建议描述动态变化 |
| **model** | string | 是 | 必须与上方对照表中的模型名称严格一致 |
| **duration** | int | 是 | 视频时长。Q2 模型支持最长 `10` 秒 |
| **resolution** | string | 是 | 分辨率：`"1080p"`, `"720p"`, `"540p"`, `"360p"` |
| **aspect_ratio** | string | 是 | 宽高比。Q2 支持最全面的比例选择 |
| **movement_amplitude** | string | 否 | **仅 2.0/Q1 支持**：`"auto"`, `"small"`, `"medium"`, `"large"` |
| **bgm** | boolean | 否 | 是否开启背景音乐：`true`, `false` |

> **开发建议**：参考图 URL 必须保证公网可访问。为了获得最佳一致性，建议参考图主体清晰。

---

## 4. 输出响应说明 (JSON)

接口提交成功后，将返回统一的任务回执：

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "SUCCESS",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

---

## 19. jdcloud-lingjing-viduttv

# 京东云灵境 Vidu文生视频

来源：https://docs.jdcloud.com/cn/lingjing/viduttv

## 1. 快速开始：Curl 调用示例

通过统一端点提交 Vidu 视频生成任务。请根据所需模型版本选择对应的 `apiId` 与 `model`。

```bash
curl -X POST "https://model.jdcloud.com/joycreator/openApi/submitTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${your_app_key}" \
  -H "x-jdcloud-request-id: ${request-id or trace-id}" \
  -d '{
      "apiId":"[对应接口ID]",
      "params":{
        "prompt": "在此输入您的视频创意描述",
        "model": "[对应模型名称]",
        "duration": 5,
        "resolution": "1080p",
        "aspect_ratio": "16:9",
        "style": "general",
        "bgm": true,
        "movement_amplitude": "auto"
      }
  }'

```

---

## 2. 模型版本与参数对照表

Vidu 系列不同版本的接口 ID 及功能支持如下：

| 模型版本 | 接口 ID | 模型名称 (model) | 支持时长 (duration) | 比例 (aspect_ratio) | 特有参数 |
| --- | --- | --- | --- | --- | --- |
| **Vidu Q1** | `7` | `viduq1` | `5` | `16:9`, `9:16`, `1:1` | 支持 `movement_amplitude` |
| **Vidu Q2** | `20` | `viduq2` | `5`, `8`, `10` | `16:9`, `9:16`, `4:3`, `3:4`, `1:1` | 支持更多比例和时长 |

---

## 3. 详细参数说明 (params)

配置生成任务的具体属性：

| 字段名 | 类型 | 必填 | 详细说明 |
| --- | --- | --- | --- |
| **prompt** | string | 是 | 视频生成提示词 |
| **model** | string | 是 | 必须与上方对照表中的名称严格一致 |
| **duration** | int | 是 | 视频时长。Q1 为 `5`；Q2 支持 `5`, `8`, `10` |
| **resolution** | string | 是 | 分辨率。Q1 为 `"1080p"`；Q2 可选 `"540p"`, `"720p"`, `"1080p"` |
| **aspect_ratio** | string | 是 | 比例。Q1 支持 3 种；Q2 支持 5 种（详见对照表） |
| **style** | string | 否 | 风格：`"general"` (通用), `"anime"` (动漫) |
| **bgm** | boolean | 否 | 是否开启背景音乐：`true`, `false` |
| **movement_amplitude** | string | 否 | **仅 Q1 支持**：`"auto"`, `"small"`, `"medium"`, `"large"` |

> **注意**：Vidu 模型对图片/视频素材的引用同样要求 URL 必须公网可访问。

---

## 4. 输出响应说明 (JSON)

接口提交成功后，将返回统一的任务回执：

```json
{
	"apiKey": "${your_api_key}",
	"appId": "${your_app_id}",
	"error": "SUCCESS",
	"genTaskId": "任务ID:用于查询任务状态",
	"requestId": "${your_request_id}",
	"success": true
}

```

