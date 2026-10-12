'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sfx } from '../../lib/audio';
import { getDiceBearAvatar, getAvatarAccentColor, useAvatarPalette } from '../../lib/avatar';
import MoreOptionsMenu from '../../components/MoreOptionsMenu';
import PipPlaceholder from '../../components/PipWindow';
import AudioQuickMenu from '../../components/AudioQuickMenu';
import ScreenShareStage from '../../components/ScreenShareStage';
import ActivitiesSidebar from '../../components/ActivitiesSidebar';

export default function MeetingRoomPage({ demoMode = false, overrideMeetingId = null }) {
  const params = useParams();
  const router = useRouter();
  const meetingId = overrideMeetingId || params?.meetingId || (demoMode ? 'demo-class' : 'sen-mvwh-cyc');

  // Dynamic user name
  const [userName, setUserName] = useState('You');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('connectt_username');
      if (saved && saved.trim()) setUserName(saved.trim());
    } catch (e) {}
  }, []);

  // Avatar-derived dynamic accent palette (auto-extracts live SVG stop colors with soft shade)
  const avatarAccent = useAvatarPalette(userName);

  // Dedicated Powder Blue constants for speaking detection UI (decoupled from PFP color)
  const POWDER_BLUE = '#a8cded';
  const POWDER_BLUE_GLOW = 'rgba(168, 205, 237, 0.28)';

  // Theme Mode: Light themed like the homepage by default (with Dark Mode toggle support)
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('connectt_room_theme');
      if (savedTheme) setTheme(savedTheme);
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('connectt_room_theme', nextTheme);
    } catch (e) {}
  };

  // Auto Fullscreen on Entering Meeting Room
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
      else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
  };

  // Centralized Timer State (settings in Sidebar, plays on Stage with Alarm)
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [initialTimerSeconds, setInitialTimerSeconds] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setIsAlarmRinging(true);
            sfx.startAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const stopAlarm = () => {
    setIsAlarmRinging(false);
    sfx.stopAlarm();
  };

  const startTimer = (playOnStage = true) => {
    stopAlarm();
    if (timerSeconds <= 0) {
      setTimerSeconds(initialTimerSeconds || 300);
    }
    setIsTimerRunning(true);
    if (playOnStage) {
      setPresentationMode('timer');
      setIsActivitiesOpen(false);
    }
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = (newDuration) => {
    stopAlarm();
    setIsTimerRunning(false);
    const secs = typeof newDuration === 'number' ? newDuration : (initialTimerSeconds || 300);
    setTimerSeconds(secs);
    if (typeof newDuration === 'number') {
      setInitialTimerSeconds(newDuration);
    }
  };

  const adjustTimer = (deltaSec) => {
    setTimerSeconds((prev) => Math.max(0, prev + deltaSec));
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const timerState = {
    timerSeconds,
    setTimerSeconds,
    initialTimerSeconds,
    setInitialTimerSeconds,
    isTimerRunning,
    isAlarmRinging,
    startTimer,
    pauseTimer,
    resetTimer,
    adjustTimer,
    stopAlarm,
    formatTimer
  };

  // Media states
  const [isMicOn, setIsMicOn] = useState(false);
  const isMicOnRef = useRef(isMicOn);
  useEffect(() => {
    isMicOnRef.current = isMicOn;
  }, [isMicOn]);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);


  const [screenStream, setScreenStream] = useState(null);
  const [presentationMode, setPresentationMode] = useState(null); // 'screen', 'whiteboard', 'youtube', 'slides', 'chess', 'desmos_graph', 'desmos_sci'
  const [isCaptionsOn, setIsCaptionsOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeEffect, setActiveEffect] = useState('none');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);

  // Permission states ('granted' | 'denied' | 'prompt')
  const [micPermission, setMicPermission] = useState('granted');
  const [cameraPermission, setCameraPermission] = useState('granted');
  const [permissionModalType, setPermissionModalType] = useState(null); // 'mic' | 'camera' | null
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('You');

  // Popover & Drawer states
  const [showQuickVideoBar, setShowQuickVideoBar] = useState(false);
  const [showAudioQuickMenu, setShowAudioQuickMenu] = useState(false);
  const [showMoreOptionsMenu, setShowMoreOptionsMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);
  const [activeActivity, setActiveActivity] = useState(null);

  // UI state
  const [clockStr, setClockStr] = useState('00:34');
  const [toast, setToast] = useState(null);
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  const [pipActive, setPipActive] = useState(false);
  const pipWinRef = useRef(null);
  const pipVideoRef = useRef(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);


  const handleToggleMicRef = useRef(null);
  const handleToggleCameraRef = useRef(null);
  const handleToggleScreenShareRef = useRef(null);
  const handleEndCallRef = useRef(null);

  // Keep pip video in sync with camera stream
  useEffect(() => {
    if (!pipActive || !pipVideoRef.current) return;
    if (cameraStream && isCameraOn) {
      pipVideoRef.current.srcObject = cameraStream;
      pipVideoRef.current.play().catch(() => {});
    } else {
      pipVideoRef.current.srcObject = null;
    }
  }, [pipActive, cameraStream, isCameraOn]);

  // Sync pip button states + avatar visibility
  useEffect(() => {
    const win = pipWinRef.current;
    if (!pipActive || !win || win.closed) return;
    const doc = win.document;
    const btnMic = doc.querySelector('.pip-btn-mic');
    const btnCam = doc.querySelector('.pip-btn-cam');
    const btnPresent = doc.querySelector('.pip-btn-present');
    const badge = doc.querySelector('.pip-mic-badge');
    const avatarDiv = doc.querySelector('.pip-cam-off-avatar');
    const pipVid = doc.querySelector('.pip-video-el');
    if (btnMic) {
      btnMic.className = `pip-btn pip-btn-mic${isMicOn ? '' : ' pip-btn-off'}`;
      const ic = btnMic.querySelector('.icon'); if (ic) ic.textContent = isMicOn ? 'mic' : 'mic_off';
    }
    if (badge) {
      badge.className = `pip-mic-badge${isMicOn ? '' : ' muted'}`;
      const ic = badge.querySelector('.icon'); if (ic) ic.textContent = isMicOn ? 'mic' : 'mic_off';
    }
    if (btnCam) {
      btnCam.className = `pip-btn pip-btn-cam${isCameraOn ? '' : ' pip-btn-off'}`;
      const ic = btnCam.querySelector('.icon'); if (ic) ic.textContent = isCameraOn ? 'videocam' : 'videocam_off';
    }
    if (btnPresent) btnPresent.className = `pip-btn pip-btn-present${presentationMode === 'screen' ? ' pip-btn-active' : ''}`;
    if (pipVid) pipVid.style.display = isCameraOn ? 'block' : 'none';
    if (avatarDiv) avatarDiv.style.display = isCameraOn ? 'none' : 'flex';
  }, [pipActive, isMicOn, isCameraOn, presentationMode]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setClockStr(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // WebRTC Setup & Permission Detection
  const initMedia = async () => {
    // Check permission status if API available
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      try {
        const micQ = await navigator.permissions.query({ name: 'microphone' });
        setMicPermission(micQ.state);
        micQ.onchange = () => setMicPermission(micQ.state);
      } catch (e) {}
      try {
        const camQ = await navigator.permissions.query({ name: 'camera' });
        setCameraPermission(camQ.state);
        camQ.onchange = () => setCameraPermission(camQ.state);
      } catch (e) {}
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true
      });
      streamRef.current = stream;
      setCameraStream(stream);
      setMicPermission('granted');
      setCameraPermission('granted');
      stream.getAudioTracks().forEach(t => (t.enabled = false));
      stream.getVideoTracks().forEach(t => (t.enabled = false));

      // Audio analysis for volume halo
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let decayTimer = null;
        const checkAudioVolume = () => {
          if (!isMicOnRef.current) {
            if (isSpeakingRef.current) {
              isSpeakingRef.current = false;
              setIsSpeaking(false);
            }
          } else {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            if (avg > 14) {
              if (decayTimer) {
                clearTimeout(decayTimer);
                decayTimer = null;
              }
              if (!isSpeakingRef.current) {
                isSpeakingRef.current = true;
                setIsSpeaking(true);
              }
            } else if (isSpeakingRef.current && !decayTimer) {
              decayTimer = setTimeout(() => {
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                decayTimer = null;
              }, 400);
            }
          }
          requestAnimationFrame(checkAudioVolume);
        };
        requestAnimationFrame(checkAudioVolume);
      }
    } catch (e) {
      console.warn('Webcam or microphone not accessible', e);
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setMicPermission('denied');
        setCameraPermission('denied');
      }
    }
  };

  useEffect(() => {
    initMedia();

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Connect local camera stream to main video element when camera is on
  useEffect(() => {
    if (videoRef.current) {
      if (cameraStream && isCameraOn) {
        if (videoRef.current.srcObject !== cameraStream) {
          videoRef.current.srcObject = cameraStream;
        }
        cameraStream.getVideoTracks().forEach(t => (t.enabled = true));
      } else if (!isCameraOn && videoRef.current.srcObject) {
        videoRef.current.srcObject = null;
      }
    }
  }, [cameraStream, isCameraOn, presentationMode]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleToggleMic();
      }
      if (isMod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleToggleCamera();
      }
      if (e.key.toLowerCase() === 'c' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        handleToggleCaptions();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMicOn, isCameraOn, isCaptionsOn]);

  // Toggle Mic
  const handleToggleMic = () => {
    if (micPermission === 'denied') {
      setPermissionModalType('mic');
      return;
    }
    const next = !isMicOn;
    setIsMicOn(next);
    isMicOnRef.current = next;
    if (cameraStream) {
      cameraStream.getAudioTracks().forEach(t => (t.enabled = next));
    }
    if (next && audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }
    sfx.playToggle(next);
    showToast(next ? 'Microphone on' : 'Microphone off');
  };
  handleToggleMicRef.current = handleToggleMic;

  // Toggle Camera
  const handleToggleCamera = () => {
    if (cameraPermission === 'denied') {
      setPermissionModalType('camera');
      return;
    }
    const next = !isCameraOn;
    setIsCameraOn(next);
    if (cameraStream) {
      cameraStream.getVideoTracks().forEach(t => (t.enabled = next));
      if (next && videoRef.current) {
        videoRef.current.srcObject = cameraStream;
      }
    }
    sfx.playToggle(next);
    showToast(next ? 'Camera on' : 'Camera off');
  };
  handleToggleCameraRef.current = handleToggleCamera;

  // Real Screen Share toggle
  const handleToggleScreenShare = async () => {
    if (presentationMode !== 'screen') {
      try {
        const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        setScreenStream(display);
        setPresentationMode('screen');
        display.getVideoTracks()[0].onended = () => {
          setPresentationMode(null);
          setScreenStream(null);
          if (cameraStream && isCameraOn) {
            cameraStream.getVideoTracks().forEach(t => (t.enabled = true));
            if (videoRef.current) videoRef.current.srcObject = cameraStream;
          }
          showToast('You stopped presenting');
        };
        showToast('You are presenting to everyone');
      } catch (err) {
        showToast('Screen share cancelled');
      }
    } else {
      if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
        setScreenStream(null);
      }
      setPresentationMode(null);
      if (cameraStream && isCameraOn) {
        cameraStream.getVideoTracks().forEach(t => (t.enabled = true));
        if (videoRef.current) videoRef.current.srcObject = cameraStream;
      }
      showToast('You stopped presenting');
    }
  };
  handleToggleScreenShareRef.current = handleToggleScreenShare;

  // Start Stage presentation from sidebar tools (Whiteboard, YouTube, Slides, Chess, Desmos, Flashcards)
  const handleStartStageSharing = (mode) => {
    setPresentationMode(mode);
    setIsActivitiesOpen(false);
    showToast(`Presenting ${mode} on main screen`);
  };

  // Stop any active stage presentation
  const handleStopPresenting = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);
    }
    setPresentationMode(null);
    if (cameraStream && isCameraOn) {
      cameraStream.getVideoTracks().forEach(t => (t.enabled = true));
      if (videoRef.current) videoRef.current.srcObject = cameraStream;
    }
    showToast('You stopped presenting');
  };

  // Send Reaction
  const handleSendReaction = (emoji) => {
    sfx.playReaction();
    const newR = {
      id: Date.now() + Math.random(),
      emoji,
      driftX: (Math.random() - 0.5) * 90,
      sender: userName
    };
    setFloatingEmojis(prev => [...prev, newR]);
    setShowReactions(false);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(r => r.id !== newR.id));
    }, 2500);
  };

  // Hand raise
  const handleToggleHand = () => {
    const next = !isHandRaised;
    setIsHandRaised(next);
    sfx.playHandRaise();
    showToast(next ? 'You raised your hand' : 'You lowered your hand');
  };

  // Captions
  const handleToggleCaptions = () => {
    const next = !isCaptionsOn;
    setIsCaptionsOn(next);
    showToast(next ? 'Captions turned on' : 'Captions turned off');
  };

  // Leave Call Trigger
  const handleEndCall = () => {
    setIsLeaveModalOpen(true);
  };
  handleEndCallRef.current = handleEndCall;

  const confirmLeaveCall = () => {
    sfx.playLeave();
    router.push('/home');
  };

  return (
    <div
      className={`call-container ${theme === 'light' ? 'light-theme' : ''}`}
      style={{ height: '100dvh', overflow: 'hidden' }}
      onClick={() => {
        if (showMoreOptionsMenu) setShowMoreOptionsMenu(false);
        if (showAudioQuickMenu) setShowAudioQuickMenu(false);
        if (showQuickVideoBar) setShowQuickVideoBar(false);
      }}
    >
      {/* Top Header */}
      <header className="call-top-header" style={{ flexShrink: 0 }}>
        <div className="call-info-left">
          {/* connectt.live Branding with Adaptive Colors in Room */}
          <div
            onClick={() => router.push('/home')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginRight: '6px' }}
            title="connectt.live Home"
          >
            <img
              src="/connectt.png"
              alt="connectt.live icon"
              style={{ height: '26px', width: 'auto', objectFit: 'contain', filter: theme === 'light' ? 'none' : 'invert(1)' }}
            />
            <img
              src="/connectt1.png"
              alt="connectt.live"
              style={{ height: '18px', width: 'auto', objectFit: 'contain', filter: theme === 'light' ? 'none' : 'invert(1)' }}
            />
          </div>

          <span className="connectt-hide-mobile" style={{ color: '#727775' }}>|</span>
          <span className="connectt-hide-mobile" style={{ color: theme === 'light' ? '#6b6560' : '#e3e3e3' }}>{clockStr}</span>
          <span className="connectt-hide-mobile" style={{ color: '#727775' }}>|</span>

          <span
            className="call-code-badge"
            data-tooltip="Copy meeting link"
            onClick={() => {
              navigator.clipboard.writeText(`https://connectt.live/${meetingId}`);
              showToast('Meeting link copied to clipboard');
            }}
          >
            {meetingId}
          </span>

          <span
            className="icon connectt-hide-mobile"
            style={{ fontSize: '18px', color: theme === 'light' ? '#6b6560' : '#c4c7c5', cursor: 'pointer' }}
            data-tooltip="Meeting details"
            onClick={() => {
              setIsActivitiesOpen(true);
              setActiveActivity('notes');
            }}
          >
            info
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Always-on Recording Badge */}
          <div className="call-recording-pill" data-tooltip="Meeting is being recorded (Always on)">
            <span className="rec-pulse-dot"></span>
            <span>REC</span>
          </div>

          <div className="call-device-counter connectt-hide-mobile" data-tooltip="Participants">
            <span className="icon" style={{ fontSize: '16px' }}>laptop</span>
            <span>{presentationMode ? 2 : 1}</span>
          </div>

          {/* Theme Toggle Button (Light / Dark Mode) */}
          <button
            type="button"
            onClick={toggleTheme}
            data-tooltip={theme === 'light' ? 'Switch to Dark theme' : 'Switch to Light theme'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme === 'light' ? '#f0ede8' : 'rgba(255, 255, 255, 0.08)',
              border: theme === 'light' ? '1px solid #e8e4de' : '1px solid rgba(255, 255, 255, 0.12)',
              color: theme === 'light' ? '#1a1814' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span className="icon" style={{ fontSize: '18px' }}>
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          {/* User Profile Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px 4px 6px',
              borderRadius: '20px',
              backgroundColor: theme === 'light' ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
              border: theme === 'light' ? '1px solid #e8e4de' : `1px solid ${avatarAccent.primary}66`,
              transition: 'all 0.2s ease'
            }}
          >
            <img
              src={getDiceBearAvatar(userName)}
              alt={userName}
              style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span className="connectt-hide-mobile" style={{ fontSize: '12px', fontWeight: 500, color: theme === 'light' ? '#1a1814' : '#ffffff' }}>
              {userName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Video or Stage Presentation */}
      <div
        className="call-stage-area"
        style={{
          background: (!isCameraOn && !presentationMode)
            ? (theme === 'light' ? '#fbfbfb' : avatarAccent.stageBg)
            : undefined,
          transition: 'background 0.4s ease',
          minWidth: 0,
          minHeight: 0
        }}
      >

        {presentationMode ? (
          /* Multi-Mode Presentation Stage (Screen Share, Excalidraw, YouTube, Slides, Chess, Desmos, Quiz, Timer) */
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ScreenShareStage
            theme={theme}
            mode={presentationMode}
            userName={userName}
            isCameraOn={isCameraOn}
            isMicOn={isMicOn}
            cameraStream={cameraStream}
            screenStream={screenStream}
            onStopPresenting={handleStopPresenting}
            timerState={timerState}
            onOpenSidebarSettings={() => {
              setIsActivitiesOpen(true);
              setActiveActivity('timer');
            }}
          />
          </div>
        ) : (
          <div className="call-video-grid-flex">
            {/* Main Video Tile with Avatar Accent */}
            <div
              className="call-main-tile"
              style={{
                background: !isCameraOn
                  ? (theme === 'light' ? '#ffffff' : avatarAccent.tileBg)
                  : 'linear-gradient(135deg, #4f5d71 0%, #3a4556 100%)',
                filter: activeEffect === 'blur' ? 'blur(12px)' : 'none',
                border: (isSpeaking && isMicOn)
                  ? `2px solid ${POWDER_BLUE}`
                  : (theme === 'light' ? '1px solid #e8e4de' : '1.5px solid rgba(255,255,255,0.08)'),
                boxShadow: (isSpeaking && isMicOn)
                  ? `0 0 16px ${POWDER_BLUE_GLOW}`
                  : (theme === 'light' ? '0 4px 20px rgba(0,0,0,0.04)' : '0 8px 32px rgba(0,0,0,0.45)'),
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.3s ease'
              }}
            >
              {/* Hand Raised Tile Badge (Google Meet style) */}
              {isHandRaised && (
                <div className="call-tile-raised-hand-badge" title="Hand raised (Queue #1)">
                  <span>✋</span>
                  <span>1</span>
                </div>
              )}

              {/* Live Camera Stream */}
              <div id="pip-video-slot" style={{ position: 'absolute', inset: 0 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    display: isCameraOn ? 'block' : 'none',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Camera Off Avatar */}
              {!isCameraOn && (
                <div className="call-camera-off-avatar" style={{ overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={getDiceBearAvatar(userName)}
                    alt={userName}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: theme === 'light' ? `3px solid #e8e4de` : `2px solid ${avatarAccent.primary}99`,
                      boxShadow: theme === 'light' ? `0 4px 24px rgba(0,0,0,0.06)` : `0 0 24px ${avatarAccent.glowSoft}`,
                      backgroundColor: theme === 'light' ? '#f5f3ef' : '#161719',
                      transition: 'border 0.3s ease, box-shadow 0.3s ease'
                    }}
                  />
                </div>
              )}

              {/* Top Right Mic Status Badge */}
              <div
                className={`call-tile-mic-status ${isCameraOn ? 'translucent-muted' : 'blue-muted'}`}
                style={{
                  backgroundColor: !isMicOn
                    ? '#ea4335'
                    : (theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.6)'),
                  color: !isMicOn
                    ? '#ffffff'
                    : (theme === 'light' ? '#1a1814' : '#ffffff'),
                  border: theme === 'light' ? '1px solid #e8e4de' : 'none',
                  boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                <span className="icon" style={{ fontSize: '18px' }}>
                  {isMicOn ? 'mic' : 'mic_off'}
                </span>
              </div>

              {/* Bottom Left Dynamic Name Tag with Powder Blue Speaking Bars */}
              <div
                className="call-tile-name-tag"
                style={{
                  backgroundColor: 'transparent',
                  color: theme === 'light' ? '#1a1814' : undefined,
                  border: 'none',
                  boxShadow: 'none'
                }}
              >
                {isSpeaking && isMicOn && (
                  <span className="speaking-wave-bars">
                    <span className="sw-bar" style={{ backgroundColor: POWDER_BLUE }}></span>
                    <span className="sw-bar" style={{ backgroundColor: POWDER_BLUE }}></span>
                    <span className="sw-bar" style={{ backgroundColor: POWDER_BLUE }}></span>
                  </span>
                )}
                <span>{userName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Authentic Google Meet Activities Sidebar */}
        <ActivitiesSidebar
          theme={theme}
          isOpen={isActivitiesOpen}
          onClose={() => setIsActivitiesOpen(false)}
          activeActivity={activeActivity}
          onSelectActivity={setActiveActivity}
          userName={userName}
          onStartStageSharing={handleStartStageSharing}
          isScreenSharing={presentationMode === 'screen'}
          presentationMode={presentationMode}
          timerState={timerState}
        />
      </div>

      {/* Quick Camera Settings Pill Bar */}
      <div
        className={`quick-media-pill-bar ${showQuickVideoBar ? 'show' : ''} ${theme === 'light' ? 'light-theme' : ''}`}
        style={{ left: '46%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="quick-cam-device-select"
          onClick={() => showToast('FaceTime HD Camera (Built-in) selected')}
        >
          <span className="icon" style={{ fontSize: '18px' }}>videocam</span>
          <span>FaceTime HD Camera (Built-in)</span>
          <span className="icon" style={{ fontSize: '16px' }}>expand_more</span>
        </div>
        <button
          className="quick-text-btn"
          onClick={() => {
            const next = activeEffect === 'blur' ? 'none' : 'blur';
            setActiveEffect(next);
            showToast(next === 'blur' ? 'Background blur enabled' : 'Background blur removed');
            setShowQuickVideoBar(false);
          }}
        >
          <span className="icon" style={{ fontSize: '18px' }}>blur_on</span>
          <span>Blur background</span>
        </button>
        <button
          className="quick-text-btn"
          onClick={() => {
            setIsActivitiesOpen(true);
            setActiveActivity('settings');
            setShowQuickVideoBar(false);
          }}
        >
          <span>Backgrounds and effects</span>
        </button>
        <button
          className="home-icon-btn"
          style={{ width: '32px', height: '32px', color: theme === 'light' ? '#6b6560' : '#c4c7c5' }}
          data-tooltip="Settings"
          onClick={() => {
            setIsActivitiesOpen(true);
            setActiveActivity('settings');
            setShowQuickVideoBar(false);
          }}
        >
          <span className="icon" style={{ fontSize: '18px' }}>settings</span>
        </button>
      </div>

      {/* Quick Audio Settings Pill Bar (Matching Camera Menu) */}
      <AudioQuickMenu
        theme={theme}
        isOpen={showAudioQuickMenu}
        onClose={() => setShowAudioQuickMenu(false)}
        isMicOn={isMicOn}
        onToggleMic={handleToggleMic}
        onOpenSettings={() => {
          setIsActivitiesOpen(true);
          setActiveActivity('settings');
        }}
        showToast={showToast}
      />

      {/* More Options Popover Menu */}
      <MoreOptionsMenu
        theme={theme}
        isOpen={showMoreOptionsMenu}
        onClose={() => setShowMoreOptionsMenu(false)}
        isCaptionsOn={isCaptionsOn}
        onToggleCaptions={handleToggleCaptions}
        presentationMode={presentationMode}
        onToggleScreenShare={handleToggleScreenShare}
        isActivitiesOpen={isActivitiesOpen}
        activeActivity={activeActivity}
        onOpenActivity={(activity) => {
          setIsActivitiesOpen(true);
          setActiveActivity(activity);
        }}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onAction={(act) => {
          if (act === 'pip') {
            if (pipActive) { pipWinRef.current?.close(); return; }
            if (!window.documentPictureInPicture) {
              showToast('Document PiP not supported — try Chrome 116+');
              return;
            }
            window.documentPictureInPicture.requestWindow({ width: 280, height: 380 })
              .then((win) => {
                pipWinRef.current = win;

                // Copy stylesheets
                [...document.styleSheets].forEach((sheet) => {
                  try {
                    const style = win.document.createElement('style');
                    style.textContent = [...sheet.cssRules].map(r => r.cssText).join('\n');
                    win.document.head.appendChild(style);
                  } catch (e) {}
                });
                [...document.querySelectorAll('link[rel="stylesheet"]')].forEach((link) => {
                  const clone = win.document.createElement('link');
                  clone.rel = 'stylesheet'; clone.href = link.href;
                  win.document.head.appendChild(clone);
                });
                win.document.body.style.cssText = 'margin:0;padding:0;overflow:hidden;';

                // Inject pip-specific override sheet LAST — wins over all copied light-theme rules
                const pipOverride = win.document.createElement('style');
                pipOverride.textContent = `
                  *, *::before, *::after { box-sizing: border-box; }
                  html, body {
                    margin: 0 !important; padding: 0 !important;
                    background: #0e0f10 !important;
                    color: #ffffff !important;
                    overflow: hidden !important;
                    font-family: 'Google Sans', Roboto, Arial, sans-serif !important;
                  }
                  .pip-video-container {
                    width: 100vw !important; height: 100vh !important;
                    position: relative !important; background: #0e0f10 !important;
                    overflow: hidden !important;
                  }
                  .pip-overlay-controls { display: flex !important; }
                  .call-container, .call-container.light-theme { all: unset !important; }
                `;
                win.document.head.appendChild(pipOverride);

                // Build pip UI directly in pip window — never touch main React DOM
                win.document.body.innerHTML = `
                  <div class="pip-video-container">
                    <video class="pip-video-el" autoplay playsinline muted
                      style="width:100%;height:100%;object-fit:cover;transform:scaleX(-1);display:${isCameraOn ? 'block' : 'none'}"></video>
                    <div class="pip-cam-off-avatar" style="display:${isCameraOn ? 'none' : 'flex'}">
                      <img src="${getDiceBearAvatar(userName)}" alt="${userName}" class="pip-cam-off-img" />
                    </div>
                    <div class="pip-overlay-controls" style="display:flex">
                      <div class="pip-overlay-name-row">
                        <div class="pip-mic-badge${isMicOn ? '' : ' muted'}"><span class="icon" style="font-size:13px">${isMicOn ? 'mic' : 'mic_off'}</span></div>
                        <span class="pip-name">${userName}</span>
                      </div>
                      <nav class="pip-overlay-nav">
                        <button class="pip-btn pip-btn-mic${isMicOn ? '' : ' pip-btn-off'}"><span class="icon">${ isMicOn ? 'mic' : 'mic_off'}</span></button>
                        <button class="pip-btn pip-btn-cam${isCameraOn ? '' : ' pip-btn-off'}"><span class="icon">${isCameraOn ? 'videocam' : 'videocam_off'}</span></button>
                        <button class="pip-btn pip-btn-present${presentationMode === 'screen' ? ' pip-btn-active' : ''}"><span class="icon">present_to_all</span></button>
                        <button class="pip-btn-leave"><span class="icon" style="transform:scaleX(-1)">call_end</span></button>
                      </nav>
                    </div>
                  </div>`;

                // Wire the pip video element
                const pipVid = win.document.querySelector('.pip-video-el');
                pipVideoRef.current = pipVid;
                if (pipVid && cameraStream && isCameraOn) {
                  pipVid.srcObject = cameraStream;
                  pipVid.play().catch(() => {});
                }

                // Wire buttons via refs
                win.document.querySelector('.pip-btn-mic')?.addEventListener('click', () => handleToggleMicRef.current?.());
                win.document.querySelector('.pip-btn-cam')?.addEventListener('click', () => handleToggleCameraRef.current?.());
                win.document.querySelector('.pip-btn-present')?.addEventListener('click', () => handleToggleScreenShareRef.current?.());
                win.document.querySelector('.pip-btn-leave')?.addEventListener('click', () => handleEndCallRef.current?.());

                setPipActive(true);
                win.addEventListener('pagehide', () => {
                  pipVideoRef.current = null;
                  setPipActive(false);
                  pipWinRef.current = null;
                });
                showToast('Your call is in another window');
              })
              .catch(() => showToast('PiP not supported in this browser'));
          } else if (act === 'effects') {
            setIsActivitiesOpen(true);
            setActiveActivity('settings');
          } else if (act === 'settings') {
            setIsActivitiesOpen(true);
            setActiveActivity('settings');
          }
        }}
        showToast={showToast}
      />

      {/* Floating Reactions Display */}
      {floatingEmojis.map((r) => (
        <div
          key={r.id}
          className="floating-reaction-particle"
          style={{
            left: '50%',
            bottom: '100px',
            '--drift-x': `${r.driftX}px`
          }}
        >
          <div className="reaction-bubble">
            <span className="emoji">{r.emoji}</span>
            <span className="reaction-sender">{r.sender}</span>
          </div>
        </div>
      ))}

      {/* Emoji Reactions Picker Bar */}
      <div
        className={`gm-reactions-popup ${showReactions ? 'show' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {['💖', '👍', '🎉', '👏', '😂', '😮', '😢', '🤔', '👎'].map((emoji) => (
          <button
            key={emoji}
            className="gm-emoji-item-btn"
            onClick={() => handleSendReaction(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Floating Raised Hand Banner */}
      {isHandRaised && (
        <div className="call-hand-raised-banner">
          <span style={{ fontSize: '18px' }}>✋</span>
          <span className="hand-text">You raised your hand</span>
          <button
            className="hand-lower-btn"
            onClick={() => {
              setIsHandRaised(false);
              sfx.playHandRaise();
              showToast('You lowered your hand');
            }}
          >
            Lower hand
          </button>
        </div>
      )}

      {/* Floating Bottom Bar */}
      <footer className="call-dock-row" style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>

        {/* RIGHT PILL — hidden on mobile (those actions move into MoreOptionsMenu) */}
        <div className="call-right-action-pill call-hide-mobile">
          <button
            className={`call-right-pill-btn ${isActivitiesOpen && activeActivity === 'chat' ? 'active' : ''}`}
            data-tooltip="Chat with everyone"
            onClick={() => {
              if (isActivitiesOpen && activeActivity === 'chat') { setIsActivitiesOpen(false); setActiveActivity(null); }
              else { setIsActivitiesOpen(true); setActiveActivity('chat'); }
            }}
          ><span className="icon">chat</span></button>

          <button
            className={`call-right-pill-btn ${isActivitiesOpen && activeActivity !== 'chat' && activeActivity !== 'host_controls' ? 'active' : ''}`}
            data-tooltip="Activities"
            onClick={() => {
              if (isActivitiesOpen && activeActivity !== 'chat' && activeActivity !== 'host_controls') { setIsActivitiesOpen(false); setActiveActivity(null); }
              else { setIsActivitiesOpen(true); setActiveActivity(null); }
            }}
          ><span className="icon">apps</span></button>

          <button
            className={`call-right-pill-btn ${isActivitiesOpen && activeActivity === 'host_controls' ? 'active' : ''}`}
            data-tooltip="Host controls"
            onClick={() => {
              if (isActivitiesOpen && activeActivity === 'host_controls') { setIsActivitiesOpen(false); setActiveActivity(null); }
              else { setIsActivitiesOpen(true); setActiveActivity('host_controls'); }
            }}
          ><span className="icon">security</span></button>

          <button
            className={`call-right-pill-btn ${isFullscreen ? 'active' : ''}`}
            data-tooltip={isFullscreen ? 'Exit full screen' : 'Full screen'}
            onClick={toggleFullscreen}
          ><span className="icon">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span></button>
        </div>

        {/* CENTER DOCK — on mobile this is the ONLY row, matching Google Meet mobile */}
        <div className="call-floating-dock">

          {/* Mic (split: ^ + mic button) */}
          <div className="call-split-dock-group">
            <button
              className="call-split-chevron"
              onClick={() => { setShowAudioQuickMenu(!showAudioQuickMenu); setShowMoreOptionsMenu(false); setShowQuickVideoBar(false); }}
              title="Microphone settings"
            ><span className="icon">keyboard_arrow_up</span></button>
            <button
              className="call-dock-circle-btn"
              data-tooltip={isMicOn ? 'Turn off microphone (⌘+D)' : 'Turn on microphone (⌘+D)'}
              onClick={handleToggleMic}
            >
              <span className="icon">{isMicOn ? 'mic' : 'mic_off'}</span>
              {micPermission === 'denied' && (
                <span className="call-alert-exclamation-dot" onClick={(e) => { e.stopPropagation(); setPermissionModalType('mic'); }}>!</span>
              )}
            </button>
          </div>

          {/* Camera (split: ^ + cam button) */}
          <div className="call-split-dock-group">
            <button
              className="call-split-chevron"
              onClick={() => { setShowQuickVideoBar(!showQuickVideoBar); setShowAudioQuickMenu(false); setShowMoreOptionsMenu(false); }}
              title="Camera options"
            ><span className="icon">keyboard_arrow_up</span></button>
            <button
              className="call-dock-circle-btn"
              data-tooltip={isCameraOn ? 'Turn off camera (⌘+E)' : 'Turn on camera (⌘+E)'}
              onClick={handleToggleCamera}
            >
              <span className="icon">{isCameraOn ? 'videocam' : 'videocam_off'}</span>
              {cameraPermission === 'denied' && (
                <span className="call-alert-exclamation-dot" onClick={(e) => { e.stopPropagation(); setPermissionModalType('camera'); }}>!</span>
              )}
            </button>
          </div>

          {/* Present — desktop only */}
          <button
            className={`call-dock-circle-btn call-hide-mobile ${presentationMode === 'screen' ? 'active-blue' : ''}`}
            data-tooltip={presentationMode === 'screen' ? 'Stop presenting' : 'Present now'}
            onClick={handleToggleScreenShare}
          ><span className="icon">present_to_all</span></button>

          {/* Reactions */}
          <button
            className="call-dock-circle-btn"
            data-tooltip="Send a reaction"
            onClick={() => setShowReactions(!showReactions)}
          ><span className="icon">sentiment_satisfied</span></button>

          {/* Captions — desktop only */}
          <button
            className={`call-dock-circle-btn call-hide-mobile ${isCaptionsOn ? 'active-blue' : ''}`}
            data-tooltip="Turn on captions (c)"
            onClick={handleToggleCaptions}
          ><span className="icon">closed_caption</span></button>

          {/* Raise Hand */}
          <button
            className={`call-dock-circle-btn ${isHandRaised ? 'active-blue' : ''}`}
            data-tooltip="Raise hand"
            onClick={handleToggleHand}
          ><span className="icon">back_hand</span></button>

          {/* More options — always visible, on mobile contains all hidden tools */}
          <div style={{ position: 'relative' }}>
            <button
              className={`call-dock-circle-btn ${showMoreOptionsMenu ? 'active-blue' : ''}`}
              data-tooltip="More options"
              onClick={() => { setShowMoreOptionsMenu(!showMoreOptionsMenu); setShowAudioQuickMenu(false); setShowQuickVideoBar(false); }}
            ><span className="icon">more_vert</span></button>
            <MoreOptionsMenu
              theme={theme}
              isOpen={showMoreOptionsMenu}
              onClose={() => setShowMoreOptionsMenu(false)}
              isCaptionsOn={isCaptionsOn}
              onToggleCaptions={handleToggleCaptions}
              presentationMode={presentationMode}
              onToggleScreenShare={handleToggleScreenShare}
              isActivitiesOpen={isActivitiesOpen}
              activeActivity={activeActivity}
              onOpenActivity={(activity) => {
                setIsActivitiesOpen(true);
                setActiveActivity(activity);
              }}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              onAction={(act) => {
                if (act === 'pip') {
                  if (pipActive) { pipWinRef.current?.close(); return; }
                  if (!window.documentPictureInPicture) {
                    showToast('Document PiP not supported — try Chrome 116+');
                    return;
                  }
                  window.documentPictureInPicture.requestWindow({ width: 280, height: 380 })
                    .then((win) => {
                      pipWinRef.current = win;
                      [...document.styleSheets].forEach((sheet) => {
                        try {
                          const style = win.document.createElement('style');
                          style.textContent = [...sheet.cssRules].map(r => r.cssText).join('\n');
                          win.document.head.appendChild(style);
                        } catch (e) {}
                      });
                      [...document.querySelectorAll('link[rel="stylesheet"]')].forEach((link) => {
                        const clone = win.document.createElement('link');
                        clone.rel = 'stylesheet'; clone.href = link.href;
                        win.document.head.appendChild(clone);
                      });
                      win.document.body.style.cssText = 'margin:0;padding:0;overflow:hidden;';
                      const pipOverride = win.document.createElement('style');
                      pipOverride.textContent = `
                        *, *::before, *::after { box-sizing: border-box; }
                        html, body {
                          margin: 0 !important; padding: 0 !important;
                          background: #0e0f10 !important;
                          color: #ffffff !important;
                          overflow: hidden !important;
                          font-family: 'Google Sans', Roboto, Arial, sans-serif !important;
                        }
                        .pip-video-container {
                          width: 100vw !important; height: 100vh !important;
                          position: relative !important; background: #0e0f10 !important;
                          overflow: hidden !important;
                        }
                        .pip-overlay-controls { display: flex !important; }
                        .call-container, .call-container.light-theme { all: unset !important; }
                      `;
                      win.document.head.appendChild(pipOverride);
                      win.document.body.innerHTML = `
                        <div class="pip-video-container">
                          <video class="pip-video-el" autoplay playsinline muted
                            style="width:100%;height:100%;object-fit:cover;transform:scaleX(-1);display:${isCameraOn ? 'block' : 'none'}"></video>
                          <div class="pip-cam-off-avatar" style="display:${isCameraOn ? 'none' : 'flex'}">
                            <img src="${getDiceBearAvatar(userName)}" alt="${userName}" class="pip-cam-off-img" />
                          </div>
                          <div class="pip-overlay-controls" style="display:flex">
                            <div class="pip-overlay-name-row">
                              <div class="pip-mic-badge${isMicOn ? '' : ' muted'}"><span class="icon" style="font-size:13px">${isMicOn ? 'mic' : 'mic_off'}</span></div>
                              <span class="pip-name">${userName}</span>
                            </div>
                            <nav class="pip-overlay-nav">
                              <button class="pip-btn pip-btn-mic${isMicOn ? '' : ' pip-btn-off'}"><span class="icon">${isMicOn ? 'mic' : 'mic_off'}</span></button>
                              <button class="pip-btn pip-btn-cam${isCameraOn ? '' : ' pip-btn-off'}"><span class="icon">${isCameraOn ? 'videocam' : 'videocam_off'}</span></button>
                              <button class="pip-btn pip-btn-present${presentationMode === 'screen' ? ' pip-btn-active' : ''}"><span class="icon">present_to_all</span></button>
                              <button class="pip-btn-leave"><span class="icon" style="transform:scaleX(-1)">call_end</span></button>
                            </nav>
                          </div>
                        </div>`;
                      const pipVid = win.document.querySelector('.pip-video-el');
                      pipVideoRef.current = pipVid;
                      if (pipVid && cameraStream && isCameraOn) {
                        pipVid.srcObject = cameraStream;
                        pipVid.play().catch(() => {});
                      }
                      win.document.querySelector('.pip-btn-mic')?.addEventListener('click', () => handleToggleMicRef.current?.());
                      win.document.querySelector('.pip-btn-cam')?.addEventListener('click', () => handleToggleCameraRef.current?.());
                      win.document.querySelector('.pip-btn-present')?.addEventListener('click', () => handleToggleScreenShareRef.current?.());
                      win.document.querySelector('.pip-btn-leave')?.addEventListener('click', () => handleEndCallRef.current?.());
                      setPipActive(true);
                      win.addEventListener('pagehide', () => {
                        pipVideoRef.current = null;
                        setPipActive(false);
                        pipWinRef.current = null;
                      });
                      showToast('Your call is in another window');
                    })
                    .catch(() => showToast('PiP not supported in this browser'));
                } else if (act === 'effects') {
                  setIsActivitiesOpen(true);
                  setActiveActivity('settings');
                } else if (act === 'settings') {
                  setIsActivitiesOpen(true);
                  setActiveActivity('settings');
                }
              }}
              showToast={showToast}
            />
          </div>

          {/* Leave */}
          <button
            className="call-leave-pill-btn"
            data-tooltip="Leave call"
            onClick={handleEndCall}
          ><span className="icon">call_end</span></button>

        </div>
      </footer>

      {/* Leave Call Confirmation Modal (Google Meet Style) */}
      {isLeaveModalOpen && (
        <div className="gm-modal-overlay" onClick={() => setIsLeaveModalOpen(false)}>
          <div className="gm-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="gm-modal-title">Leave call?</h3>
            <p className="gm-modal-desc">
              You can rejoin at any time with this meeting link. Other participants will stay in the call.
            </p>
            <div className="gm-modal-actions">
              <button
                className="gm-btn-secondary"
                onClick={() => setIsLeaveModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="gm-btn-danger"
                onClick={confirmLeaveCall}
              >
                <span className="icon" style={{ fontSize: '18px' }}>call_end</span>
                <span>Leave call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Permission Denied Modal (Google Meet Style) */}
      {permissionModalType && (
        <div className="gm-modal-overlay" onClick={() => setPermissionModalType(null)}>
          <div className="gm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(234, 67, 53, 0.15)',
                  color: '#f28b82',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <span className="icon" style={{ fontSize: '22px' }}>
                  {permissionModalType === 'camera' ? 'videocam_off' : 'mic_off'}
                </span>
              </div>
              <h3 className="gm-modal-title" style={{ margin: 0, fontSize: '18px' }}>
                {permissionModalType === 'camera'
                  ? 'Want people to see you in the meeting?'
                  : 'Want people to hear you in the meeting?'}
              </h3>
            </div>

            <p className="gm-modal-desc" style={{ marginBottom: '16px' }}>
              Connectt needs access to your {permissionModalType === 'camera' ? 'camera' : 'microphone'}. To allow access:
            </p>

            {/* Visual Address Bar Instruction Card */}
            <div className="gm-perm-guide-card">
              <div className="gm-perm-url-bar">
                <span className="icon gm-perm-url-lock">lock</span>
                <span>connectt.live/{meetingId}</span>
              </div>
              <div className="gm-perm-step">
                <div className="gm-perm-step-num">1</div>
                <div>Click the <strong>lock icon 🔒</strong> in your browser address bar above.</div>
              </div>
              <div className="gm-perm-step">
                <div className="gm-perm-step-num">2</div>
                <div>Set <strong>{permissionModalType === 'camera' ? 'Camera' : 'Microphone'}</strong> to <strong>Allow</strong>.</div>
              </div>
              <div className="gm-perm-step">
                <div className="gm-perm-step-num">3</div>
                <div>Click <strong>Try again</strong> below to connect.</div>
              </div>
            </div>

            <div className="gm-modal-actions">
              <button
                className="gm-btn-secondary"
                onClick={() => setPermissionModalType(null)}
              >
                Dismiss
              </button>
              <button
                className="gm-btn-primary"
                onClick={async () => {
                  setPermissionModalType(null);
                  await initMedia();
                  showToast('Re-checking permissions...');
                }}
              >
                <span className="icon" style={{ fontSize: '18px' }}>refresh</span>
                <span>Try again</span>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* PiP active — show placeholder in main window */}
      {pipActive && (
        <PipPlaceholder
          userName={userName}
          getDiceBearAvatar={getDiceBearAvatar}
          onReturnToTab={() => { pipWinRef.current?.focus(); }}
          theme={theme}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 9999 }}>
          <div className="toast-item">
            <span className="icon" style={{ color: '#89b754' }}>info</span>
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
