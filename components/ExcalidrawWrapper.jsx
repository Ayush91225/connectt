'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import '@excalidraw/excalidraw/index.css';

const ExcalidrawComponent = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fbfbfb', color: '#6b6560' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="icon" style={{ color: '#f48120' }}>progress_activity</span>
          <span>Loading Whiteboard...</span>
        </div>
      </div>
    )
  }
);

export default function ExcalidrawWrapper({ theme = 'light' }) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const excalidrawAPIRef = useRef(null);
  // Persist drawing state across resizes — never cleared
  const savedElementsRef = useRef(null);
  const savedAppStateRef = useRef(null);
  const isLight = theme === 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  // ResizeObserver: call refresh() on the live API instead of remounting
  useEffect(() => {
    if (!containerRef.current) return;
    let rafId = null;
    const ro = new ResizeObserver(() => {
      // Debounce via rAF to avoid thrashing during sidebar animation
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        excalidrawAPIRef.current?.refresh?.();
      });
    });
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mounted]);

  const handleAPIReady = useCallback((api) => {
    excalidrawAPIRef.current = api;
  }, []);

  // Save elements & appState before any potential unmount
  const handleChange = useCallback((elements, appState) => {
    savedElementsRef.current = elements;
    savedAppStateRef.current = appState;
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}
    >
      <ExcalidrawComponent
        // No key prop — never remount on resize
        excalidrawAPI={handleAPIReady}
        onChange={handleChange}
        theme={isLight ? 'light' : 'dark'}
        initialData={{
          elements: savedElementsRef.current ?? [],
          appState: {
            ...(savedAppStateRef.current ?? {}),
            viewBackgroundColor: isLight ? '#ffffff' : '#121212',
            currentItemStrokeColor: isLight ? '#1a1814' : '#a8c7fa',
            theme: isLight ? 'light' : 'dark'
          }
        }}
      />
    </div>
  );
}
