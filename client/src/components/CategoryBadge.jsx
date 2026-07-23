// components/CategoryBadge.jsx
import * as Icons from 'lucide-react';
import { categoryById } from '../utils/categories';

export default function CategoryBadge({ id, size = 'sm' }) {
  const cat = categoryById(id);
  const Icon = Icons[cat.icon] || Icons.Tag;
  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${pad}`}
      style={{ backgroundColor: `${cat.color}1a`, color: cat.color }}
    >
      <Icon size={size === 'sm' ? 12 : 14} />
      {cat.label}
    </span>
  );
}
