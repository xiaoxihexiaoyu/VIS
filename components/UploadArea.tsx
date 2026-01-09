import React, { useCallback } from 'react';
import { Upload, Plus } from 'lucide-react';

interface UploadAreaProps {
  onFileSelect: (base64: string) => void;
  compact?: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect, compact = false }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onFileSelect(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onFileSelect]);

  if (compact) {
    return (
      <div className="relative group">
        <label className="flex items-center gap-2 cursor-pointer bg-white hover:bg-black hover:text-white px-4 py-2 border border-black transition-colors text-xs font-bold uppercase tracking-wider">
          <Upload size={12} />
          <span>更换Logo</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <label className="flex flex-col items-center justify-center w-full h-full min-h-[300px] border border-black border-dashed cursor-pointer bg-gray-50 hover:bg-[#E30613] hover:border-[#E30613] hover:text-white transition-all duration-300 group relative overflow-hidden">

        {/* 网格装饰 */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-black group-hover:border-white transition-colors"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-black group-hover:border-white transition-colors"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-black group-hover:border-white transition-colors"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-black group-hover:border-white transition-colors"></div>

        <div className="flex flex-col items-center justify-center p-12 text-center z-10">
          <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
            <Plus size={48} strokeWidth={1} />
          </div>
          <p className="mb-4 text-3xl font-bold tracking-tighter uppercase">
            上传Logo
          </p>
          <div className="flex flex-col gap-1 text-xs font-mono uppercase tracking-widest opacity-60 group-hover:opacity-100">
            <span>格式：PNG、JPG、SVG</span>
            <span>最大大小：5MB</span>
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};
