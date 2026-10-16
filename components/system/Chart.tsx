import React from 'react';

export interface ChartProps {
  title: string;
  type?: 'bar' | 'line'; // We'll mock both visually
  data?: number[]; // Example data points
}

const DEFAULT_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function Chart({ title, type = 'bar', data = [40, 70, 45, 90, 60] }: ChartProps) {
  // Guard against bad AI output (non-array / non-numeric / out-of-range values)
  const safeData = (Array.isArray(data) ? data : [])
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v))
    .map((v) => Math.min(100, Math.max(0, v)));
  const points = safeData.length > 0 ? safeData : [40, 70, 45, 90, 60];

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h4 className="text-sm font-medium text-gray-500 mb-4">{title}</h4>
      <div className="flex items-end justify-between h-32 gap-2">
        {points.map((value, i) => (
          <div key={i} className="w-full h-full flex flex-col justify-end items-center gap-1 group">
            <div 
              className={`w-full rounded-t ${type === 'bar' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-indigo-400 rounded-full'}`}
              style={{ height: `${value}%`, width: type === 'line' ? '4px' : '100%' }}
            ></div>
            <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100">{value}%</span>
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-gray-100 pt-2 flex justify-between text-xs text-gray-400">
        {points.map((_, i) => (
          <span key={i}>{DEFAULT_LABELS[i % DEFAULT_LABELS.length]}</span>
        ))}
      </div>
    </div>
  );
}