export type CapabilityInputType = "text_prompt" | "image_url" | "image_list" | "ref_video";

export type CapabilityParamSpec = {
  type: "string" | "number" | "boolean" | "enum" | "array";
  required: boolean;
  default?: string | number | boolean;
  enum?: string[];
  range?: { min?: number; max?: number; step?: number };
  description: string;
};

export type CapabilitySpec = {
  summary: string;
  inputs: CapabilityInputType[];
  params: Record<string, CapabilityParamSpec>;
  constraints: string[];
  examples: Array<Record<string, string | number | boolean | string[]>>;
};

export type ModelPreset = {
  key: string;
  apiId: number;
  modelField: "model" | "model_name";
  modelValue: string;
  capability: "image" | "text-to-video" | "image-to-video" | "reference-to-video";
  provider: "doubao" | "hailuo" | "kling" | "paiwo" | "vidu";
  note?: string;
  capSpec: CapabilitySpec;
};

type BaseModelPreset = Omit<ModelPreset, "capSpec">;

const TEXT_PROMPT_PARAM: CapabilityParamSpec = {
  type: "string",
  required: true,
  description: "Text prompt describing style, subject and motion",
};

function enumParam(values: string[], description: string, required = false, defaultValue?: string): CapabilityParamSpec {
  return {
    type: "enum",
    required,
    enum: values,
    default: defaultValue,
    description,
  };
}

function numberParam(description: string, required = false, min?: number, max?: number): CapabilityParamSpec {
  return {
    type: "number",
    required,
    range: min !== undefined || max !== undefined ? { min, max } : undefined,
    description,
  };
}

function cloneParams(
  input: Record<string, CapabilityParamSpec>
): Record<string, CapabilityParamSpec> {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      {
        ...value,
        enum: value.enum ? [...value.enum] : undefined,
        range: value.range ? { ...value.range } : undefined,
      },
    ])
  );
}

const IMAGE_COMMON_PARAMS: Record<string, CapabilityParamSpec> = {
  prompt: TEXT_PROMPT_PARAM,
};

const VIDEO_COMMON_PARAMS: Record<string, CapabilityParamSpec> = {
  prompt: TEXT_PROMPT_PARAM,
  duration: numberParam("Video duration in seconds", false, 3, 15),
  aspect_ratio: enumParam(["16:9", "9:16", "1:1", "4:3", "3:4"], "Output aspect ratio"),
};

function buildImageSpec(preset: BaseModelPreset): CapabilitySpec {
  const params = cloneParams(IMAGE_COMMON_PARAMS);
  const constraints: string[] = [];
  let inputs: CapabilityInputType[] = ["text_prompt"];

  if (preset.provider === "doubao") {
    params.size = enumParam(
      ["2048x2048", "2304x1728", "1728x2304", "2560x1440", "1440x2560", "2496x1664", "1664x2496", "3024x1296"],
      "Output image size"
    );
    params.taskNum = numberParam("Batch size", false, 1, 4);
  }

  if (preset.provider === "kling") {
    params.aspect_ratio = enumParam(["16:9", "9:16", "1:1", "4:3", "3:4"], "Output aspect ratio");
    if (preset.key === "kling-v2-image-ref") {
      params.image = {
        type: "string",
        required: false,
        description: "Reference image URL",
      };
      inputs = ["text_prompt", "image_url"];
      constraints.push("Reference image mode is only available on apiId=554 (kling-v2-image-ref)");
    }
  }

  if (preset.provider === "hailuo") {
    params.aspect_ratio = enumParam(["1:1", "4:3", "3:4", "16:9", "9:16"], "Output aspect ratio");
  }

  if (preset.provider === "vidu") {
    params.aspect_ratio = enumParam(["16:9", "9:16", "1:1", "4:3", "3:4"], "Output aspect ratio", true);
    if (preset.key === "vidu-q2-image") {
      params.resolution = enumParam(["1080p", "2K", "4K"], "Output resolution for Q2");
      constraints.push("4K resolution is only available on vidu-q2-image");
    }
  }

  return {
    summary: `${preset.provider} image generation (${preset.modelValue})`,
    inputs,
    params,
    constraints,
    examples: [
      {
        prompt: "A cinematic portrait with dramatic lighting",
        ...(preset.provider === "doubao"
          ? { size: "2048x2048" }
          : preset.key === "kling-v2-image-ref"
            ? { image: "https://example.com/reference.jpg" }
            : {}),
      },
    ],
  };
}

function buildDoubaoVideoSpec(preset: BaseModelPreset): CapabilitySpec {
  const params = cloneParams(VIDEO_COMMON_PARAMS);
  params.mode = enumParam(["540p", "720p", "1080p"], "Resolution mode");
  params.with_audio = {
    type: "boolean",
    required: false,
    description: "Enable generated audio track",
  };

  const isPtv = preset.capability === "image-to-video";
  if (isPtv) {
    params.image = {
      type: "array",
      required: true,
      description: "Reference image list",
    };
  }

  return {
    summary: `${preset.provider} ${preset.capability} with Seedance 1.5 Pro`,
    inputs: isPtv ? ["text_prompt", "image_url"] : ["text_prompt"],
    params,
    constraints: ["model_name must be Doubao-Seedance-1.5-pro"],
    examples: [
      isPtv
        ? { prompt: "A character turns and smiles", image: ["https://example.com/ref.jpg"], duration: 5 }
        : { prompt: "A horse running in snow field", duration: 5, aspect_ratio: "16:9" },
    ],
  };
}

function buildHailuoVideoSpec(preset: BaseModelPreset): CapabilitySpec {
  const params = cloneParams(VIDEO_COMMON_PARAMS);
  params.resolution = enumParam(["768P", "1080P"], "Output resolution");

  const constraints: string[] = [];
  if (preset.capability === "image-to-video") {
    params.image_url = {
      type: "string",
      required: true,
      description: "First frame image URL",
    };
    if (preset.key === "hailuo-02-ptv") {
      params.last_frame_image = {
        type: "string",
        required: false,
        description: "Optional ending frame image URL",
      };
      constraints.push("last_frame_image is only supported by hailuo-02-ptv");
    }
  }

  if (preset.capability === "reference-to-video") {
    params.ref_video = {
      type: "string",
      required: true,
      description: "Reference video URL",
    };
    params.image_list = {
      type: "array",
      required: false,
      description: "Optional reference image list",
    };
  }

  return {
    summary: `${preset.provider} ${preset.capability} (${preset.modelValue})`,
    inputs:
      preset.capability === "text-to-video"
        ? ["text_prompt"]
        : preset.capability === "image-to-video"
          ? ["text_prompt", "image_url"]
          : ["text_prompt", "ref_video", "image_list"],
    params,
    constraints,
    examples: [
      preset.capability === "reference-to-video"
        ? { prompt: "Keep motion style", ref_video: "https://example.com/ref.mp4", duration: 5 }
        : { prompt: "Ocean sunset with soft camera move", duration: 5 },
    ],
  };
}

function buildKlingVideoSpec(preset: BaseModelPreset): CapabilitySpec {
  const params = cloneParams(VIDEO_COMMON_PARAMS);
  params.mode = enumParam(["std", "pro"], "Quality mode", false, "pro");
  const constraints: string[] = [];

  if (preset.key.includes("v2-6") || preset.key.includes("v3")) {
    params.sound = enumParam(["on", "off"], "Synchronized audio switch", false, "off");
  }

  if (preset.key.includes("v3")) {
    params.multi_shot = {
      type: "boolean",
      required: false,
      description: "Generate multi-shot sequence",
    };
    params.shot_type = enumParam(["intelligence"], "Shot planning mode");
    constraints.push("multi_shot and shot_type are only available on Kling-V3");
  }

  if (preset.key.includes("v2-6")) {
    params.mode = enumParam(["pro"], "Only pro mode is supported", true, "pro");
    constraints.push("Kling-V2.6 only supports pro mode");
  }

  if (preset.capability === "image-to-video") {
    if (preset.key.includes("v2-1") || preset.key.includes("v3")) {
      params.image = {
        type: "string",
        required: true,
        description: "Reference image URL",
      };
      params.image_tail = {
        type: "string",
        required: false,
        description: "Optional ending frame image URL",
      };
    }
    if (preset.key.includes("o1")) {
      params.image_urls = {
        type: "array",
        required: true,
        description: "O1-style reference image URL list",
      };
      params.aspect_ratio = enumParam(["16:9", "9:16", "1:1"], "Output aspect ratio", true);
      constraints.push("Kling O1 uses image_urls instead of the single-image field");
    }
    if (!preset.key.includes("o1") && !params.image) {
      params.image = {
        type: "string",
        required: true,
        description: "Reference image URL",
      };
    }
  }

  if (preset.capability === "reference-to-video") {
    params.image_references = {
      type: "array",
      required: true,
      description: "Reference images with weight",
    };
    if (preset.key.includes("o1")) {
      params.ref_video = {
        type: "string",
        required: false,
        description: "Optional reference video URL for O1",
      };
    }
  }

  return {
    summary: `${preset.provider} ${preset.capability} (${preset.modelValue})`,
    inputs:
      preset.capability === "text-to-video"
        ? ["text_prompt"]
        : preset.capability === "image-to-video"
          ? (preset.key.includes("o1") ? ["text_prompt", "image_list"] : ["text_prompt", "image_url"])
          : ["text_prompt", "image_list", "ref_video"],
    params,
    constraints,
    examples: [
      preset.capability === "text-to-video"
        ? { prompt: "Aerial shot over neon city", duration: 5, mode: "pro" }
        : preset.capability === "image-to-video"
          ? (
              preset.key.includes("o1")
                ? { prompt: "Slow dolly-in", image_urls: ["https://example.com/keyframe.jpg"], duration: 5 }
                : { prompt: "Slow dolly-in", image: "https://example.com/keyframe.jpg", duration: 5 }
            )
          : { prompt: "Keep character identity", image_references: ["https://example.com/char.jpg"], duration: 5 },
    ],
  };
}

function buildPaiwoVideoSpec(preset: BaseModelPreset): CapabilitySpec {
  const params = cloneParams(VIDEO_COMMON_PARAMS);
  params.quality = enumParam(["540p", "720p", "1080p"], "Output quality");
  params.generate_audio_switch = {
    type: "boolean",
    required: false,
    description: "Generate synchronized audio",
  };
  params.generate_multi_clip_switch = {
    type: "boolean",
    required: false,
    description: "Enable multi-clip generation",
  };

  const constraints: string[] = [];

  if (preset.capability === "image-to-video") {
    params.image_url = {
      type: "string",
      required: true,
      description: "Reference image URL",
    };
    if (preset.key.includes("single-image")) {
      params.img_id = {
        type: "string",
        required: true,
        description: "Single-image mode id",
      };
      constraints.push("img_id is required on paiwo-v5-single-image-ptv");
    }
  }

  if (preset.capability === "reference-to-video") {
    params.ref_video = {
      type: "string",
      required: true,
      description: "Reference video URL",
    };
    params.image_list = {
      type: "array",
      required: false,
      description: "Additional reference image list",
    };
  }

  if (preset.modelValue === "v5") {
    constraints.push("v5 has narrower aspect ratio and mode support than v5.5");
  }

  return {
    summary: `${preset.provider} ${preset.capability} (${preset.modelValue})`,
    inputs:
      preset.capability === "text-to-video"
        ? ["text_prompt"]
        : preset.capability === "image-to-video"
          ? ["text_prompt", "image_url"]
          : ["text_prompt", "ref_video", "image_list"],
    params,
    constraints,
    examples: [
      preset.capability === "image-to-video"
        ? { prompt: "Fashion shot with wind", image_url: "https://example.com/model.jpg", duration: 5 }
        : { prompt: "Dynamic sports trailer", duration: 5, aspect_ratio: "16:9" },
    ],
  };
}

function buildViduVideoSpec(preset: BaseModelPreset): CapabilitySpec {
  const params = cloneParams(VIDEO_COMMON_PARAMS);
  const constraints: string[] = [];

  if (preset.capability === "text-to-video") {
    if (preset.key === "vidu-q1-ttv") {
      params.duration = enumParam(["5"], "Supported duration in seconds", true, "5");
      params.resolution = enumParam(["1080p"], "Output resolution", true, "1080p");
      params.aspect_ratio = enumParam(["16:9", "9:16", "1:1"], "Output aspect ratio", true);
      params.movement_amplitude = enumParam(["auto", "small", "medium", "large"], "Motion intensity");
    }
    if (preset.key === "vidu-q2-ttv") {
      params.duration = enumParam(["5", "8", "10"], "Supported duration in seconds", true, "5");
      params.resolution = enumParam(["540p", "720p", "1080p"], "Output resolution", true, "720p");
      params.aspect_ratio = enumParam(["16:9", "9:16", "4:3", "3:4", "1:1"], "Output aspect ratio", true);
    }
    params.style = enumParam(["general", "anime"], "Generation style");
    params.bgm = {
      type: "boolean",
      required: false,
      description: "Enable background music",
    };
  }

  if (preset.capability === "image-to-video") {
    params.image_url = {
      type: "string",
      required: true,
      description: "Reference image URL",
    };
    if (preset.key === "vidu-2-0-ptv") {
      params.duration = enumParam(["4", "8"], "Supported duration in seconds", true, "4");
      params.resolution = enumParam(["360p", "720p", "1080p"], "Output resolution");
      params.bgm = {
        type: "boolean",
        required: false,
        description: "Enable background music",
      };
    }
    if (preset.key === "vidu-q1-ptv") {
      params.duration = enumParam(["5"], "Supported duration in seconds", true, "5");
      params.resolution = enumParam(["1080p"], "Output resolution", true, "1080p");
      params.bgm = {
        type: "boolean",
        required: false,
        description: "Enable background music",
      };
    }
    if (preset.key.includes("q2-pro")) {
      params.duration = enumParam(["4", "8"], "Supported duration in seconds", true, "4");
      params.resolution = enumParam(["720p", "1080p"], "Output resolution");
      params.taskNum = numberParam("Batch size for q2-pro", false, 1, 4);
      if (preset.key.includes("single-image")) {
        constraints.push("single-image preset requires single reference image workflow");
      }
    }
  }

  if (preset.capability === "reference-to-video") {
    params.image_list = {
      type: "array",
      required: true,
      description: "Reference images",
    };
    params.ref_video = {
      type: "string",
      required: false,
      description: "Optional reference video",
    };

    if (preset.key === "vidu-2-0-rtv") {
      params.duration = enumParam(["4", "8"], "Supported duration in seconds", true, "4");
      params.movement_amplitude = enumParam(["auto", "small", "medium", "large"], "Motion intensity");
    }
    if (preset.key === "vidu-q1-rtv") {
      params.duration = enumParam(["5"], "Supported duration in seconds", true, "5");
      params.movement_amplitude = enumParam(["auto", "small", "medium", "large"], "Motion intensity");
    }
    if (preset.key === "vidu-q2-rtv") {
      params.duration = enumParam(["5", "8", "10"], "Supported duration in seconds", true, "5");
      params.resolution = enumParam(["720p", "1080p"], "Output resolution");
      constraints.push("movement_amplitude is not available on vidu-q2-rtv");
    }
  }

  return {
    summary: `${preset.provider} ${preset.capability} (${preset.modelValue})`,
    inputs:
      preset.capability === "text-to-video"
        ? ["text_prompt"]
        : preset.capability === "image-to-video"
          ? ["text_prompt", "image_url"]
          : ["text_prompt", "image_list", "ref_video"],
    params,
    constraints,
    examples: [
      preset.capability === "image-to-video"
        ? { prompt: "Pan around the product", image_url: "https://example.com/product.jpg", duration: 4 }
        : { prompt: "Snow mountains timelapse", duration: 5, aspect_ratio: "16:9" },
    ],
  };
}

function buildCapabilitySpec(preset: BaseModelPreset): CapabilitySpec {
  if (preset.capability === "image") return buildImageSpec(preset);
  if (preset.provider === "doubao") return buildDoubaoVideoSpec(preset);
  if (preset.provider === "hailuo") return buildHailuoVideoSpec(preset);
  if (preset.provider === "kling") return buildKlingVideoSpec(preset);
  if (preset.provider === "paiwo") return buildPaiwoVideoSpec(preset);
  if (preset.provider === "vidu") return buildViduVideoSpec(preset);
  throw new Error(`unable to build capability spec for preset: ${preset.key}`);
}

const BASE_MODEL_PRESETS: BaseModelPreset[] = [
  { key: "doubao-seedream-4-0", apiId: 700, modelField: "model", modelValue: "doubao-seedream-4-0-250828", capability: "image", provider: "doubao" },
  { key: "doubao-seedream-4-5", apiId: 701, modelField: "model", modelValue: "doubao-seedream-4-5-251128", capability: "image", provider: "doubao" },
  { key: "doubao-seedance-1-5-pro-ttv", apiId: 750, modelField: "model_name", modelValue: "Doubao-Seedance-1.5-pro", capability: "text-to-video", provider: "doubao" },
  { key: "doubao-seedance-1-5-pro-ptv", apiId: 751, modelField: "model_name", modelValue: "Doubao-Seedance-1.5-pro", capability: "image-to-video", provider: "doubao" },

  { key: "hailuo-02-ptv", apiId: 457, modelField: "model", modelValue: "MiniMax-Hailuo-02", capability: "image-to-video", provider: "hailuo" },
  { key: "hailuo-2-3-ptv", apiId: 461, modelField: "model", modelValue: "MiniMax-Hailuo-2.3", capability: "image-to-video", provider: "hailuo" },
  { key: "hailuo-2-3-fast-ptv", apiId: 462, modelField: "model", modelValue: "MiniMax-Hailuo-2.3-Fast", capability: "image-to-video", provider: "hailuo" },
  { key: "hailuo-s2v-01-rtv", apiId: 459, modelField: "model", modelValue: "S2V-01", capability: "reference-to-video", provider: "hailuo" },
  { key: "hailuo-image-01", apiId: 456, modelField: "model", modelValue: "image-01", capability: "image", provider: "hailuo" },
  { key: "hailuo-02-ttv", apiId: 458, modelField: "model", modelValue: "MiniMax-Hailuo-02", capability: "text-to-video", provider: "hailuo" },
  { key: "hailuo-2-3-ttv", apiId: 460, modelField: "model", modelValue: "MiniMax-Hailuo-2.3", capability: "text-to-video", provider: "hailuo" },

  { key: "kling-v2-1-image", apiId: 553, modelField: "model_name", modelValue: "kling-v2-1", capability: "image", provider: "kling" },
  { key: "kling-v2-image-ref", apiId: 554, modelField: "model_name", modelValue: "kling-v2", capability: "image", provider: "kling", note: "supports image reference" },
  { key: "kling-v2-1-ptv", apiId: 550, modelField: "model_name", modelValue: "kling-v2-1", capability: "image-to-video", provider: "kling" },
  { key: "kling-v2-6-ptv", apiId: 564, modelField: "model_name", modelValue: "kling-v2-6", capability: "image-to-video", provider: "kling" },
  { key: "kling-o1-ptv", apiId: 561, modelField: "model_name", modelValue: "kling-video-o1", capability: "image-to-video", provider: "kling" },
  { key: "kling-v3-ptv", apiId: 566, modelField: "model_name", modelValue: "Kling-V3", capability: "image-to-video", provider: "kling" },
  { key: "kling-v1-6-rtv", apiId: 552, modelField: "model_name", modelValue: "kling-v1-6", capability: "reference-to-video", provider: "kling" },
  { key: "kling-o1-rtv", apiId: 562, modelField: "model_name", modelValue: "kling-video-o1", capability: "reference-to-video", provider: "kling" },
  { key: "kling-v2-5-turbo-ttv", apiId: 551, modelField: "model_name", modelValue: "kling-v2-5-turbo", capability: "text-to-video", provider: "kling" },
  { key: "kling-o1-ttv", apiId: 560, modelField: "model_name", modelValue: "kling-video-o1", capability: "text-to-video", provider: "kling" },
  { key: "kling-v2-6-ttv", apiId: 563, modelField: "model_name", modelValue: "kling-v2-6", capability: "text-to-video", provider: "kling" },
  { key: "kling-v3-ttv", apiId: 565, modelField: "model_name", modelValue: "Kling-V3", capability: "text-to-video", provider: "kling" },

  { key: "paiwo-v5-5-ptv", apiId: 402, modelField: "model", modelValue: "v5.5", capability: "image-to-video", provider: "paiwo" },
  { key: "paiwo-v5-ptv", apiId: 501, modelField: "model", modelValue: "v5", capability: "image-to-video", provider: "paiwo" },
  { key: "paiwo-v5-single-image-ptv", apiId: 502, modelField: "model", modelValue: "v5", capability: "image-to-video", provider: "paiwo", note: "uses img_id" },
  { key: "paiwo-v5-rtv", apiId: 503, modelField: "model", modelValue: "v5", capability: "reference-to-video", provider: "paiwo" },
  { key: "paiwo-v5-ttv", apiId: 400, modelField: "model", modelValue: "v5", capability: "text-to-video", provider: "paiwo" },
  { key: "paiwo-v5-5-ttv", apiId: 401, modelField: "model", modelValue: "v5.5", capability: "text-to-video", provider: "paiwo" },

  { key: "vidu-2-0-ptv", apiId: 2, modelField: "model", modelValue: "vidu2.0", capability: "image-to-video", provider: "vidu" },
  { key: "vidu-q1-ptv", apiId: 0, modelField: "model", modelValue: "viduq1", capability: "image-to-video", provider: "vidu" },
  { key: "vidu-q2-pro-ptv", apiId: 17, modelField: "model", modelValue: "viduq2-pro", capability: "image-to-video", provider: "vidu" },
  { key: "vidu-q2-pro-single-image-ptv", apiId: 19, modelField: "model", modelValue: "viduq2-pro", capability: "image-to-video", provider: "vidu" },
  { key: "vidu-q1-image", apiId: 16, modelField: "model", modelValue: "viduq1", capability: "image", provider: "vidu" },
  { key: "vidu-q2-image", apiId: 22, modelField: "model", modelValue: "viduq2", capability: "image", provider: "vidu" },
  { key: "vidu-2-0-rtv", apiId: 5, modelField: "model", modelValue: "vidu2.0", capability: "reference-to-video", provider: "vidu" },
  { key: "vidu-q1-rtv", apiId: 4, modelField: "model", modelValue: "viduq1", capability: "reference-to-video", provider: "vidu" },
  { key: "vidu-q2-rtv", apiId: 21, modelField: "model", modelValue: "viduq2", capability: "reference-to-video", provider: "vidu" },
  { key: "vidu-q1-ttv", apiId: 7, modelField: "model", modelValue: "viduq1", capability: "text-to-video", provider: "vidu" },
  { key: "vidu-q2-ttv", apiId: 20, modelField: "model", modelValue: "viduq2", capability: "text-to-video", provider: "vidu" },
];

export const MODEL_PRESETS: ModelPreset[] = BASE_MODEL_PRESETS.map((preset) => ({
  ...preset,
  capSpec: buildCapabilitySpec(preset),
}));

export const CAPABILITY_INPUT_TYPES: CapabilityInputType[] = ["text_prompt", "image_url", "image_list", "ref_video"];

const PRESET_KEY_SET = new Set(MODEL_PRESETS.map((preset) => preset.key));
if (PRESET_KEY_SET.size !== MODEL_PRESETS.length) {
  throw new Error("duplicate preset keys detected");
}
if (MODEL_PRESETS.some((preset) => !preset.capSpec)) {
  throw new Error("every preset must provide capSpec");
}

export function getPresetByKey(key: string): ModelPreset | undefined {
  return MODEL_PRESETS.find((preset) => preset.key === key);
}

export function supportsCapabilityInput(preset: ModelPreset, input: string): boolean {
  return preset.capSpec.inputs.includes(input as CapabilityInputType);
}

export function supportsCapabilityParam(preset: ModelPreset, param: string): boolean {
  return Object.prototype.hasOwnProperty.call(preset.capSpec.params, param);
}
