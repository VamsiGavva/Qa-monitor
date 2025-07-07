"use client";

import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTag } from '@/context/TagContext';

interface MultiSelectTagsProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  error?: string;
}

export default function MultiSelectTags({
  selectedTags,
  onTagsChange,
  placeholder = 'Select tags...',
  error
}: MultiSelectTagsProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { tags, loading, getTags, createTag } = useTag();

  useEffect(() => {
    getTags();
  }, []);

  const filteredTags = tags.filter(tag =>
    tag.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
    setSearchValue('');
  };

  const handleTagRemove = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleCustomTagAdd = async () => {
    const trimmedValue = searchValue.trim();
    if (
      trimmedValue &&
      !tags.includes(trimmedValue)
    ) {
      try {
        await createTag(trimmedValue);
        onTagsChange([...selectedTags, trimmedValue]);
        setSearchValue('');
      } catch (error) {
        console.error('Error adding tag:', error);
      }
    } else if (trimmedValue && tags.includes(trimmedValue)) {
      handleTagSelect(trimmedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomTagAdd();
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between min-h-[40px] h-auto ${error ? 'border-red-500' : ''
              }`}
          >
            <div className="flex flex-wrap gap-1 flex-1 max-w-full overflow-hidden">
              {selectedTags.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs max-w-[120px] truncate"
                  >
                    <span className="truncate">{tag}</span>
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTagRemove(tag);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleTagRemove(tag)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] max-w-full p-0"
          align="start"
        >

          <div className="p-3 border-b">
            <Input
              placeholder="Search or add custom tag..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9"
            />
            {searchValue && !tags.some(tag => tag.toLowerCase() === searchValue.toLowerCase()) && (
              <Button
                variant="ghost"
                className="w-full justify-start mt-2 h-9"
                onClick={handleCustomTagAdd}
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="text-sm">Add "{searchValue}"</span>
              </Button>
            )}
          </div>
          <ScrollArea className="max-h-60 overflow-y-auto">
            {filteredTags.length === 0 && !searchValue ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No more tags available
              </div>
            ) : (
              <div className="p-1">
                {filteredTags.map((tag) => (
                  <Button
                    key={tag}
                    variant="ghost"
                    className="w-full justify-start h-9"
                    onClick={() => handleTagSelect(tag)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${selectedTags.includes(tag) ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                    <span className="truncate">{tag}</span>
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>

        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}