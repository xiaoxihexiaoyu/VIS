import React, { useState, useRef, useEffect } from 'react';
import { Layout, Send, ArrowRight, ArrowLeft, Sparkles, Key, X } from 'lucide-react';
import { GeneratedImage, VIS_CATEGORIES, BASIC_VI_CATEGORIES, ChatMessage, DesignAction, ActionType } from './types';
import { generateImage, generateCreativePrompts, analyzeDesignRequest } from './services/imageService';
import { UploadArea } from './components/UploadArea';
import { Button } from './components/Button';
import { ImageGrid } from './components/ImageGrid';
import { ImageViewer } from './components/ImageViewer';
import { ActionCard } from './components/ActionCard';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'system',
  text: "系统已启动。\n\n我是您的自动化VIS生成器。请上传Logo以开始。\n\n我将为您生成完整的视觉识别系统，包括多种标志布局、色彩系统和完整的字体指南。"
};

const RANDOM_PROMPTS = [
  "未来感全息图从智能手表投射",
  "赛博朋克城市雨夜中的巨大霓虹广告牌",
  "现代美术馆极简水泥墙面蚀刻",
  "高级哑光黑色包装上的烫金工艺",
  "飞越瑞士阿尔卑斯山的品牌热气球",
  "高端丝绸轰炸机夹克上的刺绣",
  "苔藓上的激光切割金属名片",
  "赛道上飞驰的品牌F1赛车",
  "水下酒店窗户贴纸",
  "舒适咖啡馆拿铁上的咖啡拉花艺术",
  "游行中漂浮的巨型充气吉祥物",
  "品牌宇航员头盔反光"
];

const App: React.FC = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [editImage, setEditImage] = useState<GeneratedImage | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('TUZI_API_KEY') || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // 流程控制状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingAction, setPendingAction] = useState<DesignAction | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动聊天
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loadingStatus, pendingAction]);

  // 检查API密钥
  const checkApiKey = (): boolean => {
    const key = localStorage.getItem('TUZI_API_KEY') || apiKey;
    return !!key;
  };

  // 处理Logo上传
  const handleLogoUpload = async (base64: string) => {
    if (!checkApiKey()) {
      setShowApiKeyModal(true);
      return;
    }

    setLogo(base64);
    setImages([]); // 清空旧图片
    setEditImage(null);
    setPendingAction(null);
    setChatHistory([{
      id: Date.now().toString(),
      role: 'system',
      text: "已获取源Logo。初始化多批次生成...\n\n阶段1：多样化基础元素（30+变体）\n阶段2：应用场景（16+样机）"
    }]);

    setIsGenerating(true);

    try {
      // 阶段1：基础元素
      await generateBasicSystem(base64);

      // 阶段2：应用场景
      await generateApplicationScenarios(base64);

      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        text: `系统生成完成。\n\n共生成${BASIC_VI_CATEGORIES.length + VIS_CATEGORIES.length}个高保真品牌资产。\n您现在可以选择任意图片进行下载或进一步优化。`
      }]);

    } catch (error) {
      console.error("序列错误", error);
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        text: "生成序列中断。请检查您的网络连接和API密钥。"
      }]);
    } finally {
      setLoadingStatus('');
      setIsGenerating(false);
    }
  };

  const generateBasicSystem = async (logoBase64: string) => {
    const tasks = BASIC_VI_CATEGORIES.map(category => ({
      categoryName: category.name,
      prompt: `${category.promptSuffix}，请将此标志应用其中：${logoBase64}`,
      variationLabel: '标准',
      aspectRatio: category.aspectRatio || '1:1'
    }));

    await processBatch(tasks, logoBase64, '基础系统');
  };

  const generateApplicationScenarios = async (logoBase64: string) => {
    const tasks = VIS_CATEGORIES.map(category => ({
      categoryName: category.name,
      prompt: `一个${category.promptSuffix}，品牌标识可见，照片级样机，请将此标志应用其中：${logoBase64}`,
      variationLabel: '应用',
      aspectRatio: category.aspectRatio || '1:1'
    }));

    await processBatch(tasks, logoBase64, '样机');
  };

  const processBatch = async (
    tasks: { categoryName: string; prompt: string; variationLabel: string; aspectRatio: string }[],
    logoBase64: string,
    phaseLabel: string
  ) => {
    const BATCH_SIZE = 4;

    for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
      const batch = tasks.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(tasks.length / BATCH_SIZE);

      setLoadingStatus(`正在生成${phaseLabel}：批次 ${batchNumber}/${totalBatches}`);

      const promises = batch.map(async (task): Promise<GeneratedImage | null> => {
        try {
          const url = await generateImage(task.prompt, task.aspectRatio);
          return {
            id: Date.now() + Math.random().toString(),
            url,
            prompt: `${task.categoryName}（${task.variationLabel}）`,
            timestamp: Date.now(),
            type: 'initial'
          };
        } catch (e) {
          console.error(`生成${task.categoryName}失败`, e);
          return null;
        }
      });

      const results = await Promise.all(promises);
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

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsAnalyzing(true);
    setLoadingStatus('正在分析请求...');

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
            text: "操作被阻止：请先上传Logo。"
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
        text: "通信错误。请重试。"
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

    try {
      const referenceImage = logo;

      if (action.type === 'MODIFY' && editImage) {
        setLoadingStatus(`正在修改资产：${action.label.toUpperCase()}...`);
        const promptContext = `请根据以下要求修改这张图片：${action.searchQuery}。保持主要构图但应用更改。专业设计风格。原始图片：${editImage.url}`;

        const generatedUrl = await generateImage(promptContext, '1:1');

        const newImg: GeneratedImage = {
          id: Date.now().toString(),
          url: generatedUrl,
          prompt: `编辑：${action.searchQuery}`,
          timestamp: Date.now(),
          type: 'modification'
        };

        setImages(prev => [newImg, ...prev]);
        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          text: "修改完成。",
          relatedImageId: newImg.id
        }]);

      } else {
        setLoadingStatus(action.type === 'RANDOM' ? '正在构思随机创意...' : '正在设计变体...');

        const inputForGenerator = action.type === 'RANDOM'
          ? RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)]
          : action.searchQuery;

        const creativePrompts = await generateCreativePrompts(inputForGenerator);

        setLoadingStatus(`正在渲染${creativePrompts.length}个资产...`);

        const generationPromises = creativePrompts.map(async (prompt, index): Promise<GeneratedImage | null> => {
          try {
            const ratios = ['1:1', '16:9', '9:16'];
            const randomRatio = ratios[Math.floor(Math.random() * ratios.length)];
            const ratioToUse = action.type === 'RANDOM' ? randomRatio : '1:1';

            const url = await generateImage(`${prompt}，品牌标志：${logo}`, ratioToUse);
            return {
              id: Date.now() + Math.random().toString(),
              url,
              prompt: prompt,
              timestamp: Date.now(),
              type: 'initial'
            };
          } catch (e) {
            console.error(`生成变体${index + 1}失败`, e);
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
            text: `生成完成：${successfulImages.length}个新资产。`,
            relatedImageId: successfulImages[0].id
          }]);
        } else {
          throw new Error("生成未产生有效结果。");
        }
      }

    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        text: "生成失败。请检查API密钥和网络连接。"
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
      text: `已进入编辑模式（ID #${img.id.slice(-4)}）。\n告诉我如何修改（例如："改成金色"、"把背景换成红色"）。`
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
      label: '给我惊喜',
      description: '生成一个完全随机的高品质品牌资产。',
      searchQuery: 'random'
    });
  };

  // 保存API密钥
  const handleSaveApiKey = () => {
    localStorage.setItem('TUZI_API_KEY', apiKey);
    setApiKey(apiKey);
    setShowApiKeyModal(false);
  };

  return (
    <div className="flex h-screen bg-white text-black overflow-hidden font-sans">

      {/* API密钥模态框 */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white border-2 border-black p-8 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold uppercase tracking-tighter">设置API密钥</h2>
              <button onClick={() => setShowApiKeyModal(false)} className="hover:bg-gray-100 p-2">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              请输入您的兔子API密钥以继续使用。
              <br />
              <a href="https://app.apifox.com/web/project/7040782/apis/api-343646956-run" target="_blank" rel="noopener noreferrer" className="text-[#E30613] underline">
                获取API密钥 →
              </a>
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Bearer sk-..."
              className="w-full border border-black px-4 py-3 mb-4 text-sm font-mono focus:outline-none focus:border-[#E30613]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="flex-1 py-3 border border-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
                className="flex-1 py-3 bg-[#E30613] text-white text-sm font-bold uppercase tracking-wider hover:bg-black disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 侧边栏：聊天与控制 */}
      <div className="w-[400px] bg-white border-r border-black flex flex-col z-20 shrink-0 relative shadow-xl">
        {/* 头部 */}
        <div className="p-8 border-b border-black flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#E30613]">
              <Layout size={20} />
            </div>
            <h1 className="font-black text-3xl tracking-tighter uppercase leading-none">
              VIS<br/>智能
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              AI设计助手
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="text-xs font-bold uppercase tracking-widest border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors flex items-center gap-1"
            >
              <Key size={12} />
              密钥
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

        {/* 聊天记录 */}
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
                    {msg.role === 'model' ? 'VIS智能' : msg.role === 'user' ? '用户' : `日志 [${index.toString().padStart(3, '0')}]`}
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
                    查看输出 <ArrowRight size={12} />
                  </button>
                )}
              </div>
            ))}

            {(isAnalyzing || isGenerating) && (
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E30613] animate-pulse">
                  {loadingStatus || '处理中...'}
                </span>
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
                <span className="text-xs font-bold uppercase tracking-wider truncate">正在修改：{editImage.prompt.substring(0, 20)}...</span>
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
                  title="给我惊喜（随机生成）"
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
              placeholder={logo ? (editImage ? "我该如何修改这张图片？" : "与我聊聊您的品牌...") : "等待源文件..."}
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
                  品牌<br/>识别<br/>系统
                </h2>
                <div className="w-24 h-2 bg-[#E30613] mt-8"></div>
              </div>

              <div className="grid grid-cols-2 gap-12 max-w-lg">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4">批量处理</h3>
                  <p className="text-sm font-medium">4个并发AI设计线程并行执行，实现最高效率。</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4">VIS覆盖</h3>
                  <p className="text-sm font-medium">全面的标志规范、色彩系统、字体指南和样机。</p>
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
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">项目源文件</span>
                  <span className="text-sm font-bold uppercase">Main Logo.png</span>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <img src={logo} alt="源文件" className="h-8 w-auto border border-gray-200" />
              </div>
              <div className="flex items-center gap-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#E30613]">批量模式（4x）</div>
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
