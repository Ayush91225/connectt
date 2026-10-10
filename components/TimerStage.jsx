'use client';

import React from 'react';
import { sfx } from '../lib/audio';

export default function TimerStage({
  timerState,
  onStopPresenting,
  userName = 'You',
  onOpenSidebarSettings,
  theme = 'light'
}) {
  const isLight = theme === 'light';
  const cBg = isLight ? '#ffffff' : '#0e0f12';
  const cHeaderBg = isLight ? '#fbfbfb' : '#131417';
  const cBorder = isLight ? '#e8e4de' : 'rgba(255, 255, 255, 0.06)';
  const cText = isLight ? '#1a1814' : '#ffffff';
  const cSubtle = isLight ? '#6b6560' : '#9aa0a6';

  const {
    timerSeconds = 300,
    initialTimerSeconds = 300,
    isTimerRunning = false,
    isAlarmRinging = false,
    startTimer,
    pauseTimer,
    resetTimer,
    adjustTimer,
    stopAlarm,
    formatTimer
  } = timerState || {};

  const total = initialTimerSeconds || 300;
  const progressPercent = Math.max(0, Math.min(100, (timerSeconds / total) * 100));

  // Circular progress calculations (Radius = 140)
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: cBg,
        color: cText,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px clamp(16px, 3vw, 28px)',
          borderBottom: `1px solid ${cBorder}`,
          backgroundColor: cHeaderBg
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="icon" style={{ fontSize: '18px', color: '#a8cded' }}>timer</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: cText }}>Classroom Countdown Timer</span>
          <span style={{ color: isLight ? '#e8e4de' : 'rgba(255,255,255,0.15)', fontSize: '12px' }}>•</span>
          <span style={{ fontSize: '12px', color: '#9aa0a6' }}>
            {isAlarmRinging ? '⏰ Alarm Active' : isTimerRunning ? 'Running on Stage' : 'Paused'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onOpenSidebarSettings && (
            <button
              onClick={onOpenSidebarSettings}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                backgroundColor: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.05)',
                color: isLight ? '#6b6560' : '#c4c7c5',
                fontSize: '11px',
                fontWeight: 500,
                border: `1px solid ${cBorder}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span className="icon" style={{ fontSize: '14px' }}>tune</span>
              <span>Settings</span>
            </button>
          )}

          {onStopPresenting && (
            <button
              onClick={onStopPresenting}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: isLight ? '#6b6560' : '#9aa0a6',
                fontSize: '11px',
                border: `1px solid ${cBorder}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span className="icon" style={{ fontSize: '14px' }}>close</span>
              <span>Exit Stage</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Timer Stage Center */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(20px, 4vw, 40px)',
          gap: '28px'
        }}
      >
        {/* Progress Ring & Big Time Display */}
        <div
          style={{
            position: 'relative',
            width: 'clamp(260px, 40vw, 360px)',
            height: 'clamp(260px, 40vw, 360px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* SVG Circular Progress Track */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              transform: 'rotate(-90deg)'
            }}
            viewBox="0 0 320 320"
          >
            {/* Background Track */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke={isLight ? '#e8e4de' : 'rgba(255, 255, 255, 0.05)'}
              strokeWidth="6"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke={isAlarmRinging ? '#ff8a80' : (isLight ? '#0284c7' : '#a8cded')}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease',
                filter: isAlarmRinging ? 'drop-shadow(0 0 8px rgba(255, 138, 128, 0.6))' : 'drop-shadow(0 0 6px rgba(168, 205, 237, 0.4))'
              }}
            />
          </svg>

          {/* Time Centerpiece */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              textAlign: 'center'
            }}
          >
            {isAlarmRinging ? (
              <>
                <div style={{ fontSize: '36px', marginBottom: '4px' }}>⏰</div>
                <div
                  style={{
                    fontSize: 'clamp(32px, 6vw, 48px)',
                    fontWeight: 700,
                    color: '#ff8a80',
                    letterSpacing: '-0.5px'
                  }}
                >
                  Time's Up!
                </div>
                <div style={{ fontSize: '13px', color: cSubtle, marginTop: '4px' }}>
                  Alarm ringing
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 'clamp(48px, 10vw, 84px)',
                    fontWeight: 600,
                    letterSpacing: '-1.5px',
                    fontVariantNumeric: 'tabular-nums',
                    color: timerSeconds <= 30 && isTimerRunning ? '#ff8a80' : cText,
                    transition: 'color 0.2s ease'
                  }}
                >
                  {formatTimer ? formatTimer(timerSeconds) : `${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}`}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: cSubtle,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}
                >
                  {isTimerRunning ? 'Countdown Active' : 'Ready'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Minimal Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {isAlarmRinging ? (
            <button
              onClick={() => {
                stopAlarm?.();
                resetTimer?.();
                sfx.playReaction();
              }}
              style={{
                padding: '12px 28px',
                borderRadius: '24px',
                backgroundColor: '#ff8a80',
                color: '#111215',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(255, 138, 128, 0.4)'
              }}
            >
              <span className="icon" style={{ fontSize: '18px' }}>notifications_off</span>
              <span>Stop Alarm</span>
            </button>
          ) : (
            <>
              {/* Adjustments */}
              <button
                onClick={() => {
                  adjustTimer?.(-60);
                  sfx.playReaction();
                }}
                disabled={timerSeconds < 60 || isTimerRunning}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  backgroundColor: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.05)',
                  color: timerSeconds < 60 || isTimerRunning ? (isLight ? '#c7c4be' : '#555') : (isLight ? '#6b6560' : '#c4c7c5'),
                  fontSize: '12px',
                  border: `1px solid ${cBorder}`,
                  cursor: timerSeconds < 60 || isTimerRunning ? 'default' : 'pointer'
                }}
              >
                -1m
              </button>

              {/* Start / Pause */}
              <button
                onClick={() => {
                  if (isTimerRunning) {
                    pauseTimer?.();
                  } else {
                    startTimer?.();
                  }
                  sfx.playReaction();
                }}
                style={{
                  padding: '10px 24px',
                  borderRadius: '24px',
                  backgroundColor: '#a8cded',
                  color: '#0e1720',
                  fontWeight: 600,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span className="icon" style={{ fontSize: '16px' }}>
                  {isTimerRunning ? 'pause' : 'play_arrow'}
                </span>
                <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
              </button>

              {/* Reset */}
              <button
                onClick={() => {
                  resetTimer?.();
                  sfx.playReaction();
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '24px',
                  backgroundColor: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.06)',
                  color: isLight ? '#6b6560' : '#c4c7c5',
                  fontSize: '13px',
                  border: `1px solid ${cBorder}`,
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>

              <button
                onClick={() => {
                  adjustTimer?.(60);
                  sfx.playReaction();
                }}
                disabled={isTimerRunning}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  backgroundColor: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.05)',
                  color: isTimerRunning ? (isLight ? '#c7c4be' : '#555') : (isLight ? '#6b6560' : '#c4c7c5'),
                  fontSize: '12px',
                  border: `1px solid ${cBorder}`,
                  cursor: isTimerRunning ? 'default' : 'pointer'
                }}
              >
                +1m
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
