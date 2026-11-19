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
  const [currentTheme, setCurrentTheme] = useState(theme);
  const isLight = currentTheme === 'light';

  const [userName, setUserName] = useState(initialName || '');
  const [nameError, setNameError] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [cameraStream, setCameraStream] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [roomInfo, setRoomInfo] = useState({ activeParticipants: [], participantCount: 0 });
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Device selectors
  const [devices, setDevices] = useState({ audioInputs: [], videoInputs: [], audioOutputs: [] });
  const [selectedAudioInput, setSelectedAudioInput] = useState('');
  const [selectedVideoInput, setSelectedVideoInput] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Load saved name from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('connectt_username');
      if (saved && saved.trim() && !userName) {
        setUserName(saved.trim());
      }
    } catch (e) {}
  }, []);

  // Fetch active room info
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

  // Enumerate hardware devices
  const updateDeviceList = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const aIn = allDevices.filter(d => d.kind === 'audioinput');
      const vIn = allDevices.filter(d => d.kind === 'videoinput');
      const aOut = allDevices.filter(d => d.kind === 'audiooutput');

      setDevices({ audioInputs: aIn, videoInputs: vIn, audioOutputs: aOut });
    } catch (e) {
      console.warn('Device enumeration error:', e);
    }
  };

  // Setup live camera & microphone stream
  const initMediaStream = async (audioId = null, videoId = null) => {
    // Stop existing preview stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }

    try {
      const constraints = {
        video: videoId ? { deviceId: { exact: videoId }, width: { ideal: 1280 }, height: { ideal: 720 } } : { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: audioId ? { deviceId: { exact: audioId } } : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraStream(stream);

      // Track selected device IDs
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      if (videoTrack?.getSettings()?.deviceId) {
        setSelectedVideoInput(videoTrack.getSettings().deviceId);
      }
      if (audioTrack?.getSettings()?.deviceId) {
        setSelectedAudioInput(audioTrack.getSettings().deviceId);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Audio Analyser
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
            setAudioLevel(Math.min(100, Math.round(avg * 1.6)));
            animFrameRef.current = requestAnimationFrame(checkLevel);
          };
          checkLevel();
        }
      } catch (e) {}

      await updateDeviceList();
    } catch (err) {
      console.warn('Lobby camera/mic access error:', err);
      setIsCameraOn(false);
    }
  };

  useEffect(() => {
    initMediaStream();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleToggleCamera = () => {
    const next = !isCameraOn;
    setIsCameraOn(next);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => (t.enabled = next));
    }
    sfx.playToggle(next);
  };

  const handleToggleMic = () => {
    const next = !isMicOn;
    setIsMicOn(next);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => (t.enabled = next));
    }
    sfx.playToggle(next);
  };

  const handleDeviceChange = (type, deviceId) => {
    if (type === 'audio') {
      setSelectedAudioInput(deviceId);
      initMediaStream(deviceId, selectedVideoInput);
    } else if (type === 'video') {
      setSelectedVideoInput(deviceId);
      initMediaStream(selectedAudioInput, deviceId);
    }
  };

  const handleCopyLink = () => {
    const link = `https://connectt.live/${meetingId}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      sfx.playReaction();
    }
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

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }

    onJoin({
      userName: cleanName,
      isCameraOn,
      isMicOn,
      presentDirectly,
      stream: streamRef.current
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
        fontFamily: "'Google Sans', Roboto, -apple-system, sans-serif",
        overflow: 'hidden'
      }}
    >
      {/* Top Header */}
      <header
        style={{
          height: '64px',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isLight ? '1px solid #e8e4de' : '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: isLight ? '#ffffff' : '#18191b',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/connectt.png" alt="connectt.live" style={{ width: '28px', height: '28px' }} />
          <span style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.3px' }}>
            connectt<span style={{ color: '#0b57d0' }}>.live</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Copy Meeting Link Pill */}
          <button
            onClick={handleCopyLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: isLight ? '#f1f3f4' : '#28292a',
              border: isLight ? '1px solid #e0e0e0' : '1px solid rgba(255, 255, 255, 0.1)',
              color: isLight ? '#1a1814' : '#ffffff',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Copy invitation link"
          >
            <span className="icon" style={{ fontSize: '16px', color: copiedLink ? '#34a853' : '#0b57d0' }}>
              {copiedLink ? 'check' : 'link'}
            </span>
            <span>{copiedLink ? 'Link copied!' : meetingId}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setCurrentTheme(isLight ? 'dark' : 'light')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: isLight ? '#f1f3f4' : '#28292a',
              border: 'none',
              color: isLight ? '#5f6368' : '#e8eaed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
          >
            <span className="icon" style={{ fontSize: '18px' }}>
              {isLight ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Lobby Area */}
      <div
        className="cnt-lobby-main-split"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 32px',
          gap: '56px',
          maxWidth: '1240px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Left: Camera Preview Tile */}
        <div
          className="cnt-lobby-camera-tile"
          style={{
            flex: '1.3',
            maxWidth: '720px',
            width: '100%',
            aspectRatio: '16 / 9',
            position: 'relative',
            borderRadius: '24px',
            backgroundColor: isLight ? '#000000' : '#202124',
            border: isLight ? '1px solid #e8e4de' : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: isLight ? '0 16px 48px rgba(0, 0, 0, 0.1)' : '0 20px 60px rgba(0, 0, 0, 0.55)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Live Video Preview */}
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

          {/* Camera Off Cloud Orb Avatar */}
          {!isCameraOn && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <OrbAvatar
                userName={userName || 'You'}
                size={170}
                isSpeaking={isMicOn && audioLevel > 15}
                isMicOn={isMicOn}
                themeVariant="cloud"
              />
            </div>
          )}

          {/* Floating Controls Bar at bottom of camera */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(0, 0, 0, 0.72)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
              zIndex: 10
            }}
          >
            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              style={{
                width: '46px',
                height: '46px',
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
              <span className="icon" style={{ fontSize: '22px' }}>
                {!isMicOn ? 'mic_off' : 'mic'}
              </span>
            </button>

            {/* Camera Toggle Button */}
            <button
              type="button"
              onClick={handleToggleCamera}
              style={{
                width: '46px',
                height: '46px',
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
              <span className="icon" style={{ fontSize: '22px' }}>
                {!isCameraOn ? 'videocam_off' : 'videocam'}
              </span>
            </button>

            {/* Mic Level Visualizer Bars */}
            {isMicOn && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '0 6px' }}>
                <span style={{ width: '3px', height: `${Math.max(4, audioLevel * 0.22)}px`, backgroundColor: '#34d399', borderRadius: '2px', transition: 'height 0.05s ease' }}></span>
                <span style={{ width: '3px', height: `${Math.max(4, audioLevel * 0.38)}px`, backgroundColor: '#34d399', borderRadius: '2px', transition: 'height 0.05s ease' }}></span>
                <span style={{ width: '3px', height: `${Math.max(4, audioLevel * 0.2)}px`, backgroundColor: '#34d399', borderRadius: '2px', transition: 'height 0.05s ease' }}></span>
              </div>
            )}

            <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(255, 255, 255, 0.2)', margin: '0 2px' }} />

            {/* Hardware Devices Settings Button */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: showSettingsModal ? '#0b57d0' : 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Audio and video device settings"
            >
              <span className="icon" style={{ fontSize: '22px' }}>settings</span>
            </button>
          </div>
        </div>

        {/* Right: Join Card */}
        <div
          className="cnt-lobby-join-card"
          style={{
            flex: '0.85',
            maxWidth: '400px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <h1 style={{ fontSize: '32px', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '-0.6px' }}>
            Ready to join?
          </h1>

          {/* Active Participants Presence */}
          <div style={{ fontSize: '14px', color: isLight ? '#5f6368' : '#9aa0a6', marginBottom: '28px', minHeight: '22px' }}>
            {isLoadingRoom ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="icon" style={{ fontSize: '16px', animation: 'spin 1s linear infinite' }}>sync</span>
                Checking room status...
              </span>
            ) : activeOthers.length === 0 ? (
              <span>No one else is here</span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="icon" style={{ fontSize: '18px', color: '#0b57d0' }}>group</span>
                <span>
                  <strong>{activeOthers[0].userName}</strong>
                  {activeOthers.length > 1 ? ` and ${activeOthers.length - 1} other(s)` : ''} in call
                </span>
              </div>
            )}
          </div>

          {/* Name Input */}
          <div style={{ marginBottom: '24px' }}>
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
              placeholder="Enter your name"
              autoFocus
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: nameError ? '2px solid #ea4335' : isLight ? '1px solid #c4c7c5' : '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: isLight ? '#ffffff' : '#1e1f20',
                color: isLight ? '#1a1814' : '#ffffff',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border 0.2s ease',
                boxShadow: isLight ? 'inset 0 1px 2px rgba(0,0,0,0.04)' : 'none'
              }}
            />
            {nameError && (
              <span style={{ display: 'block', fontSize: '12px', color: '#ea4335', marginTop: '6px' }}>
                Please enter your name before joining.
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleJoinCall(false)}
              style={{
                flex: 1,
                padding: '14px 28px',
                borderRadius: '9999px',
                backgroundColor: '#0b57d0',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(11, 87, 208, 0.35)',
                transition: 'all 0.15s ease'
              }}
            >
              Join now
            </button>

            <button
              type="button"
              onClick={() => handleJoinCall(true)}
              style={{
                padding: '14px 22px',
                borderRadius: '9999px',
                backgroundColor: 'transparent',
                color: isLight ? '#0b57d0' : '#a8c7fa',
                fontSize: '15px',
                fontWeight: 600,
                border: isLight ? '1px solid #c4c7c5' : '1px solid rgba(255, 255, 255, 0.25)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
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

      {/* Device Settings Modal */}
      {showSettingsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: isLight ? '#ffffff' : '#28292a',
              borderRadius: '20px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)',
              padding: '24px',
              border: isLight ? '1px solid #e8e4de' : '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Audio & Video Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isLight ? '#5f6368' : '#9aa0a6',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <span className="icon" style={{ fontSize: '22px' }}>close</span>
              </button>
            </div>

            {/* Microphone Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: isLight ? '#444746' : '#c4c7c5' }}>
                Microphone
              </label>
              <select
                value={selectedAudioInput}
                onChange={(e) => handleDeviceChange('audio', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: isLight ? '#f8f9fa' : '#1e1f20',
                  color: isLight ? '#1a1814' : '#ffffff',
                  border: isLight ? '1px solid #dadce0' : '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                {devices.audioInputs.length === 0 ? (
                  <option value="">Default Microphone</option>
                ) : (
                  devices.audioInputs.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Microphone ${d.deviceId.slice(0, 5)}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Camera Selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: isLight ? '#444746' : '#c4c7c5' }}>
                Camera
              </label>
              <select
                value={selectedVideoInput}
                onChange={(e) => handleDeviceChange('video', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: isLight ? '#f8f9fa' : '#1e1f20',
                  color: isLight ? '#1a1814' : '#ffffff',
                  border: isLight ? '1px solid #dadce0' : '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                {devices.videoInputs.length === 0 ? (
                  <option value="">Default Camera</option>
                ) : (
                  devices.videoInputs.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '9999px',
                  backgroundColor: '#0b57d0',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14px',
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

      <style jsx global>{`
        @media (max-width: 860px) {
          .cnt-lobby-main-split {
            flex-direction: column !important;
            gap: 24px !important;
            padding: 16px !important;
            height: auto !important;
          }
          .cnt-lobby-camera-tile {
            max-width: 100% !important;
            width: 100% !important;
            aspect-ratio: 16 / 9 !important;
            max-height: 42vh !important;
          }
          .cnt-lobby-join-card {
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
