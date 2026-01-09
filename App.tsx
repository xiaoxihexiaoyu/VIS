import React, { useState, useRef, useEffect } from 'react';
import { Layout, Send, ArrowRight, ArrowLeft, Sparkles, Key, X, Square } from 'lucide-react';
import { GeneratedImage, VIS_CATEGORIES, BASIC_VI_CATEGORIES, ChatMessage, DesignAction, ActionType } from './types';
import { generateImage, generateCreativePrompts, analyzeDesignRequest, abortAllRequests } from './services/imageService';
import { UploadArea } from './components/UploadArea';
import { Button } from './components/Button';
import { ImageGrid } from './components/ImageGrid';
import { ImageViewer } from './components/ImageViewer';
import { ActionCard } from './components/ActionCard';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'system',
  text: "VIS 噐度 · 智能品牌视觉系统\n\n请上传您的品牌标识，开启视觉进化之旅。\n\n系统将为您构建完整的设计语言体系——\n从基础视觉规范到沉浸式应用场景，\n每一帧都是品牌DNA的精准表达。"
};

const RANDOM_PROMPTS = [
  "智能穿戴设备投射的全息品牌徽章，未来主义美学",
  "新东京赛博都会阴雨夜幕下的巨幅霓虹品牌装置",
  "苏黎世当代美术馆极简水泥墙面的品牌蚀刻艺术",
  "高级暗纹纸上的烫金品牌印鉴，奢华触感呈现",
  "穿越阿尔卑斯雪域的品牌热气球，史诗级航拍",
  "米兰时装周丝绸轰炸机夹克上的品牌刺绣",
  "北欧森林苔藓之上的激光镂空金属名片，自然与工业的对话",
  "蒙特卡洛F1赛道疾驰的品牌赛车，速度与激情",
  "马尔代夫水下套房玻璃幕墙的品牌贴膜",
  "巴黎左岸咖啡馆的拉花艺术，法式浪漫诠释",
  "柏林街头狂欢节的巨型品牌充气装置",
  "太空站宇航员头盔面罩上的品牌反光，星际征途"
];

const App: React.FC = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [editImage, setEditImage] = useState<GeneratedImage | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('TUZI_API_KEY') || '');
  const [arkApiKey, setArkApiKey] = useState<string>(() => localStorage.getItem('ARK_API_KEY') || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // 流程控制状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingAction, setPendingAction] = useState<DesignAction | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [isCancelled, setIsCancelled] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动聊天
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loadingStatus, pendingAction]);

  // 检查API密钥
  const checkApiKey = (): boolean => {
    const tuziKey = localStorage.getItem('TUZI_API_KEY') || apiKey;
    const arkKey = localStorage.getItem('ARK_API_KEY') || arkApiKey;
    return !!(tuziKey && arkKey);
  };

  // 取消生成
  const handleCancelGeneration = () => {
    abortAllRequests();
    setIsCancelled(true);
    setIsGenerating(false);
    setIsAnalyzing(false);
    setLoadingStatus('');
    setPendingAction(null);
    setChatHistory(prev => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      text: "生成已终止\n\n可重新上传标识或调整参数继续"
    }]);
  };

  // 处理Logo上传
  const handleLogoUpload = async (base64: string) => {
    if (!checkApiKey()) {
      setShowApiKeyModal(true);
      return;
    }

    setIsCancelled(false);
    setLogo(base64);
    setImages([]);
    setEditImage(null);
    setPendingAction(null);
    setChatHistory([{
      id: Date.now().toString(),
      role: 'system',
      text: "源标识已捕获 · 视觉系统初始化中...\n\n━━━ 阶段壹 ━━━\n基础视觉规范构建\n30+ 设计语言单元\n\n━━━ 阶段贰 ━━━\n沉浸式场景演绎\n16+ 应用美学呈现"
    }]);

    setIsGenerating(true);

    try {
      await generateBasicSystem(base64);
      await generateApplicationScenarios(base64);

      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        text: `视觉系统构建完成\n\n${BASIC_VI_CATEGORIES.length + VIS_CATEGORIES.length} 枚品牌资产已生成\n\n您的品牌DNA现已完整呈现。\n可任意选择资产进行深度优化。`
      }]);

    } catch (error) {
      console.error("序列错误", error);
      if ((error as Error).message === 'GENERATION_ABORTED') {
        // 已通过 handleCancelGeneration 处理
        return;
      }
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        text: "生成流程异常中断\n\n请核实网络连接与API密钥配置"
      }]);
    } finally {
      setLoadingStatus('');
      setIsGenerating(false);
    }
  };

  const generateBasicSystem = async (logoBase64: string) => {
    const tasks = BASIC_VI_CATEGORIES.map(category => ({
      categoryName: category.name,
      prompt: `${category.promptSuffix}，请将此品牌标识融入设计：${logoBase64}`,
      variationLabel: '标准',
      aspectRatio: category.aspectRatio || '1:1'
    }));

    await processBatch(tasks, logoBase64, '基础规范');
  };

  const generateApplicationScenarios = async (logoBase64: string) => {
    const tasks = VIS_CATEGORIES.map(category => ({
      categoryName: category.name,
      prompt: `${category.promptSuffix}，品牌视觉识别清晰可辨，摄影级真实感渲染，请将此品牌标识融入：${logoBase64}`,
      variationLabel: '应用',
      aspectRatio: category.aspectRatio || '1:1'
    }));

    await processBatch(tasks, logoBase64, '场景演绎');
  };

  const processBatch = async (
    tasks: { categoryName: string; prompt: string; variationLabel: string; aspectRatio: string }[],
    logoBase64: string,
    phaseLabel: string
  ) => {
    const BATCH_SIZE = 4;

    for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
      // 检查是否已取消
      if (isCancelled) {
        throw new Error('GENERATION_ABORTED');
      }

      const batch = tasks.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(tasks.length / BATCH_SIZE);

      setLoadingStatus(`${phaseLabel}渲染中 · 批次 ${batchNumber}/${totalBatches}`);

      const promises = batch.map(async (task): Promise<GeneratedImage | null> => {
        try {
          const url = await generateImage(task.prompt, task.aspectRatio);
          return {
            id: Date.now() + Math.random().toString(),
            url,
            prompt: `${task.categoryName} · ${task.variationLabel}`,
            timestamp: Date.now(),
            type: 'initial'
          };
        } catch (e) {
          if ((e as Error).message === 'GENERATION_ABORTED') {
            throw e;
          }
          console.error(`${task.categoryName}生成失败`, e);
          return null;
        }
      });

      const results = await Promise.all(promises);

      // 再次检查是否已取消
      if (isCancelled) {
        throw new Error('GENERATION_ABORTED');
      }

      const successfulImages = results.filter((img): img is GeneratedImage => img !== null);

      if (successfulImages.length > 0) {
        setImages(prev => [...successfulImages, ...prev]);
      }
    }
  };

  // 处理用户消息发送
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isAnalyzing || isGenerating) return;
    if (!checkApiKey()) {
      setShowApiKeyModal(true);
      return;
    }

    const text = inputValue;
    setInputValue('');
    setPendingAction(null);
    setIsCancelled(false);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsAnalyzing(true);
    setLoadingStatus('意图解析中...');

    try {
      const analysis = await analyzeDesignRequest(text, !!logo, !!editImage);

      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: analysis.reply
      }]);

      if (analysis.suggestedAction) {
        if (!logo) {
          setChatHistory(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            text: "操作暂无法执行\n\n请先行上传品牌标识"
          }]);
        } else {
          setPendingAction(analysis.suggestedAction);
        }
      }

    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        text: "通信异常\n\n请稍后重试"
      }]);
    } finally {
      setIsAnalyzing(false);
      setLoadingStatus('');
    }
  };

  // 执行确认的操作
  const handleConfirmAction = async () => {
    if (!pendingAction || !logo) return;
    const action = pendingAction;
    setPendingAction(null);
    setIsGenerating(true);
    setIsCancelled(false);

    try {
      const referenceImage = logo;

      if (action.type === 'MODIFY' && editImage) {
        setLoadingStatus(`资产重构中 · ${action.label}...`);
        const promptContext = `请依据以下指令对图像进行艺术化重构：${action.searchQuery}。保留核心构图，精准演绎设计意图，专业设计美学。源图像：${editImage.url}`;

        const generatedUrl = await generateImage(promptContext, '1:1');

        const newImg: GeneratedImage = {
          id: Date.now().toString(),
          url: generatedUrl,
          prompt: `重构 · ${action.searchQuery}`,
          timestamp: Date.now(),
          type: 'modification'
        };

        setImages(prev => [newImg, ...prev]);
        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          text: "视觉重构完成",
          relatedImageId: newImg.id
        }]);

      } else {
        setLoadingStatus(action.type === 'RANDOM' ? '创意涌现中...' : '美学演绎中...');

        const inputForGenerator = action.type === 'RANDOM'
          ? RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)]
          : action.searchQuery;

        const creativePrompts = await generateCreativePrompts(inputForGenerator);

        setLoadingStatus(`视觉渲染中 · ${creativePrompts.length} 构图`);

        const generationPromises = creativePrompts.map(async (prompt, index): Promise<GeneratedImage | null> => {
          try {
            const ratios = ['1:1', '16:9', '9:16'];
            const randomRatio = ratios[Math.floor(Math.random() * ratios.length)];
            const ratioToUse = action.type === 'RANDOM' ? randomRatio : '1:1';

            const url = await generateImage(`${prompt}，品牌标识：${logo}`, ratioToUse);
            return {
              id: Date.now() + Math.random().toString(),
              url,
              prompt: prompt,
              timestamp: Date.now(),
              type: 'initial'
            };
          } catch (e) {
            if ((e as Error).message === 'GENERATION_ABORTED') {
              throw e;
            }
            console.error(`构图${index + 1}生成失败`, e);
            return null;
          }
        });

        const results = await Promise.all(generationPromises);
        const successfulImages = results.filter((img): img is GeneratedImage => img !== null);

        if (successfulImages.length > 0) {
          setImages(prev => [...successfulImages, ...prev]);
          setChatHistory(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            text: `美学呈现完成\n\n${successfulImages.length} 枚全新视觉资产`,
            relatedImageId: successfulImages[0].id
          }]);
        } else {
          throw new Error("生成未产生有效结果");
        }
      }

    } catch (error) {
      if ((error as Error).message === 'GENERATION_ABORTED') {
        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          text: "生成已终止\n\n可调整参数后重新开始"
        }]);
        return;
      }
      console.error(error);
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        text: "生成失败\n\n请核实API密钥与网络状态"
      }]);
    } finally {
      setIsGenerating(false);
      setLoadingStatus('');
      if (action.type === 'MODIFY') {
        setEditImage(null);
      }
    }
  };

  const handleImageClick = (img: GeneratedImage) => {
    setSelectedImage(img);
  };

  const handleSelectForEdit = (img: GeneratedImage) => {
    setEditImage(img);
    setSelectedImage(null);
    setChatHistory(prev => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      text: `编辑模式已激活 [资产 #${img.id.slice(-4)}]\n\n请描述您期望的视觉调整\n例：「调整为金色系」「替换深色背景」`
    }]);
  };

  const clearEditSelection = () => {
    setEditImage(null);
    setPendingAction(null);
  };

  const triggerRandom = () => {
    if (!logo) return;
    setPendingAction({
      type: 'RANDOM',
      label: '随机创意',
      description: '触发全新品牌美学构想',
      searchQuery: 'random'
    });
  };

  // 保存API密钥
  const handleSaveApiKey = () => {
    localStorage.setItem('TUZI_API_KEY', apiKey);
    localStorage.setItem('ARK_API_KEY', arkApiKey);
    setApiKey(apiKey);
    setArkApiKey(arkApiKey);
    setShowApiKeyModal(false);
  };

  return (
    <div className="flex h-screen bg-white text-black overflow-hidden font-sans">

      {/* API密钥模态框 */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white border-2 border-black p-8 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold uppercase tracking-tighter">API 密钥配置</h2>
              <button onClick={() => setShowApiKeyModal(false)} className="hover:bg-gray-100 p-2">
                <X size={20} />
              </button>
            </div>

            {/* 图像生成 API */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                图像生成 API (兔子)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Bearer sk-..."
                className="w-full border border-black px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#E30613]"
              />
              <a href="https://app.apifox.com/web/project/7040782/apis/api-343646956-run" target="_blank" rel="noopener noreferrer" className="text-xs text-[#E30613] underline mt-1 inline-block">
                获取访问令牌 →
              </a>
            </div>

            {/* 智能对话 API */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                智能对话 API (豆包)
              </label>
              <input
                type="password"
                value={arkApiKey}
                onChange={(e) => setArkApiKey(e.target.value)}
                placeholder="Bearer sk-..."
                className="w-full border border-black px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#E30613]"
              />
              <a href="https://console.volcengine.com/ark" target="_blank" rel="noopener noreferrer" className="text-xs text-[#E30613] underline mt-1 inline-block">
                获取访问令牌 →
              </a>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="flex-1 py-3 border border-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim() || !arkApiKey.trim()}
                className="flex-1 py-3 bg-[#E30613] text-white text-sm font-bold uppercase tracking-wider hover:bg-black disabled:opacity-50"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 侧边栏：对话与控制 */}
      <div className="w-[400px] bg-white border-r border-black flex flex-col z-20 shrink-0 relative shadow-xl">
        {/* 头部 */}
        <div className="p-8 border-b border-black flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#E30613]">
              <Layout size={20} />
            </div>
            <h1 className="font-black text-3xl tracking-tighter uppercase leading-none">
              VIS<br/>噐度
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              智能品牌视觉系统
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="text-xs font-bold uppercase tracking-widest border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors flex items-center gap-1"
            >
              <Key size={12} />
              令牌
            </button>
            {logo && (
              <button
                onClick={() => {
                  setLogo(null);
                  setImages([]);
                }}
                className="text-xs font-bold uppercase tracking-widest border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
              >
                重置
              </button>
            )}
          </div>
        </div>

        {/* 对话记录 */}
        <div className="flex-1 overflow-y-auto p-0 scrollbar-hide">
          <div className="flex flex-col pb-4">
            {chatHistory.map((msg, index) => (
              <div
                key={msg.id}
                className={`p-6 border-b border-gray-100 flex flex-col gap-2 ${msg.role === 'system' ? 'bg-gray-50' : 'bg-white'}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    msg.role === 'user' ? 'text-black' : msg.role === 'model' ? 'text-[#E30613]' : 'text-gray-400'
                  }`}>
                    {msg.role === 'model' ? 'VIS 噐度' : msg.role === 'user' ? '您' : `系统 [${index.toString().padStart(3, '0')}]`}
                  </span>
                </div>

                <p className={`text-sm font-medium leading-relaxed whitespace-pre-wrap ${msg.role === 'system' ? 'font-mono text-xs text-gray-500' : ''}`}>
                  {msg.text}
                </p>

                {msg.relatedImageId && (
                  <button
                    onClick={() => {
                      const img = images.find(i => i.id === msg.relatedImageId);
                      if (img) setSelectedImage(img);
                    }}
                    className="mt-2 self-start flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E30613] hover:underline"
                  >
                    查看呈现 <ArrowRight size={12} />
                  </button>
                )}
              </div>
            ))}

            {(isAnalyzing || isGenerating) && (
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E30613] animate-pulse">
                  {loadingStatus || '处理中...'}
                </span>
                <button
                  onClick={handleCancelGeneration}
                  className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
                  title="终止生成"
                >
                  <Square size={12} fill="currentColor" />
                  终止
                </button>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* 输入区域与操作卡片 */}
        <div className="bg-white border-t border-black relative">

          {/* 操作弹窗 */}
          {pendingAction && (
            <ActionCard
              action={pendingAction}
              onConfirm={handleConfirmAction}
              onCancel={() => setPendingAction(null)}
              isLoading={isGenerating}
            />
          )}

          {/* 编辑上下文 */}
          {editImage && (
            <div className="flex items-center justify-between bg-[#E30613] text-white p-3 border-b border-black">
              <div className="flex items-center gap-3 overflow-hidden">
                <img src={editImage.url} className="w-8 h-8 bg-white border border-black object-cover" />
                <span className="text-xs font-bold uppercase tracking-wider truncate">编辑中 · {editImage.prompt.substring(0, 15)}...</span>
              </div>
              <button onClick={clearEditSelection} className="hover:bg-black p-1 transition-colors">
                <ArrowLeft size={16} />
              </button>
            </div>
          )}

          <div className="relative">
            {/* 工具栏 */}
            <div className="absolute top-6 right-6 flex gap-2">
              {!editImage && !pendingAction && (
                <button
                  onClick={triggerRandom}
                  disabled={!logo || isAnalyzing || isGenerating}
                  className="p-2 bg-white text-black border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-0"
                  title="随机创意生成"
                >
                  <Sparkles size={20} />
                </button>
              )}
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || !logo || isAnalyzing || isGenerating}
                className="p-2 bg-black text-white hover:bg-[#E30613] transition-colors disabled:opacity-0"
              >
                <Send size={20} />
              </button>
            </div>

            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={logo ? (editImage ? "描述您的视觉调整意图..." : "请表达您的品牌构想...") : "等待品牌标识..."}
              disabled={!logo || isAnalyzing || isGenerating}
              className="w-full bg-white text-black placeholder-gray-400 p-6 pr-24 focus:outline-none resize-none h-24 text-sm font-medium uppercase rounded-none"
            />
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col relative h-full bg-white">
        {!logo ? (
          <div className="grid grid-cols-1 md:grid-cols-12 h-full">
            {/* 左侧：排版 */}
            <div className="col-span-1 md:col-span-8 p-12 md:p-24 flex flex-col justify-between border-b md:border-b-0 md:border-r border-black">
              <div className="space-y-2">
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
                  品牌<br/>视觉<br/>系统
                </h2>
                <div className="w-24 h-2 bg-[#E30613] mt-8"></div>
              </div>

              <div className="grid grid-cols-2 gap-12 max-w-lg">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4">并发演算</h3>
                  <p className="text-sm font-medium">四线程并行生成<br>效率与美学兼得</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4">系统覆盖</h3>
                  <p className="text-sm font-medium">基础规范 · 场景演绎<br>全维度品牌呈现</p>
                </div>
              </div>
            </div>

            {/* 右侧：操作 */}
            <div className="col-span-1 md:col-span-4 bg-[#f5f5f5]">
              <UploadArea onFileSelect={handleLogoUpload} />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* 顶部栏 */}
            <div className="h-16 border-b border-black flex items-center justify-between px-6 bg-white z-10 shrink-0">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">源标识</span>
                  <span className="text-sm font-bold uppercase">Brand Mark</span>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <img src={logo} alt="源标识" className="h-8 w-auto border border-gray-200" />
              </div>
              <div className="flex items-center gap-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#E30613]">并发模式 4x</div>
                <UploadArea onFileSelect={handleLogoUpload} compact />
              </div>
            </div>

            {/* 网格内容 */}
            <div className="flex-1 relative bg-gray-100">
              {/* 背景网格图案 */}
              <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

              <ImageGrid
                images={images}
                onImageClick={handleImageClick}
                selectedImageId={editImage?.id}
              />
            </div>
          </div>
        )}
      </div>

      {/* 模态查看器 */}
      {selectedImage && (
        <ImageViewer
          image={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          onSelectForEdit={handleSelectForEdit}
          isSelectedForEdit={editImage?.id === selectedImage.id}
        />
      )}
    </div>
  );
};

export default App;
