'use client';

import React from 'react';

export default function MonacoCodeStage() {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#1e1e1e', overflow: 'hidden' }}>
      <iframe
        src="http://localhost:8080/"
        title="RUX VS Code Web"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          backgroundColor: '#1e1e1e'
        }}
        allow="clipboard-read; clipboard-write; microphone; camera; fullscreen"
      />
    </div>
  );
}
