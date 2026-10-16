'use client';

import React, { useState } from 'react';
import { LiveProvider, LiveError, LivePreview as ReactLivePreview } from 'react-live';
import { Button, Card, Input, Container, Navbar, Sidebar, Modal, Chart, Table } from '../system';

interface LivePreviewProps {
  code: string;
}

export function LivePreview({ code }: LivePreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [dark, setDark] = useState(false);
  const widths = { desktop: '100%', tablet: '768px', mobile: '375px' } as const;
  const scope = { Button, Card, Input, Container, Navbar, Sidebar, Modal, Chart, Table };

  // FIX: If the code is empty or just the placeholder comment, 
  // show a clean "Welcome" state instead of crashing.
  const isPlaceholder = !code || code.trim() === '// Generated code will appear here' || code.trim().startsWith('//');

  if (isPlaceholder) {
    return (
      <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex flex-col items-center justify-center text-gray-400">
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold">Ready to Build</p>
          <p className="text-sm">Describe your UI in the chat to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden bg-white flex flex-col">
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 text-sm font-mono text-gray-600 flex justify-between">
        <span>Live Render</span>
        <div className="flex gap-1 items-center">
          <button
            onClick={() => setDark(d => !d)}
            className={`px-2 py-0.5 rounded text-xs transition-colors mr-2 ${dark ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            {dark ? 'Dark' : 'Light'}
          </button>
          {(['desktop', 'tablet', 'mobile'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`px-2 py-0.5 rounded text-xs capitalize transition-colors ${device === d ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto bg-gray-50">
        <LiveProvider code={code} scope={scope} noInline={false}>
          <div className="mx-auto transition-all duration-200 bg-white" style={{ maxWidth: widths[device], filter: dark ? 'invert(1) hue-rotate(180deg)' : undefined }}>
            <ReactLivePreview />
          </div>
          {/* Only show errors if it's NOT a syntax error caused by typing */}
          <LiveError className="text-red-500 font-mono text-sm mt-4 p-2 bg-red-50 rounded" />
        </LiveProvider>
      </div>
    </div>
  );
}