import React from 'react';

export interface TableProps {
  columns?: string[];
  rows?: (string | number)[][];
}

export function Table({ columns = [], rows = [] }: TableProps) {
  // Guard against malformed AI output
  const cols = Array.isArray(columns) ? columns.map(String) : [];
  const data = Array.isArray(rows) ? rows.filter(Array.isArray) : [];

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm text-left text-gray-700">
        {cols.length > 0 && (
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              {cols.map((c, i) => (
                <th key={i} className="px-4 py-3 font-semibold">{c}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-100">
          {data.map((row, r) => (
            <tr key={r} className="hover:bg-gray-50">
              {row.map((cell, c) => (
                <td key={c} className="px-4 py-3">{String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
