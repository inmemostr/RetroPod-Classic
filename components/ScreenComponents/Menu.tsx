import React from 'react';
import { ChevronRight } from 'lucide-react';
import { MenuItem } from '../../types';

interface MenuProps {
  items: MenuItem[];
  selectedIndex: number;
}

export const Menu: React.FC<MenuProps> = ({ items, selectedIndex }) => {
  return (
    <div className="flex-1 overflow-hidden bg-white">
      {items.map((item, index) => {
        const isSelected = index === selectedIndex;
        return (
          <div
            key={item.id}
            className={`flex items-center justify-between px-2 py-1 text-sm border-b border-gray-100 cursor-pointer
              ${isSelected 
                ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold' 
                : 'text-black hover:bg-gray-50'
              }
            `}
          >
            <span className="truncate">{item.label}</span>
            {item.hasChevron && (
              <ChevronRight size={14} className={isSelected ? 'text-white' : 'text-gray-400'} />
            )}
          </div>
        );
      })}
      {/* Empty state filler */}
      {items.length < 6 && Array.from({ length: 6 - items.length }).map((_, i) => (
         <div key={`empty-${i}`} className="h-[29px] border-b border-gray-50"></div>
      ))}
    </div>
  );
};