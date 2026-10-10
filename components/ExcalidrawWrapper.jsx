'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import '@excalidraw/excalidraw/index.css';

// Dynamically import Excalidraw with SSR disabled
const ExcalidrawComponent = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fbfbfb', color: '#6b6560' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="icon" style={{ animation: 'spin 1s linear infinite', color: '#f48120' }}>progress_activity</span>
          <span>Loading Whiteboard...</span>
        </div>
      </div>
    )
  }
);

export default function ExcalidrawWrapper({ theme = 'light' }) {
  const [mounted, setMounted] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <ExcalidrawComponent
        theme={isLight ? 'light' : 'dark'}
        initialData={{
          appState: {
            viewBackgroundColor: isLight ? '#ffffff' : '#121212',
            currentItemStrokeColor: isLight ? '#1a1814' : '#a8c7fa',
            theme: isLight ? 'light' : 'dark'
          }
        }}
      />
    </div>
  );
}
