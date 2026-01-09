export interface GeneratedImage {
  id: string;
  url: string; // 图像URL
  prompt: string;
  timestamp: number;
  type: 'initial' | 'modification' | 'upload';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  relatedImageId?: string; // 消息关联的图像
}

export type ActionType = 'GENERATE' | 'MODIFY' | 'RANDOM';

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface DesignAction {
  type: ActionType;
  label: string;
  description: string;
  searchQuery: string; // 生成主题关键词
}

export interface DesignAnalysis {
  reply: string; // 对话回复
  suggestedAction: DesignAction | null; // 建议的操作
}

export interface VisCategory {
  name: string;
  promptSuffix: string;
  aspectRatio?: AspectRatio;
}

// 基础视觉规范分类
export const BASIC_VI_CATEGORIES: VisCategory[] = [
  // 1. 标识规范与构成
  { name: '几何解构', promptSuffix: '品牌标识几何解构图，蓝图美学，黄金分割曲线，辅助线系统，数理构成分析，工程制图风格，黑白单色', aspectRatio: '1:1' },
  { name: '呼吸空间', promptSuffix: '品牌标识安全保护区，X高度度量规范，最小留白定义，极简技术指南，尺寸标注系统', aspectRatio: '1:1' },
  { name: '横向构成', promptSuffix: '品牌标识横向组合规范，文字与符号并置，白色背景纯净呈现，企业官方应用标准', aspectRatio: '16:9' },
  { name: '纵向构成', promptSuffix: '品牌标识纵向组合规范，符号居上文字居下，瑞士国际主义字体美学', aspectRatio: '3:4' },
  { name: '正方容器', promptSuffix: '品牌标识居中于正方形容器内，平衡留白构图，社交媒体头像样式', aspectRatio: '1:1' },
  { name: '符号独白', promptSuffix: '独立品牌徽记符号，大比例呈现，网站图标美学，抽象符号聚焦，无文字元素', aspectRatio: '1:1' },
  { name: '字标独白', promptSuffix: '独立品牌字体标识，文字排版美学，字母形态分析，无符号元素，极简呈现', aspectRatio: '16:9' },
  { name: '比例测试', promptSuffix: '品牌标识缩放比例测试表，展示16px/32px/64px尺寸，清晰度验证，极简网格美学', aspectRatio: '4:3' },
  { name: '单色版本', promptSuffix: '纯黑品牌标识于白纸之上，100%黑色密度，高对比度印章效果，专业印刷标准', aspectRatio: '1:1' },
  { name: '反转版本', promptSuffix: '纯白品牌标识于深黑背景之上，反转对比美学，暗色模式视觉，强冲击力呈现', aspectRatio: '1:1' },

  // 2. 色彩系统
  { name: '主色光谱', promptSuffix: '品牌主色调光谱系统，大幅色块呈现，潘通色号标注，CMYK/RGB数值，极简布局，奢华质感', aspectRatio: '4:3' },
  { name: '辅色光谱', promptSuffix: '互补辅助色光谱系统，强调色彩组合，和谐色彩方案，现代设计色块美学', aspectRatio: '4:3' },
  { name: '语义色彩', promptSuffix: '用户界面功能性色彩系统，成功绿/错误红/警告橙/信息蓝，品牌整体协调', aspectRatio: '16:9' },
  { name: '渐变光谱', promptSuffix: '品牌色彩渐变网格系统，平滑过渡美学，现代模糊效果，网格渐变背景，鲜艳呈现', aspectRatio: '16:9' },
  { name: '视觉权重', promptSuffix: '视觉权重信息图表，60-30-10色彩法则图解，品牌色彩应用指南', aspectRatio: '1:1' },

  // 3. 字体样本
  { name: '主字体族', promptSuffix: '品牌主字体族样本海报，"Aa"大字形呈现，完整字母表，与品牌标识美学匹配的风格', aspectRatio: '3:4' },
  { name: '辅字体族', promptSuffix: '品牌辅字体族样本，正文文本块，易读衬线或无衬线体，匹配品牌个性', aspectRatio: '3:4' },
  { name: '字体对话', promptSuffix: '字体搭配指南，主标题与辅正文组合，层级关系示例，极简布局美学', aspectRatio: '4:3' },
  { name: '基线网格', promptSuffix: '基线网格图解，字体垂直韵律，技术间距指南，现代布局美学', aspectRatio: '3:4' },
  { name: '字态微观', promptSuffix: '品牌标识字体单个字符微距特写，墨水晕染或数字精度，字体字符分析', aspectRatio: '1:1' },

  // 4. 图形资产与视觉DNA
  { name: '几何图腾', promptSuffix: '无缝品牌图腾，源自标识DNA的重复几何形态，壁纸纹理美学，包装纸艺术', aspectRatio: '1:1' },
  { name: '抽象超图', promptSuffix: '大幅抽象超图形，裁剪标识元素，动态背景构图，墙面艺术美学', aspectRatio: '16:9' },
  { name: '流体形态', promptSuffix: '品牌背景用有机抽象形态，流体设计美学，协调色板呈现', aspectRatio: '16:9' },
  { name: '符号体系', promptSuffix: '定制12枚用户界面符号组，统一线条粗细，极简矢量风格，连贯品牌语言', aspectRatio: '4:3' },
  { name: '插图风格', promptSuffix: '企业插图风格指南，扁平矢量艺术，抽象概念场景，品牌色彩呈现', aspectRatio: '4:3' },

  // 5. 数字与纹理标准
  { name: '界面套件', promptSuffix: '现代用户界面设计系统，按钮/输入框/卡片，应用品牌色彩，Figma风格预览', aspectRatio: '16:9' },
  { name: '应用图标', promptSuffix: '应用图标设计指南，iOS与Android圆角方形容器，标识适配规范', aspectRatio: '1:1' },
  { name: '纸纹触感', promptSuffix: '标识压印于高级纹理纸张，微距拍摄，触感美学，奢华品牌质感', aspectRatio: '1:1' },
  { name: '金属工艺', promptSuffix: '三维激光切割金属标识标牌，拉丝钢质感，工业建筑美学', aspectRatio: '16:9' },
  { name: '玻璃蚀刻', promptSuffix: '标识蚀刻于磨砂玻璃，办公室隔断环境，柔和光线，专业质感', aspectRatio: '4:3' }
];

// 应用场景分类
export const VIS_CATEGORIES: VisCategory[] = [
  // 企业用品
  { name: '商务名片', promptSuffix: '高品质专业商务名片样机，极简现代设计美学，正面与背面', aspectRatio: '16:9' },
  { name: '信封信笺', promptSuffix: '极简企业信封信笺样机置于桌面之上，优雅纸张质感', aspectRatio: '3:4' },
  { name: '身份牌', promptSuffix: '企业身份牌吊绳样机，专业外观，悬垂状态', aspectRatio: '3:4' },
  { name: '手账本', promptSuffix: '精装手账本样机，标识压印工艺，黑色皮革质感', aspectRatio: '3:4' },
  { name: '演示文稿', promptSuffix: '演示文稿幻灯片组样机，极简布局美学，品牌母版', aspectRatio: '16:9' },

  // 数字产品
  { name: '移动应用', promptSuffix: '现代iPhone样机展示带标识的登录界面，极简用户界面，黏土渲染', aspectRatio: '9:16' },
  { name: '品牌官网', promptSuffix: 'MacBook Pro笔记本电脑样机，展示极简企业落地页与标识', aspectRatio: '16:9' },
  { name: '社交矩阵', promptSuffix: 'Instagram网格布局样机，连贯品牌美学，手机屏幕', aspectRatio: '1:1' },

  // 周边产品
  { name: '文化衫', promptSuffix: '黑色棉质文化衫样机，标识位于胸前，真实面料，时尚摄影', aspectRatio: '3:4' },
  { name: '环保袋', promptSuffix: '帆布手提袋样机，环保美学，丝网印刷标识', aspectRatio: '3:4' },
  { name: '咖啡外带', promptSuffix: '一次性纸咖啡杯样机，咖啡馆环境，热气氤氲', aspectRatio: '1:1' },
  { name: '包装礼盒', promptSuffix: '极简运输箱样机，带标识图案的封箱胶带', aspectRatio: '4:3' },

  // 标识标牌
  { name: '办公招牌', promptSuffix: '三维室外办公室招牌样机，现代玻璃幕墙建筑，日光', aspectRatio: '4:3' },
  { name: '户外大牌', promptSuffix: '大型户外广告牌样机，城市街道环境，高冲击力', aspectRatio: '16:9' },
  { name: '车辆涂装', promptSuffix: '配送货车包贴样机，侧面视图，极简品牌美学，白色货车', aspectRatio: '16:9' },
  { name: '店铺门头', promptSuffix: '精品店店铺门头标识，背光，夜间照明，发光标识', aspectRatio: '4:3' }
];
