'use client';

import React, { useEffect, useRef } from 'react';
import OrbAvatar from './OrbAvatar';
import { getAvatarAccentColor } from '../lib/avatar';

export default function RemoteParticipantTile({
  participant,
  theme = 'light',
  tileCount = 2
}) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const isLight = theme === 'light';

  const {
    id,
    userName = 'Guest',
    isCameraOn = false,
    isMicOn = true,
    isSpeaking = false,
    isHandRaised = false,
    videoTrack = null,
    audioTrack = null
  } = participant;

  const avatarAccent = getAvatarAccentColor(userName);
  const POWDER_BLUE = '#a8cded';
  const POWDER_BLUE_GLOW = 'rgba(168, 205, 237, 0.28)';

  // Attach remote video track
  useEffect(() => {
    if (videoRef.current && videoTrack && isCameraOn) {
      const ms = new MediaStream([videoTrack]);
      videoRef.current.srcObject = ms;
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [videoTrack, isCameraOn]);

  // Attach remote audio track
  useEffect(() => {
    if (audioRef.current && audioTrack) {
      const ms = new MediaStream([audioTrack]);
      audioRef.current.srcObject = ms;
    }
  }, [audioTrack]);

  const orbSize = tileCount > 2 ? 110 : 150;

  return (
    <div
      className="call-main-tile remote-participant-tile"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '220px',
        background: !isCameraOn
          ? (isLight ? '#ffffff' : avatarAccent.tileBg)
          : 'linear-gradient(135deg, #3d495a 0%, #29323f 100%)',
        border: (isSpeaking && isMicOn)
          ? `2px solid ${POWDER_BLUE}`
          : (isLight ? '1px solid #e8e4de' : '1.5px solid rgba(255,255,255,0.08)'),
        boxShadow: (isSpeaking && isMicOn)
          ? `0 0 16px ${POWDER_BLUE_GLOW}`
          : (isLight ? '0 4px 20px rgba(0,0,0,0.04)' : '0 8px 32px rgba(0,0,0,0.45)'),
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.3s ease'
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
            top: '12px',
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: '#0b57d0',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(11, 87, 208, 0.4)',
            zIndex: 10
          }}
        >
          <span>✋</span>
          <span>Hand raised</span>
        </div>
      )}

      {/* Top Right Mic Status Badge */}
      <div
        className={`call-tile-mic-status ${isCameraOn ? 'translucent-muted' : 'blue-muted'}`}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '28px',
          height: '28px',
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
        <span className="icon" style={{ fontSize: '15px' }}>
          {!isMicOn ? 'mic_off' : 'mic'}
        </span>
      </div>

      {/* Bottom Left Name Tag */}
      <div
        className="call-tile-name-tag"
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '20px',
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(8px)',
          color: isLight ? '#1a1814' : '#ffffff',
          fontSize: '12px',
          fontWeight: 500,
          zIndex: 10
        }}
      >
        <span>{userName}</span>
      </div>
    </div>
  );
}
