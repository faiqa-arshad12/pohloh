'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Plus, X } from 'lucide-react'; // Using Lucide icons for consistency

interface TagProps {
  initialTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ 
  initialTags = ['Software Engineering', 'Design'], 
  onTagsChange,
  className = ''
}) => {
  const [tags, setTags] = useState<string[]>(initialTags);

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    onTagsChange?.(newTags);
  };

  const addTag = () => {
    const newTag = prompt('Enter a new tag:');
    if (newTag && !tags.includes(newTag)) {
      const updated = [...tags, newTag];
      setTags(updated);
      onTagsChange?.(updated);
    }
  };

  return (
    <div className={`w-full max-w-[368px] relative ${className}`}>
      <div className="flex flex-wrap items-start border border-white/20 rounded-[6px] px-3 py-2 bg-[#FFFFFF0F] gap-2">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="bg-[#F9DB6F]  w-[114px] h-[24px] text-black px-2 sm:px-3 rounded-sm flex items-center text-xs sm:text-sm max-w-full justify-between"
          >
            <span className="truncate max-w-[120px] sm:max-w-[160px]">{tag}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="w-4 h-4 ml-1 p-0 text-black text-right hover:bg-black/10 hover:text-black focus-visible:ring-0 focus-visible:ring-offset-0"
              onClick={() => removeTag(index)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          onClick={addTag}
          variant="ghost"
          className="h-[24px] w-[92px] text-white/80 hover:text-white px-2 sm:px-3 py-1 rounded-sm flex items-center text-xs sm:text-sm gap-1 bg-[#00000033] hover:bg-white/10"
        >
          <span className="font-urbanist font-normal text-[10.44px] leading-6 align-middle">Add Tag</span>
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Tag;