export type ModelPreset = {
  key: string;
  apiId: number;
  modelField: "model" | "model_name";
  modelValue: string;
  capability: "image" | "text-to-video" | "image-to-video" | "reference-to-video";
  provider: "doubao" | "hailuo" | "kling" | "paiwo" | "vidu";
  note?: string;
};

export const MODEL_PRESETS: ModelPreset[] = [
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
  { key: "vidu-q2-ttv", apiId: 20, modelField: "model", modelValue: "viduq2", capability: "text-to-video", provider: "vidu" }
];

export function getPresetByKey(key: string): ModelPreset | undefined {
  return MODEL_PRESETS.find((preset) => preset.key === key);
}
