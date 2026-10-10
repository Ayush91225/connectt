'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function DesmosCalculator({ type = 'graphing' }) {
  const containerRef = useRef(null);
  const calcInstanceRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

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

  useEffect(() => {
    if (isLoaded && containerRef.current && window.Desmos) {
      if (calcInstanceRef.current) {
        calcInstanceRef.current.destroy();
      }

      if (type === 'graphing') {
        calcInstanceRef.current = window.Desmos.GraphingCalculator(containerRef.current, {
          keypad: true,
          expressions: true,
          settingsMenu: true,
          zoomButtons: true,
          border: false
        });
        // Set sample functions
        calcInstanceRef.current.setExpression({ id: 'graph1', latex: 'y=\\sin(x)', color: '#89b754' });
        calcInstanceRef.current.setExpression({ id: 'graph2', latex: 'y=x^2', color: '#7cacf8' });
      } else {
        calcInstanceRef.current = window.Desmos.ScientificCalculator(containerRef.current, {
          border: false
        });
      }
    }

    return () => {
      if (calcInstanceRef.current) {
        calcInstanceRef.current.destroy();
        calcInstanceRef.current = null;
      }
    };
  }, [isLoaded, type]);

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
