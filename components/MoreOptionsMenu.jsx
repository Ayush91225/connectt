'use client';

import React from 'react';

export default function MoreOptionsMenu({ isOpen, onClose, onAction, showToast, theme = 'light' }) {
  return (
    <div
      className={`m3-more-options-menu ${isOpen ? 'show' : ''} ${theme === 'light' ? 'light-theme' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top disabled item: Recording unavailable (Screenshot 1) */}
      <div className="m3-menu-item-disabled">
        <span className="icon" style={{ color: '#8e918f' }}>radio_button_checked</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '14px', color: '#c4c7c5' }}>Recording unavailable</span>
          <span style={{ fontSize: '12px', color: '#8e918f' }}>You&apos;re not allowed to record this video call</span>
        </div>
      </div>

      <div className="m3-menu-divider" />

      {/* Adjust view */}
      <div
        className="m3-call-menu-item"
        onClick={() => { onAction('adjust-view'); onClose(); }}
      >
        <span className="icon">grid_view</span>
        <span>Adjust view</span>
      </div>

      {/* Full screen */}
      <div
        className="m3-call-menu-item"
        onClick={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          onClose();
        }}
      >
        <span className="icon">fullscreen</span>
        <span>Full screen</span>
      </div>

      {/* Open picture-in-picture mode */}
      <div
        className="m3-call-menu-item"
        onClick={() => { onAction('pip'); onClose(); }}
      >
        <span className="icon">picture_in_picture_alt</span>
        <span>Open picture-in-picture mode</span>
      </div>

      {/* Backgrounds and effects */}
      <div
        className="m3-call-menu-item"
        onClick={() => { onAction('effects'); onClose(); }}
      >
        <span className="icon">auto_fix_high</span>
        <span>Backgrounds and effects</span>
      </div>

      <div className="m3-menu-divider" />

      {/* Report a problem */}
      <div
        className="m3-call-menu-item"
        onClick={() => { showToast('Feedback form opened'); onClose(); }}
      >
        <span className="icon">feedback</span>
        <span>Report a problem</span>
      </div>

      {/* Report abuse */}
      <div
        className="m3-call-menu-item"
        onClick={() => { showToast('Report submitted'); onClose(); }}
      >
        <span className="icon">report</span>
        <span>Report abuse</span>
      </div>

      {/* Troubleshooting and help */}
      <div
        className="m3-call-menu-item"
        onClick={() => { showToast('Network and hardware health: Good'); onClose(); }}
      >
        <span className="icon">troubleshoot</span>
        <span>Troubleshooting and help</span>
      </div>

      {/* Settings */}
      <div
        className="m3-call-menu-item"
        onClick={() => { onAction('settings'); onClose(); }}
      >
        <span className="icon">settings</span>
        <span>Settings</span>
      </div>
    </div>
  );
}
