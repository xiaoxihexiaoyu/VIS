import React, { useState, useRef, useEffect } from 'react';
import { Layout, Send, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { GeneratedImage, VIS_CATEGORIES, BASIC_VI_CATEGORIES, ChatMessage, DesignAction, ActionType } from './types';
import { generateVisImage, generateCreativePrompts, analyzeDesignRequest } from './services/geminiService';
import { UploadArea } from './components/UploadArea';
import { Button } from './components/Button';
import { ImageGrid } from './components/ImageGrid';
import { ImageViewer } from './components/ImageViewer';
import { ActionCard } from './components/ActionCard';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'system',
  text: "SYSTEM ONLINE.\n\nI am your Automated VIS Generator. Upload a logo to begin.\n\nI will generate a comprehensive Visual Identity System, testing multiple logo arrangements, color systems, and a complete typography guide."
};

const RANDOM_PROMPTS = [
  "A futuristic hologram projected from a smartwatch",
  "A massive neon billboard in a rainy cyberpunk city",
  "Minimalist concrete wall etching in a modern art gallery",
  "Gold foil stamping on premium matte black packaging",
  "A branded hot air balloon floating over the Swiss Alps",
  "Embroidery on a high-end silk bomber jacket",
  "A laser-cut metal business card resting on moss",
  "A branded formula 1 racing car speeding on track",
  "An underwater hotel room window decal",
  "A coffee art pattern on a latte in a cozy cafe",
  "A giant inflatable mascot floating in a parade",
  "A branded spacesuit helmet reflection"
];

const App: React.FC = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [editImage, setEditImage] = useState<GeneratedImage | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  
  // States for flow control
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingAction, setPendingAction] = useState<DesignAction | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loadingStatus, pendingAction]);

  const handleLogoUpload = async (base64: string) => {
    setLogo(base64);
    setImages([]); // Clear old images
    setEditImage(null);
    setPendingAction(null);
    setChatHistory([{
      id: Date.now().toString(),
      role: 'system',
      text: "SOURCE LOGO ACQUIRED. INITIALIZING MULTI-BATCH GENERATION...\n\nPHASE 1: DIVERSE BASIC ELEMENTS (30+ Variations)\nPHASE 2: APPLICATION SCENARIOS (16+ Mockups)"
    }]);

    setIsGenerating(true);
    
    try {
      // Phase 1: Basic Elements (Logo Layouts, Colors, Type Guides)
      await generateBasicSystem(base64);
      
      // Phase 2: Applications
      await generateApplicationScenarios(base64);

      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        text: `SYSTEM GENERATION COMPLETE.\n\nTotal of ${BASIC_VI_CATEGORIES.length + VIS_CATEGORIES.length} high-fidelity brand assets generated.\nYou can now select any image to download or refine it further.`
      }]);

    } catch (error) {
      console.error("Sequence error", error);
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        text: "GENERATION SEQUENCE INTERRUPTED. PLEASE CHECK YOUR CONNECTION."
      }]);
    } finally {
      setLoadingStatus('');
      setIsGenerating(false);
    }
  };

  const generateBasicSystem = async (logoBase64: string) => {
    // For Basic System, we generate 1 high-quality standard per category to maximize diversity
    const tasks = BASIC_VI_CATEGORIES.map(category => ({
      categoryName: category.name,
      prompt: `${category.promptSuffix}, high quality graphic design, professional execution`,
      variationLabel: 'Standard',
      aspectRatio: category.aspectRatio || '1:1'
    }));

    // Process in batches of 4
    await processBatch(tasks, logoBase64, 'BASIC SYSTEM');
  };

  const generateApplicationScenarios = async (logoBase64: string) => {
    const tasks = VIS_CATEGORIES.map(category => ({
      categoryName: category.name,
      prompt: `A ${category.promptSuffix}, branding visible, photorealistic mockup`,
      variationLabel: 'Application',
      aspectRatio: category.aspectRatio || '1:1'
    }));

    // Process in batches of 4
    await processBatch(tasks, logoBase64, 'MOCKUP');
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

      setLoadingStatus(`GENERATING ${phaseLabel}: BATCH ${batchNumber}/${totalBatches}`);

      // Concurrent batch processing (4 at a time)
      const promises = batch.map(async (task): Promise<GeneratedImage | null> => {
        try {
          const url = await generateVisImage(task.prompt, logoBase64, task.aspectRatio);
          return {
            id: Date.now() + Math.random().toString(),
            url,
            prompt: `${task.categoryName} (${task.variationLabel})`,
            timestamp: Date.now(),
            type: 'initial'
          };
        } catch (e) {
          console.error(`Failed to generate ${task.categoryName}`, e);
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

  // 1. Handle User Input -> Send to Analysis
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isAnalyzing || isGenerating) return;
    const text = inputValue;
    setInputValue('');
    setPendingAction(null);

    // Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsAnalyzing(true);
    setLoadingStatus('ANALYZING REQUEST...');

    try {
      // Analyze intent
      const analysis = await analyzeDesignRequest(text, !!logo, !!editImage);

      // Add Model Response
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: analysis.reply
      }]);

      // If action suggested, set pending state
      if (analysis.suggestedAction) {
        if (!logo) {
             setChatHistory(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                text: "ACTION BLOCKED: PLEASE UPLOAD A LOGO FIRST."
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
        text: "COMMUNICATION ERROR. PLEASE TRY AGAIN."
      }]);
    } finally {
      setIsAnalyzing(false);
      setLoadingStatus('');
    }
  };

  // 2. Execute the confirmed action
  const handleConfirmAction = async () => {
    if (!pendingAction || !logo) return;
    const action = pendingAction;
    setPendingAction(null); // Clear prompt
    setIsGenerating(true);

    try {
      const referenceImage = (action.type === 'MODIFY' && editImage) ? editImage.url : logo;

      if (action.type === 'MODIFY' && editImage) {
        // --- EDIT MODE ---
        setLoadingStatus(`MODIFYING ASSET: ${action.label.toUpperCase()}...`);
        const promptContext = `Modify this image based on: ${action.searchQuery}. Keep the main composition but apply the change. Professional design style.`;
        
        // Modifications usually keep the aspect ratio of the editImage, or default to 1:1 if unsure, 
        // but API requires explicit ratio for new gen. Let's assume 1:1 for edits unless stated otherwise.
        const generatedUrl = await generateVisImage(promptContext, referenceImage, '1:1');
        
        const newImg: GeneratedImage = {
            id: Date.now().toString(),
            url: generatedUrl,
            prompt: `Edit: ${action.searchQuery}`,
            timestamp: Date.now(),
            type: 'modification'
        };

        setImages(prev => [newImg, ...prev]);
        setChatHistory(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            text: "MODIFICATION COMPLETE.",
            relatedImageId: newImg.id
        }]);

      } else {
        // --- CREATION / RANDOM MODE ---
        setLoadingStatus(action.type === 'RANDOM' ? 'BRAINSTORMING RANDOM CONCEPTS...' : 'DESIGNING VARIATIONS...');
        
        // Decide text to prompt generator
        const inputForGenerator = action.type === 'RANDOM' 
            ? RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)] 
            : action.searchQuery;

        // Generate specific prompts
        const creativePrompts = await generateCreativePrompts(inputForGenerator);
        
        setLoadingStatus(`RENDERING ${creativePrompts.length} ASSETS...`);

        // Generate images (Process in parallel for efficiency)
        const generationPromises = creativePrompts.map(async (prompt, index): Promise<GeneratedImage | null> => {
          try {
            // For random creations, default to 1:1 or randomise? Let's stick to 1:1 for stability or random.
            // Let's create a variety for "Random"
            const ratios = ['1:1', '16:9', '9:16'];
            const randomRatio = ratios[Math.floor(Math.random() * ratios.length)];
            const ratioToUse = action.type === 'RANDOM' ? randomRatio : '1:1';

            const url = await generateVisImage(prompt, referenceImage, ratioToUse);
            return {
              id: Date.now() + Math.random().toString(),
              url,
              prompt: prompt,
              timestamp: Date.now(),
              type: 'initial'
            };
          } catch (e) {
            console.error(`Failed to generate variation ${index + 1}`, e);
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
            text: `GENERATION COMPLETE: ${successfulImages.length} NEW ASSETS.`,
            relatedImageId: successfulImages[0].id
          }]);
        } else {
           throw new Error("Generation produced no valid results.");
        }
      }

    } catch (error) {
       console.error(error);
       setChatHistory(prev => [...prev, {
         id: Date.now().toString(),
         role: 'system',
         text: "GENERATION FAILED."
       }]);
    } finally {
      setIsGenerating(false);
      setLoadingStatus('');
      // Exit edit mode if we were in it
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
      text: `EDIT MODE ENGAGED (ID #${img.id.slice(-4)}).\nTell me what to change (e.g., "Make it gold", "Change background to red").`
    }]);
  };

  const clearEditSelection = () => {
    setEditImage(null);
    setPendingAction(null);
  };

  // Trigger random via button manually
  const triggerRandom = () => {
    if(!logo) return;
    setPendingAction({
        type: 'RANDOM',
        label: 'Surprise Me',
        description: 'Generate a completely random, high-quality brand asset.',
        searchQuery: 'random'
    });
  };

  return (
    <div className="flex h-screen bg-white text-black overflow-hidden font-sans">
      
      {/* Sidebar: Chat & Controls */}
      <div className="w-[400px] bg-white border-r border-black flex flex-col z-20 shrink-0 relative shadow-xl">
        {/* Header */}
        <div className="p-8 border-b border-black flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#E30613]">
               <Layout size={20} />
            </div>
            <h1 className="font-black text-3xl tracking-tighter uppercase leading-none">
              VIS<br/>Genius
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-500">
               AI Design Partner
            </p>
          </div>
          {logo && (
             <button 
              onClick={() => {
                setLogo(null);
                setImages([]);
              }} 
              className="text-xs font-bold uppercase tracking-widest border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
             >
               Reset
             </button>
          )}
        </div>

        {/* Chat Transcript */}
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
                     {msg.role === 'model' ? 'VIS GENIUS' : msg.role === 'user' ? 'USER' : `LOG [${index.toString().padStart(3, '0')}]`}
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
                    View Output <ArrowRight size={12} />
                  </button>
                )}
              </div>
            ))}
            
            {(isAnalyzing || isGenerating) && (
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E30613] animate-pulse">
                  {loadingStatus || 'PROCESSING...'}
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area & Action Card */}
        <div className="bg-white border-t border-black relative">
          
          {/* Action Popup */}
          {pendingAction && (
             <ActionCard 
                action={pendingAction} 
                onConfirm={handleConfirmAction} 
                onCancel={() => setPendingAction(null)}
                isLoading={isGenerating}
             />
          )}

          {/* Edit Context */}
          {editImage && (
            <div className="flex items-center justify-between bg-[#E30613] text-white p-3 border-b border-black">
              <div className="flex items-center gap-3 overflow-hidden">
                <img src={editImage.url} className="w-8 h-8 bg-white border border-black object-cover" />
                <span className="text-xs font-bold uppercase tracking-wider truncate">Modifying: {editImage.prompt.substring(0, 20)}...</span>
              </div>
              <button onClick={clearEditSelection} className="hover:bg-black p-1 transition-colors">
                <ArrowLeft size={16} />
              </button>
            </div>
          )}

          <div className="relative">
             {/* Toolbar */}
             <div className="absolute top-6 right-6 flex gap-2">
                {!editImage && !pendingAction && (
                  <button 
                    onClick={triggerRandom}
                    disabled={!logo || isAnalyzing || isGenerating}
                    className="p-2 bg-white text-black border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-0"
                    title="Surprise Me (Random Generation)"
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
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={logo ? (editImage ? "How should I change this?" : "Chat with me about your brand...") : "WAITING FOR SOURCE..."}
              disabled={!logo || isAnalyzing || isGenerating}
              className="w-full bg-white text-black placeholder-gray-400 p-6 pr-24 focus:outline-none resize-none h-24 text-sm font-medium uppercase rounded-none"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full bg-white">
        {!logo ? (
          <div className="grid grid-cols-1 md:grid-cols-12 h-full">
             {/* Left: Typography */}
             <div className="col-span-1 md:col-span-8 p-12 md:p-24 flex flex-col justify-between border-b md:border-b-0 md:border-r border-black">
                <div className="space-y-2">
                   <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
                     Brand<br/>Identity<br/>System
                   </h2>
                   <div className="w-24 h-2 bg-[#E30613] mt-8"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-12 max-w-lg">
                   <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Batch Processing</h3>
                      <p className="text-sm font-medium">Parallel execution of 4 concurrent AI design threads for maximum efficiency.</p>
                   </div>
                   <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest mb-4">VIS Coverage</h3>
                      <p className="text-sm font-medium">Extensive Logo Standards, Color Systems, Typography Guides, and Mockups.</p>
                   </div>
                </div>
             </div>

             {/* Right: Action */}
             <div className="col-span-1 md:col-span-4 bg-[#f5f5f5]">
                <UploadArea onFileSelect={handleLogoUpload} />
             </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Top Bar */}
            <div className="h-16 border-b border-black flex items-center justify-between px-6 bg-white z-10 shrink-0">
               <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Project Source</span>
                     <span className="text-sm font-bold uppercase">Main Logo.png</span>
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <img src={logo} alt="Source" className="h-8 w-auto border border-gray-200" />
               </div>
               <div className="flex items-center gap-4">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-[#E30613]">Batch Mode (4x)</div>
                 <UploadArea onFileSelect={handleLogoUpload} compact />
               </div>
            </div>
            
            {/* Grid Content */}
            <div className="flex-1 relative bg-gray-100">
               {/* Background Grid Pattern */}
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

      {/* Modal Viewer */}
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