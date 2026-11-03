// Color and Avatar Generator powered by orb-ui & M3 Expressive Palette
import { useState, useEffect } from 'react';

// Convert Hex to RGB
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return null;
  const num = parseInt(c, 16);
  if (isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

// Convert RGB to HSL
export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// Curated signature palettes for consistent, premium Google Meet aesthetics
const ORB_PALETTES = [
  // 0: Emerald Sage Mint
  {
    name: 'Emerald Sage',
    idle: '#10b981',
    speaking: '#34d399',
    listening: '#6ee7b7',
    deep: '#064e3b',
    cobalt: '#059669',
    aqua: '#34d399',
    pale: '#a7f3d0',
    primary: 'rgb(16, 185, 129)',
    hex: '#10b981',
    glow: 'rgba(16, 185, 129, 0.35)',
    glowSoft: 'rgba(16, 185, 129, 0.15)'
  },
  // 1: Sapphire Sky Blue
  {
    name: 'Sapphire Sky',
    idle: '#0284c7',
    speaking: '#38bdf8',
    listening: '#7dd3fc',
    deep: '#0c4a6e',
    cobalt: '#0369a1',
    aqua: '#38bdf8',
    pale: '#bae6fd',
    primary: 'rgb(2, 132, 199)',
    hex: '#0284c7',
    glow: 'rgba(56, 189, 248, 0.35)',
    glowSoft: 'rgba(56, 189, 248, 0.15)'
  },
  // 2: Royal Amethyst Purple
  {
    name: 'Royal Amethyst',
    idle: '#8b5cf6',
    speaking: '#a78bfa',
    listening: '#c4b5fd',
    deep: '#4c1d95',
    cobalt: '#7c3aed',
    aqua: '#a78bfa',
    pale: '#ddd6fe',
    primary: 'rgb(139, 92, 246)',
    hex: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.35)',
    glowSoft: 'rgba(139, 92, 246, 0.15)'
  },
  // 3: Coral Sunset
  {
    name: 'Coral Sunset',
    idle: '#f43f5e',
    speaking: '#fb7185',
    listening: '#fda4af',
    deep: '#881337',
    cobalt: '#e11d48',
    aqua: '#fb7185',
    pale: '#fecdd3',
    primary: 'rgb(244, 63, 94)',
    hex: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.35)',
    glowSoft: 'rgba(244, 63, 94, 0.15)'
  },
  // 4: Golden Amber
  {
    name: 'Golden Amber',
    idle: '#f59e0b',
    speaking: '#fbbf24',
    listening: '#fde68a',
    deep: '#78350f',
    cobalt: '#d97706',
    aqua: '#fbbf24',
    pale: '#fef3c7',
    primary: 'rgb(245, 158, 11)',
    hex: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.35)',
    glowSoft: 'rgba(245, 158, 11, 0.15)'
  },
  // 5: Electric Turquoise Teal
  {
    name: 'Electric Turquoise',
    idle: '#0d9488',
    speaking: '#2dd4bf',
    listening: '#5eead4',
    deep: '#134e4a',
    cobalt: '#0f766e',
    aqua: '#2dd4bf',
    pale: '#99f6e4',
    primary: 'rgb(13, 148, 136)',
    hex: '#0d9488',
    glow: 'rgba(45, 212, 191, 0.35)',
    glowSoft: 'rgba(45, 212, 191, 0.15)'
  },
  // 6: Indigo Velvet
  {
    name: 'Indigo Velvet',
    idle: '#6366f1',
    speaking: '#818cf8',
    listening: '#a5b4fc',
    deep: '#312e81',
    cobalt: '#4f46e5',
    aqua: '#818cf8',
    pale: '#c7d2fe',
    primary: 'rgb(99, 102, 241)',
    hex: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.35)',
    glowSoft: 'rgba(99, 102, 241, 0.15)'
  },
  // 7: Rose Flamingo
  {
    name: 'Rose Flamingo',
    idle: '#d946ef',
    speaking: '#e879f9',
    listening: '#f0abfc',
    deep: '#701a75',
    cobalt: '#c026d3',
    aqua: '#e879f9',
    pale: '#f5d0fe',
    primary: 'rgb(217, 70, 239)',
    hex: '#d946ef',
    glow: 'rgba(217, 70, 239, 0.35)',
    glowSoft: 'rgba(217, 70, 239, 0.15)'
  }
];

// Hash function to consistently select an Orb palette based on user name
export function getOrbPalette(name = 'User') {
  const clean = (name || 'User').trim();

  // Consistent string hash
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % ORB_PALETTES.length;
  return ORB_PALETTES[index];
}

// Generate an orb-ui theme configuration for a specific user name
export function getOrbThemeConfig(name = 'User', variant = 'cloud') {
  const p = getOrbPalette(name);

  // Default: 'cloud' theme with organic fluid motion & signature palette
  if (variant === 'cloud') {
    return {
      name: 'cloud',
      preset: 'expressive',
      appearance: {
        deepColor: p.deep,
        upperColor: p.speaking,
        lowerColor: p.idle,
        highlightColor: p.listening,
        launchColor: p.cobalt,
        spinnerColor: p.pale
      }
    };
  }

  if (variant === 'radial') {
    return {
      name: 'radial',
      preset: 'expressive',
      appearance: {
        deepColor: p.deep,
        cobaltColor: p.cobalt,
        aquaColor: p.aqua,
        paleColor: p.pale,
        membraneColor: `${p.hex}55`,
        seamColor: 'rgba(255, 255, 255, 0.85)',
        idleControlColor: p.idle,
        activeControlColor: p.speaking,
        connectingControlColor: '#f59e0b'
      }
    };
  }

  // 'circle' theme with M3 expressive responsiveness
  return {
    name: 'circle',
    preset: 'expressive',
    appearance: {
      colors: {
        idle: p.idle,
        speaking: p.speaking,
        listening: p.listening,
        thinking: p.pale,
        connecting: '#f59e0b',
        error: '#ef4444'
      },
      listeningGlow: 0.85,
      speakingGlow: 1.2
    }
  };
}

// Backwards-compatible soft palette generator used for backgrounds, borders, and ambient glow
export function getAvatarAccentColor(name = 'User') {
  const p = getOrbPalette(name);
  const rgb = hexToRgb(p.hex) || { r: 16, g: 185, b: 129 };
  return {
    name: p.name,
    primary: p.primary,
    hex: p.hex,
    glow: p.glow,
    glowSoft: p.glowSoft,
    bgTint: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04)`,
    tileBg: `radial-gradient(ellipse at 50% 50%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02) 50%, #111215 100%)`,
    stageBg: `radial-gradient(ellipse at 50% 45%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04) 0%, rgba(16, 17, 20, 0.98) 75%)`,
    btnActive: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
    borderThin: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
    borderSpeaking: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95)`
  };
}

// React hook for component palette extraction
export function useAvatarPalette(userName = 'User') {
  const [palette, setPalette] = useState(() => getAvatarAccentColor(userName));

  useEffect(() => {
    setPalette(getAvatarAccentColor(userName));
  }, [userName]);

  return palette;
}

// Fallback SVG data URL generator using the user's signature Orb colors (no letters, pure orb gradient)
export function getDiceBearAvatar(name = 'User') {
  const p = getOrbPalette(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <radialGradient id="g" cx="50%" cy="40%" r="55%">
        <stop offset="0%" stop-color="${p.speaking}" />
        <stop offset="50%" stop-color="${p.idle}" />
        <stop offset="100%" stop-color="${p.deep}" />
      </radialGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#g)" filter="url(#glow)"/>
    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
