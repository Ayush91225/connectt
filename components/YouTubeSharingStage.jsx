'use client';

import React, { useState } from 'react';
import { sfx } from '../lib/audio';

const QUICK_LECTURES = [
  { id: '8mAITcNt710', label: 'CS50 • Harvard', title: 'Harvard CS50: Computational Thinking' },
  { id: 'fNk_zzaMoSs', label: 'Linear Algebra • 3Blue1Brown', title: 'Essence of Linear Algebra' },
  { id: 'VMj-3S1tku0', label: 'Neural Networks • Karpathy', title: 'Building Neural Networks from Scratch' }
];

const YTIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 28 20" width={size} height={size * 0.72} fill="none">
    <path d="M27.4 3.1A3.5 3.5 0 0 0 24.9.6C22.7 0 14 0 14 0S5.3 0 3.1.6A3.5 3.5 0 0 0 .6 3.1C0 5.3 0 10 0 10s0 4.7.6 6.9a3.5 3.5 0 0 0 2.5 2.5C5.3 20 14 20 14 20s8.7 0 10.9-.6a3.5 3.5 0 0 0 2.5-2.5c.6-2.2.6-6.9.6-6.9s0-4.7-.6-6.9Z" fill="#89b754" />
    <path d="m11 14.3 7-4.3-7-4.3v8.6Z" fill="white" />
  </svg>
);

export default function YouTubeSharingStage({ theme = 'light' }) {
  const isLight = theme === 'light';

  const cBg     = isLight ? '#f7f5f2' : '#0e0f10';
  const cCard   = isLight ? '#ffffff' : '#1a1b1e';
  const cCardH  = isLight ? '#f0ede8' : '#222428';
  const cBorder = isLight ? '#e8e4de' : 'rgba(255,255,255,0.07)';
  const cText   = isLight ? '#1a1814' : '#f0f0f0';
  const cSubtle = isLight ? '#6b6560' : '#6e7178';

  const [currentVideo, setCurrentVideo] = useState(null);
  const [inputUrl, setInputUrl]         = useState('');
  const [error, setError]               = useState('');

  const extractVideoId = (input) => {
    if (!input) return null;
    const v = input.trim();
    if (/^[\w-]{11}$/.test(v)) return v;
    try {
      const url = new URL(/^[a-zA-Z][\w+.-]*:/.test(v) ? v : `https://${v}`);
      const host = url.hostname.toLowerCase().replace(/^www\./, '');
      if (host === 'youtu.be') {
        const id = url.pathname.split('/').filter(Boolean)[0];
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
      if (['youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
        const id = url.searchParams.get('v') ||
          (url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/) || [])[1];
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
    } catch { return null; }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const id = extractVideoId(inputUrl);
    if (id) {
      setCurrentVideo({ id, title: 'Synchronized YouTube Stream' });
      setInputUrl('');
      sfx.playReaction();
    } else {
      setError('Enter a valid YouTube link or video ID.');
    }
  };

  /* ── ACTIVE PLAYER ── */
  if (currentVideo) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#000', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: isLight ? '#ffffff' : '#111214', borderBottom: `1px solid ${cBorder}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <YTIcon size={16} />
            <span style={{ fontSize: '13px', fontWeight: 500, color: cText }}>{currentVideo.title}</span>
          </div>
          <button
            onClick={() => { setCurrentVideo(null); sfx.playToggle(false); }}
            style={{ padding: '6px 16px', borderRadius: '9999px', background: isLight ? '#f5f3ef' : 'rgba(255,255,255,0.07)', color: cText, border: `1px solid ${cBorder}`, fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
          >
            Change video
          </button>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <iframe
            key={currentVideo.id}
            src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`}
            title={currentVideo.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  /* ── EMPTY STATE ── */
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: cBg, overflowY: 'auto', overflowX: 'hidden', padding: 'clamp(24px, 5vh, 56px) clamp(16px, 5vw, 48px)' }}>
      <div style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(20px, 3vh, 32px)' }}>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, color: cText, letterSpacing: '-1px', lineHeight: 1.2, marginBottom: '12px' }}>
            Watch together,<br />perfectly in sync.
          </div>
          <div style={{ fontSize: 'clamp(13px, 1.5vw, 16px)', color: cSubtle, lineHeight: 1.6 }}>
            Paste any YouTube link — everyone on the call watches it together.
          </div>
        </div>

        {/* Big pill search bar — same style as reference home page join-field */}
        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            background: isLight ? '#ffffff' : '#18191c',
            border: `1.5px solid ${inputUrl ? '#89b754' : cBorder}`,
            borderRadius: '28px',
            padding: '4px 4px 4px 20px',
            boxShadow: inputUrl
              ? (isLight ? '0 0 0 4px rgba(137,183,84,0.1)' : '0 0 0 4px rgba(137,183,84,0.15)')
              : (isLight ? '0 2px 12px rgba(0,0,0,0.06)' : '0 2px 12px rgba(0,0,0,0.3)'),
            transition: 'border-color 0.2s, box-shadow 0.2s'
          }}>
            <input
              type="text"
              placeholder="Paste a YouTube link or video ID..."
              value={inputUrl}
              onChange={(e) => { setInputUrl(e.target.value); if (error) setError(''); }}
              style={{
                flex: 1, minWidth: 0,
                background: 'transparent', border: 'none', outline: 'none',
                color: cText, fontSize: '15px', letterSpacing: '-0.2px',
                padding: '14px 0'
              }}
            />
            <button
              type="submit"
              style={{
                flexShrink: 0,
                height: '44px',
                padding: '0 24px',
                borderRadius: '9999px',
                border: 'none',
                background: inputUrl ? '#89b754' : (isLight ? '#f0ede8' : '#26272b'),
                color: inputUrl ? '#fff' : cSubtle,
                fontWeight: 700,
                fontSize: '14px',
                cursor: inputUrl ? 'pointer' : 'default',
                transition: 'background 0.2s, color 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              Stream
            </button>
          </div>
          {error && <div style={{ fontSize: '12px', color: '#ea4335', paddingLeft: '4px' }}>{error}</div>}
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
          <div style={{ flex: 1, height: '1px', background: cBorder }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: cSubtle, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Quick picks</span>
          <div style={{ flex: 1, height: '1px', background: cBorder }} />
        </div>

        {/* Quick pick chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {QUICK_LECTURES.map((item) => (
            <button
              key={item.id}
              onClick={() => { setCurrentVideo({ id: item.id, title: item.title }); sfx.playReaction(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '9999px', background: cCard, border: `1px solid ${cBorder}`, cursor: 'pointer', transition: 'background 0.15s', fontSize: '13px', color: cSubtle, fontWeight: 500, whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = cCardH; e.currentTarget.style.color = cText; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = cCard; e.currentTarget.style.color = cSubtle; }}
            >
              <YTIcon size={12} />
              {item.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
