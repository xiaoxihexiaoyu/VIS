export interface GeneratedImage {
  id: string;
  url: string; // 图片URL
  prompt: string;
  timestamp: number;
  type: 'initial' | 'modification' | 'upload';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  relatedImageId?: string; // 如果消息关联到某张图片
}

export type ActionType = 'GENERATE' | 'MODIFY' | 'RANDOM';

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface DesignAction {
  type: ActionType;
  label: string;
  description: string;
  searchQuery: string; // 用于生成的主题词
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

// 基础VIS元素分类
export const BASIC_VI_CATEGORIES: VisCategory[] = [
  // 1. 标志规范与布局
  { name: '技术网格', promptSuffix: '标志技术网格构造图，蓝图风格，几何分析，构造线，斐波那契螺旋，工程制图，黑白风格', aspectRatio: '1:1' },
  { name: '安全空间指南', promptSuffix: '标志安全区域图，用"X"高度定义的排除区域，极简技术指南，尺寸线，间距规则', aspectRatio: '1:1' },
  { name: '横向组合', promptSuffix: '标志横向布局规范，文字在图标旁边，白色背景整洁呈现，官方企业使用', aspectRatio: '16:9' },
  { name: '纵向组合', promptSuffix: '标志纵向布局规范，图标在文字上方，居中对齐，现代瑞士字体设计', aspectRatio: '3:4' },
  { name: '方形容器', promptSuffix: '标志居中于方形容器内，平衡留白，社交媒体头像风格', aspectRatio: '1:1' },
  { name: '单独符号', promptSuffix: '独立品牌标志符号，大尺寸，网站图标风格，抽象图标聚焦，无文字', aspectRatio: '1:1' },
  { name: '文字标志', promptSuffix: '独立字体标志，文字排版聚焦，字形分析，无符号，整洁呈现', aspectRatio: '16:9' },
  { name: '小尺寸测试', promptSuffix: '标志缩放测试表，显示16px、32px、64px尺寸，清晰度检查，极简网格', aspectRatio: '4:3' },
  { name: '单色墨版', promptSuffix: '纯黑标志在白纸上，100%黑色，高对比度印章效果，专业印刷标准', aspectRatio: '1:1' },
  { name: '反向负版', promptSuffix: '纯白标志在深黑背景上，反向对比，暗色美学，高冲击力', aspectRatio: '1:1' },

  // 2. 色彩系统
  { name: '主色板', promptSuffix: '品牌主色调色板，大色块，潘通色号，CMYK RGB值，极简布局，奢华感', aspectRatio: '4:3' },
  { name: '辅助色板', promptSuffix: '互补辅助色色板，强调色，和谐色彩方案，现代设计色块', aspectRatio: '4:3' },
  { name: '语义色彩', promptSuffix: 'UI功能性色彩系统，成功绿、错误红、警告橙、信息蓝，与品牌协调', aspectRatio: '16:9' },
  { name: '渐变系统', promptSuffix: '品牌色彩渐变网格，平滑过渡，现代模糊效果，网格渐变背景，鲜艳', aspectRatio: '16:9' },
  { name: '色彩比重', promptSuffix: '视觉权重信息图，60-30-10色彩规则图解，品牌色彩应用指南', aspectRatio: '1:1' },

  // 3. 字体样本
  { name: '主字体', promptSuffix: '品牌主字体族样张海报，"Aa"大字形，完整字母表，与上传标志美学匹配的风格', aspectRatio: '3:4' },
  { name: '辅助字体', promptSuffix: '辅助字体样张，正文文本块，易读衬线或无衬线体，匹配品牌个性', aspectRatio: '3:4' },
  { name: '字体搭配', promptSuffix: '字体搭配指南，主标题与辅助正文，层级示例，整洁布局', aspectRatio: '4:3' },
  { name: '字体网格', promptSuffix: '基线网格图解，字体垂直韵律，技术间距指南，现代布局', aspectRatio: '3:4' },
  { name: '字形细节', promptSuffix: '标志字体单个字符的微距特写，墨水晕染或数字精度，字体字符分析', aspectRatio: '1:1' },

  // 4. 图形资产与视觉DNA
  { name: '几何图案', promptSuffix: '无缝品牌图案，源自标志DNA的重复几何形状，壁纸纹理，包装纸', aspectRatio: '1:1' },
  { name: '抽象超级图形', promptSuffix: '大幅抽象超级图形，裁剪的标志元素，动态背景构图，墙面艺术', aspectRatio: '16:9' },
  { name: '流体品牌形状', promptSuffix: '品牌背景用有机抽象形状，流体设计，协调色板', aspectRatio: '16:9' },
  { name: '图标集', promptSuffix: '定制12个UI图标组，统一线条粗细，极简矢量风格，连贯品牌语言', aspectRatio: '4:3' },
  { name: '品牌插图', promptSuffix: '企业插图风格指南，扁平矢量艺术，抽象概念场景，品牌色彩', aspectRatio: '4:3' },

  // 5. 数字与纹理标准
  { name: '数字UI套件', promptSuffix: '现代UI设计系统，按钮、输入框、卡片，应用品牌色彩，Figma风格预览', aspectRatio: '16:9' },
  { name: '应用图标系统', promptSuffix: '应用图标设计指南，iOS和Android圆角方形容器，标志适配', aspectRatio: '1:1' },
  { name: '材质纹理', promptSuffix: '标志压印在高级纹理纸张上，微距拍摄，触感，奢华品牌', aspectRatio: '1:1' },
  { name: '金属制作', promptSuffix: '3D激光切割金属标志标牌，拉丝钢质感，工业建筑风格', aspectRatio: '16:9' },
  { name: '玻璃蚀刻', promptSuffix: '标志蚀刻在磨砂玻璃上，办公室隔断环境，柔和光线，专业', aspectRatio: '4:3' }
];

// 应用场景分类
export const VIS_CATEGORIES: VisCategory[] = [
  // 企业用品
  { name: '商务名片', promptSuffix: '高品质专业商务名片样机，极简现代设计，正面和背面', aspectRatio: '16:9' },
  { name: '信头纸', promptSuffix: '整洁企业信头和信封样机放在桌面上，优雅纸张纹理', aspectRatio: '3:4' },
  { name: '工牌', promptSuffix: '企业工牌胸卡样机，专业外观，悬挂状态', aspectRatio: '3:4' },
  { name: '笔记本', promptSuffix: '精装笔记本样机，标志压印，黑色皮革纹理', aspectRatio: '3:4' },
  { name: '演示文稿', promptSuffix: 'PPT演示文稿幻灯片组样机，整洁布局，品牌母版', aspectRatio: '16:9' },

  // 数字产品
  { name: '移动应用', promptSuffix: '现代iPhone样机显示带有标志的登录界面，整洁UI，黏土渲染', aspectRatio: '9:16' },
  { name: '落地页', promptSuffix: 'MacBook Pro笔记本电脑样机，显示整洁企业落地页与标志', aspectRatio: '16:9' },
  { name: '社交媒体', promptSuffix: 'Instagram网格布局样机，连贯品牌美学，手机屏幕', aspectRatio: '1:1' },

  // 周边产品
  { name: 'T恤', promptSuffix: '黑色棉质T恤样机，标志在胸前，真实面料，时尚摄影', aspectRatio: '3:4' },
  { name: '环保袋', promptSuffix: '帆布手提袋样机，环保风格，丝网印刷标志', aspectRatio: '3:4' },
  { name: '咖啡杯', promptSuffix: '一次性纸咖啡杯样机，咖啡馆环境，热气', aspectRatio: '1:1' },
  { name: '包装盒', promptSuffix: '极简运输箱样机，带标志图案的胶带', aspectRatio: '4:3' },

  // 标识标牌
  { name: '办公室标牌', promptSuffix: '3D室外办公室标牌样机，现代玻璃建筑，白天', aspectRatio: '4:3' },
  { name: '广告牌', promptSuffix: '大型户外广告牌样机，城市街道环境，高冲击力', aspectRatio: '16:9' },
  { name: '车身广告', promptSuffix: '配送货车包贴样机，侧视图，整洁品牌，白色货车', aspectRatio: '16:9' },
  { name: '店面标识', promptSuffix: '精品店店面标牌，背光，夜间照明，发光标志', aspectRatio: '4:3' }
];
