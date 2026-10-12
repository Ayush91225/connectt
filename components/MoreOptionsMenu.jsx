'use client';

import React from 'react';

export default function MoreOptionsMenu({ isOpen, onClose, onAction, showToast, theme = 'light',
  isCaptionsOn, onToggleCaptions,
  presentationMode, onToggleScreenShare,
  isActivitiesOpen, activeActivity, onOpenActivity,
  isFullscreen, onToggleFullscreen
}) {
  const isLight = theme === 'light';
  const textColor = isLight ? '#1a1814' : '#e3e3e3';
  const subColor = isLight ? '#6b6560' : '#8e918f';

  return (
    <div
      className={`m3-more-options-menu ${isOpen ? 'show' : ''} ${isLight ? 'light-theme' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── TOOLS SECTION (mobile-first quick access) ── */}
      <div style={{ padding: '8px 14px 4px', fontSize: '11px', fontWeight: 700, color: subColor, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
        Tools
      </div>

      {/* Chat */}
      <div className="m3-call-menu-item" onClick={() => { onOpenActivity('chat'); onClose(); }}>
        <span className="icon" style={{ color: '#7cacf8' }}>chat</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '14px', color: textColor }}>In-call messages</span>
          <span style={{ fontSize: '11px', color: subColor }}>Chat with everyone</span>
        </div>
      </div>

      {/* Activities */}
      <div className="m3-call-menu-item" onClick={() => { onOpenActivity(null); onClose(); }}>
        <span className="icon" style={{ color: '#89b754' }}>apps</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '14px', color: textColor }}>Activities</span>
          <span style={{ fontSize: '11px', color: subColor }}>Whiteboard, quiz, chess & more</span>
        </div>
      </div>

      {/* Present / Screen share */}
      <div className="m3-call-menu-item" onClick={() => { onToggleScreenShare(); onClose(); }}>
        <span className="icon" style={{ color: presentationMode === 'screen' ? '#ea4335' : '#a8c7fa' }}>
          {presentationMode === 'screen' ? 'stop_screen_share' : 'present_to_all'}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '14px', color: textColor }}>
            {presentationMode === 'screen' ? 'Stop presenting' : 'Present now'}
          </span>
          <span style={{ fontSize: '11px', color: subColor }}>Share your screen</span>
        </div>
      </div>

      {/* Captions */}
      <div className="m3-call-menu-item" onClick={() => { onToggleCaptions(); onClose(); }}>
        <span className="icon" style={{ color: isCaptionsOn ? '#fbbc04' : '#c4c7c5' }}>closed_caption</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '14px', color: textColor }}>
            {isCaptionsOn ? 'Turn off captions' : 'Turn on captions'}
          </span>
          <span style={{ fontSize: '11px', color: subColor }}>Live subtitles (C)</span>
        </div>
      </div>

      {/* Host Controls */}
      <div className="m3-call-menu-item" onClick={() => { onOpenActivity('host_controls'); onClose(); }}>
        <span className="icon" style={{ color: '#a8c7fa' }}>security</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '14px', color: textColor }}>Host controls</span>
          <span style={{ fontSize: '11px', color: subColor }}>Manage participants</span>
        </div>
      </div>

      <div className="m3-menu-divider" />

      {/* ── VIEW SECTION ── */}
      <div style={{ padding: '8px 14px 4px', fontSize: '11px', fontWeight: 700, color: subColor, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
        View
      </div>

      {/* Full screen */}
      <div className="m3-call-menu-item" onClick={() => { onToggleFullscreen(); onClose(); }}>
        <span className="icon">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
        <span style={{ fontSize: '14px', color: textColor }}>{isFullscreen ? 'Exit full screen' : 'Full screen'}</span>
      </div>

      {/* PiP */}
      <div className="m3-call-menu-item" onClick={() => { onAction('pip'); onClose(); }}>
        <span className="icon">picture_in_picture_alt</span>
        <span style={{ fontSize: '14px', color: textColor }}>Picture-in-picture</span>
      </div>

      <div className="m3-menu-divider" />

      {/* ── SETTINGS & HELP ── */}
      <div className="m3-call-menu-item" onClick={() => { onAction('settings'); onClose(); }}>
        <span className="icon">settings</span>
        <span style={{ fontSize: '14px', color: textColor }}>Settings</span>
      </div>

      <div className="m3-call-menu-item" onClick={() => { onOpenActivity('report'); onClose(); }}>
        <span className="icon">feedback</span>
        <span style={{ fontSize: '14px', color: textColor }}>Report a problem</span>
      </div>

    </div>
  );
}
