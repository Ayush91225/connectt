'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { sfx } from '../../lib/audio';
import OrbAvatar from '../../components/OrbAvatar';

export default function HomePage() {
  const router = useRouter();

  // User Display Name - loaded dynamically from localStorage, no hardcoded name
  const [userName, setUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [meetingCode, setMeetingCode] = useState('');
  const [showLaterModal, setShowLaterModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [toast, setToast] = useState(null);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [dark, setDark] = useState(false);

  // Pre-flight hardware test state
  const [previewStream, setPreviewStream] = useState(null);
  const [previewCamActive, setPreviewCamActive] = useState(false);
  const [previewMicActive, setPreviewMicActive] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const previewVideoRef = useRef(null);
  const audioContextRef = useRef(null);
  const animFrameRef = useRef(null);

  // Recent Rooms (Dynamic from localStorage)
  const [recentRooms, setRecentRooms] = useState([]);

  const inputRef = useRef(null);

  // Theme Colors
  const bg = dark ? '#0d1117' : '#f8fafc';
  const surface = dark ? '#161b22' : '#ffffff';
  const border = dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
  const text = dark ? '#f0f6fc' : '#0f172a';
  const muted = dark ? '#8b949e' : '#64748b';
  const primary = '#2563eb';
  const primaryHover = '#1d4ed8';

  // Load saved name & recent rooms
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('connectt_username');
      if (savedName && savedName.trim()) {
        setUserName(savedName.trim());
        setTempName(savedName.trim());
      } else {
        setUserName('Guest User');
        setTempName('Guest User');
      }

      const savedRooms = localStorage.getItem('connectt_recent_rooms');
      if (savedRooms) {
        setRecentRooms(JSON.parse(savedRooms));
      }
    } catch (e) {
      setUserName('Guest User');
      setTempName('Guest User');
    }
  }, []);

  // Live World Clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;

      setTimeStr(`${hours}:${minutes} ${ampm}`);
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
      );
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Pre-flight mic/cam toggle
  const togglePreflightCam = async () => {
    if (previewCamActive) {
      if (previewStream) {
        previewStream.getVideoTracks().forEach(t => t.stop());
      }
      setPreviewCamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: previewMicActive });
        setPreviewStream(stream);
        setPreviewCamActive(true);
        if (previewVideoRef.current) previewVideoRef.current.srcObject = stream;
      } catch (err) {
        showToast('Camera access denied or unavailable');
      }
    }
  };

  const togglePreflightMic = async () => {
    if (previewMicActive) {
      if (previewStream) {
        previewStream.getAudioTracks().forEach(t => t.stop());
      }
      setPreviewMicActive(false);
      setMicVolume(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: previewCamActive });
        setPreviewStream(stream);
        setPreviewMicActive(true);

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          const src = ctx.createMediaStreamSource(stream);
          src.connect(analyser);

          const data = new Uint8Array(analyser.frequencyBinCount);
          const loop = () => {
            analyser.getByteFrequencyData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i];
            const avg = sum / data.length;
            setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(loop);
          };
          loop();
        }
      } catch (err) {
        showToast('Microphone access denied or unavailable');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(t => t.stop());
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [previewStream]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const generateMeetingId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const randPart = (n) =>
      Array.from({ length: n }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    return `${randPart(3)}-${randPart(4)}-${randPart(3)}`;
  };

  const recordRecentRoom = (id) => {
    try {
      const updated = [
        { id, joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...recentRooms.filter(r => r.id !== id)
      ].slice(0, 5);
      setRecentRooms(updated);
      localStorage.setItem('connectt_recent_rooms', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleStartInstant = () => {
    sfx.playClick();
    const id = generateMeetingId();
    recordRecentRoom(id);
    router.push(`/${id}`);
  };

  const handleCreateLater = () => {
    sfx.playClick();
    const id = generateMeetingId();
    const fullLink = `${window.location.origin}/${id}`;
    setGeneratedLink(fullLink);
    setShowLaterModal(true);
    recordRecentRoom(id);
  };

  const handleJoin = (e) => {
    e?.preventDefault();
    if (!meetingCode.trim()) return;
    sfx.playClick();

    let clean = meetingCode.trim();
    if (clean.includes('/')) {
      const parts = clean.split('/');
      clean = parts[parts.length - 1];
    }
    clean = clean.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();

    if (!clean) {
      showToast('Please enter a valid meeting code');
      return;
    }

    recordRecentRoom(clean);
    router.push(`/${clean}`);
  };

  const handleSaveName = () => {
    if (!tempName.trim()) {
      showToast('Name cannot be blank');
      return;
    }
    const clean = tempName.trim();
    setUserName(clean);
    try {
      localStorage.setItem('connectt_username', clean);
    } catch (e) {}
    setIsEditingName(false);
    showToast(`Display name updated to "${clean}"`);
  };

  return (
    <main
      className="cnt-home-root"
      style={{
        background: bg,
        color: text,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* PROFESSIONAL TOP NAV */}
      <header
        style={{
          height: '68px',
          padding: '0 28px',
          borderBottom: `1px solid ${border}`,
          background: surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(12px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            onClick={() => router.push('/home')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <img src="/connectt.png" alt="Connectt Logo" style={{ height: '34px', objectFit: 'contain' }} />
            <img src="/connectt1.png" alt="Connectt" style={{ height: '24px', objectFit: 'contain' }} />
          </div>

          <div
            className="cnt-status-pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: dark ? 'rgba(34, 197, 94, 0.12)' : '#ecfdf5',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: dark ? '#4ade80' : '#15803d',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span>Edge Ready · Global SFU</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {timeStr && (
            <span style={{ fontSize: '13px', color: muted, fontWeight: 500 }} className="cnt-hide-sm">
              {timeStr} · {dateStr}
            </span>
          )}

          {/* User Profile Pill with Cloud Orb */}
          <button
            type="button"
            onClick={() => {
              setTempName(userName);
              setIsEditingName(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '5px 12px 5px 6px',
              borderRadius: '24px',
              border: `1px solid ${border}`,
              background: dark ? 'rgba(255,255,255,0.04)' : '#f1f5f9',
              color: text,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <OrbAvatar userName={userName} size={28} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{userName}</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: muted }}>edit</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={() => setDark(!dark)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: `1px solid ${border}`,
              background: surface,
              color: text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
              {dark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </header>

      {/* MAIN COMMAND DASHBOARD */}
      <div style={{ flex: 1, padding: '48px 28px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div className="cnt-grid-hero">
          {/* LEFT: ACTION & JOIN PANEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <h1
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                  marginBottom: '12px',
                  color: text
                }}
              >
                Ultra-low latency video collaboration for teams
              </h1>
              <p style={{ fontSize: '1.05rem', color: muted, lineHeight: 1.5, maxWidth: '520px' }}>
                Built on high-performance WebRTC infrastructure. Synchronized screen sharing, interactive STEM whiteboard, and real-time audio.
              </p>
            </div>

            {/* QUICK ACTIONS ROW */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleStartInstant}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 22px',
                  borderRadius: '12px',
                  background: primary,
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  transition: 'transform 0.1s ease, background 0.2s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = primaryHover)}
                onMouseOut={(e) => (e.currentTarget.style.background = primary)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>video_call</span>
                <span>Instant Meeting</span>
              </button>

              <button
                type="button"
                onClick={handleCreateLater}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  background: surface,
                  color: text,
                  fontSize: '15px',
                  fontWeight: 600,
                  border: `1px solid ${border}`,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '19px', color: muted }}>link</span>
                <span>Create for Later</span>
              </button>
            </div>

            {/* JOIN MEETING INPUT FORM */}
            <form
              onSubmit={handleJoin}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: surface,
                padding: '6px 8px 6px 14px',
                borderRadius: '14px',
                border: `1.5px solid ${border}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                maxWidth: '460px'
              }}
            >
              <span className="material-symbols-outlined" style={{ color: muted, fontSize: '20px' }}>keyboard</span>
              <input
                ref={inputRef}
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                placeholder="Enter room code or paste link"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: text,
                  fontSize: '14.5px',
                  fontWeight: 500
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: muted,
                  background: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                  padding: '3px 7px',
                  borderRadius: '6px',
                  border: `1px solid ${border}`
                }}
              >
                ⌘K
              </span>
              <button
                type="submit"
                disabled={!meetingCode.trim()}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: meetingCode.trim() ? primary : (dark ? '#21262d' : '#e2e8f0'),
                  color: meetingCode.trim() ? '#ffffff' : muted,
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: meetingCode.trim() ? 'pointer' : 'default',
                  transition: 'all 0.2s ease'
                }}
              >
                Join
              </button>
            </form>

            {/* RECENT SESSIONS LIST */}
            {recentRooms.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recent Sessions
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {recentRooms.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => router.push(`/${r.id}`)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: surface,
                        border: `1px solid ${border}`,
                        color: text,
                        fontSize: '12.5px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#22c55e' }}>radio_button_checked</span>
                      <span>{r.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: PRE-FLIGHT HARDWARE DIAGNOSTICS & SYSTEM STATUS */}
          <div
            style={{
              background: surface,
              borderRadius: '20px',
              border: `1px solid ${border}`,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: dark ? '0 8px 30px rgba(0,0,0,0.3)' : '0 8px 30px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: text }}>Pre-Call Check</h3>
                <span style={{ fontSize: '12px', color: muted }}>Verify camera and microphone before jumping in</span>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                <span>System Ready</span>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div
              style={{
                width: '100%',
                height: '200px',
                borderRadius: '14px',
                background: dark ? '#0d1117' : '#f1f5f9',
                border: `1px solid ${border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                  display: previewCamActive ? 'block' : 'none'
                }}
              />
              {!previewCamActive && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <OrbAvatar userName={userName} size={64} />
                  <span style={{ fontSize: '13px', color: muted }}>Camera is off</span>
                </div>
              )}

              {/* OVERLAY BUTTONS */}
              <div style={{ position: 'absolute', bottom: '12px', display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={togglePreflightCam}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    background: previewCamActive ? '#22c55e' : '#ef4444',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {previewCamActive ? 'videocam' : 'videocam_off'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={togglePreflightMic}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    background: previewMicActive ? '#22c55e' : '#ef4444',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {previewMicActive ? 'mic' : 'mic_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* AUDIO LEVEL VISUALIZER */}
            {previewMicActive && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: muted }}>Mic Input Level</span>
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>{micVolume}%</span>
                </div>
                <div style={{ height: '6px', background: dark ? '#21262d' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${micVolume}%`,
                      background: micVolume > 75 ? '#eab308' : '#22c55e',
                      transition: 'width 0.1s linear'
                    }}
                  />
                </div>
              </div>
            )}

            {/* PROTOCOL METRICS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                paddingTop: '12px',
                borderTop: `1px solid ${border}`
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: muted, display: 'block' }}>Encryption</span>
                <strong style={{ fontSize: '13px', color: text }}>DTLS-SRTP</strong>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: muted, display: 'block' }}>Topology</span>
                <strong style={{ fontSize: '13px', color: text }}>LiveKit / SFU</strong>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: muted, display: 'block' }}>Audio Quality</span>
                <strong style={{ fontSize: '13px', color: text }}>Opus 48kHz</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${border}`,
          padding: '24px 28px',
          background: surface,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '13px',
          color: muted
        }}
      >
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="#" style={{ color: muted, textDecoration: 'none' }}>Documentation</a>
          <a href="#" style={{ color: muted, textDecoration: 'none' }}>System Status</a>
          <a href="#" style={{ color: muted, textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: muted, textDecoration: 'none' }}>Terms of Service</a>
        </div>

        <div>
          <span>© 2026 connectt.live · High-Fidelity Enterprise Communications</span>
        </div>
      </footer>

      {/* SHARE MODAL */}
      {showLaterModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
          onClick={() => setShowLaterModal(false)}
        >
          <div
            style={{
              width: '460px',
              maxWidth: 'calc(100vw - 32px)',
              background: surface,
              borderRadius: '20px',
              padding: '24px',
              border: `1px solid ${border}`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: text }}>
              Your Meeting is Ready
            </h3>
            <p style={{ fontSize: '13px', color: muted, margin: '0 0 16px 0' }}>
              Share this invite link with participants to let them join with zero downloads.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: dark ? '#0d1117' : '#f1f5f9',
                border: `1px solid ${border}`,
                marginBottom: '18px'
              }}
            >
              <span style={{ flex: 1, fontSize: '13px', color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {generatedLink}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  showToast('Link copied to clipboard!');
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: primary,
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Copy
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowLaterModal(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: `1px solid ${border}`,
                  color: text,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => router.push(`/${generatedLink.split('/').pop()}`)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  background: primary,
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Join Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT NAME MODAL */}
      {isEditingName && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
          onClick={() => setIsEditingName(false)}
        >
          <div
            style={{
              width: '380px',
              maxWidth: 'calc(100vw - 32px)',
              background: surface,
              borderRadius: '20px',
              padding: '24px',
              border: `1px solid ${border}`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: text }}>
              Edit Display Name
            </h3>
            <p style={{ fontSize: '13px', color: muted, margin: '0 0 16px 0' }}>
              Your name is shown to everyone in meetings you host or join.
            </p>

            <input
              autoFocus
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              placeholder="Enter your name"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: `1px solid ${border}`,
                background: dark ? '#0d1117' : '#ffffff',
                color: text,
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: '18px'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${border}`,
                  background: 'transparent',
                  color: muted,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveName}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: primary,
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: dark ? '#21262d' : '#0f172a',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '24px',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            zIndex: 1000
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#38bdf8' }}>info</span>
          <span>{toast}</span>
        </div>
      )}

      <style jsx global>{`
        .cnt-grid-hero {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 48px;
          align-items: center;
        }

        @media (max-width: 900px) {
          .cnt-grid-hero {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .cnt-hide-sm {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
