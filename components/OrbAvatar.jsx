'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Orb } from 'orb-ui';
import { getOrbThemeConfig, getOrbPalette } from '../lib/avatar';

export default function OrbAvatar({
  userName = 'User',
  size = 40,
  state,
  isSpeaking = false,
  isMicOn = true,
  themeVariant = 'cloud', // 'cloud' theme as default
  showGlow = true,
  interactive = false,
  className = '',
  style = {}
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const palette = useMemo(() => getOrbPalette(userName), [userName]);
  const themeConfig = useMemo(() => getOrbThemeConfig(userName, themeVariant), [userName, themeVariant]);

  // Determine active state: if explicitly passed use it; otherwise evaluate speaking/mic
  const computedState = state || (isSpeaking ? 'speaking' : isMicOn ? 'listening' : 'idle');

  const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 40;

  // SSR or before mount fallback: pure seamless orb gradient, NO letters
  if (!mounted) {
    return (
      <div
        className={`orb-avatar-fallback ${className}`}
        style={{
          width: `${numericSize}px`,
          height: `${numericSize}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle at 45% 40%, ${palette.speaking} 0%, ${palette.idle} 55%, ${palette.deep} 100%)`,
          boxShadow: showGlow ? `0 0 ${Math.max(6, numericSize * 0.22)}px ${palette.glow}` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          ...style
        }}
      />
    );
  }

  return (
    <div
      className={`orb-avatar-wrapper ${className}`}
      style={{
        width: `${numericSize}px`,
        height: `${numericSize}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        borderRadius: '50%',
        ...style
      }}
    >
      {/* Dynamic atmospheric ambient back-glow */}
      {showGlow && (
        <div
          style={{
            position: 'absolute',
            inset: isSpeaking ? '-18%' : '-8%',
            borderRadius: '50%',
            background: palette.glow,
            filter: `blur(${Math.max(6, numericSize * 0.18)}px)`,
            opacity: isSpeaking ? 0.9 : 0.5,
            transition: 'all 0.35s cubic-bezier(0.34, 1.45, 0.64, 1)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}

      {/* Living Interactive Cloud Orb - Pure fluid motion, NO letters */}
      <div
        style={{
          width: `${numericSize}px`,
          height: `${numericSize}px`,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Orb
          theme={themeConfig}
          size={numericSize}
          state={computedState}
          interactive={interactive}
        />
      </div>
    </div>
  );
}
