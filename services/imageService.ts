// 图像生成服务 - 使用兔子API
// API文档: https://app.apifox.com/web/project/7040782/apis/api-343646956-run

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

/**
 * 生成图像
 * @param prompt 提示词（可以包含图片URL）
 * @param size 图片尺寸，默认1x1（1024x1024）
 * @returns 图片URL
 */
export const generateImage = async (
  prompt: string,
  size: string = '1x1'
): Promise<string> => {
  const apiKey = getApiKey();

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
      body: JSON.stringify(requestBody)
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
 * 设计请求分析（简化版，不再使用AI分析）
 * 直接根据用户输入返回操作建议
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
 * 分析用户的设计请求
 */
export const analyzeDesignRequest = async (
  userMessage: string,
  hasLogo: boolean,
  hasSelectedImage: boolean
): Promise<DesignAnalysis> => {
  const lowerMessage = userMessage.toLowerCase();

  // 检测随机请求
  if (lowerMessage.includes('随机') || lowerMessage.includes('惊喜') || lowerMessage.includes('random') || lowerMessage.includes('surprise')) {
    return {
      reply: '好的，我将为您生成一个随机创意品牌资产！',
      suggestedAction: {
        type: 'RANDOM',
        label: '随机创意生成',
        description: '生成一个完全随机的高品质品牌资产',
        searchQuery: 'random'
      }
    };
  }

  // 检测修改请求
  if (hasSelectedImage && (lowerMessage.includes('修改') || lowerMessage.includes('改变') || lowerMessage.includes('改成') || lowerMessage.includes('换'))) {
    return {
      reply: `好的，我将为您修改这张图片：${userMessage}`,
      suggestedAction: {
        type: 'MODIFY',
        label: '修改图片',
        description: `根据您的要求修改：${userMessage.substring(0, 20)}...`,
        searchQuery: userMessage
      }
    };
  }

  // 默认为生成请求
  if (userMessage.length > 0) {
    return {
      reply: `明白了，我将为您生成：${userMessage}`,
      suggestedAction: {
        type: 'GENERATE',
        label: `生成：${userMessage.substring(0, 10)}`,
        description: `生成${userMessage}的品牌资产`,
        searchQuery: userMessage
      }
    };
  }

  return {
    reply: '您好！请告诉我您想生成什么品牌资产，例如：名片、T恤、网站等。',
    suggestedAction: null
  };
};

/**
 * 生成创意提示词（简化版）
 */
export const generateCreativePrompts = async (userDescription: string): Promise<string[]> => {
  const validPrompt = userDescription.trim().length > 0 ? userDescription : '品牌资产';

  // 返回多个变体的提示词
  return [
    `${validPrompt}，专业设计，高品质，品牌标识可见`,
    `${validPrompt}，现代简约风格，摄影质感，品牌展示`,
    `${validPrompt}，创意设计，光影效果，品牌形象呈现`
  ];
};
