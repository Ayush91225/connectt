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
          <span className="icon" style={{ color: '#2563eb', animation: 'spin 1.5s linear infinite' }}>progress_activity</span>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Connecting Whiteboard Stream...</span>
        </div>
      </div>
    )
  }
);

export default function ExcalidrawWrapper({
  theme = 'light',
  onSync = null,
  syncData = null,
  isPresenter = false
}) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const excalidrawAPIRef = useRef(null);
  const savedElementsRef = useRef(null);
  const savedAppStateRef = useRef(null);
  const isRemoteUpdatingRef = useRef(false);
  const debounceTimerRef = useRef(null);
  const isLight = theme === 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  // ResizeObserver: refresh canvas on container dimensions change without remounting
  useEffect(() => {
    if (!containerRef.current) return;
    let rafId = null;
    const ro = new ResizeObserver(() => {
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

  // Handle incoming remote drawings from other participants
  useEffect(() => {
    if (!syncData?.elements || !excalidrawAPIRef.current) return;

    try {
      isRemoteUpdatingRef.current = true;
      savedElementsRef.current = syncData.elements;

      excalidrawAPIRef.current.updateScene({
        elements: syncData.elements,
        appState: syncData.appState ? { viewBackgroundColor: syncData.appState.viewBackgroundColor } : undefined,
        commitToHistory: false
      });
    } catch (e) {
      console.warn('[Whiteboard Sync Error]:', e);
    } finally {
      setTimeout(() => {
        isRemoteUpdatingRef.current = false;
      }, 50);
    }
  }, [syncData]);

  const handleAPIReady = useCallback((api) => {
    excalidrawAPIRef.current = api;
    // If we have initial syncData on load, apply it
    if (syncData?.elements && syncData.elements.length > 0) {
      api.updateScene({ elements: syncData.elements });
    }
  }, [syncData]);

  // Handle local drawing changes & broadcast to room
  const handleChange = useCallback((elements, appState) => {
    savedElementsRef.current = elements;
    savedAppStateRef.current = appState;

    // Avoid echoing remote changes back into the network
    if (isRemoteUpdatingRef.current) return;

    if (onSync) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        // Strip heavy non-serializable objects before broadcasting
        const cleanElements = elements.map(el => ({
          id: el.id,
          type: el.type,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          angle: el.angle,
          strokeColor: el.strokeColor,
          backgroundColor: el.backgroundColor,
          fillStyle: el.fillStyle,
          strokeWidth: el.strokeWidth,
          strokeStyle: el.strokeStyle,
          roughness: el.roughness,
          opacity: el.opacity,
          points: el.points,
          text: el.text,
          fontSize: el.fontSize,
          fontFamily: el.fontFamily,
          textAlign: el.textAlign,
          verticalAlign: el.verticalAlign,
          isDeleted: el.isDeleted
        }));

        onSync({
          elements: cleanElements,
          appState: {
            viewBackgroundColor: appState.viewBackgroundColor
          }
        });
      }, 75);
    }
  }, [onSync]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <ExcalidrawComponent
        excalidrawAPI={handleAPIReady}
        onChange={handleChange}
        theme={isLight ? 'light' : 'dark'}
        initialData={{
          elements: syncData?.elements || savedElementsRef.current || [],
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
