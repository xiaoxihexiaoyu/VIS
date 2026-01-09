import React, { useState } from 'react';
import { X, Download, Edit2, Check, ChevronDown } from 'lucide-react';
import { GeneratedImage } from '../types';
import { Button } from './Button';

interface ImageViewerProps {
  image: GeneratedImage;
  isOpen: boolean;
  onClose: () => void;
  onSelectForEdit: (image: GeneratedImage) => void;
  isSelectedForEdit: boolean;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ 
  image, 
  isOpen, 
  onClose,
  onSelectForEdit,
  isSelectedForEdit
}) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  if (!isOpen) return null;

  const handleDownload = (format: 'png' | 'jpg') => {
    if (format === 'png') {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `vis-generated-${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else if (format === 'jpg') {
        // Convert to JPG using Canvas
        const img = new Image();
        img.src = image.url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if(ctx) {
                // JPG needs a background color as it doesn't support transparency
                ctx.fillStyle = "#FFFFFF"; 
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/jpeg', 0.9);
                link.download = `vis-generated-${image.id}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };
    }
    setShowDownloadMenu(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-0 md:p-12 animate-in fade-in duration-200">
      {/* Container with grid border */}
      <div className="relative w-full h-full border border-black bg-white flex flex-col md:flex-row shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Left: Image Area */}
        <div className="flex-1 relative bg-[#f0f0f0] flex items-center justify-center p-8 overflow-hidden border-b md:border-b-0 md:border-r border-black">
          {/* Grid background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <img 
            src={image.url} 
            alt={image.prompt} 
            className="max-w-full max-h-full object-contain shadow-xl z-10"
          />
        </div>

        {/* Right: Info & Controls */}
        <div className="w-full md:w-96 bg-white flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-black flex justify-between items-start">
             <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Status</h3>
                <p className="text-xl font-bold uppercase">Viewing</p>
             </div>
             <button onClick={onClose} className="hover:bg-[#E30613] hover:text-white p-2 transition-colors border border-transparent hover:border-black">
                <X size={24} />
             </button>
          </div>

          {/* Details */}
          <div className="flex-1 p-6 overflow-y-auto">
             <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Prompt</h3>
                <p className="text-lg leading-snug font-medium">{image.prompt}</p>
             </div>
             <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Details</h3>
                <ul className="text-sm font-mono space-y-1">
                   <li>ID: {image.id.slice(-8)}</li>
                   <li>Time: {new Date(image.timestamp).toLocaleTimeString()}</li>
                   <li>Type: {image.type.toUpperCase()}</li>
                </ul>
             </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-black space-y-3 bg-gray-50 relative">
            <div className="relative">
                <Button 
                    variant="secondary" 
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)} 
                    className="w-full justify-between group"
                >
                    <span>Download Options</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${showDownloadMenu ? 'rotate-180' : ''}`} />
                </Button>
                
                {showDownloadMenu && (
                    <div className="absolute bottom-full left-0 right-0 bg-white border border-black mb-1 shadow-xl flex flex-col z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <button 
                            onClick={() => handleDownload('png')}
                            className="text-left px-6 py-3 hover:bg-black hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex justify-between items-center"
                        >
                            <span>PNG (Lossless)</span>
                            <Download size={12} />
                        </button>
                        <div className="h-px bg-gray-100"></div>
                        <button 
                            onClick={() => handleDownload('jpg')}
                            className="text-left px-6 py-3 hover:bg-black hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex justify-between items-center"
                        >
                            <span>JPG (Compressed)</span>
                            <Download size={12} />
                        </button>
                    </div>
                )}
            </div>

            <Button 
              variant={isSelectedForEdit ? 'primary' : 'secondary'} 
              onClick={() => onSelectForEdit(image)}
              className="w-full justify-between"
            >
              <span>{isSelectedForEdit ? 'Active in Chat' : 'Refine / Edit'}</span>
              {isSelectedForEdit ? <Check size={16} /> : <Edit2 size={16} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};