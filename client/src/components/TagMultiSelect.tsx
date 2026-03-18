import { useState, useEffect } from 'react';
import { tagsApi, Tag } from '../services/tags.service';
import TagChip from './TagChip';

interface TagMultiSelectProps {
  value: number[];
  onChange: (ids: number[]) => void;
}

export default function TagMultiSelect({ value, onChange }: TagMultiSelectProps) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    tagsApi.getAll().then(setTags);
  }, []);

  const availableTags = tags.filter(t => !value.includes(t.id));
  const selectedTags = tags.filter(t => value.includes(t.id));

  const handleAdd = (id: number) => {
    if (value.length >= 5) return;
    onChange([...value, id]);
  };

  const handleRemove = (id: number) => {
    onChange(value.filter(v => v !== id));
  };

  return (
    <div>
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map(tag => (
            <TagChip key={tag.id} name={tag.name} onRemove={() => handleRemove(tag.id)} />
          ))}
        </div>
      )}
      {availableTags.length > 0 && value.length < 5 && (
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleAdd(tag.id)}
              className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 transition"
            >
              + {tag.name}
            </button>
          ))}
        </div>
      )}
      {value.length >= 5 && (
        <p className="text-xs text-amber-600 mt-1">Maximum 5 tags reached</p>
      )}
    </div>
  );
}
