import React from 'react';
import { GeneratedImage } from '../types';
import { Plus } from 'lucide-react';

interface ImageGridProps {
  images: GeneratedImage[];
  onImageClick: (image: GeneratedImage) => void;
  selectedImageId?: string | null;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick, selectedImageId }) => {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-start justify-center h-full text-black p-12 border-l border-black">
        <h3 className="text-4xl font-bold uppercase tracking-tighter mb-4">No Output</h3>
        <p className="text-sm font-mono text-gray-500 uppercase tracking-widest">Waiting for input stream...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-[1px] bg-black p-[1px] pb-32 overflow-y-auto h-full w-full">
      {images.map((img) => (
        <div 
          key={img.id} 
          className={`relative group aspect-square bg-white cursor-pointer overflow-hidden`}
          onClick={() => onImageClick(img)}
        >
          {/* Image */}
          <img 
            src={img.url} 
            alt="Generated VIS" 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ease-linear"
          />
          
          {/* Selection Indicator (Thick Red Border) */}
          {selectedImageId === img.id && (
             <div className="absolute inset-0 border-[6px] border-[#E30613] z-20 pointer-events-none"></div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-[#E30613]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-6">
             <div className="self-end text-white">
                <Plus size={24} />
             </div>
             <div>
                <p className="text-white text-xs font-bold uppercase tracking-widest mb-2">Generated {new Date(img.timestamp).toLocaleTimeString()}</p>
                <p className="text-white text-lg font-bold leading-tight line-clamp-3">{img.prompt}</p>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};