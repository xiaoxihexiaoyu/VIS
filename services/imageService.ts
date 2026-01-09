// 图像生成服务 - 使用兔子API
// API文档: https://app.apifox.com/web/project/7040782/apis/api-343646956-run

import { chatCompletion } from './arkService';

const API_BASE_URL = 'https://api.tu-zi.com';

export interface ImageGenerationRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: string;
  response_format?: 'url' | 'b64_json';
  quality?: '1k' | '2k' | '4k';
}

export interface ImageGenerationResponse {
  created: number;
  data: Array<{ url: string }>;
}

/**
 * 获取API密钥
 */
const getApiKey = (): string => {
  // 优先从localStorage获取用户输入的密钥
  const localKey = localStorage.getItem('TUZI_API_KEY');
  if (localKey) return localKey;

  // 其次从环境变量获取
  const envKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;
  if (envKey) return envKey;

  throw new Error('请先设置API密钥');
};

// 全局中断控制器
let globalAbortController: AbortController | null = null;

/**
 * 取消当前正在进行的所有请求
 */
export const abortAllRequests = (): void => {
  if (globalAbortController) {
    globalAbortController.abort();
    globalAbortController = null;
  }
};

/**
 * 生成图像
 * @param prompt 提示词（可以包含图片URL）
 * @param size 图片尺寸，默认1x1（1024x1024）
 * @param signal 可选的 AbortSignal 用于取消请求
 * @returns 图片URL
 */
export const generateImage = async (
  prompt: string,
  size: string = '1x1',
  signal?: AbortSignal
): Promise<string> => {
  const apiKey = getApiKey();

  // 创建新的中断控制器
  if (!signal) {
    globalAbortController = new AbortController();
    signal = globalAbortController.signal;
  }

  const requestBody: ImageGenerationRequest = {
    model: 'gemini-3-pro-image-preview',
    prompt: prompt,
    n: 1,
    size: mapAspectRatio(size),
    response_format: 'url',
    quality: '1k'
  };

  try {
    const response = await fetch(`${API_BASE_URL}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} - ${errorText}`);
    }

    const data: ImageGenerationResponse = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error('未返回生成的图像');
    }

    return data.data[0].url;
  } catch (error) {
    // 如果是主动取消的错误，抛出特殊错误
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('GENERATION_ABORTED');
    }
    console.error('图像生成错误:', error);
    throw error;
  }
};

/**
 * 将内部宽高比格式映射为API支持的尺寸格式
 */
const mapAspectRatio = (ratio: string): string => {
  const mapping: Record<string, string> = {
    '1:1': '1x1',
    '3:4': '3x4',
    '4:3': '4x3',
    '9:16': '9x16',
    '16:9': '16x9',
    '2:3': '2x3',
    '3:2': '3x2',
    '4:5': '4x5',
    '5:4': '5x4',
    '21:9': '21x9'
  };
  return mapping[ratio] || '1x1';
};

/**
 * 设计请求分析接口
 */
export interface DesignAnalysis {
  reply: string;
  suggestedAction: {
    type: 'GENERATE' | 'MODIFY' | 'RANDOM';
    label: string;
    description: string;
    searchQuery: string;
  } | null;
}

/**
 * 分析用户的设计请求（使用豆包AI）
 */
export const analyzeDesignRequest = async (
  userMessage: string,
  hasLogo: boolean,
  hasSelectedImage: boolean
): Promise<DesignAnalysis> => {
  const systemInstruction = `你是一位资深艺术总监与品牌战略专家。
你的职责是与用户探讨他们的品牌愿景，并建议应生成的视觉识别系统（VIS）资产。

上下文：
- 品牌标识已上传：${hasLogo}
- 已选中特定待编辑图像：${hasSelectedImage}

指令：
1. 回复：提供专业、简练的回应，给予设计建议或明确需求
2. 动作检测：判断用户意图
   - 若表达「生成」「创作」「展现」或具体对象（如「咖啡杯」），设为 'GENERATE'
   - 若表达「修改」「调整」「换成蓝色」「移除背景」等编辑意图（需有选中图像），设为 'MODIFY'
   - 若表达「随机」「惊喜」，设为 'RANDOM'
   - 若仅为问候或提问，设为 null
3. 输出：必须返回 JSON 对象，格式如下：

{
  "reply": "对话式回复",
  "suggestedAction": {
    "type": "GENERATE" | "MODIFY" | "RANDOM",
    "label": "简短动作名称（如：生成广告牌）",
    "description": "简短描述将发生的事情",
    "searchQuery": "提炼的生成主体或编辑指令"
  }
}

若无需动作，suggestedAction 设为 null。`;

  try {
    const response = await chatCompletion([
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userMessage }
    ], true);

    const result = JSON.parse(response) as DesignAnalysis;

    // 确保 AI 返回的结果结构正确
    if (result.suggestedAction && !result.suggestedAction.type) {
      result.suggestedAction = null;
    }

    return result;
  } catch (error) {
    console.error('分析请求错误:', error);

    // 降级处理：使用简化逻辑
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('随机') || lowerMessage.includes('惊喜') || lowerMessage.includes('灵感') || lowerMessage.includes('创意') || lowerMessage.includes('random')) {
      return {
        reply: '即将为您呈现全新的品牌美学构想',
        suggestedAction: {
          type: 'RANDOM',
          label: '随机创意',
          description: '触发全新的品牌美学构想',
          searchQuery: 'random'
        }
      };
    }

    if (hasSelectedImage && (lowerMessage.includes('修改') || lowerMessage.includes('改变') || lowerMessage.includes('调整') || lowerMessage.includes('替换') || lowerMessage.includes('改成'))) {
      return {
        reply: `理解您的美学意图，将对视觉资产进行重构：${userMessage}`,
        suggestedAction: {
          type: 'MODIFY',
          label: '视觉重构',
          description: `依据您的指令进行艺术化重构`,
          searchQuery: userMessage
        }
      };
    }

    if (userMessage.length > 0) {
      return {
        reply: `已捕获您的品牌构想，将为您演绎：${userMessage}`,
        suggestedAction: {
          type: 'GENERATE',
          label: `美学演绎 · ${userMessage.substring(0, 6)}`,
          description: `生成${userMessage}的视觉呈现`,
          searchQuery: userMessage
        }
      };
    }

    return {
      reply: '请描述您期望的品牌视觉呈现\n\n例如：名片、文化衫、品牌官网等应用场景',
      suggestedAction: null
    };
  }
};

/**
 * 生成创意提示词（使用豆包AI）
 * 根据用户描述生成多个高质量、摄影级真实的品牌资产提示词
 */
export const generateCreativePrompts = async (userDescription: string): Promise<string[]> => {
  const validPrompt = userDescription.trim().length > 0 ? userDescription : '品牌视觉资产';

  const systemInstruction = `你是一位创意总监。
基于用户输入：「${validPrompt}」，生成一系列高质量、摄影级真实的品牌资产图像生成提示词。

指令：
1. 分析输入确定数量（默认3个，最多5个）
2. 若输入较为宽泛，生成多样化的提示词
3. 每个提示词必须提及「品牌标识应用」或「品牌视觉可见」
4. 输出：仅返回 JSON 字符串数组，例如：
["提示词1", "提示词2", "提示词3"]

提示词风格应专业、富有艺术感，强调光影、质感与品牌呈现。`;

  try {
    const response = await chatCompletion([
      { role: 'system', content: systemInstruction },
      { role: 'user', content: validPrompt }
    ], true);

    const result = JSON.parse(response) as string[];

    if (!Array.isArray(result) || result.length === 0) {
      throw new Error('AI未返回有效数组');
    }

    return result;
  } catch (error) {
    console.error('创意提示词生成错误:', error);

    // 降级处理：返回默认提示词
    return [
      `${validPrompt}，专业设计美学，高品质呈现，品牌视觉识别清晰`,
      `${validPrompt}，现代极简风格，摄影质感，品牌形象完美演绎`,
      `${validPrompt}，创意设计美学，光影效果，品牌视觉诗意呈现`
    ];
  }
};
