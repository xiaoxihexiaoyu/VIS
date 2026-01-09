import React from 'react';
import { ArrowRight, X, Sparkles, Edit2, Play } from 'lucide-react';
import { DesignAction } from '../types';

interface ActionCardProps {
  action: DesignAction;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, onConfirm, onCancel, isLoading }) => {
  const getIcon = () => {
    switch (action.type) {
      case 'MODIFY': return <Edit2 size={16} />;
      case 'RANDOM': return <Sparkles size={16} />;
      default: return <Play size={16} />;
    }
  };

  return (
    <div className="absolute bottom-full left-0 right-0 mb-4 mx-4 z-30 animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="bg-white border border-black shadow-[4px_4px_0px_0px_rgba(227,6,19,1)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-black text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#E30613]">{getIcon()}</span>
            <span className="text-xs font-bold uppercase tracking-widest">Suggested Action</span>
          </div>
          <button onClick={onCancel} className="hover:text-[#E30613] transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="text-lg font-bold uppercase leading-tight mb-1">{action.label}</h4>
          <p className="text-sm text-gray-600 mb-4">{action.description}</p>
          
          <div className="flex gap-2">
             <button 
               onClick={onCancel}
               disabled={isLoading}
               className="flex-1 py-2 text-xs font-bold uppercase tracking-widest border border-gray-200 hover:bg-gray-50 text-gray-500"
             >
               Dismiss
             </button>
             <button 
               onClick={onConfirm}
               disabled={isLoading}
               className="flex-[2] bg-[#E30613] hover:bg-black text-white py-2 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
             >
               {isLoading ? 'Processing...' : 'Execute'} <ArrowRight size={14} />
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};