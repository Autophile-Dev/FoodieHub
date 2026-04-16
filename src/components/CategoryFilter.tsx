import React from 'react';
import * as Icons from 'lucide-react';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedId, onSelect }) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {categories.map((category) => {
        const Icon = (Icons as any)[category.icon];
        const isActive = selectedId === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border whitespace-nowrap transition-all duration-300 ${
              isActive 
                ? 'bg-emerald-500 border-emerald-500 text-white scale-105' 
                : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/30'
            }`}
          >
            <div className={`${isActive ? 'text-white' : 'text-emerald-500'}`}>
              {Icon && <Icon size={18} />}
            </div>
            <span className="text-sm font-bold">
              {category.name}
            </span>
            {category.id !== 'all' && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {category.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
