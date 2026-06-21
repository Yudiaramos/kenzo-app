'use client';

import { Stage } from '@/types';
import { WEDDING_CONFIG } from '@/config/wedding';

interface StageSelectorProps {
  selected: Stage | null;
  onSelect: (stage: Stage) => void;
}

export default function StageSelector({ selected, onSelect }: StageSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {WEDDING_CONFIG.stages.map((stage) => (
        <button
          key={stage.id}
          type="button"
          onClick={() => onSelect(stage.id)}
          className={`
            px-4 py-2.5 rounded-full text-sm font-medium
            transition-all duration-300 ease-out
            border
            ${
              selected === stage.id
                ? 'bg-[#c9a84c] text-white border-[#c9a84c] shadow-md shadow-[#c9a84c]/25 scale-105'
                : 'bg-white text-[#555] border-[#e0d5c1] hover:border-[#c9a84c] hover:text-[#c9a84c] hover:shadow-sm'
            }
          `}
        >
          {stage.label}
        </button>
      ))}
    </div>
  );
}
