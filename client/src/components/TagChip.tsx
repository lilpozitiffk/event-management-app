import { X } from 'lucide-react';

const tagColors: Record<string, string> = {
  tech: 'bg-blue-100 text-blue-700',
  art: 'bg-purple-100 text-purple-700',
  business: 'bg-green-100 text-green-700',
  music: 'bg-pink-100 text-pink-700',
  sports: 'bg-orange-100 text-orange-700',
  education: 'bg-yellow-100 text-yellow-700',
};

const defaultColor = 'bg-gray-100 text-gray-700';

interface TagChipProps {
  name: string;
  onRemove?: () => void;
}

export default function TagChip({ name, onRemove }: TagChipProps) {
  const color = tagColors[name.toLowerCase()] || defaultColor;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {name}
      {onRemove && (
        <button type="button" onClick={onRemove} className="hover:opacity-70">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
