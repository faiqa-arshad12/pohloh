"use client";

import type React from "react";
import {useState, useEffect, useCallback, useRef} from "react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Plus, X, TagIcon, Loader2} from "lucide-react";
import {apiUrl} from "@/utils/constant";
import {useDebounce} from "@/hooks/use-debounce";
import {ShowToast} from "@/components/shared/show-toast";
import {cn} from "@/lib/utils";

interface TagInputProps {
  initialTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  className?: string;
  orgId?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  initialTags = [],
  onTagsChange,
  className = "",
  orgId,
}) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  const searchTags = useCallback(
    async (query: string) => {
      if (!query.trim() || !orgId) return;

      setIsSearching(true);
      try {
        const response = await fetch(
          `${apiUrl}/cards/tags/search?org_id=${orgId}&query=${encodeURIComponent(
            query
          )}`
        );
        if (!response.ok) throw new Error("Failed to search tags");

        const data = await response.json();
        if (data.success) {
          // Filter out tags that are already added
          const filteredResults = data.tags.filter(
            (tag: string) => !tags.includes(tag)
          );
          setSearchResults(filteredResults);
        }
      } catch (error) {
        console.error("Error searching tags:", error);
        ShowToast("Failed to search tags", "error");
      } finally {
        setIsSearching(false);
      }
    },
    [orgId, tags]
  );

  useEffect(() => {
    if (debouncedSearch) {
      searchTags(debouncedSearch);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch, searchTags]);

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    onTagsChange?.(newTags);
  };

  const addTag = (tagName: string) => {
    if (!tagName.trim()) return;

    // Check if tag already exists
    if (tags.includes(tagName)) {
      ShowToast("Tag already exists", "warning");
      return;
    }

    // Add tag directly to the local state
    const updated = [...tags, tagName];
    setTags(updated);
    onTagsChange?.(updated);
    setSearchQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      addTag(searchQuery);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-wrap items-center gap-2 p-4 bg-[#FFFFFF0F] rounded-[6px]">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="px-3 items-center h-[24px] rounded-[4px] text-sm font-medium gap-1.5 bg-[#F9DB6F] hover:bg-[#F9DB6F]/80 text-[#232D39] cursor-pointer"
          >
            {/* <TagIcon className="w-3.5 h-3.5" /> */}
            <span className="max-w-[150px] truncate">{tag}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="w-4 h-4 p-0 ml-1 rounded-full hover:bg-[#232D39]/10"
              onClick={() => removeTag(index)}
            >
              <X className="w-3 h-3 text-[#232D39]" />
              <span className="sr-only">Remove {tag}</span>
            </Button>
          </Badge>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-[24px] px-3 text-white hover:text-white flex items-center gap-2 text-sm bg-[#1A1B1C] hover:bg-white/10 rounded-[4px] transition-colors border-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 cursor-pointer" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[300px] p-0 bg-[#1A1B1C] border border-white/20"
            align="start"
          >
            <Command className="bg-[#1A1B1C] text-white">
              <CommandInput
                placeholder="Search or create tag..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                onKeyDown={handleKeyDown}
                className="h-9 border-b border-white/10 focus:border-[#B8860B]/50"
              />
              <CommandList>
                {isSearching ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-[#B8860B]" />
                  </div>
                ) : (
                  <>
                    {searchResults.length > 0 && (
                      <CommandGroup
                        heading="Existing tags"
                        // className="text-white/80"
                      >
                        {searchResults.map((tag) => (
                          <CommandItem
                            key={tag}
                            value={tag}
                            onSelect={() => addTag(tag)}
                            className="flex items-center gap-2 text-white hover:bg-[#F9DB6F33] data-[selected=true]:bg-[#F9DB6F33] data-[selected=true]:text-[#F9DB6F]"
                          >
                            <TagIcon className="w-4 h-4 text-[#B8860B]" />
                            <span>{tag}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {searchQuery.trim() && (
                      <CommandGroup
                        heading="Create new tag"
                        className="text-white/80"
                      >
                        <CommandItem
                          onSelect={() => addTag(searchQuery)}
                            className="mt-2 border-0 text-[#F9DB6F]  bg-[#F9DB6F33] hover:bg-[#F9DB6F33]  cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-[#B8860B]" />
                          <span>Create "{searchQuery}"</span>
                        </CommandItem>
                      </CommandGroup>
                    )}

                    <CommandEmpty>
                      {searchQuery.trim() ? (
                        <div className="flex flex-col items-center py-4 text-center">
                          <p className="text-sm text-white/60">
                            No matching tags found
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 border-0 text-[#F9DB6F]  bg-[#F9DB6F33] hover:bg-[#F9DB6F33] opacity-100 hover-opacity-80 cursor-pointer"
                            onClick={() => addTag(searchQuery)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Create "{searchQuery}"
                          </Button>
                        </div>
                      ) : (
                        <p className="py-4 text-sm text-center text-white/60">
                          Type to search or create tags
                        </p>
                      )}
                    </CommandEmpty>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default TagInput;
