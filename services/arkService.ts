// Volcengine ARK API 服务 - 豆包模型对话
// API文档: https://www.volcengine.com/docs/82379

const ARK_API_BASE = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' | 'text' };
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 获取ARK API密钥
 */
const getArkApiKey = (): string => {
  const localKey = localStorage.getItem('ARK_API_KEY');
  if (localKey) return localKey;

  const envKey = import.meta.env.VITE_ARK_API_KEY || process.env.ARK_API_KEY;
  if (envKey) return envKey;

  throw new Error('请先设置ARK API密钥');
};

/**
 * 调用ARK聊天完成API
 */
export const chatCompletion = async (
  messages: ChatMessage[],
  responseJson: boolean = true
): Promise<string> => {
  const apiKey = getArkApiKey();

  const requestBody: ChatCompletionRequest = {
    model: 'doubao-seed-1-6-251015',
    messages: messages,
    temperature: 0.7,
    max_tokens: 2000
  };

  if (responseJson) {
    requestBody.response_format = { type: 'json_object' };
  }

  try {
    const response = await fetch(ARK_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ARK API请求失败: ${response.status} - ${errorText}`);
    }

    const data: ChatCompletionResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('ARK API未返回响应');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('ARK API错误:', error);
    throw error;
  }
};
