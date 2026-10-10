// Avatar generator using DiceBear glass collection
import { useState, useEffect } from 'react';

export function getDiceBearAvatar(name = 'User') {
  const cleanName = (name || 'User').trim();
  const seed = encodeURIComponent(cleanName);
  return `https://api.dicebear.com/10.x/glass/svg?tags=animation&seed=${seed}`;
}

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

// Transform any vibrant color into an ultra-soft, gentle pastel tone
export function softenRgb(r, g, b) {
  const hsl = rgbToHsl(r, g, b);
  // Modulate saturation to a soft pastel 24-34% and soothing lightness 63-69%
  const softS = Math.min(Math.max(hsl.s, 22), 34);
  const softL = Math.min(Math.max(hsl.l, 63), 69);
  return hslToRgb(hsl.h, softS, softL);
}

// Generate an ultra-soft, elegant ambient palette from RGB values
export function generateSoftPaletteFromRgb(rawR, rawG, rawB, name = 'Glass Accent') {
  // Always soften input RGB to create a muted, soothing pastel tone
  const { r, g, b } = softenRgb(rawR, rawG, rawB);
  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  return {
    name,
    primary: `rgb(${r}, ${g}, ${b})`,
    hex,
    // Ultra-soft, gentle ambient highlights
    glow: `rgba(${r}, ${g}, ${b}, 0.16)`,
    glowSoft: `rgba(${r}, ${g}, ${b}, 0.08)`,
    bgTint: `rgba(${r}, ${g}, ${b}, 0.025)`,
    // Ultra-soft, deep luxury slate with a gentle 4% -> 1% soft mist
    tileBg: `radial-gradient(ellipse at 50% 50%, rgba(${r}, ${g}, ${b}, 0.045) 0%, rgba(${r}, ${g}, ${b}, 0.01) 50%, #111215 100%)`,
    stageBg: `radial-gradient(ellipse at 50% 45%, rgba(${r}, ${g}, ${b}, 0.025) 0%, rgba(16, 17, 20, 0.98) 75%)`,
    btnActive: `rgba(${r}, ${g}, ${b}, 0.15)`,
    borderThin: `rgba(${r}, ${g}, ${b}, 0.28)`,
    borderSpeaking: `rgba(${r}, ${g}, ${b}, 0.9)`
  };
}

export function generateSoftPaletteFromHex(hex, name = 'Glass Accent') {
  const rgb = hexToRgb(hex) || { r: 142, g: 195, b: 156 };
  return generateSoftPaletteFromRgb(rgb.r, rgb.g, rgb.b, name);
}

// Fallback curated soft palettes (inspired by DiceBear Glass tones with ultra-soft pastel values)
const SOFT_PALETTES = [
  generateSoftPaletteFromRgb(142, 195, 156, 'Soft Sage Mint'), // Index 0: Green/Mint (DiceBear Ayushmaan)
  generateSoftPaletteFromRgb(145, 185, 240, 'Soft Sky Mist'),
  generateSoftPaletteFromRgb(190, 165, 230, 'Soft Amethyst Lilac'),
  generateSoftPaletteFromRgb(135, 205, 190, 'Soft Seafoam'),
  generateSoftPaletteFromRgb(225, 165, 160, 'Soft Rose Petal'),
  generateSoftPaletteFromRgb(155, 195, 170, 'Soft Sage Leaf'),
  generateSoftPaletteFromRgb(170, 190, 235, 'Soft Periwinkle Dew'),
  generateSoftPaletteFromRgb(230, 175, 185, 'Soft Blush Pink')
];

// Seeded quick synchronous fallback
export function getAvatarAccentColor(name = 'User') {
  const clean = (name || 'User').trim();
  const lower = clean.toLowerCase();

  // Explicit match for Ayushmaan & variants
  if (lower.includes('ayushmaan') || lower.includes('ayushman')) {
    return SOFT_PALETTES[0]; // Soft Emerald Mint
  }

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SOFT_PALETTES.length;
  return SOFT_PALETTES[index];
}

// React Hook to dynamically extract the exact SVG stop-color directly from DiceBear in the browser
export function useAvatarPalette(userName = 'User') {
  const [palette, setPalette] = useState(() => getAvatarAccentColor(userName));

  useEffect(() => {
    const clean = (userName || 'User').trim();
    if (!clean) return;

    // Immediately set synchronous fallback
    const fallback = getAvatarAccentColor(clean);
    setPalette(fallback);

    let isMounted = true;
    const cacheKey = `connectt_dicebear_pal_${clean}`;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setPalette(JSON.parse(cached));
        return;
      }
    } catch (e) {}

    // Fetch live SVG from DiceBear API
    const svgUrl = getDiceBearAvatar(clean);
    fetch(svgUrl)
      .then(res => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.text();
      })
      .then(svgText => {
        if (!isMounted) return;

        // Extract hex colors from stop-color or fill attributes
        const regex = /(?:stop-color|fill)=["'](#[0-9a-fA-F]{3,6})["']/gi;
        const found = [];
        let match;
        while ((match = regex.exec(svgText)) !== null) {
          found.push(match[1]);
        }

        // If no regex match, search all hex codes in the SVG
        const allHex = found.length > 0 ? found : (svgText.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g) || []);

        if (allHex.length > 0) {
          let bestHex = null;
          let highestScore = -1;

          for (const hex of allHex) {
            const rgb = hexToRgb(hex);
            if (!rgb) continue;
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

            // Filter out near-white highlights, near-black shadows, and uncolored grays
            if (hsl.l > 90 || hsl.l < 15 || hsl.s < 20) continue;

            // Score: midtone saturation + optimal lightness around 55%
            const lightnessBalance = 1 - Math.abs(hsl.l - 55) / 55;
            const score = (hsl.s / 100) * 1.5 + lightnessBalance;

            if (score > highestScore) {
              highestScore = score;
              bestHex = hex;
            }
          }

          if (bestHex) {
            const dynamicPalette = generateSoftPaletteFromHex(bestHex, `${clean} Glass Tone`);
            setPalette(dynamicPalette);
            try {
              sessionStorage.setItem(cacheKey, JSON.stringify(dynamicPalette));
            } catch (e) {}
            return;
          }
        }
      })
      .catch(() => {
        // Quietly maintain fallback if offline or blocked
      });

    return () => {
      isMounted = false;
    };
  }, [userName]);

  return palette;
}
