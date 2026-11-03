'use client';

import React, { useState, useEffect, useRef } from 'react';
import OrbAvatar from './OrbAvatar';
import { sfx } from '../lib/audio';

export default function MeetingLobby({
  meetingId,
  initialName = '',
  onJoin,
  theme = 'light'
}) {
  const isLight = theme === 'light';

  const [userName, setUserName] = useState(initialName || '');
  const [nameError, setNameError] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [cameraStream, setCameraStream] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [roomInfo, setRoomInfo] = useState({ activeParticipants: [], participantCount: 0 });
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Load saved name from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('connectt_username');
      if (saved && saved.trim() && !userName) {
        setUserName(saved.trim());
      }
    } catch (e) {}
  }, []);

  // Fetch room info from DynamoDB API
  useEffect(() => {
    let isMounted = true;
    async function fetchInfo() {
      try {
        const res = await fetch(`/api/room/${meetingId}/info`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setRoomInfo({
              activeParticipants: data.activeParticipants || [],
              participantCount: data.participantCount || 0
            });
            setIsLoadingRoom(false);
          }
        }
      } catch (e) {
        if (isMounted) setIsLoadingRoom(false);
      }
    }

    fetchInfo();
    const interval = setInterval(fetchInfo, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [meetingId]);

  // Request camera and microphone stream for preview
  useEffect(() => {
    let streamInstance = null;

    async function setupPreview() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        });

        streamInstance = stream;
        setCameraStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup Audio Analyser for mic test visualizer
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            audioContextRef.current = ctx;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            analyserRef.current = analyser;

            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkLevel = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round(avg * 1.5)));
              animFrameRef.current = requestAnimationFrame(checkLevel);
            };
            checkLevel();
          }
        } catch (e) {}
      } catch (err) {
        console.warn('Camera preview permission not granted:', err);
        setIsCameraOn(false);
      }
    }

    setupPreview();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamInstance) {
        streamInstance.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleToggleCamera = () => {
    const next = !isCameraOn;
    setIsCameraOn(next);
    if (cameraStream) {
      cameraStream.getVideoTracks().forEach(t => (t.enabled = next));
    }
    sfx.playToggle(next);
  };

  const handleToggleMic = () => {
    const next = !isMicOn;
    setIsMicOn(next);
    if (cameraStream) {
      cameraStream.getAudioTracks().forEach(t => (t.enabled = next));
    }
    sfx.playToggle(next);
  };

  const handleJoinCall = (presentDirectly = false) => {
    const cleanName = (userName || '').trim();
    if (!cleanName) {
      setNameError(true);
      return;
    }

    try {
      localStorage.setItem('connectt_username', cleanName);
    } catch (e) {}

    sfx.playJoin();

    // Stop preview stream before transferring to in-call stage
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }

    onJoin({
      userName: cleanName,
      isCameraOn,
      isMicOn,
      presentDirectly,
      stream: cameraStream
    });
  };

  const activeOthers = roomInfo.activeParticipants.filter(p => p.userName !== userName);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: isLight ? '#fbfbfb' : '#131314',
        color: isLight ? '#1a1814' : '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Google Sans', Roboto, sans-serif",
        overflow: 'hidden'
      }}
    >
      {/* Top Header */}
      <header
        style={{
          height: '64px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isLight ? '1px solid #e8e4de' : '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/connectt.png" alt="connectt.live" style={{ width: '28px', height: '28px' }} />
          <span style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.3px' }}>
            connectt<span style={{ color: '#0b57d0' }}>.live</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: isLight ? '#6b6560' : '#a8a39d' }}>
            Meeting code: <strong style={{ color: isLight ? '#1a1814' : '#ffffff' }}>{meetingId}</strong>
          </span>
        </div>
      </header>

      {/* Main Lobby Split Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 32px',
          gap: '48px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Left: Camera Preview Tile */}
        <div
          style={{
            flex: '1.2',
            maxWidth: '680px',
            aspectRatio: '16 / 9',
            position: 'relative',
            borderRadius: '24px',
            backgroundColor: isLight ? '#ffffff' : '#202124',
            border: isLight ? '1px solid #e8e4de' : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: isLight ? '0 12px 40px rgba(0, 0, 0, 0.08)' : '0 16px 48px rgba(0, 0, 0, 0.45)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Live Video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              display: isCameraOn ? 'block' : 'none'
            }}
          />

          {/* Camera Off Cloud Orb */}
          {!isCameraOn && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <OrbAvatar
                userName={userName || 'You'}
                size={160}
                isSpeaking={isMicOn && audioLevel > 15}
                isMicOn={isMicOn}
                themeVariant="cloud"
              />
            </div>
          )}

          {/* Bottom Floating Control Buttons */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(12px)',
              zIndex: 10
            }}
          >
            {/* Mic Toggle */}
            <button
              type="button"
              onClick={handleToggleMic}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: !isMicOn ? '#ea4335' : 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={isMicOn ? 'Turn off microphone' : 'Turn on microphone'}
            >
              <span className="icon" style={{ fontSize: '20px' }}>
                {!isMicOn ? 'mic_off' : 'mic'}
              </span>
            </button>

            {/* Camera Toggle */}
            <button
              type="button"
              onClick={handleToggleCamera}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: !isCameraOn ? '#ea4335' : 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              <span className="icon" style={{ fontSize: '20px' }}>
                {!isCameraOn ? 'videocam_off' : 'videocam'}
              </span>
            </button>

            {/* Mic Level Visualizer Bars */}
            {isMicOn && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '0 4px' }}>
                <span style={{ width: '3px', height: `${Math.max(4, audioLevel * 0.22)}px`, backgroundColor: '#34d399', borderRadius: '2px', transition: 'height 0.05s ease' }}></span>
                <span style={{ width: '3px', height: `${Math.max(4, audioLevel * 0.35)}px`, backgroundColor: '#34d399', borderRadius: '2px', transition: 'height 0.05s ease' }}></span>
                <span style={{ width: '3px', height: `${Math.max(4, audioLevel * 0.18)}px`, backgroundColor: '#34d399', borderRadius: '2px', transition: 'height 0.05s ease' }}></span>
              </div>
            )}
          </div>
        </div>

        {/* Right: "Ready to join?" Card */}
        <div
          style={{
            flex: '0.9',
            maxWidth: '380px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <h1 style={{ fontSize: '28px', fontWeight: 600, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Ready to join?
          </h1>

          {/* Participant Presence Summary */}
          <div style={{ fontSize: '14px', color: isLight ? '#5f6368' : '#9aa0a6', marginBottom: '24px', minHeight: '22px' }}>
            {isLoadingRoom ? (
              <span>Checking active participants...</span>
            ) : activeOthers.length === 0 ? (
              <span>No one else is here</span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>
                  <strong>{activeOthers[0].userName}</strong>
                  {activeOthers.length > 1 ? ` and ${activeOthers.length - 1} other(s)` : ''} in the call
                </span>
              </div>
            )}
          </div>

          {/* Name Input Field */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: isLight ? '#444746' : '#c4c7c5',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}
            >
              Your name <span style={{ color: '#ea4335' }}>*</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (nameError && e.target.value.trim()) setNameError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJoinCall(false);
              }}
              placeholder="What's your name?"
              autoFocus
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: nameError ? '2px solid #ea4335' : isLight ? '1px solid #c4c7c5' : '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: isLight ? '#ffffff' : '#1e1f20',
                color: isLight ? '#1a1814' : '#ffffff',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border 0.2s ease'
              }}
            />
            {nameError && (
              <span style={{ display: 'block', fontSize: '12px', color: '#ea4335', marginTop: '6px' }}>
                Please enter your name to join the meeting.
              </span>
            )}
          </div>

          {/* Action Buttons (Join now & Present) */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleJoinCall(false)}
              style={{
                flex: 1,
                padding: '13px 24px',
                borderRadius: '9999px',
                backgroundColor: '#0b57d0',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(11, 87, 208, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              Join now
            </button>

            <button
              type="button"
              onClick={() => handleJoinCall(true)}
              style={{
                padding: '13px 20px',
                borderRadius: '9999px',
                backgroundColor: 'transparent',
                color: isLight ? '#0b57d0' : '#a8c7fa',
                fontSize: '14px',
                fontWeight: 600,
                border: isLight ? '1px solid #c4c7c5' : '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
              title="Join and immediately share your screen"
            >
              <span className="icon" style={{ fontSize: '18px' }}>present_to_all</span>
              <span>Present</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
