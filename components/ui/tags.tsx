'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';

type TagItem = string | { name: string; image?: string };

interface TagProps {
  initialTags?: TagItem[];
  onTagsChange?: (tags: TagItem[]) => void;
  addTagLabel?: string;
  allowDuplicates?: boolean;
  placeholder?: string;
  className?: string;
  classNameTag?: string;
  classNameTagRemove?: string;
  validateTag?: (tag: TagItem) => boolean;
  confirmBeforeAdd?: boolean;
  classNameAddTag?: string;
  showAddTagButton?: boolean;
}

const Tag: React.FC<TagProps> = ({
  initialTags = [],
  onTagsChange,
  addTagLabel = 'Add Tag',
  allowDuplicates = false,
  placeholder = 'Enter a new tag:',
  className = '',
  classNameTag = '',
  classNameTagRemove = '',
  validateTag,
  confirmBeforeAdd = true,
  classNameAddTag = 'h-[24px] text-black px-3 py-1 rounded-sm flex items-center text-sm max-w-[calc(100%-32px)] gap-2 bg-[#00000033]',
  showAddTagButton = true,
}) => {
  const [tags, setTags] = useState<TagItem[]>(initialTags);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    onTagsChange?.(newTags);
  };

  const addTag = () => {
    const name = prompt(placeholder);
    if (!name) return;

    const image = prompt('Optional: Enter image URL (or leave blank):');
    const newTag: TagItem = image ? { name, image } : name;

    const isDuplicate = tags.some((t) =>
      typeof t === 'string' ? t === name : t.name === name
    );

    if (!allowDuplicates && isDuplicate) {
      alert('Duplicate tag.');
      return;
    }

    const isValid = validateTag ? validateTag(newTag) : true;
    if (!isValid) {
      alert('Invalid tag.');
      return;
    }

    if (confirmBeforeAdd) {
      const confirmed = confirm(`Add "${name}" as a tag?`);
      if (!confirmed) return;
    }

    const updated = [...tags, newTag];
    setTags(updated);
    onTagsChange?.(updated);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-wrap items-center rounded-[6px] px-4 py-2 gap-2 min-h-[90px]">
        {tags.map((tag, index) => {
          const isObject = typeof tag === 'object' && tag !== null;
          const tagName = isObject ? tag.name : tag;
          const tagImage = isObject && tag.image;

          return (
            <div key={index} className={`${classNameTag} flex items-center gap-2`}>
              {tagImage && (
                <Image
                  src={tagImage}
                  alt={tagName}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <span className="truncate">{tagName}</span>
              <Button
                type="button"
                className={classNameTagRemove}
                onClick={() => removeTag(index)}
              >
                ×
              </Button>
            </div>
          );
        })}

        {showAddTagButton && (
          <div className="w-full flex">
            <Button
              type="button"
              onClick={addTag}
              className={classNameAddTag}
            >
              {addTagLabel} <span className="text-lg font-bold">+</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tag;
