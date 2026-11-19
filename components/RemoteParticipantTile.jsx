'use client';

import React, { useEffect, useRef, useState } from 'react';
import OrbAvatar from './OrbAvatar';
import { getAvatarAccentColor } from '../lib/avatar';

export default function RemoteParticipantTile({
  participant,
  theme = 'light',
  tileCount = 2,
  isFilmstrip = false,
  isPinned = false,
  onPin = null
}) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const isLight = theme === 'light';

  const {
    id,
    userName = 'Guest',
    isCameraOn = false,
    isMicOn = true,
    isSpeaking = false,
    isHandRaised = false,
    videoTrack = null,
    audioTrack = null,
    stream = null
  } = participant;

  const avatarAccent = getAvatarAccentColor(userName);
  const SPEAKER_BORDER = '#1a73e8';

  // Attach remote video track
  useEffect(() => {
    if (videoRef.current) {
      if (videoTrack && isCameraOn) {
        const ms = stream || new MediaStream([videoTrack]);
        if (videoRef.current.srcObject !== ms) {
          videoRef.current.srcObject = ms;
          videoRef.current.play().catch(() => {});
        }
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [videoTrack, isCameraOn, stream]);

  // Attach remote audio track
  useEffect(() => {
    if (audioRef.current && audioTrack) {
      const ms = stream || new MediaStream([audioTrack]);
      if (audioRef.current.srcObject !== ms) {
        audioRef.current.srcObject = ms;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [audioTrack, stream]);

  const orbSize = isFilmstrip ? 58 : (tileCount > 4 ? 90 : (tileCount > 2 ? 110 : 150));

  return (
    <div
      className={`call-main-tile remote-participant-tile ${isFilmstrip ? 'filmstrip-tile' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: isFilmstrip ? '110px' : (tileCount <= 2 ? '220px' : '150px'),
        maxHeight: isFilmstrip ? '160px' : 'none',
        background: !isCameraOn
          ? (isLight ? '#ffffff' : avatarAccent.tileBg)
          : '#202124',
        border: (isSpeaking && isMicOn)
          ? `2px solid ${SPEAKER_BORDER}`
          : (isPinned ? '2px solid #1a73e8' : (isLight ? '1px solid #e8e4de' : '1px solid rgba(255,255,255,0.08)')),
        boxShadow: (isSpeaking && isMicOn)
          ? '0 0 0 1px #1a73e8'
          : (isLight ? '0 2px 8px rgba(0,0,0,0.04)' : '0 4px 16px rgba(0,0,0,0.3)'),
        borderRadius: isFilmstrip ? '12px' : '16px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Remote Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: isCameraOn && videoTrack ? 'block' : 'none'
        }}
      />

      {/* Hidden audio element to playback participant audio */}
      <audio ref={audioRef} autoPlay playsInline />

      {/* Camera Off Avatar with Living Cloud Orb */}
      {(!isCameraOn || !videoTrack) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent'
          }}
        >
          <OrbAvatar
            userName={userName}
            size={orbSize}
            isSpeaking={isSpeaking && isMicOn}
            isMicOn={isMicOn}
            themeVariant="cloud"
          />
        </div>
      )}

      {/* Top Left Hand Raised Indicator */}
      {isHandRaised && (
        <div
          style={{
            position: 'absolute',
            top: isFilmstrip ? '6px' : '10px',
            left: isFilmstrip ? '6px' : '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: isFilmstrip ? '2px 6px' : '3px 8px',
            borderRadius: '20px',
            backgroundColor: '#0b57d0',
            color: '#ffffff',
            fontSize: isFilmstrip ? '10px' : '11px',
            fontWeight: 600,
            zIndex: 10
          }}
        >
          <span className="icon" style={{ fontSize: isFilmstrip ? '12px' : '14px' }}>back_hand</span>
          {!isFilmstrip && <span>Hand raised</span>}
        </div>
      )}

      {/* Top Right Mic Status Badge */}
      <div
        className={`call-tile-mic-status ${isCameraOn ? 'translucent-muted' : 'blue-muted'}`}
        style={{
          position: 'absolute',
          top: isFilmstrip ? '6px' : '10px',
          right: isFilmstrip ? '6px' : '10px',
          width: isFilmstrip ? '22px' : '28px',
          height: isFilmstrip ? '22px' : '28px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: !isMicOn
            ? '#ea4335'
            : (isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.6)'),
          color: !isMicOn
            ? '#ffffff'
            : (isLight ? '#1a1814' : '#ffffff'),
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 10
        }}
      >
        <span className="icon" style={{ fontSize: isFilmstrip ? '12px' : '15px' }}>
          {!isMicOn ? 'mic_off' : 'mic'}
        </span>
      </div>

      {/* Hover Action Overlay: Pin button */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            borderRadius: '24px',
            padding: '4px 10px',
            zIndex: 15,
            transition: 'opacity 0.15s ease'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onPin?.(id || userName)}
            title={isPinned ? 'Unpin' : 'Pin to main screen'}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px'
            }}
          >
            <span className="icon" style={{ fontSize: '18px', color: isPinned ? '#a8c7fa' : '#ffffff' }}>
              {isPinned ? 'keep_off' : 'push_pin'}
            </span>
          </button>
        </div>
      )}

      {/* Bottom Left Name Tag */}
      <div
        className="call-tile-name-tag"
        style={{
          position: 'absolute',
          bottom: isFilmstrip ? '6px' : '10px',
          left: isFilmstrip ? '6px' : '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: isFilmstrip ? '2px 8px' : '4px 10px',
          borderRadius: '20px',
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          color: isLight ? '#1a1814' : '#ffffff',
          fontSize: isFilmstrip ? '11px' : '12px',
          fontWeight: 500,
          boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.4)',
          zIndex: 10
        }}
      >
        {isSpeaking && isMicOn && (
          <span className="speaking-wave-bars">
            <span className="sw-bar" style={{ backgroundColor: POWDER_BLUE }}></span>
            <span className="sw-bar" style={{ backgroundColor: POWDER_BLUE }}></span>
            <span className="sw-bar" style={{ backgroundColor: POWDER_BLUE }}></span>
          </span>
        )}
        <span style={{ maxWidth: isFilmstrip ? '90px' : '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {userName}
        </span>
      </div>
    </div>
  );
}
