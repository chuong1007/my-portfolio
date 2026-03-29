import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from "@/lib/utils";

export const MentionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item, label: item });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  if (!props.items || props.items.length === 0) return null;

  return (
    <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden p-3 min-w-[280px] max-w-[400px]">
      <div className="px-1.5 pb-2 mb-2 border-b border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Gợi ý Tag</span>
        <span className="text-[10px] text-zinc-600">↑↓ để chọn • Enter để chèn</span>
      </div>
      <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
        {props.items.map((item: string, index: number) => (
          <button
            key={index}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border",
              index === selectedIndex 
                ? "bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] scale-[1.05]" 
                : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
            )}
            onClick={() => selectItem(index)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
});

MentionList.displayName = 'MentionList';
