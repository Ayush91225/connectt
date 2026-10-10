'use client';

import React, { useState } from 'react';
import { sfx } from '../lib/audio';

export default function AudioQuickMenu({
  isOpen,
  onClose,
  isMicOn,
  onToggleMic,
  onOpenSettings,
  showToast,
  theme = 'light'
}) {
  const [selectedMic, setSelectedMic] = useState('Microphone (Built-in)');
  const [isNoiseCancel, setIsNoiseCancel] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestChime = () => {
    setIsTesting(true);
    sfx.playJoin();
    setTimeout(() => setIsTesting(false), 1200);
  };

  return (
    <div
      className={`quick-media-pill-bar ${isOpen ? 'show' : ''} ${theme === 'light' ? 'light-theme' : ''}`}
      style={{
        transform: isOpen ? 'translateX(-50%) translateY(0) scale(1)' : 'translateX(-50%) translateY(16px) scale(0.96)',
        left: '42%'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Mic Device Select */}
      <div
        className="quick-cam-device-select"
        onClick={() => {
          const next = selectedMic.includes('Built-in') ? 'External Audio (USB)' : 'Microphone (Built-in)';
          setSelectedMic(next);
          showToast?.(`${next} selected`);
        }}
      >
        <span className="icon" style={{ fontSize: '18px' }}>mic</span>
        <span>{selectedMic}</span>
        <span className="icon" style={{ fontSize: '16px' }}>expand_more</span>
      </div>

      {/* Noise Cancellation Toggle */}
      <button
        className="quick-text-btn"
        onClick={() => {
          const next = !isNoiseCancel;
          setIsNoiseCancel(next);
          showToast?.(next ? 'Noise cancellation on' : 'Noise cancellation off');
        }}
      >
        <span className="icon" style={{ fontSize: '18px', color: isNoiseCancel ? '#a8c7fa' : '#8e918f' }}>
          {isNoiseCancel ? 'noise_aware' : 'noise_control_off'}
        </span>
        <span>Noise cancellation</span>
      </button>

      {/* Test Speaker Button */}
      <button
        className="quick-text-btn"
        onClick={handleTestChime}
      >
        <span className="icon" style={{ fontSize: '18px' }}>volume_up</span>
        <span>{isTesting ? 'Playing chime...' : 'Test speakers'}</span>
      </button>

      {/* Audio Settings Gear */}
      <button
        className="home-icon-btn"
        style={{ width: '32px', height: '32px', color: '#c4c7c5' }}
        data-tooltip="Settings"
        onClick={() => {
          onClose();
          onOpenSettings?.();
        }}
      >
        <span className="icon" style={{ fontSize: '18px' }}>settings</span>
      </button>
    </div>
  );
}
