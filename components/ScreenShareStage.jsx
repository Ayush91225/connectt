'use client';

import React, { useState, useEffect, useRef } from 'react';
import ExcalidrawWrapper from './ExcalidrawWrapper';
import DesmosCalculator from './DesmosCalculator';
import ChessGame from './ChessGame';
import FlashcardsDeck from './FlashcardsDeck';
import MonacoCodeStage from './MonacoCodeStage';
import SlideDeckPresenter from './SlideDeckPresenter';
import YouTubeSharingStage from './YouTubeSharingStage';
import QuizStage from './QuizStage';
import TimerStage from './TimerStage';
import { getDiceBearAvatar } from '../lib/avatar';

export default function ScreenShareStage({
  mode = 'screen', // 'screen', 'whiteboard', 'youtube', 'slides', 'chess', 'desmos_graph', 'desmos_sci', 'flashcards', 'code', 'quiz', 'timer'
  userName = 'You',
  isCameraOn = false,
  isMicOn = false,
  cameraStream = null,
  screenStream = null,
  onStopPresenting,
  timerState = null,
  onOpenSidebarSettings = null,
  theme = 'light'
}) {
  const [isAudioSharing, setIsAudioSharing] = useState(true);
  const pipVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const pipRef = useRef(null);
  const dragState = useRef(null);
  const [pipPos, setPipPos] = useState({ right: 20, bottom: 20 });

  const onPointerDown = (e) => {
    e.preventDefault();
    const el = pipRef.current;
    const rect = el.getBoundingClientRect();
    const parent = el.offsetParent.getBoundingClientRect();
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origRight: parent.right - rect.right,
      origBottom: parent.bottom - rect.bottom,
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!dragState.current) return;
    const { startX, startY, origRight, origBottom } = dragState.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const el = pipRef.current;
    const parent = el.offsetParent.getBoundingClientRect();
    const newRight = Math.max(8, Math.min(parent.width - el.offsetWidth - 8, origRight - dx));
    const newBottom = Math.max(8, Math.min(parent.height - el.offsetHeight - 8, origBottom - dy));
    setPipPos({ right: newRight, bottom: newBottom });
  };

  const onPointerUp = () => {
    dragState.current = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };

  // Bind local camera stream to PIP tile
  useEffect(() => {
    if (pipVideoRef.current && cameraStream && isCameraOn) {
      pipVideoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, isCameraOn]);

  // Bind screen stream to main stage video
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream, mode]);

  const getModeTitle = () => {
    switch (mode) {
      case 'whiteboard': return 'Whiteboard';
      case 'youtube': return 'YouTube Watch Party';
      case 'slides': return 'Slide Deck';
      case 'chess': return 'Chess';
      case 'desmos_graph': return 'Desmos Graphing';
      case 'desmos_sci': return 'Desmos Scientific';
      case 'flashcards': return 'Flashcards';
      case 'code': return 'RUX Code Studio';
      case 'quiz': return 'Live Classroom Quiz';
      case 'timer': return 'Classroom Timer';
      default: return 'Screen';
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
      {/* Top Presentation Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 16px 8px', flexShrink: 0 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: theme === 'light' ? '#ffffff' : '#28292a',
            border: theme === 'light' ? '1px solid #e8e4de' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: theme === 'light' ? '0 2px 12px rgba(0,0,0,0.08)' : '0 4px 16px rgba(0,0,0,0.5)',
            borderRadius: '9999px',
            padding: '6px 6px 6px 14px',
            maxWidth: '100%',
            flexWrap: 'wrap',
            rowGap: '6px',
          }}
        >
          {/* Mode icon + label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', paddingRight: '2px' }}>
            {mode === 'code' ? (
              <img src="/rux.png" alt="RUX" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
            ) : (
              <span className="icon" style={{ fontSize: '16px', color: theme === 'light' ? '#f48120' : '#89b754' }}>
                {mode === 'whiteboard' ? 'gesture'
                  : mode === 'youtube' ? 'smart_display'
                  : mode === 'slides' ? 'co_present'
                  : mode === 'chess' ? 'sports_esports'
                  : mode === 'desmos_graph' ? 'show_chart'
                  : mode === 'desmos_sci' ? 'functions'
                  : mode === 'flashcards' ? 'style'
                  : mode === 'quiz' ? 'quiz'
                  : mode === 'timer' ? 'timer'
                  : 'present_to_all'}
              </span>
            )}
            <span style={{ fontSize: '13px', fontWeight: 500, color: theme === 'light' ? '#1a1814' : '#e3e3e3', whiteSpace: 'nowrap' }}>
              {getModeTitle()}
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '18px', backgroundColor: theme === 'light' ? '#e8e4de' : 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

          {/* Audio toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '0 4px' }}>
            <span className="icon" style={{ fontSize: '15px', color: isAudioSharing ? '#89b754' : (theme === 'light' ? '#a8a39d' : '#5f6368') }}>
              {isAudioSharing ? 'volume_up' : 'volume_off'}
            </span>
            <label className="m3-switch" style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
              <input type="checkbox" checked={isAudioSharing} onChange={() => setIsAudioSharing(!isAudioSharing)} />
              <span className="m3-slider round" />
            </label>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '18px', backgroundColor: theme === 'light' ? '#e8e4de' : 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

          {/* Stop button */}
          <button
            onClick={onStopPresenting}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 14px',
              borderRadius: '9999px',
              backgroundColor: '#ea4335',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span className="icon" style={{ fontSize: '14px' }}>stop_screen_share</span>
            Stop
          </button>
        </div>
      </div>

      {/* Main Presentation Surface */}
      <div className="gm-presentation-surface">
        {/* MODE: REAL SCREEN SHARING */}
        {mode === 'screen' && (
          screenStream ? (
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: '#fff', padding: '32px' }}>
              <span className="icon" style={{ fontSize: '64px', color: '#89b754' }}>screen_share</span>
              <div style={{ fontSize: '18px', fontWeight: 500 }}>You are sharing your screen</div>
              <div style={{ fontSize: '13px', color: '#9aa0a6' }}>All participants in connectt.live can see your display</div>
            </div>
          )
        )}

        {/* MODE: FULL STAGE EXCALIDRAW (PACKAGE-POWERED, NO IFRAME) */}
        {mode === 'whiteboard' && (
          <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: theme === 'light' ? '#ffffff' : '#121212' }}>
            <ExcalidrawWrapper theme={theme} />
          </div>
        )}

        {/* MODE: FULL STAGE DESMOS GRAPHING */}
        {mode === 'desmos_graph' && (
          <div style={{ width: '100%', height: '100%', padding: '16px', backgroundColor: '#18191b' }}>
            <DesmosCalculator type="graphing" />
          </div>
        )}

        {/* MODE: FULL STAGE DESMOS SCIENTIFIC */}
        {mode === 'desmos_sci' && (
          <div style={{ width: '100%', height: '100%', padding: '16px', backgroundColor: theme === 'light' ? '#fbfbfb' : '#18191b' }}>
            <DesmosCalculator type="scientific" theme={theme} />
          </div>
        )}

        {/* MODE: FULL STAGE CHESS */}
        {mode === 'chess' && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme === 'light' ? '#fbfbfb' : '#18191b' }}>
            <ChessGame theme={theme} />
          </div>
        )}

        {/* MODE: FULL STAGE FLASHCARDS */}
        {mode === 'flashcards' && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme === 'light' ? '#fbfbfb' : '#18191b' }}>
            <FlashcardsDeck isStage={true} theme={theme} />
          </div>
        )}

        {/* MODE: FULL STAGE SYNCED YOUTUBE */}
        {mode === 'youtube' && (
          <div style={{ width: '100%', height: '100%', backgroundColor: theme === 'light' ? '#fbfbfb' : '#000' }}>
            <YouTubeSharingStage theme={theme} />
          </div>
        )}

        {/* MODE: FULL STAGE SLIDES */}
        {mode === 'slides' && (
          <div style={{ width: '100%', height: '100%', backgroundColor: theme === 'light' ? '#fbfbfb' : '#0e0e0e' }}>
            <SlideDeckPresenter theme={theme} />
          </div>
        )}

        {/* MODE: FULL STAGE MONACO CODE EDITOR */}
        {mode === 'code' && (
          <div style={{ width: '100%', height: '100%', backgroundColor: theme === 'light' ? '#ffffff' : '#1e1e1e' }}>
            <MonacoCodeStage theme={theme} />
          </div>
        )}


        {/* MODE: FULL STAGE LIVE QUIZ */}
        {mode === 'quiz' && (
          <div style={{ width: '100%', height: '100%', backgroundColor: theme === 'light' ? '#ffffff' : '#121316' }}>
            <QuizStage onStopPresenting={onStopPresenting} userName={userName} theme={theme} />
          </div>
        )}

        {/* MODE: FULL STAGE TIMER */}
        {mode === 'timer' && (
          <div style={{ width: '100%', height: '100%', backgroundColor: theme === 'light' ? '#ffffff' : '#0e0f12' }}>
            <TimerStage
              timerState={timerState}
              onStopPresenting={onStopPresenting}
              userName={userName}
              onOpenSidebarSettings={onOpenSidebarSettings}
              theme={theme}
            />
          </div>
        )}

        {/* Floating Draggable PIP Camera Tile (LOCAL WEBCAM) */}
        <div
          ref={pipRef}
          className="gm-floating-pip-cam-tile"
          onPointerDown={onPointerDown}
          style={{ right: pipPos.right, bottom: pipPos.bottom, cursor: 'grab' }}
        >
          <video
            ref={pipVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              display: isCameraOn ? 'block' : 'none',
              backgroundColor: '#1e1f20'
            }}
          />

          {!isCameraOn && (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#202124' }}>
              <img
                src={getDiceBearAvatar(userName)}
                alt={userName}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  border: '2px solid rgba(137, 183, 84, 0.6)',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}

          {/* Top Right Mic Status */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: isMicOn ? 'rgba(0,0,0,0.6)' : '#0b57d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <span className="icon" style={{ fontSize: '13px' }}>{isMicOn ? 'mic' : 'mic_off'}</span>
          </div>

          {/* Bottom Left Name */}
          <div style={{ position: 'absolute', bottom: '8px', left: '10px', fontSize: '12px', color: '#fff', fontWeight: 500, textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
            {userName}
          </div>
        </div>
      </div>
    </div>
  );
}
