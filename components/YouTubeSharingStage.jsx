'use client';

import React, { useState } from 'react';
import { sfx } from '../lib/audio';

const QUICK_LECTURES = [
  { id: '8mAITcNt710', label: 'CS50 • Harvard', title: 'Harvard CS50: Computational Thinking' },
  { id: 'fNk_zzaMoSs', label: 'Linear Algebra • 3Blue1Brown', title: 'Essence of Linear Algebra' },
  { id: 'VMj-3S1tku0', label: 'Neural Networks • Karpathy', title: 'Building Neural Networks from Scratch' }
];

export default function YouTubeSharingStage({ theme = 'light' }) {
  const isLight = theme === 'light';
  const cBg = isLight ? '#fbfbfb' : '#0a0a0c';
  const cTopBar = isLight ? '#ffffff' : '#111215';
  const cBorder = isLight ? '#e8e4de' : 'rgba(255, 255, 255, 0.08)';
  const cText = isLight ? '#1a1814' : '#ffffff';
  const cSubtle = isLight ? '#6b6560' : '#9aa0a6';
  const cInputBg = isLight ? '#ffffff' : '#151619';
  const cChipBg = isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.05)';
  const cChipHover = isLight ? '#eeebe4' : 'rgba(255, 255, 255, 0.1)';

  const [currentVideo, setCurrentVideo] = useState(null);
  const [inputUrl, setInputUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const extractVideoId = (input) => {
    if (!input) return null;
    const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : (input.trim().length === 11 ? input.trim() : null);
  };

  const handleStartStream = (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const id = extractVideoId(inputUrl);
    if (id) {
      setCurrentVideo({
        id,
        title: 'Synchronized YouTube Stream'
      });
      setInputUrl('');
      sfx.playReaction();
    } else {
      setErrorMessage('Please enter a valid YouTube video link');
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: cBg,
        color: cText,
        fontFamily: "'Segoe UI', Roboto, -apple-system, sans-serif",
        overflow: 'hidden'
      }}
    >
      {/* ACTIVE VIDEO VIEW */}
      {currentVideo ? (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
          {/* Top Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 16px',
              height: '42px',
              backgroundColor: cTopBar,
              borderBottom: `1px solid ${cBorder}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 28 20" style={{ width: '16px', height: '12px', fill: '#ff0000' }}>
                <path d="M27.973 3.123A3.504 3.504 0 0 0 25.503.653C23.323.07 14 .07 14 .07s-9.323 0-11.503.583A3.504 3.504 0 0 0 .027 3.123C-.556 5.303-.556 9.83-.556 9.83s0 4.527.583 6.707a3.504 3.504 0 0 0 2.47 2.47c2.18.583 11.503.583 11.503.583s9.323 0 11.503-.583a3.504 3.504 0 0 0 2.47-2.47c.583-2.18.583-6.707.583-6.707s0-4.527-.583-6.707z" />
                <polygon points="11.2,14 18.2,9.83 11.2,5.66" fill="#ffffff" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: 500, color: cText }}>
                {currentVideo.title}
              </span>
            </div>

            <button
              onClick={() => {
                setCurrentVideo(null);
                sfx.playToggle(false);
              }}
              style={{
                padding: '4px 12px',
                borderRadius: '12px',
                backgroundColor: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.08)',
                color: cText,
                border: `1px solid ${cBorder}`,
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Change Video
            </button>
          </div>

          {/* Clean Full-Stage Video Player */}
          <div style={{ flex: 1, position: 'relative', backgroundColor: '#000000' }}>
            <iframe
              key={currentVideo.id}
              src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`}
              title={currentVideo.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        /* ULTRA-MINIMAL EMPTY STATE */
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 20px',
            backgroundColor: cBg
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            {/* Subtle Minimal Icon */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'rgba(234, 67, 53, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}
            >
              <svg viewBox="0 0 28 20" style={{ width: '28px', height: '20px', fill: '#ea4335' }}>
                <path d="M27.973 3.123A3.504 3.504 0 0 0 25.503.653C23.323.07 14 .07 14 .07s-9.323 0-11.503.583A3.504 3.504 0 0 0 .027 3.123C-.556 5.303-.556 9.83-.556 9.83s0 4.527.583 6.707a3.504 3.504 0 0 0 2.47 2.47c2.18.583 11.503.583 11.503.583s9.323 0 11.503-.583a3.504 3.504 0 0 0 2.47-2.47c.583-2.18.583-6.707.583-6.707s0-4.527-.583-6.707z" />
                <polygon points="11.2,14 18.2,9.83 11.2,5.66" fill="#ffffff" />
              </svg>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 600, color: cText, margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>
              YouTube Watch Party
            </h2>
            <p style={{ fontSize: '13px', color: cSubtle, margin: '0 0 24px 0', lineHeight: 1.5, maxWidth: '380px' }}>
              Stream lectures and videos synchronously with everyone in connectt.live.
            </p>

            {/* Clean Input Field */}
            <form
              onSubmit={handleStartStream}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: cInputBg,
                border: `1px solid ${cBorder}`,
                borderRadius: '24px',
                padding: '4px 6px 4px 16px',
                marginBottom: '10px',
                boxShadow: isLight ? '0 2px 10px rgba(0, 0, 0, 0.04)' : 'none'
              }}
            >
              <input
                type="text"
                placeholder="Paste YouTube link..."
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: cText,
                  fontSize: '13px'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '7px 18px',
                  borderRadius: '18px',
                  backgroundColor: '#ea4335',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Stream
              </button>
            </form>

            {errorMessage && (
              <div style={{ fontSize: '12px', color: '#ea4335', marginBottom: '12px' }}>
                {errorMessage}
              </div>
            )}

            {/* Quick Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              {QUICK_LECTURES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentVideo(item);
                    sfx.playReaction();
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '14px',
                    backgroundColor: cChipBg,
                    color: cSubtle,
                    fontSize: '11px',
                    fontWeight: 500,
                    border: `1px solid ${cBorder}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = cChipHover;
                    e.currentTarget.style.color = cText;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = cChipBg;
                    e.currentTarget.style.color = cSubtle;
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
