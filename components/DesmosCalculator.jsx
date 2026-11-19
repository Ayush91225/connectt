'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function DesmosCalculator({
  type = 'graphing',
  theme = 'light',
  onSync = null,
  syncData = null,
  isPresenter = false
}) {
  const containerRef = useRef(null);
  const calcInstanceRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isRemoteUpdatingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Check if Desmos is already in window
    if (window.Desmos) {
      setIsLoaded(true);
      return;
    }

    const scriptId = 'desmos-api-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
      script.async = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setIsLoaded(true));
    }
  }, []);

  // Sync state from remote presenter
  useEffect(() => {
    if (!calcInstanceRef.current || !syncData?.state) return;
    try {
      isRemoteUpdatingRef.current = true;
      calcInstanceRef.current.setState(syncData.state);
    } catch (e) {
      console.warn('Desmos state sync error:', e);
    } finally {
      setTimeout(() => {
        isRemoteUpdatingRef.current = false;
      }, 150);
    }
  }, [syncData]);

  useEffect(() => {
    if (isLoaded && containerRef.current && window.Desmos) {
      if (calcInstanceRef.current) {
        calcInstanceRef.current.destroy();
      }

      if (type === 'graphing') {
        const calc = window.Desmos.GraphingCalculator(containerRef.current, {
          keypad: true,
          expressions: true,
          settingsMenu: true,
          zoomButtons: true,
          border: false
        });
        calcInstanceRef.current = calc;

        // Set initial state from syncData or defaults if presenter
        isRemoteUpdatingRef.current = true;
        if (syncData?.state) {
          try {
            calc.setState(syncData.state);
          } catch (e) {}
        } else if (isPresenter) {
          calc.setExpression({ id: 'graph1', latex: 'y=\\sin(x)', color: '#89b754' });
          calc.setExpression({ id: 'graph2', latex: 'y=x^2', color: '#7cacf8' });
        }

        setTimeout(() => {
          isRemoteUpdatingRef.current = false;
          hasInitializedRef.current = true;
        }, 250);

        let changeTimer = null;
        calc.observeEvent('change', () => {
          if (isRemoteUpdatingRef.current || !hasInitializedRef.current) return;
          if (changeTimer) clearTimeout(changeTimer);
          changeTimer = setTimeout(() => {
            if (calcInstanceRef.current && onSync) {
              const state = calcInstanceRef.current.getState();
              onSync({ state });
            }
          }, 150);
        });
      } else {
        calcInstanceRef.current = window.Desmos.ScientificCalculator(containerRef.current, {
          border: false
        });
      }
    }

    return () => {
      if (calcInstanceRef.current) {
        try {
          calcInstanceRef.current.destroy();
        } catch (e) {}
        calcInstanceRef.current = null;
      }
    };
  }, [isLoaded, type, isPresenter]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '380px', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
      {!isLoaded && (
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aa0a6' }}>
          <span className="icon" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}>progress_activity</span>
          <span>Loading Desmos {type === 'graphing' ? 'Graphing' : 'Scientific'} Calculator...</span>
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '380px' }} />
    </div>
  );
}
