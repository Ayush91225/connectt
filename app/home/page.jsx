'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { sfx } from '../../lib/audio';
import { getDiceBearAvatar } from '../../lib/avatar';
import GuruAIPanel from '../components/GuruAIPanel';

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Ayushmaan');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('Ayushmaan');
  const [meetingCode, setMeetingCode] = useState('');
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showLaterModal, setShowLaterModal] = useState(false);
  const [isGuruAIOpen, setIsGuruAIOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [toast, setToast] = useState(null);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isMac, setIsMac] = useState(true);
  const inputRef = useRef(null);

  // Load saved name
  useEffect(() => {
    try {
      const saved = localStorage.getItem('connectt_username');
      if (saved && saved.trim()) {
        setUserName(saved.trim());
        setTempName(saved.trim());
      }
    } catch (e) {}

    if (typeof window !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent));
    }
  }, []);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTimeStr(`${hours}:${mins} ${ampm}`);
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      setDateStr(now.toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cmd+K / Ctrl+K keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveName = (newName) => {
    const trimmed = (newName || tempName || userName).trim();
    if (trimmed) {
      setUserName(trimmed);
      setTempName(trimmed);
      try {
        localStorage.setItem('connectt_username', trimmed);
      } catch (e) {}
    }
    setIsEditingName(false);
    showToast(`Profile name updated to ${trimmed}`);
  };

  const handleJoin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const code = meetingCode.trim();
    if (userName.trim()) {
      try { localStorage.setItem('connectt_username', userName.trim()); } catch (err) {}
    }
    const clean = code.replace(/^(https?:\/\/)?connectt\.live\//, '').replace(/\//g, '');
    sfx.playJoin();
    if (clean) {
      router.push(`/${clean}`);
    } else {
      router.push('/sen-mvwh-cyc');
    }
  };

  const handleStartInstant = () => {
    setShowNewMenu(false);
    if (userName.trim()) {
      try { localStorage.setItem('connectt_username', userName.trim()); } catch (err) {}
    }
    sfx.playJoin();
    const randomCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    router.push(`/${randomCode}`);
  };

  const handleCreateLater = () => {
    setShowNewMenu(false);
    const randomCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    setGeneratedLink(`https://connectt.live/${randomCode}`);
    setShowLaterModal(true);
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: '#fbfbfb',
        color: '#1a1814',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
      }}
      onClick={() => {
        if (showNewMenu) setShowNewMenu(false);
      }}
    >
      {/* ─── Topbar Navigation (HomeGuruEco Style: 58px) ─── */}
      <header
        style={{
          height: '58px',
          borderBottom: '1px solid #e8e4de',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          flexShrink: 0
        }}
      >
        {/* Left: Connectt Brand & Ecosystem Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            onClick={() => router.push('/home')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <img
              src="/connectt.png"
              alt="Connectt Icon"
              style={{ height: '26px', width: 'auto', objectFit: 'contain' }}
            />
            <img
              src="/connectt1.png"
              alt="Connectt Logo"
              style={{ height: '17px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <div
            className="connectt-hide-mobile"
            style={{ height: '16px', width: '1px', backgroundColor: '#e8e4de' }}
          />

          {/* HomeGuru Brand Logo */}
          <a
            href="https://uat.homeguruworld.in"
            target="_blank"
            rel="noopener noreferrer"
            className="connectt-hide-mobile"
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            title="HomeGuru"
          >
            <img
              src="/logo.png"
              alt="HomeGuru"
              style={{ height: '20px', width: 'auto', objectFit: 'contain' }}
            />
          </a>
        </div>

        {/* Right Header Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {timeStr && (
            <span
              className="connectt-hide-mobile"
              style={{ fontSize: '12px', color: '#6b6560', fontWeight: 500, marginRight: '4px' }}
            >
              {timeStr} • {dateStr}
            </span>
          )}

          {/* Guru AI Trigger - Opens Guru AI Panel */}
          <button
            type="button"
            onClick={() => setIsGuruAIOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '8px',
              border: '1px solid #e8e4de',
              backgroundColor: isGuruAIOpen ? 'rgba(244, 129, 32, 0.08)' : '#ffffff',
              color: '#1a1814',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(244, 129, 32, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(244, 129, 32, 0.3)';
            }}
            onMouseLeave={(e) => {
              if (!isGuruAIOpen) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e8e4de';
              }
            }}
          >
            <img src="/guruai.png" alt="Guru AI" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
            <span>Guru AI</span>
          </button>

          {/* Support Link */}
          <a
            href="https://uat.homeguruworld.in/dashboard/settings?tab=support"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '5px 8px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: '#6b6560',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span className="icon" style={{ fontSize: '16px' }}>help</span>
            <span className="connectt-hide-mobile">Support</span>
          </a>

          {/* Profile User Pill */}
          <div
            onClick={() => {
              setTempName(userName);
              setIsEditingName(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '3px 8px 3px 4px',
              borderRadius: '20px',
              backgroundColor: '#ffffff',
              border: '1px solid #e8e4de',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
            title="Click to edit display name"
          >
            <img
              src={getDiceBearAvatar(userName)}
              alt={userName}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                objectFit: 'cover',
                backgroundColor: '#fbfbfb'
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1814', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName}
            </span>
          </div>
        </div>
      </header>

      {/* ─── Main Content Canvas (Minimalist, Responsive) ─── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '720px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 20px',
          boxSizing: 'border-box'
        }}
      >
        {/* Hero Heading */}
        <div style={{ textAlign: 'center', marginBottom: '32px', userSelect: 'none' }}>
          <h1
            style={{
              fontSize: 'clamp(1.85rem, 4.5vw, 2.75rem)',
              fontWeight: 700,
              color: '#1a1814',
              letterSpacing: '-0.025em',
              margin: '0 0 10px 0',
              lineHeight: 1.15
            }}
          >
            Ready when you are.
          </h1>
          <p
            style={{
              fontSize: 'clamp(13px, 2.2vw, 15px)',
              color: '#6b6560',
              margin: 0,
              fontWeight: 400,
              maxWidth: '560px',
              lineHeight: 1.5
            }}
          >
            High-fidelity interactive video meetings, collaborative whiteboard, and real-time learning.
          </p>
        </div>

        {/* Search & Meeting Action Bar */}
        <div style={{ width: '100%', position: 'relative', zIndex: 30, marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px 6px 14px',
              borderRadius: '16px',
              border: '1px solid #e8e4de',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* Input area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              <span className="icon" style={{ fontSize: '18px', color: '#a8a39d', flexShrink: 0 }}>search</span>
              <input
                ref={inputRef}
                type="text"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleJoin(e);
                }}
                placeholder="Search or enter meeting code..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#1a1814'
                }}
              />
            </div>

            {/* Right inline controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '6px' }}>
              {!meetingCode && (
                <div className="connectt-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <kbd style={{ padding: '2px 5px', fontSize: '10px', fontWeight: 600, color: '#6b6560', backgroundColor: '#f0ede8', border: '1px solid #e8e4de', borderRadius: '4px' }}>
                    {isMac ? '⌘' : 'Ctrl'}
                  </kbd>
                  <kbd style={{ padding: '2px 5px', fontSize: '10px', fontWeight: 600, color: '#6b6560', backgroundColor: '#f0ede8', border: '1px solid #e8e4de', borderRadius: '4px' }}>
                    K
                  </kbd>
                </div>
              )}

              {/* Join Button */}
              {meetingCode && (
                <button
                  type="button"
                  onClick={handleJoin}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#1a1814',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  Join
                </button>
              )}

              {/* New Meeting CTA with Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNewMenu(!showNewMenu);
                  }}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#f48120',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(244, 129, 32, 0.25)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e07114')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f48120')}
                >
                  <span style={{ whiteSpace: 'nowrap' }}>New meeting</span>
                  <span className="icon" style={{ fontSize: '16px' }}>arrow_drop_down</span>
                </button>

                {/* Dropdown Menu */}
                {showNewMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                      border: '1px solid #e8e4de',
                      width: '240px',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '6px 0',
                      zIndex: 200
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      onClick={handleStartInstant}
                      style={{
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        color: '#1a1814',
                        fontSize: '13px',
                        fontWeight: 500,
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fbfbfb')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <span className="icon" style={{ color: '#f48120', fontSize: '18px' }}>bolt</span>
                      <span>Start instant meeting</span>
                    </div>
                    <div
                      onClick={handleCreateLater}
                      style={{
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        color: '#1a1814',
                        fontSize: '13px',
                        fontWeight: 500,
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fbfbfb')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <span className="icon" style={{ color: '#f48120', fontSize: '18px' }}>link</span>
                      <span>Create meeting for later</span>
                    </div>
                    <div
                      onClick={() => {
                        setShowNewMenu(false);
                        showToast('Schedule via Google Calendar or Outlook');
                      }}
                      style={{
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        color: '#1a1814',
                        fontSize: '13px',
                        fontWeight: 500,
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fbfbfb')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <span className="icon" style={{ color: '#f48120', fontSize: '18px' }}>calendar_month</span>
                      <span>Schedule in Calendar</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Footer (Exact User Links & Copyright) ─── */}
      <footer
        style={{
          width: '100%',
          marginTop: 'auto',
          padding: '16px',
          borderTop: '1px solid #e8e4de',
          backgroundColor: '#ffffff',
          textAlign: 'center',
          flexShrink: 0
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px 18px',
            fontSize: '12px',
            color: '#6b6560'
          }}
        >
          <a
            href="https://uat.homeguruworld.in/dashboard/settings?tab=support"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            Support
          </a>
          <a
            href="https://status.homeguruworld.in/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            System status
          </a>
          <a
            href="https://homeguruworld.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            Terms of Use
          </a>
          <a
            href="https://homeguruworld.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            Privacy Policy
          </a>
          <a
            href="https://uat.homeguruworld.in/library"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            Library
          </a>
          <span style={{ color: '#6b6560', opacity: 0.65 }}>
            © 2026 HomeGuru I Private Limited
          </span>
        </div>
      </footer>

      {/* ─── Guru AI Copilot Panel (Slide-out Sidebar) ─── */}
      <GuruAIPanel
        isOpen={isGuruAIOpen}
        onClose={() => setIsGuruAIOpen(false)}
        userName={userName}
      />

      {/* ─── Create Meeting for Later Modal ─── */}
      {showLaterModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
          onClick={() => setShowLaterModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 48px rgba(0,0,0,0.18)',
              border: '1px solid #e8e4de'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#1a1814' }}>
                Here&apos;s the link to your meeting
              </h3>
              <button
                type="button"
                onClick={() => setShowLaterModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b6560',
                  cursor: 'pointer'
                }}
              >
                <span className="icon" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#6b6560', margin: '0 0 18px 0', lineHeight: 1.5 }}>
              Copy this link and send it to people that you want to meet with. Be sure to save it so that you can use it later.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: '#f5f3ef',
                border: '1px solid #e8e4de',
                marginBottom: '20px'
              }}
            >
              <span style={{ fontSize: '13px', color: '#1a1814', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {generatedLink}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  showToast('Meeting link copied to clipboard');
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e8e4de',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#f48120',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginLeft: '8px',
                  flexShrink: 0
                }}
              >
                <span className="icon" style={{ fontSize: '16px' }}>content_copy</span>
                <span>Copy</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowLaterModal(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#1a1814',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Profile Name Edit Modal ─── */}
      {isEditingName && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
          onClick={() => setIsEditingName(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '380px',
              boxShadow: '0 20px 48px rgba(0,0,0,0.18)',
              border: '1px solid #e8e4de'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 10px 0', color: '#1a1814' }}>
              Edit Your Display Name
            </h3>
            <p style={{ fontSize: '12px', color: '#6b6560', margin: '0 0 16px 0' }}>
              This name will be displayed to all participants when you join meetings.
            </p>
            <input
              type="text"
              autoFocus
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #e8e4de',
                fontSize: '14px',
                color: '#1a1814',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '20px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e8e4de',
                  backgroundColor: '#ffffff',
                  color: '#6b6560',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveName()}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#f48120',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast Notification ─── */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1a1814',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 10px 28px rgba(0,0,0,0.25)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <span className="icon" style={{ fontSize: '18px', color: '#f48120' }}>info</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
