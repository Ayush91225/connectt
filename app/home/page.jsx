
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [menuPosition, setMenuPosition] = useState({ left: 12, top: 12 });
  const [showLaterModal, setShowLaterModal] = useState(false);
  const [isGuruAIOpen, setIsGuruAIOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [toast, setToast] = useState(null);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [dark, setDark] = useState(false);

  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const days = (() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    return ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return { day, date: date.getDate() };
    });
  })();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('connectt_username');

      if (saved && saved.trim()) {
        setUserName(saved.trim());
        setTempName(saved.trim());
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12 || 12;

      setTimeStr(`${hours}:${minutes} ${ampm}`);
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'long',
          day: 'numeric',
        })
      );
    };

    update();

    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (event.key === 'Escape') {
        setShowNewMenu(false);
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!showNewMenu) return;

    const closeOnOutsideClick = (event) => {
      if (menuRef.current?.contains(event.target)) return;
      if (event.target.closest?.('[data-new-menu-trigger]')) return;

      setShowNewMenu(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
    };
  }, [showNewMenu]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveName = () => {
    const trimmed = tempName.trim();

    if (trimmed) {
      setUserName(trimmed);

      try {
        localStorage.setItem('connectt_username', trimmed);
      } catch (e) {}
    }

    setIsEditingName(false);
    showToast(`Name updated to ${trimmed}`);
  };

  const handleJoin = (event) => {
    event.preventDefault();

    const code = meetingCode.trim();

    if (userName.trim()) {
      try {
        localStorage.setItem('connectt_username', userName.trim());
      } catch (e) {}
    }

    const clean = code
      .replace(/^(https?:\/\/)?connectt\.live\//, '')
      .replace(/\//g, '');

    sfx.playJoin();
    router.push(clean || 'sen-mvwh-cyc' ? `/${clean || 'sen-mvwh-cyc'}` : '/');
  };

  const handleStartInstant = () => {
    setShowNewMenu(false);

    if (userName.trim()) {
      try {
        localStorage.setItem('connectt_username', userName.trim());
      } catch (e) {}
    }

    sfx.playJoin();

    const code = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

    router.push(`/${code}`);
  };

  const handleCreateLater = () => {
    setShowNewMenu(false);

    const code = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

    setGeneratedLink(`https://connectt.live/${code}`);
    setShowLaterModal(true);
  };

  const bg = dark ? '#202124' : '#ffffff';
  const text = dark ? '#e8eaed' : '#202124';
  const muted = dark ? '#bdc1c6' : '#5f6368';
  const border = dark ? '#3c4043' : '#dadce0';
  const inputBg = dark ? '#303134' : '#e8eef7';

  // Position the menu using the exact button that was clicked.
  const toggleNewMenu = (event) => {
    event.stopPropagation();

    if (showNewMenu) {
      setShowNewMenu(false);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;

    const menuWidth = Math.min(240, viewportWidth - 24);
    const estimatedMenuHeight = 132;
    const gap = 8;
    const margin = 12;

    // Align to the button's left edge where possible.
    const left = Math.max(
      margin,
      Math.min(rect.left, viewportWidth - menuWidth - margin)
    );

    // Prefer opening below the clicked button.
    let top = rect.bottom + gap;

    // If there is not enough room, open above the button.
    if (top + estimatedMenuHeight > viewportHeight - margin) {
      top = rect.top - estimatedMenuHeight - gap;
    }

    top = Math.max(
      margin,
      Math.min(top, viewportHeight - estimatedMenuHeight - margin)
    );

    setMenuPosition({ left, top });
    setShowNewMenu(true);
  };

  const closeNewMenu = () => setShowNewMenu(false);

  const meetingMenuItems = [
    {
      icon: 'bolt',
      label: 'Start instant meeting',
      action: handleStartInstant,
    },
    {
      icon: 'link',
      label: 'Create meeting for later',
      action: handleCreateLater,
    },
    {
      icon: 'calendar_month',
      label: 'Schedule in Calendar',
      action: () => {
        closeNewMenu();
        showToast('Schedule via Google Calendar or Outlook');
      },
    },
  ];

  const newMenu = showNewMenu ? (
    <div
      ref={menuRef}
      className="hm-new-menu"
      onClick={(event) => event.stopPropagation()}
      style={{
        position: 'fixed',
        top: menuPosition.top,
        left: menuPosition.left,
        width: 240,
        maxWidth: 'calc(100vw - 24px)',
        boxSizing: 'border-box',
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0,0,0,0.13)',
        padding: '6px 0',
        zIndex: 9999,
      }}
    >
      {meetingMenuItems.map(({ icon, label, action }) => (
        <button
          key={label}
          type="button"
          onClick={action}
          className="hm-menu-item"
          style={{ color: text }}
        >
          <span className="icon hm-menu-icon">{icon}</span>
          <span className="hm-menu-label">{label}</span>
        </button>
      ))}
    </div>
  ) : null;

  return (
    <main
      className="hm-root"
      style={{
        width: '100%',
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
        position: 'relative',
        overflowX: 'clip',
        transition: 'background 0.2s, color 0.2s',
      }}
    >
      {/* HEADER */}
      <header
        className="hm-header"
        style={{ borderBottom: `1px solid ${border}`, background: bg }}
      >
        <div className="hm-brand" onClick={() => router.push('/home')}>
          <img src="/connectt.png" alt="Connectt" />
          <img src="/connectt1.png" alt="Connectt" />
        </div>

        <div className="hm-center">
          <form
            className="hm-join-form"
            onSubmit={handleJoin}
            style={{ background: inputBg }}
          >
            <span className="icon hm-keyboard-icon">keyboard</span>

            <input
              ref={inputRef}
              value={meetingCode}
              onChange={(event) => setMeetingCode(event.target.value)}
              placeholder="Enter a code or link"
              className="hm-code-input"
              style={{ color: text }}
            />

            <button
              type="submit"
              disabled={!meetingCode.trim()}
              className="hm-join-button"
              style={{
                background: meetingCode.trim()
                  ? '#c2e7ff'
                  : dark
                    ? '#3c4043'
                    : '#d2d6dd',
                color: meetingCode.trim()
                  ? '#004a77'
                  : dark
                    ? '#5f6368'
                    : '#858990',
              }}
            >
              Join
            </button>
          </form>

          <div className="hm-new-wrapper">
            <button
              type="button"
              data-new-menu-trigger
              className="hm-pill hm-pill-green"
              onClick={toggleNewMenu}
            >
              <span className="icon">videocam</span>
              <span>New</span>
            </button>
          </div>

          <button className="hm-pill hm-pill-blue hm-hide-sm" type="button">
            <span className="icon">mic</span>
            <span>In-person notes</span>
          </button>
        </div>

        <div className="hm-right">
          {timeStr && (
            <span className="hm-time hm-hide-md" style={{ color: muted }}>
              {timeStr} · {dateStr}
            </span>
          )}

          <button
            className="hm-pill hm-pill-outline hm-hide-sm"
            onClick={() => setIsGuruAIOpen(true)}
            style={{ border: `1px solid ${border}`, color: text }}
            type="button"
          >
            <img src="/guruai.png" alt="Guru AI" className="hm-guru-icon" />
            <span>Guru AI</span>
          </button>

          <button className="hm-icon-btn" style={{ color: muted }} type="button">
            <span className="icon hm-large-icon">help_outline</span>
          </button>

          <button className="hm-icon-btn" style={{ color: muted }} type="button">
            <span className="icon hm-large-icon">settings</span>
          </button>

          <button
            type="button"
            className="hm-profile"
            onClick={() => {
              setTempName(userName);
              setIsEditingName(true);
            }}
            style={{ border: `1px solid ${border}`, background: bg }}
          >
            <img
              src={getDiceBearAvatar(userName)}
              alt={userName}
              className="hm-avatar"
            />
            <span className="hm-profile-name">{userName}</span>
          </button>

          <button
            className="hm-icon-btn hm-theme-button"
            onClick={() => setDark(!dark)}
            style={{ border: `1px solid ${border}`, color: text }}
            type="button"
          >
            <span className="icon">
              {dark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </header>

      {/* DATE STRIP */}
      <section
        className="hm-date-strip"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <div className="hm-date-title" style={{ color: text }}>
          <span>{dateStr}</span>
          <span
            className="icon"
            style={{ fontSize: 16, color: muted, cursor: 'pointer' }}
          >
            expand_more
          </span>
        </div>

        <div className="hm-date-picker">
          <button className="hm-date-arrow" style={{ color: muted }} type="button">
            <span className="icon">chevron_left</span>
          </button>

          <div className="hm-date-days">
            {days.map((item) => {
              const isSelected = selectedDate === item.date;
              const isToday = item.date === new Date().getDate();

              return (
                <button
                  key={item.day}
                  type="button"
                  onClick={() => setSelectedDate(item.date)}
                  className="hm-day"
                  style={{
                    background: isSelected
                      ? dark
                        ? '#004a77'
                        : '#b8e0ff'
                      : 'transparent',
                    color: isSelected
                      ? dark
                        ? '#c2e7ff'
                        : '#004a77'
                      : isToday
                        ? '#89b754'
                        : muted,
                    position: 'relative',
                  }}
                >
                  <span className="hm-day-label">{item.day}</span>
                  <strong className="hm-day-num">{item.date}</strong>

                  {isToday && !isSelected && (
                    <span className="hm-today-dot" />
                  )}
                </button>
              );
            })}
          </div>

          <button className="hm-date-arrow" style={{ color: muted }} type="button">
            <span className="icon">chevron_right</span>
          </button>
        </div>
      </section>

      {/* EMPTY STATE */}
      <section className="hm-empty">
        <img
          src="/home.png"
          alt="No meetings"
          className="hm-empty-image"
        />

        <h1 style={{ color: text }}>No meetings scheduled for today</h1>

        <p style={{ color: muted, letterSpacing: -0.3 }}>
          Schedule a meeting or enjoy the free time
        </p>

        <div className="hm-empty-new-wrapper">
          <button
            type="button"
            data-new-menu-trigger
            onClick={toggleNewMenu}
            className="hm-empty-new-button"
          >
            <span className="icon">videocam</span>
            New
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="hm-footer"
        style={{
          borderTop: `1px solid ${border}`,
          background: bg,
          color: muted,
        }}
      >
        {[
          {
            label: 'Support',
            href: 'https://uat.homeguruworld.in/dashboard/settings?tab=support',
          },
          {
            label: 'System status',
            href: 'https://status.homeguruworld.in/',
          },
          {
            label: 'Terms of Use',
            href: 'https://homeguruworld.com/terms',
          },
          {
            label: 'Privacy Policy',
            href: 'https://homeguruworld.com/privacy',
          },
          {
            label: 'Library',
            href: 'https://uat.homeguruworld.in/library',
          },
        ].map(({ label, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ))}

        <span className="hm-copyright">
          © 2026 HomeGuru I Private Limited
        </span>
      </footer>

      {/* Render the dropdown only ONCE, outside the page layout. */}
      {typeof document !== 'undefined' &&
        showNewMenu &&
        createPortal(newMenu, document.body)}

      {/* GURU AI PANEL */}
      <GuruAIPanel
        isOpen={isGuruAIOpen}
        onClose={() => setIsGuruAIOpen(false)}
        userName={userName}
      />

      {/* CREATE LATER MODAL */}
      {showLaterModal && (
        <div
          className="hm-modal-overlay"
          onClick={() => setShowLaterModal(false)}
        >
          <div
            className="hm-modal"
            style={{ background: bg, border: `1px solid ${border}` }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="hm-modal-heading">
              <h3 style={{ color: text }}>Here&apos;s the link to your meeting</h3>
              <button
                type="button"
                className="hm-close-button"
                onClick={() => setShowLaterModal(false)}
                style={{ color: muted }}
              >
                <span className="icon">close</span>
              </button>
            </div>

            <p className="hm-modal-description" style={{ color: muted }}>
              Copy this link and send it to people you want to meet with.
            </p>

            <div
              className="hm-generated-link"
              style={{
                background: dark ? '#303134' : '#f5f3ef',
                border: `1px solid ${border}`,
              }}
            >
              <span style={{ color: text }}>{generatedLink}</span>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  showToast('Link copied!');
                }}
                style={{ border: `1px solid ${border}`, background: bg }}
              >
                <span className="icon">content_copy</span>
                Copy
              </button>
            </div>

            <div className="hm-modal-actions">
              <button
                type="button"
                onClick={() => setShowLaterModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAME EDIT MODAL */}
      {isEditingName && (
        <div
          className="hm-modal-overlay"
          onClick={() => setIsEditingName(false)}
        >
          <div
            className="hm-modal hm-name-modal"
            style={{ background: bg, border: `1px solid ${border}` }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 style={{ color: text }}>Edit Display Name</h3>
            <p style={{ color: muted }}>
              This name is shown to all participants.
            </p>

            <input
              autoFocus
              value={tempName}
              onChange={(event) => setTempName(event.target.value)}
              onKeyDown={(event) =>
                event.key === 'Enter' && handleSaveName()
              }
              style={{
                color: text,
                background: dark ? '#303134' : '#fff',
                border: `1px solid ${border}`,
              }}
            />

            <div className="hm-name-actions">
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                style={{
                  border: `1px solid ${border}`,
                  color: muted,
                  background: 'transparent',
                }}
              >
                Cancel
              </button>

              <button type="button" onClick={handleSaveName}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="hm-toast">
          <span className="icon">info</span>
          {toast}
        </div>
      )}

      <style jsx global>{`
        body:has(.hm-root) {
          overflow-y: auto !important;
          height: auto !important;
        }

        .hm-root,
        .hm-root * {
          box-sizing: border-box;
        }

        .hm-root {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: 'Google Sans', Roboto, Arial, sans-serif;
        }

        .hm-header {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 12px;
          height: 60px;
          position: sticky;
          top: 0;
          z-index: 40;
          flex-shrink: 0;
        }

        .hm-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .hm-brand img:first-child {
          height: 24px;
          width: auto;
        }

        .hm-brand img:last-child {
          height: 16px;
          width: auto;
        }

        .hm-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 0;
        }

        .hm-join-form {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 46px;
          border-radius: 9999px;
          padding: 4px 4px 4px 16px;
          flex: 1;
          max-width: 420px;
          min-width: 0;
        }

        .hm-keyboard-icon {
          font-size: 20px;
          color: #5f6368;
          flex-shrink: 0;
        }

        .hm-code-input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          font-size: 15px;
        }

        .hm-join-button {
          flex-shrink: 0;
          height: 42px;
          padding: 0 18px;
          border-radius: 9999px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .hm-join-button:disabled {
          cursor: default;
        }

        .hm-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .hm-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 38px;
          padding: 0 14px;
          border-radius: 9999px;
          border: none;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          font-family: inherit;
        }

        .hm-pill-green {
          background: #c4eed0;
          color: #0b5726;
        }

        .hm-pill-blue {
          background: #b8e0ff;
          color: #004a77;
        }

        .hm-pill-outline {
          background: transparent;
          padding: 0 12px;
          font-size: 12px;
        }

        .hm-icon-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .hm-theme-button {
          border-radius: 50%;
        }

        .hm-profile {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px 3px 4px;
          border-radius: 20px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .hm-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
        }

        .hm-profile-name {
          font-size: 13px;
          font-weight: 600;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hm-guru-icon {
          width: 14px;
          height: 14px;
        }

        .hm-large-icon {
          font-size: 24px;
        }

        .hm-time {
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }

        .hm-new-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        /* The menu is rendered in a portal and positioned against the viewport. */
        .hm-new-menu {
          transform: none;
          animation: hm-menu-enter 100ms ease-out;
          transform-origin: top left;
        }

        @keyframes hm-menu-enter {
          from {
            opacity: 0.7;
          }
          to {
            opacity: 1;
          }
        }

        .hm-menu-item {
          width: 100%;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: none;
          background: transparent;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          line-height: 1.4;
          transition: background 0.12s ease;
        }

        .hm-menu-item:hover {
          background: rgba(128, 128, 128, 0.1);
        }

        .hm-menu-icon {
          font-size: 18px;
          color: #89b754;
          flex-shrink: 0;
        }

        .hm-menu-label {
          min-width: 0;
          white-space: normal;
          overflow-wrap: anywhere;
        }

        .hm-date-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 3%;
          gap: 12px;
          flex-wrap: wrap;
          min-height: 68px;
          background: transparent;
        }

        .hm-date-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.3px;
          white-space: nowrap;
          cursor: pointer;
          flex-shrink: 0;
        }

        .hm-date-picker {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .hm-date-arrow {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
          flex-shrink: 0;
          border-radius: 50%;
        }

        .hm-date-arrow:hover {
          background: rgba(0, 0, 0, 0.06);
        }

        .hm-date-days {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .hm-day {
          width: 42px;
          height: 52px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 2px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.15s;
          font-family: inherit;
        }

        .hm-day:hover {
          background: rgba(0, 0, 0, 0.05) !important;
        }

        .hm-day-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        .hm-day-num {
          font-size: 15px;
          font-weight: 500;
        }

        .hm-today-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #89b754;
          position: absolute;
          bottom: 6px;
        }

        .hm-security {
          margin: 14px 3%;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          border-radius: 28px;
          flex-wrap: wrap;
        }

        .hm-empty {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: clamp(16px, 3vh, 40px) 20px;
        }

        .hm-empty-image {
          width: min(340px, 80vw);
          height: auto;
          object-fit: contain;
          user-select: none;
          pointer-events: none;
        }

        .hm-empty h1 {
          margin: 16px 0 0;
          font-size: clamp(22px, 3vw, 36px);
          font-weight: 400;
          letter-spacing: -1.2px;
          line-height: 1.2;
        }

        .hm-empty p {
          margin: 12px 0 0;
          font-size: clamp(14px, 1.4vw, 17px);
        }

        .hm-empty-new-wrapper {
          position: relative;
          margin-top: 24px;
        }

        .hm-empty-new-button {
          height: 66px;
          min-width: 140px;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: none;
          border-radius: 9999px;
          background: #c4eed0;
          color: #0b5726;
          font-size: 19px;
          font-weight: 500;
          cursor: pointer;
        }

        .hm-footer {
          width: 100%;
          margin-top: auto;
          padding: 16px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 10px 18px;
          font-size: 12px;
          text-align: center;
        }

        .hm-footer a {
          color: inherit;
          text-decoration: none;
        }

        .hm-copyright {
          opacity: 0.6;
        }

        .hm-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .hm-modal {
          width: 100%;
          max-width: 420px;
          padding: 24px;
          border-radius: 20px;
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.18);
        }

        .hm-modal-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .hm-modal-heading h3,
        .hm-name-modal h3 {
          font-size: 17px;
          font-weight: 700;
          margin: 0;
        }

        .hm-close-button {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          flex-shrink: 0;
        }

        .hm-modal-description,
        .hm-name-modal p {
          font-size: 12px;
          line-height: 1.5;
          margin: 0 0 16px;
        }

        .hm-generated-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .hm-generated-link > span {
          min-width: 0;
          font-size: 13px;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hm-generated-link button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 8px;
          color: #89b754;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          flex-shrink: 0;
        }

        .hm-modal-actions {
          display: flex;
          justify-content: flex-end;
        }

        .hm-modal-actions button,
        .hm-name-actions button {
          padding: 8px 18px;
          border: none;
          border-radius: 10px;
          background: #1a1814;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .hm-name-modal {
          max-width: 380px;
        }

        .hm-name-modal h3 {
          margin-bottom: 10px;
        }

        .hm-name-modal p {
          margin-bottom: 16px;
        }

        .hm-name-modal input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          margin-bottom: 20px;
        }

        .hm-name-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .hm-name-actions button:first-child {
          background: transparent;
        }

        .hm-name-actions button:last-child {
          background: #89b754;
        }

        .hm-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: #1a1814;
          color: #fff;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);
          z-index: 1100;
          display: flex;
          align-items: center;
          gap: 8px;
          max-width: calc(100vw - 24px);
        }

        .hm-toast .icon {
          font-size: 18px;
          color: #89b754;
        }

        @media (max-width: 960px) {
          .hm-hide-md {
            display: none !important;
          }

          .hm-join-form {
            max-width: 300px;
          }
        }

        @media (max-width: 640px) {
          .hm-header {
            height: auto;
            flex-wrap: wrap;
            padding: 10px 12px;
            gap: 8px;
          }

          .hm-center {
            order: 3;
            width: 100%;
            justify-content: stretch;
          }

          .hm-join-form {
            max-width: 100%;
            flex: 1;
            height: 42px;
          }

          .hm-hide-sm {
            display: none !important;
          }

          .hm-right {
            gap: 4px;
          }

          .hm-date-strip {
            padding: 0 12px;
            min-height: 60px;
            gap: 8px;
          }

          .hm-date-title {
            font-size: 15px;
            gap: 8px;
          }

          .hm-date-days {
            gap: 2px;
          }

          .hm-day {
            width: clamp(32px, 11vw, 44px);
            height: 50px;
          }

          .hm-day-num {
            font-size: 14px;
          }

          .hm-security {
            margin: 10px 12px;
            padding: 10px 14px;
            border-radius: 20px;
            gap: 10px;
          }

          .hm-empty {
            padding: 16px 20px;
          }

          .hm-empty-image {
            width: min(280px, 75vw);
          }

          .hm-empty h1 {
            font-size: clamp(20px, 6vw, 28px);
            margin-top: 12px;
          }

          .hm-empty p {
            font-size: 14px;
            margin-top: 8px;
          }

          .hm-menu-item {
            padding: 12px 14px;
            font-size: 13px;
          }
        }

        @media (max-width: 400px) {
          .hm-hide-xs {
            display: none !important;
          }

          .hm-day {
            width: 30px;
            height: 46px;
            border-radius: 8px;
          }

          .hm-day-label {
            font-size: 9px;
          }

          .hm-day-num {
            font-size: 13px;
          }

          .hm-date-title {
            font-size: 13px;
          }

          .hm-modal {
            padding: 20px;
          }
        }

        @media (max-height: 500px) and (orientation: landscape) {
          .hm-empty {
            padding: 16px 20px;
          }

          .hm-date-strip {
            min-height: 52px;
          }
        }
      `}</style>
    </main>
  );
}
