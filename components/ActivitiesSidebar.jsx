'use client';

import React, { useState, useEffect, useRef } from 'react';
import { sfx } from '../lib/audio';
import DesmosCalculator from './DesmosCalculator';
import ChessGame from './ChessGame';
import FlashcardsDeck from './FlashcardsDeck';
import { getDiceBearAvatar } from '../lib/avatar';
import MathRenderer from './MathRenderer';

export default function ActivitiesSidebar({
  isOpen,
  onClose,
  activeActivity,
  onSelectActivity,
  userName = 'You',
  onStartStageSharing,
  isScreenSharing,
  presentationMode,
  timerState,
  theme = 'light'
}) {
  const isLight = theme === 'light';
  const cBg = isLight ? '#ffffff' : '#1e1f20';
  const cCard = isLight ? '#ffffff' : '#28292a';
  const cCardHover = isLight ? '#f5f3ef' : '#303134';
  const cBorder = isLight ? '#e8e4de' : 'rgba(255, 255, 255, 0.08)';
  const cText = isLight ? '#1a1814' : '#ffffff';
  const cSubtle = isLight ? '#6b6560' : '#c4c7c5';
  const cInputBg = isLight ? '#f5f3ef' : '#131314';

  const [speechLang, setSpeechLang] = useState('Spanish (es)');

  // Host Controls State
  const [hostManagement, setHostManagement] = useState(true);
  const [allowShareScreen, setAllowShareScreen] = useState(true);
  const [allowSendReactions, setAllowSendReactions] = useState(true);
  const [allowTurnOnMic, setAllowTurnOnMic] = useState(true);
  const [allowTurnOnVideo, setAllowTurnOnVideo] = useState(true);
  const [quickAccess, setQuickAccess] = useState(true);
  const [settingsTab, setSettingsTab] = useState('audio'); // 'audio', 'video', 'host'

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'System', time: '12:00 PM', text: 'Welcome to connectt.live! Enterprise-grade meetings powered by Navchetna Technologies × HomeGuru.', isSystem: true },
    { id: 2, sender: 'Sarah Chen', time: '12:02 PM', text: 'Hey! The new Desmos graphing engine and Chess board are fantastic!' }
  ]);
  const [newMsg, setNewMsg] = useState('');
  const [allowChat, setAllowChat] = useState(true);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isImg = file.type.startsWith('image/');
    const url = URL.createObjectURL(file);

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: userName || 'You',
        time: timeStr,
        text: newMsg.trim() || `Sent attachment: ${file.name}`,
        file: {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          isImage: isImg,
          url: url
        }
      }
    ]);
    setNewMsg('');
    sfx.playReaction();
    e.target.value = '';
  };

  // Centralized Timer State (synced with main stage & audio alarm)
  const timerSeconds = timerState?.timerSeconds ?? 300;
  const initialTimerSeconds = timerState?.initialTimerSeconds ?? 300;
  const isTimerRunning = timerState?.isTimerRunning ?? false;
  const isAlarmRinging = timerState?.isAlarmRinging ?? false;
  const startTimer = timerState?.startTimer;
  const pauseTimer = timerState?.pauseTimer;
  const resetTimer = timerState?.resetTimer;
  const adjustTimer = timerState?.adjustTimer;
  const stopAlarm = timerState?.stopAlarm;
  const formatTimer = timerState?.formatTimer || ((sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  });

  const [isCustomTimerMode, setIsCustomTimerMode] = useState(false);
  const [inputMinutes, setInputMinutes] = useState('5');
  const [inputSeconds, setInputSeconds] = useState('00');

  // EdTech Polls State
  const [polls, setPolls] = useState([
    {
      id: 1,
      question: 'Which algorithms topic should we deep-dive into next?',
      category: 'Computer Science',
      options: [
        { text: 'AVL & Red-Black Balanced Trees', votes: 18 },
        { text: 'Dijkstra & Graph Shortest Paths', votes: 14 },
        { text: 'Dynamic Programming Memoization', votes: 22 },
        { text: 'Trie & Prefix Tree Matching', votes: 7 }
      ],
      userVoted: null,
      status: 'active'
    },
    {
      id: 2,
      question: 'What is the amortized complexity of inserting into an ArrayList?',
      category: 'Data Structures',
      options: [
        { text: 'O(1) Amortized Constant Time', votes: 31 },
        { text: 'O(n) Linear Time', votes: 5 },
        { text: 'O(log n) Logarithmic Time', votes: 2 }
      ],
      userVoted: null,
      status: 'active'
    }
  ]);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [newPollQ, setNewPollQ] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '', '']);

  // Notes State
  const [sharedNotes, setSharedNotes] = useState(
    '# Meeting Notes - connectt.live\n\nNavchetna Technologies × HomeGuru\n\n- Real WebRTC display media capture verified\n- Desmos scientific & graphing calculation active\n- Live Excalidraw collaborative board\n\nAction Items:\n- [x] Cloud recording always on\n- [x] Working Chess integration\n- [ ] Export session recap'
  );

  // Working Basic Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrev, setCalcPrev] = useState(null);
  const [calcOp, setCalcOp] = useState(null);

  // EdTech Live Quiz State (Add Quiz -> Post Quiz -> Give Quiz with LaTeX & Images)
  const [quizMode, setQuizMode] = useState('take'); // 'take' | 'create'
  const [quizTitle, setQuizTitle] = useState('Calculus & Chemical Equations Pop Quiz');
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Initial questions featuring KaTeX / chemfig / LaTeX and visual diagrams
  const [edtechQuizQuestions, setEdtechQuizQuestions] = useState([
    {
      id: 1,
      q: 'Evaluate the definite Gaussian integral: $$\\int_{-\\infty}^{\\infty} e^{-x^2} dx$$',
      image: '',
      options: [
        { text: '$\\sqrt{\\pi}$', image: '' },
        { text: '$\\frac{\\pi}{2}$', image: '' },
        { text: '$2\\pi$', image: '' },
        { text: '$\\infty$', image: '' }
      ],
      correct: 0,
      explanation: 'Using polar coordinates substitution $\\left(\\int e^{-x^2} dx\\right)^2 = \\int_0^{2\\pi} d\\theta \\int_0^\\infty r e^{-r^2} dr = \\pi$, yielding $\\sqrt{\\pi}$.'
    },
    {
      id: 2,
      q: 'In the complete combustion of methane, identify the stoichiometric coefficient $x$: $$\\text{CH}_4 + x\\text{O}_2 \\longrightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}$$',
      image: '',
      options: [
        { text: '$x = 1$', image: '' },
        { text: '$x = 2$', image: '' },
        { text: '$x = 3$', image: '' },
        { text: '$x = 4$', image: '' }
      ],
      correct: 1,
      explanation: 'Balancing oxygen atoms: The right-hand side has $2 + 2 = 4$ oxygen atoms. Therefore, $x = 2$ gives $2 \\times 2 = 4$ oxygen atoms.'
    },
    {
      id: 3,
      q: 'Calculate the fundamental trigonometric limit: $$\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$$',
      image: '',
      options: [
        { text: '$0$', image: '' },
        { text: '$1$', image: '' },
        { text: '$3$', image: '' },
        { text: 'Does not exist', image: '' }
      ],
      correct: 2,
      explanation: 'Rewrite as $\\lim_{x \\to 0} 3 \\cdot \\frac{\\sin(3x)}{3x} = 3 \\cdot 1 = 3$.'
    }
  ]);

  // Creator draft state for "Add Quiz & Post Quiz"
  const [createQuizTitle, setCreateQuizTitle] = useState('');
  const [createQuestionsList, setCreateQuestionsList] = useState([]);
  const [draftQ, setDraftQ] = useState('');
  const [draftImage, setDraftImage] = useState('');
  const [draftOptions, setDraftOptions] = useState([
    { text: '', image: '' },
    { text: '', image: '' },
    { text: '', image: '' },
    { text: '', image: '' }
  ]);
  const [draftCorrect, setDraftCorrect] = useState(0);
  const [draftExplanation, setDraftExplanation] = useState('');

  // Flashcards State
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flashcards = [
    { q: 'What is WebRTC?', a: 'Direct browser-to-browser peer communication for real-time video, audio, and data.' },
    { q: 'What is Desmos?', a: 'The premier mathematical calculation and graphing engine used worldwide in STEM education.' },
    { q: 'What is connectt.live?', a: 'An ultra-high-fidelity, enterprise-grade video collaboration platform co-built by Navchetna Technologies × HomeGuru.' }
  ];


  const handleSendChat = () => {
    if (!newMsg.trim() || !allowChat) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), sender: userName || 'You', time: timeStr, text: newMsg.trim() }
    ]);
    setNewMsg('');
    sfx.playReaction();
  };

  // Basic Calculator handler
  const handleCalcPress = (k) => {
    if (k === 'C') {
      setCalcDisplay('0');
      setCalcPrev(null);
      setCalcOp(null);
      return;
    }
    if (k === '±') {
      setCalcDisplay(prev => String(-parseFloat(prev || '0')));
      return;
    }
    if (k === '%') {
      setCalcDisplay(prev => String(parseFloat(prev || '0') / 100));
      return;
    }
    if (['+', '-', '×', '÷'].includes(k)) {
      setCalcPrev(parseFloat(calcDisplay));
      setCalcOp(k);
      setCalcDisplay('0');
      return;
    }
    if (k === '=') {
      if (calcOp && calcPrev !== null) {
        const cur = parseFloat(calcDisplay);
        let res = 0;
        if (calcOp === '+') res = calcPrev + cur;
        if (calcOp === '-') res = calcPrev - cur;
        if (calcOp === '×') res = calcPrev * cur;
        if (calcOp === '÷') res = cur !== 0 ? calcPrev / cur : 'Error';
        setCalcDisplay(String(Number(res.toFixed(6))));
        setCalcOp(null);
        setCalcPrev(null);
      }
      return;
    }
    if (k === '.') {
      if (!calcDisplay.includes('.')) setCalcDisplay(prev => prev + '.');
      return;
    }
    // Digit
    setCalcDisplay(prev => (prev === '0' ? String(k) : prev + String(k)));
  };

  return (
    <aside
      className={`google-meet-sidebar-aside ${isOpen ? 'open' : ''} ${isLight ? 'light-theme' : ''}`}
      style={{
        display: isOpen ? 'flex' : 'none',
        width: '360px',
        minWidth: '360px',
        backgroundColor: cBg,
        borderRadius: '16px',
        border: `1px solid ${cBorder}`,
        boxShadow: isLight ? '0 8px 32px rgba(0, 0, 0, 0.08)' : '0 8px 32px rgba(0, 0, 0, 0.65)',
        flexDirection: 'column',
        height: '100%',
        fontFamily: 'Google Sans, Roboto, sans-serif',
        zIndex: 50,
        overflow: 'hidden'
      }}
    >
      {/* Authentic Google Meet Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: `1px solid ${cBorder}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeActivity && (
            <button
              onClick={() => onSelectActivity(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: cSubtle,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = isLight ? '#f5f3ef' : 'rgba(255,255,255,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              title="Back"
            >
              <span className="icon" style={{ fontSize: '20px' }}>arrow_back</span>
            </button>
          )}
          <h2 style={{ fontSize: '18px', fontWeight: 500, color: cText, margin: 0 }}>
            {activeActivity === 'chat' ? 'In-call messages'
              : activeActivity === 'translation' ? 'Speech translation'
              : activeActivity === 'timer' ? 'Timer'
              : activeActivity === 'chess' ? 'Multiplayer Chess'
              : activeActivity === 'desmos_graph' ? 'Desmos Graphing'
              : activeActivity === 'desmos_sci' ? 'Desmos Scientific'
              : activeActivity === 'calc_basic' ? 'Calculator'
              : activeActivity === 'notes' ? 'Collaborative Notes'
              : activeActivity === 'polls' ? 'Polls'
              : activeActivity === 'quiz' ? 'Live Quiz'
              : activeActivity === 'flashcards' ? 'Flashcards'
              : activeActivity === 'settings' ? 'Settings'
              : 'Activities'}
          </h2>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: cSubtle,
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = isLight ? '#f5f3ef' : 'rgba(255,255,255,0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          title="Close"
        >
          <span className="icon" style={{ fontSize: '20px' }}>close</span>
        </button>
      </div>

      {/* Main Content Area */}
      {!activeActivity ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* ALWAYS ON CLOUD RECORDING CARD */}
          <div
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(234, 67, 53, 0.15), rgba(234, 67, 53, 0.05))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span className="icon filled" style={{ color: '#ea4335', fontSize: '20px' }}>
                  radio_button_checked
                </span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>
                  Recording
                </div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>
                  Always on • Cloud storage active
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(234, 67, 53, 0.15)',
                color: '#f28b82',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ea4335', animation: 'bounceDot 1.5s infinite ease-in-out' }} />
              <span>REC</span>
            </div>
          </div>

          {/* Pill 1: Speech translation */}
          <div
            onClick={() => { onSelectActivity('translation'); sfx.playToggle(true); }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(124, 172, 248, 0.12), rgba(124, 172, 248, 0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: '#7cacf8', fontSize: '20px' }}>translate</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>Speech translation</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Limited access</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>chevron_right</span>
          </div>

          {/* Pill 2: Timer */}
          <div
            onClick={() => { onSelectActivity('timer'); sfx.playToggle(true); }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isAlarmRinging
                    ? 'rgba(234, 67, 53, 0.22)'
                    : 'linear-gradient(135deg, rgba(168, 205, 237, 0.16), rgba(168, 205, 237, 0.04))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span
                  className="icon"
                  style={{ color: isAlarmRinging ? '#ea4335' : '#a8cded', fontSize: '20px' }}
                >
                  {isAlarmRinging ? 'alarm' : 'timer'}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>Timer</div>
                <div
                  style={{
                    fontSize: '12px',
                    color: isAlarmRinging ? '#ea4335' : cSubtle,
                    marginTop: '2px',
                    fontWeight: isAlarmRinging ? 600 : 400
                  }}
                >
                  {isAlarmRinging
                    ? "⏰ Time's Up! Alarm ringing"
                    : isTimerRunning
                    ? `Running • ${formatTimer(timerSeconds)}`
                    : 'Configure in sidebar • Play on stage'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAlarmRinging) {
                    stopAlarm?.();
                  } else {
                    startTimer?.(true);
                  }
                  sfx.playToggle(true);
                }}
                title={isAlarmRinging ? 'Stop Alarm' : 'Play Timer on Stage'}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: isAlarmRinging ? 'rgba(234, 67, 53, 0.2)' : 'rgba(168, 205, 237, 0.16)',
                  color: isAlarmRinging ? '#ff8a80' : '#a8cded',
                  border: isAlarmRinging ? '1px solid rgba(234, 67, 53, 0.4)' : '1px solid rgba(168, 205, 237, 0.3)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span className="icon" style={{ fontSize: '13px' }}>
                  {isAlarmRinging ? 'notifications_off' : 'play_arrow'}
                </span>
                <span>{isAlarmRinging ? 'Stop' : 'Stage'}</span>
              </button>
              <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>chevron_right</span>
            </div>
          </div>

          {/* Pill 3: Whiteboard (Excalidraw Package -> Full Stage) */}
          <div
            onClick={() => {
              onStartStageSharing?.('whiteboard');
              sfx.playToggle(true);
            }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(137, 183, 84, 0.14), rgba(137, 183, 84, 0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: '#89b754', fontSize: '20px' }}>gesture</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>Whiteboard</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Draw together on main stage</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>open_in_new</span>
          </div>

          {/* Pill 3b: RUX Code Studio */}
          <div
            onClick={() => {
              onStartStageSharing?.('code');
              sfx.playToggle(true);
            }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isLight ? '#f5f3ef' : '#0d1117', border: `1px solid ${cBorder}` }}>
                <img src="/rux.png" alt="RUX" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: cText }}>RUX Code Studio</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Collaborative coding on stage</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>open_in_new</span>
          </div>

          {/* Pill 3c: YouTube Watch Party */}
          <div
            onClick={() => {
              onStartStageSharing?.('youtube');
              sfx.playToggle(true);
            }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(234, 67, 53, 0.14), rgba(234, 67, 53, 0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: '#ea4335', fontSize: '20px' }}>smart_display</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>YouTube</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Watch synced videos</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>open_in_new</span>
          </div>

          {/* Pill 3d: Slide Deck Presenter */}
          <div
            onClick={() => {
              onStartStageSharing?.('slides');
              sfx.playToggle(true);
            }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(251, 188, 4, 0.14), rgba(251, 188, 4, 0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: '#fbbc04', fontSize: '20px' }}>co_present</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>Slides</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Present interactive deck</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>open_in_new</span>
          </div>

          {/* Pill 4: Multiplayer Chess */}
          <div
            onClick={() => {
              onStartStageSharing?.('chess');
              sfx.playToggle(true);
            }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(253, 214, 99, 0.14), rgba(253, 214, 99, 0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: '#fdd663', fontSize: '20px' }}>sports_esports</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>Multiplayer Chess</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Play on main stage</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>open_in_new</span>
          </div>

          {/* Pill 5: Desmos Graphing Calculator */}
          <div
            onClick={() => {
              onStartStageSharing?.('desmos_graph');
              sfx.playToggle(true);
            }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(124, 172, 248, 0.12), rgba(124, 172, 248, 0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: '#7cacf8', fontSize: '20px' }}>show_chart</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>Desmos Graphing</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Plot equations on main stage</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>open_in_new</span>
          </div>

          {/* Pill 6: Desmos Scientific Calculator */}
          {/* Pill 6: Desmos Scientific Calculator (Shares to Stage) */}
          <div
            onClick={() => {
              onStartStageSharing?.('desmos_sci');
              sfx.playToggle(true);
            }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(129, 201, 149, 0.14), rgba(129, 201, 149, 0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: '#81c995', fontSize: '20px' }}>functions</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>Desmos Scientific</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Trig & logs on main stage</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>open_in_new</span>
          </div>

          {/* Pill 7: Flashcards (Shares to Stage) */}
          <div
            onClick={() => {
              onStartStageSharing?.('flashcards');
              sfx.playToggle(true);
            }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(215, 174, 251, 0.14), rgba(215, 174, 251, 0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: '#d7aefb', fontSize: '20px' }}>style</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>Flashcards</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Interactive deck on main stage</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>open_in_new</span>
          </div>

          {/* Pill 8: Working Basic Calculator */}
          <div
            onClick={() => { onSelectActivity('calc_basic'); sfx.playToggle(true); }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(253, 214, 99, 0.12), rgba(253, 214, 99, 0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: '#fdd663', fontSize: '20px' }}>calculate</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>Calculator</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Basic · personal</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>chevron_right</span>
          </div>

          {/* Pill 9: In-call messages */}
          <div
            onClick={() => { onSelectActivity('chat'); sfx.playToggle(true); }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(124, 172, 248, 0.12), rgba(124, 172, 248, 0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: '#7cacf8', fontSize: '20px' }}>chat</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>In-call messages</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Send messages & files to call</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>chevron_right</span>
          </div>

          {/* Pill 10: Collaborative Notes */}
          <div
            onClick={() => { onSelectActivity('notes'); sfx.playToggle(true); }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(129, 201, 149, 0.12), rgba(129, 201, 149, 0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: '#81c995', fontSize: '20px' }}>edit_note</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>Collaborative Notes</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Shared editing</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>chevron_right</span>
          </div>

          {/* Pill 11: Polls */}
          <div
            onClick={() => { onSelectActivity('polls'); sfx.playToggle(true); }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(215, 174, 251, 0.12), rgba(215, 174, 251, 0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: '#d7aefb', fontSize: '20px' }}>poll</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>Polls</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Live classroom voting</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>chevron_right</span>
          </div>

          {/* Pill 11b: Live Quiz */}
          <div
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div
              onClick={() => { onSelectActivity('quiz'); sfx.playToggle(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(142, 195, 156, 0.16), rgba(142, 195, 156, 0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: '#8ec39c', fontSize: '20px' }}>quiz</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>Live Quiz</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Interactive STEM competition (Sidebar & Stage)</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartStageSharing?.('quiz');
                  sfx.playToggle(true);
                }}
                title="Present Quiz to Stage"
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(142, 195, 156, 0.18)',
                  color: '#8ec39c',
                  border: '1px solid rgba(142, 195, 156, 0.3)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span className="icon" style={{ fontSize: '13px' }}>open_in_new</span>
                <span>Stage</span>
              </button>
              <span
                onClick={() => { onSelectActivity('quiz'); sfx.playToggle(true); }}
                className="icon"
                style={{ color: '#9aa0a6', fontSize: '20px', cursor: 'pointer' }}
              >
                chevron_right
              </span>
            </div>
          </div>

          {/* Pill 12: Host Controls */}
          <div
            onClick={() => { onSelectActivity('host_controls'); sfx.playToggle(true); }}
            style={{
              backgroundColor: cCard, border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(168, 199, 250, 0.14), rgba(168, 199, 250, 0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: '#a8c7fa', fontSize: '20px' }}>security</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>Host controls</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Meeting moderation & safety</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>chevron_right</span>
          </div>

          {/* SETTINGS CARD (Always visible & prominent at bottom) */}
          <div
            onClick={() => { onSelectActivity('settings'); sfx.playToggle(true); }}
            style={{
              marginTop: '12px',
              backgroundColor: cCard,
              borderRadius: '28px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: `1px solid ${cBorder}`,
              boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cCard)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ color: cText, fontSize: '20px' }}>settings</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: cText }}>Settings</div>
                <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px' }}>Audio, video, & devices</div>
              </div>
            </div>
            <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>chevron_right</span>
          </div>
        </div>
      ) : (
        /* ACTIVE TOOL SUB-VIEW */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* DESMOS SCIENTIFIC */}
          {activeActivity === 'desmos_sci' && (
            <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: cSubtle }}>Powered by Desmos API</span>
                <button
                  onClick={() => onStartStageSharing?.('desmos_sci')}
                  style={{ padding: '6px 12px', borderRadius: '8px', background: '#89b754', color: '#000', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Share to Stage
                </button>
              </div>
              <div style={{ flex: 1, minHeight: '400px' }}>
                <DesmosCalculator type="scientific" />
              </div>
            </div>
          )}

          {/* BASIC CALCULATOR */}
          {activeActivity === 'calc_basic' && (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  backgroundColor: isLight ? '#f5f3ef' : '#131314',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  textAlign: 'right',
                  fontSize: '32px',
                  fontWeight: 500,
                  color: isLight ? '#1a1814' : '#89b754',
                  fontFamily: 'Roboto Mono, monospace',
                  minHeight: '70px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  border: `1px solid ${cBorder}`
                }}
              >
                {calcDisplay}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {['C', '±', '%', '÷', 7, 8, 9, '×', 4, 5, 6, '-', 1, 2, 3, '+'].map((k) => (
                  <button
                    key={k}
                    onClick={() => handleCalcPress(k)}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      background: typeof k === 'number'
                        ? (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.06)')
                        : (isLight ? '#eeebe4' : '#282a2c'),
                      color: typeof k === 'number' ? cText : (isLight ? '#1a1814' : '#89b754'),
                      fontSize: '16px',
                      border: `1px solid ${cBorder}`,
                      cursor: 'pointer'
                    }}
                  >
                    {k}
                  </button>
                ))}

                <button
                  onClick={() => handleCalcPress(0)}
                  style={{ gridColumn: 'span 2', padding: '14px', borderRadius: '12px', background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.06)', color: cText, fontSize: '16px', border: `1px solid ${cBorder}`, cursor: 'pointer' }}
                >
                  0
                </button>
                <button
                  onClick={() => handleCalcPress('.')}
                  style={{ padding: '14px', borderRadius: '12px', background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.06)', color: cText, fontSize: '16px', border: `1px solid ${cBorder}`, cursor: 'pointer' }}
                >
                  .
                </button>
                <button
                  onClick={() => handleCalcPress('=')}
                  style={{ padding: '14px', borderRadius: '12px', background: '#89b754', color: '#ffffff', fontSize: '18px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  =
                </button>
              </div>
            </div>
          )}

          {/* CHESS IN SIDEBAR */}
          {activeActivity === 'chess' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <ChessGame onShareToStage={() => onStartStageSharing?.('chess')} theme={theme} />
            </div>
          )}

          {/* IN-CALL MESSAGES */}
          {activeActivity === 'chat' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  background: isLight ? '#fbfbfb' : 'rgba(255, 255, 255, 0.03)',
                  borderBottom: `1px solid ${cBorder}`
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', color: cText, fontWeight: 500 }}>Let everyone send messages</div>
                  <div style={{ fontSize: '11px', color: cSubtle }}>Host management setting</div>
                </div>
                <label className="m3-switch">
                  <input
                    type="checkbox"
                    checked={allowChat}
                    onChange={() => setAllowChat(!allowChat)}
                  />
                  <span className="m3-slider round"></span>
                </label>
              </div>

              <div style={{ padding: '10px 14px', fontSize: '12px', color: cSubtle, background: isLight ? '#f5f3ef' : 'rgba(255,255,255,0.03)', border: `1px solid ${cBorder}`, margin: '12px 16px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span className="icon" style={{ fontSize: '16px', color: '#7cacf8', marginTop: '1px' }}>info</span>
                <span>Messages can only be seen by people in the call and are deleted when the call ends.</span>
              </div>

              <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                {chatMessages.map(m => {
                  const isMe = m.sender === userName || m.sender === 'You';
                  if (m.isSystem) {
                    return (
                      <div key={m.id} style={{ textAlign: 'center', padding: '6px', fontSize: '11px', color: '#8e918f' }}>
                        {m.text}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        gap: '3px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={getDiceBearAvatar(m.sender)}
                          alt={m.sender}
                          style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: isMe ? '#89b754' : '#7cacf8' }}>{m.sender}</span>
                        <span style={{ fontSize: '10px', color: '#8e918f' }}>{m.time}</span>
                      </div>
                      <div
                        style={{
                          backgroundColor: isMe ? (isLight ? '#e6f4ea' : 'rgba(137, 183, 84, 0.15)') : (isLight ? '#f5f3ef' : '#28292a'),
                          border: isMe ? (isLight ? '1px solid #ceead6' : '1px solid rgba(137, 183, 84, 0.3)') : `1px solid ${cBorder}`,
                          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          padding: '10px 14px',
                          color: cText,
                          fontSize: '13px',
                          lineHeight: 1.45,
                          maxWidth: '85%',
                          wordBreak: 'break-word',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        {m.file && m.file.isImage && (
                          <img
                            src={m.file.url}
                            alt={m.file.name}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '180px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          />
                        )}
                        {m.file && !m.file.isImage && (
                          <a
                            href={m.file.url}
                            download={m.file.name}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(0, 0, 0, 0.25)',
                              color: '#89b754',
                              textDecoration: 'none',
                              fontSize: '12px'
                            }}
                          >
                            <span className="icon" style={{ fontSize: '20px' }}>description</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600, color: '#fff' }}>{m.file.name}</span>
                              <span style={{ fontSize: '10px', color: '#9aa0a6' }}>{m.file.size} • Download</span>
                            </div>
                          </a>
                        )}
                        <span>{m.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: '14px 16px', borderTop: `1px solid ${cBorder}`, display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!allowChat}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.08)',
                    color: cSubtle,
                    border: `1px solid ${cBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: allowChat ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  title="Attach file"
                >
                  <span className="icon" style={{ fontSize: '18px' }}>attach_file</span>
                </button>
                <input
                  type="text"
                  placeholder={allowChat ? "Send a message to everyone" : "Chat disabled by host"}
                  disabled={!allowChat}
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendChat(); }}
                  style={{
                    flex: 1,
                    background: isLight ? '#f5f3ef' : '#131314',
                    border: `1px solid ${cBorder}`,
                    borderRadius: '24px',
                    padding: '10px 16px',
                    color: cText,
                    fontSize: '13px',
                    outline: 'none',
                    opacity: allowChat ? 1 : 0.5
                  }}
                />
                <button
                  onClick={handleSendChat}
                  disabled={!newMsg.trim() || !allowChat}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: newMsg.trim() ? '#89b754' : (isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.08)'),
                    color: newMsg.trim() ? '#ffffff' : (isLight ? '#a8a39d' : '#8e918f'),
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: newMsg.trim() ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  <span className="icon" style={{ fontSize: '18px' }}>send</span>
                </button>
              </div>
            </div>
          )}

          {/* TIMER (SETTINGS IN SIDEBAR • PLAY ON STAGE • AUDIBLE ALARM) */}
          {activeActivity === 'timer' && (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              {/* Audible Alarm Alert Banner (if ringing) */}
              {isAlarmRinging && (
                <div
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(234, 67, 53, 0.12)',
                    border: '1px solid rgba(234, 67, 53, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '32px' }}>⏰</div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: '#ff8a80' }}>
                    Time's Up! Alarm Ringing
                  </div>
                  <div style={{ fontSize: '12px', color: '#c4c7c5' }}>
                    Audible tone sounding across the room
                  </div>
                  <button
                    onClick={() => {
                      stopAlarm?.();
                      sfx.playReaction();
                    }}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '24px',
                      backgroundColor: '#ff8a80',
                      color: '#111215',
                      fontWeight: 700,
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 0 16px rgba(255, 138, 128, 0.4)'
                    }}
                  >
                    <span className="icon" style={{ fontSize: '18px' }}>notifications_off</span>
                    <span>Stop Alarm</span>
                  </button>
                </div>
              )}

              {/* Main Time Countdown Display */}
              {!isCustomTimerMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    onClick={() => {
                      if (!isTimerRunning) setIsCustomTimerMode(true);
                    }}
                    style={{
                      fontSize: '52px',
                      fontWeight: 600,
                      color: isAlarmRinging ? '#ff8a80' : isTimerRunning ? (isLight ? '#f48120' : '#a8cded') : cText,
                      fontFamily: 'Roboto Mono, monospace',
                      letterSpacing: '2px',
                      margin: '8px 0',
                      cursor: !isTimerRunning ? 'pointer' : 'default',
                      padding: '4px 16px',
                      borderRadius: '12px',
                      backgroundColor: !isTimerRunning ? (isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.04)') : 'transparent',
                      border: !isTimerRunning ? `1px dashed ${cBorder}` : '1px solid transparent',
                      transition: 'color 0.2s ease'
                    }}
                    title={!isTimerRunning ? 'Click to edit duration' : ''}
                  >
                    {formatTimer(timerSeconds)}
                  </div>
                  {!isTimerRunning && (
                    <button
                      onClick={() => setIsCustomTimerMode(true)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: cSubtle,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        marginTop: '2px'
                      }}
                    >
                      <span className="icon" style={{ fontSize: '14px' }}>edit</span>
                      <span>Edit duration</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Custom Time Input Form */
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: isLight ? '#fbfbfb' : '#1e1f22',
                    borderRadius: '16px',
                    border: `1px solid ${cBorder}`,
                    width: '100%',
                    maxWidth: '300px'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, color: cText }}>
                    Set Custom Duration
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={inputMinutes}
                        onChange={(e) => setInputMinutes(e.target.value)}
                        style={{
                          width: '64px',
                          height: '44px',
                          textAlign: 'center',
                          fontSize: '22px',
                          fontWeight: 600,
                          backgroundColor: isLight ? '#ffffff' : '#121316',
                          color: cText,
                          border: `1px solid ${cBorder}`,
                          borderRadius: '8px',
                          outline: 'none'
                        }}
                      />
                      <span style={{ fontSize: '11px', color: cSubtle, marginTop: '4px' }}>Minutes</span>
                    </div>

                    <span style={{ fontSize: '24px', fontWeight: 600, color: cSubtle }}>:</span>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={inputSeconds}
                        onChange={(e) => setInputSeconds(e.target.value)}
                        style={{
                          width: '64px',
                          height: '44px',
                          textAlign: 'center',
                          fontSize: '22px',
                          fontWeight: 600,
                          backgroundColor: isLight ? '#ffffff' : '#121316',
                          color: cText,
                          border: `1px solid ${cBorder}`,
                          borderRadius: '8px',
                          outline: 'none'
                        }}
                      />
                      <span style={{ fontSize: '11px', color: cSubtle, marginTop: '4px' }}>Seconds</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      onClick={() => {
                        const m = parseInt(inputMinutes, 10) || 0;
                        const s = parseInt(inputSeconds, 10) || 0;
                        const total = Math.max(1, m * 60 + s);
                        resetTimer?.(total);
                        setIsCustomTimerMode(false);
                        sfx.playReaction();
                      }}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '16px',
                        backgroundColor: isLight ? '#f48120' : '#a8cded',
                        color: isLight ? '#ffffff' : '#0e1720',
                        fontWeight: 600,
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Set Timer
                    </button>
                    <button
                      onClick={() => setIsCustomTimerMode(false)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '16px',
                        backgroundColor: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.08)',
                        color: cText,
                        fontSize: '12px',
                        border: isLight ? `1px solid ${cBorder}` : 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Incremental Adjustment Buttons (+1m, +5m, -1m) */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    adjustTimer?.(-60);
                    sfx.playReaction();
                  }}
                  disabled={timerSeconds < 60 || isTimerRunning}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.06)',
                    color: timerSeconds < 60 || isTimerRunning ? (isLight ? '#c7c4be' : '#555') : cText,
                    fontSize: '11px',
                    fontWeight: 500,
                    border: `1px solid ${cBorder}`,
                    cursor: timerSeconds < 60 || isTimerRunning ? 'default' : 'pointer'
                  }}
                >
                  -1 min
                </button>
                <button
                  onClick={() => {
                    adjustTimer?.(60);
                    sfx.playReaction();
                  }}
                  disabled={isTimerRunning}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.06)',
                    color: isTimerRunning ? (isLight ? '#c7c4be' : '#555') : cText,
                    fontSize: '11px',
                    fontWeight: 500,
                    border: `1px solid ${cBorder}`,
                    cursor: isTimerRunning ? 'default' : 'pointer'
                  }}
                >
                  +1 min
                </button>
                <button
                  onClick={() => {
                    adjustTimer?.(300);
                    sfx.playReaction();
                  }}
                  disabled={isTimerRunning}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.06)',
                    color: isTimerRunning ? (isLight ? '#c7c4be' : '#555') : cText,
                    fontSize: '11px',
                    fontWeight: 500,
                    border: `1px solid ${cBorder}`,
                    cursor: isTimerRunning ? 'default' : 'pointer'
                  }}
                >
                  +5 min
                </button>
              </div>

              {/* Action Buttons (Play on Stage / Pause / Reset) */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                {isTimerRunning ? (
                  <>
                    <button
                      onClick={() => {
                        pauseTimer?.();
                        sfx.playReaction();
                      }}
                      style={{
                        padding: '10px 22px',
                        borderRadius: '9999px',
                        background: isLight ? '#f5f3ef' : '#3c4043',
                        color: cText,
                        fontWeight: 600,
                        fontSize: '13px',
                        border: `1px solid ${cBorder}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span className="icon" style={{ fontSize: '16px' }}>pause</span>
                      <span>Pause</span>
                    </button>
                    <button
                      onClick={() => {
                        startTimer?.(true);
                        sfx.playReaction();
                      }}
                      style={{
                        padding: '10px 22px',
                        borderRadius: '9999px',
                        background: isLight ? '#fef3e2' : '#a8cded',
                        color: isLight ? '#f48120' : '#0e1720',
                        fontWeight: 600,
                        fontSize: '13px',
                        border: isLight ? '1px solid #fbd38d' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isLight ? '0 2px 8px rgba(244, 129, 32, 0.15)' : '0 2px 10px rgba(168, 205, 237, 0.3)'
                      }}
                    >
                      <span className="icon" style={{ fontSize: '16px' }}>open_in_new</span>
                      <span>Open on Stage</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      startTimer?.(true);
                      sfx.playReaction();
                    }}
                    style={{
                      padding: '10px 28px',
                      borderRadius: '9999px',
                      background: isLight ? '#f48120' : '#a8cded',
                      color: isLight ? '#ffffff' : '#0e1720',
                      fontWeight: 700,
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: isLight ? '0 2px 12px rgba(244, 129, 32, 0.35)' : '0 2px 12px rgba(168, 205, 237, 0.35)'
                    }}
                  >
                    <span className="icon" style={{ fontSize: '18px' }}>play_arrow</span>
                    <span>Play on Stage</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    resetTimer?.(initialTimerSeconds);
                    sfx.playToggle(false);
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '9999px',
                    background: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.08)',
                    color: cText,
                    fontSize: '13px',
                    border: `1px solid ${cBorder}`,
                    cursor: 'pointer'
                  }}
                >
                  Reset
                </button>
              </div>

              {/* Informational Subtitle */}
              <div style={{ fontSize: '12px', color: cSubtle, textAlign: 'center', maxWidth: '280px', lineHeight: 1.4 }}>
                Settings are configured here in the sidebar. Playback & countdown ring live on the main presentation stage.
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ width: '100%', borderTop: `1px solid ${cBorder}`, paddingTop: '16px', marginTop: '4px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: cSubtle, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px', textAlign: 'center' }}>
                  Quick Presets
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                  {[
                    { label: '1 min', sec: 60 },
                    { label: '3 min', sec: 180 },
                    { label: '5 min', sec: 300 },
                    { label: '10 min', sec: 600 },
                    { label: '15 min', sec: 900 },
                    { label: '25 min (Pomodoro)', sec: 1500 },
                    { label: '45 min', sec: 2700 }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        resetTimer?.(preset.sec);
                        setInputMinutes(Math.floor(preset.sec / 60).toString());
                        setInputSeconds((preset.sec % 60).toString().padStart(2, '0'));
                        sfx.playReaction();
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        backgroundColor: timerSeconds === preset.sec
                          ? (isLight ? '#fef3e2' : 'rgba(168, 205, 237, 0.18)')
                          : (isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.04)'),
                        border: timerSeconds === preset.sec
                          ? `1px solid ${isLight ? '#f48120' : '#a8cded'}`
                          : `1px solid ${cBorder}`,
                        color: timerSeconds === preset.sec
                          ? (isLight ? '#f48120' : '#a8cded')
                          : cSubtle,
                        fontSize: '11px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TRANSLATION */}
          {activeActivity === 'translation' && (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '13px', color: cSubtle }}>Spoken captions will automatically be translated into your selected language.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Spanish (es)', 'French (fr)', 'Hindi (hi)', 'German (de)', 'Japanese (ja)'].map(l => (
                  <div key={l} onClick={() => setSpeechLang(l)} style={{ padding: '12px 16px', borderRadius: '12px', background: speechLang === l ? (isLight ? '#e6f4ea' : 'rgba(137, 183, 84, 0.15)') : cCard, border: speechLang === l ? '1px solid #89b754' : `1px solid ${cBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span style={{ fontSize: '14px', color: cText }}>{l}</span>
                    {speechLang === l && <span className="icon" style={{ color: '#89b754', fontSize: '18px' }}>check</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTES */}
          {activeActivity === 'notes' && (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: cSubtle }}>Collaborative meeting pad</span>
                <button onClick={() => { navigator.clipboard.writeText(sharedNotes); sfx.playReaction(); }} style={{ padding: '4px 12px', borderRadius: '6px', background: isLight ? '#f5f3ef' : 'rgba(255,255,255,0.06)', color: '#89b754', border: `1px solid ${cBorder}`, fontSize: '11px', cursor: 'pointer' }}>
                  Copy Notes
                </button>
              </div>
              <textarea value={sharedNotes} onChange={(e) => setSharedNotes(e.target.value)} style={{ flex: 1, minHeight: '380px', backgroundColor: isLight ? '#f5f3ef' : '#131314', border: `1px solid ${cBorder}`, borderRadius: '12px', padding: '14px', color: cText, fontSize: '13px', lineHeight: 1.6, fontFamily: 'monospace', resize: 'none', outline: 'none' }} />
            </div>
          )}

          {/* EDTECH CLASSROOM POLLS */}
          {activeActivity === 'polls' && (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              {!isCreatingPoll ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '13px', color: '#9aa0a6' }}>
                      {polls.length} Active Classroom Polls
                    </div>
                    <button
                      onClick={() => setIsCreatingPoll(true)}
                      style={{
                        background: '#89b754',
                        color: '#ffffff',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontWeight: 600,
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span className="icon" style={{ fontSize: '16px' }}>add</span>
                      <span>New Poll</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {polls.map((p) => {
                      const totalVotes = p.options.reduce((a, b) => a + b.votes, 0);
                      return (
                        <div
                          key={p.id}
                          style={{
                            background: cCard,
                            borderRadius: '16px',
                            padding: '18px',
                            border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : '0 4px 16px rgba(0,0,0,0.2)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#89b754', fontWeight: 600, textTransform: 'uppercase', backgroundColor: 'rgba(137,183,84,0.12)', padding: '2px 8px', borderRadius: '6px' }}>
                              {p.category || 'Classroom Poll'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#9aa0a6' }}>
                              {totalVotes} total votes
                            </span>
                          </div>

                          <div style={{ fontSize: '15px', fontWeight: 600, color: cText, marginBottom: '14px', lineHeight: 1.4 }}>
                            {p.question}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {p.options.map((opt, i) => {
                              const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                              const isSelected = p.userVoted === i;
                              return (
                                <div
                                  key={i}
                                  onClick={() => {
                                    if (p.userVoted === null) {
                                      setPolls(prev => prev.map(pl => {
                                        if (pl.id === p.id) {
                                          const opts = [...pl.options];
                                          opts[i].votes += 1;
                                          return { ...pl, options: opts, userVoted: i };
                                        }
                                        return pl;
                                      }));
                                      sfx.playToggle(true);
                                    }
                                  }}
                                  style={{
                                    position: 'relative',
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    background: isSelected ? 'rgba(137, 183, 84, 0.18)' : (isLight ? '#f5f3ef' : '#18191b'),
                                    border: isSelected ? '1px solid #89b754' : `1px solid ${cBorder}`,
                                    cursor: p.userVoted === null ? 'pointer' : 'default',
                                    overflow: 'hidden',
                                    transition: 'background-color 0.15s ease'
                                  }}
                                >
                                  {/* Vote Percentage Fill Bar */}
                                  <div
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      bottom: 0,
                                      width: `${pct}%`,
                                      background: isSelected ? 'rgba(137, 183, 84, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                                      transition: 'width 0.4s ease'
                                    }}
                                  />
                                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {isSelected && (
                                        <span className="icon" style={{ fontSize: '16px', color: '#89b754' }}>check_circle</span>
                                      )}
                                      <span style={{ fontSize: '13px', color: cText, fontWeight: isSelected ? 600 : 400 }}>
                                        {opt.text}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? '#89b754' : '#9aa0a6' }}>
                                      {pct}% ({opt.votes})
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {p.userVoted !== null && (
                            <div style={{ marginTop: '12px', fontSize: '11px', color: '#89b754', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span className="icon" style={{ fontSize: '14px' }}>done</span>
                              <span>Your vote has been submitted to the live call</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* CREATE POLL FORM */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: cCard, padding: '18px', borderRadius: '16px', border: `1px solid ${cBorder}`, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : 'none' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: cText }}>Create a Classroom Poll</div>
                  <input
                    type="text"
                    placeholder="Enter question (e.g. Which algorithm to review?)"
                    value={newPollQ}
                    onChange={(e) => setNewPollQ(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', background: isLight ? '#f5f3ef' : '#141517', border: `1px solid ${cBorder}`, color: cText, fontSize: '13px', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {newPollOptions.map((opt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newPollOptions];
                          updated[idx] = e.target.value;
                          setNewPollOptions(updated);
                        }}
                        style={{ padding: '10px 14px', borderRadius: '8px', background: isLight ? '#f5f3ef' : '#141517', border: `1px solid ${cBorder}`, color: cText, fontSize: '13px', outline: 'none' }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setNewPollOptions([...newPollOptions, ''])}
                    style={{ background: 'transparent', border: 'none', color: '#89b754', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span className="icon" style={{ fontSize: '16px' }}>add</span>
                    <span>Add another option</span>
                  </button>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      onClick={() => {
                        const validOpts = newPollOptions.filter(o => o.trim());
                        if (newPollQ.trim() && validOpts.length >= 2) {
                          setPolls(prev => [
                            {
                              id: Date.now(),
                              question: newPollQ.trim(),
                              category: 'Custom Question',
                              options: validOpts.map(t => ({ text: t.trim(), votes: 0 })),
                              userVoted: null,
                              status: 'active'
                            },
                            ...prev
                          ]);
                          setIsCreatingPoll(false);
                          setNewPollQ('');
                          setNewPollOptions(['', '', '']);
                          sfx.playReaction();
                        }
                      }}
                      style={{ padding: '10px 22px', borderRadius: '20px', background: '#89b754', color: '#ffffff', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                    >
                      Launch to Class
                    </button>
                    <button
                      onClick={() => setIsCreatingPoll(false)}
                      style={{ padding: '10px 16px', borderRadius: '20px', background: 'transparent', color: '#c4c7c5', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EDTECH LIVE CLASSROOM QUIZ (ADD QUIZ -> POST QUIZ -> GIVE QUIZ) */}
          {activeActivity === 'quiz' && (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              {/* Top Mode Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: cText }}>{quizTitle}</div>
                  <div style={{ fontSize: '11px', color: cSubtle }}>
                    {quizMode === 'create' ? 'Creator Mode • Add & Post Quiz' : `${edtechQuizQuestions.length} Questions • KaTeX & ChemFig Ready`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {/* Present to Stage Button */}
                  <button
                    onClick={() => {
                      onStartStageSharing?.('quiz');
                      sfx.playToggle(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(142, 195, 156, 0.16)',
                      color: '#8ec39c',
                      fontWeight: 600,
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      border: '1px solid rgba(142, 195, 156, 0.28)'
                    }}
                    title="Present Quiz to Main Stage"
                  >
                    <span className="icon" style={{ fontSize: '13px' }}>open_in_new</span>
                    <span>Present</span>
                  </button>

                  {quizMode === 'take' ? (
                    <button
                      onClick={() => {
                        setQuizMode('create');
                        setCreateQuestionsList([]);
                        setCreateQuizTitle('');
                        setDraftQ('');
                        setDraftImage('');
                        setDraftOptions([{ text: '', image: '' }, { text: '', image: '' }, { text: '', image: '' }, { text: '', image: '' }]);
                        setDraftCorrect(0);
                        setDraftExplanation('');
                        sfx.playToggle(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: '#e3e3e3',
                        fontWeight: 600,
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        border: '1px solid rgba(255, 255, 255, 0.12)'
                      }}
                    >
                      <span className="icon" style={{ fontSize: '14px' }}>add</span>
                      <span>Add Quiz</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizMode('take');
                        sfx.playToggle(false);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: '#c4c7c5',
                        fontSize: '11px',
                        cursor: 'pointer',
                        border: 'none'
                      }}
                    >
                      Back to Quiz
                    </button>
                  )}
                </div>
              </div>

              {/* MODE 1: CREATE & POST QUIZ */}
              {quizMode === 'create' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Quiz Title Input */}
                  <div>
                    <label style={{ fontSize: '11px', color: '#9aa0a6', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Quiz Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Organic Reaction Mechanisms & Integral Calculus"
                      value={createQuizTitle}
                      onChange={(e) => setCreateQuizTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: isLight ? '#f5f3ef' : '#1b1c1f',
                        border: `1px solid ${cBorder}`,
                        color: cText,
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Question Creator Box */}
                  <div style={{ backgroundColor: isLight ? '#f5f3ef' : '#191a1d', padding: '16px', borderRadius: '14px', border: `1px solid ${cBorder}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#fbbc04' }}>
                        Question #{createQuestionsList.length + 1}
                      </span>
                      <span style={{ fontSize: '11px', color: '#747775' }}>Supports $math$ and $\text&#123;chem&#125;$</span>
                    </div>

                    {/* Question Text Input */}
                    <textarea
                      placeholder="Enter question (e.g., Solve $\int_0^1 x^2 dx$ or $\text{CH}_4 + 2\text{O}_2 \rightarrow ?$)..."
                      value={draftQ}
                      onChange={(e) => setDraftQ(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '70px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: isLight ? '#ffffff' : '#121315',
                        border: `1px solid ${cBorder}`,
                        color: cText,
                        fontSize: '13px',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />

                    {/* Live KaTeX / Chemfig Preview */}
                    {draftQ.trim() && (
                      <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(137, 183, 84, 0.08)', border: '1px solid rgba(137, 183, 84, 0.2)', fontSize: '13px', color: '#e3e3e3' }}>
                        <div style={{ fontSize: '10px', color: '#89b754', fontWeight: 600, marginBottom: '2px' }}>LIVE MATH PREVIEW</div>
                        <MathRenderer text={draftQ} />
                      </div>
                    )}

                    {/* Question Image URL (optional) */}
                    <div>
                      <input
                        type="text"
                        placeholder="Attach question image URL (optional, e.g. diagram/graph)..."
                        value={draftImage}
                        onChange={(e) => setDraftImage(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#121315',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#ffffff',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      />
                      {draftImage && (
                        <div style={{ marginTop: '6px', maxHeight: '120px', overflow: 'hidden', borderRadius: '8px' }}>
                          <img src={draftImage} alt="Question preview" style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }} />
                        </div>
                      )}
                    </div>

                    {/* 4 Options Input with Math & Image support */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#9aa0a6', fontWeight: 600 }}>Options (Select radio for correct answer):</span>
                      {draftOptions.map((opt, optIdx) => (
                        <div key={optIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: '#141517', padding: '8px 10px', borderRadius: '8px', border: draftCorrect === optIdx ? '1px solid #89b754' : '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="radio"
                              name="correctOption"
                              checked={draftCorrect === optIdx}
                              onChange={() => setDraftCorrect(optIdx)}
                              style={{ accentColor: '#89b754', cursor: 'pointer' }}
                              title="Mark as correct answer"
                            />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: draftCorrect === optIdx ? '#89b754' : '#c4c7c5', width: '16px' }}>
                              {['A', 'B', 'C', 'D'][optIdx]}
                            </span>
                            <input
                              type="text"
                              placeholder={`Option ${['A', 'B', 'C', 'D'][optIdx]} text or LaTeX math (e.g. $1/3$)...`}
                              value={opt.text}
                              onChange={(e) => {
                                const copy = [...draftOptions];
                                copy[optIdx].text = e.target.value;
                                setDraftOptions(copy);
                              }}
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#101113',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#ffffff',
                                fontSize: '12px',
                                outline: 'none'
                              }}
                            />
                          </div>

                          {/* Option Image URL (optional) */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '28px' }}>
                            <input
                              type="text"
                              placeholder="Image URL for this option (optional)..."
                              value={opt.image}
                              onChange={(e) => {
                                const copy = [...draftOptions];
                                copy[optIdx].image = e.target.value;
                                setDraftOptions(copy);
                              }}
                              style={{
                                flex: 1,
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(255,255,255,0.06)',
                                color: '#aaa',
                                fontSize: '11px',
                                outline: 'none'
                              }}
                            />
                          </div>

                          {/* Option Live Preview */}
                          {opt.text && (
                            <div style={{ paddingLeft: '28px', fontSize: '12px', color: '#c4c7c5' }}>
                              <MathRenderer text={opt.text} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Explanation Input */}
                    <div style={{ marginTop: '4px' }}>
                      <input
                        type="text"
                        placeholder="Explanation with LaTeX math (optional)..."
                        value={draftExplanation}
                        onChange={(e) => setDraftExplanation(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#121315',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#ffffff',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Add Question to Queue Button */}
                    <button
                      onClick={() => {
                        if (!draftQ.trim()) return;
                        const newQ = {
                          id: Date.now(),
                          q: draftQ.trim(),
                          image: draftImage.trim(),
                          options: draftOptions.map(o => ({ text: o.text || 'Option', image: o.image || '' })),
                          correct: draftCorrect,
                          explanation: draftExplanation.trim() || 'Calculated from mathematical/chemical principles.'
                        };
                        setCreateQuestionsList([...createQuestionsList, newQ]);
                        setDraftQ('');
                        setDraftImage('');
                        setDraftOptions([{ text: '', image: '' }, { text: '', image: '' }, { text: '', image: '' }, { text: '', image: '' }]);
                        setDraftCorrect(0);
                        setDraftExplanation('');
                        sfx.playReaction();
                      }}
                      disabled={!draftQ.trim()}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: draftQ.trim() ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: draftQ.trim() ? '#ffffff' : '#666666',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: draftQ.trim() ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span className="icon" style={{ fontSize: '16px' }}>playlist_add</span>
                      <span>Add Question to Quiz ({createQuestionsList.length} ready)</span>
                    </button>
                  </div>

                  {/* Summary of Questions Added */}
                  {createQuestionsList.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#9aa0a6', fontWeight: 600, textTransform: 'uppercase' }}>
                        Questions in this Quiz ({createQuestionsList.length}):
                      </div>
                      {createQuestionsList.map((item, idx) => (
                        <div key={idx} style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#141517', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                            {idx + 1}. <MathRenderer text={item.q} />
                          </span>
                          <span style={{ color: '#89b754', fontWeight: 600 }}>Ready</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* POST QUIZ BUTTON */}
                  {/* POST QUIZ ACTIONS */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        let finalQuestions = [...createQuestionsList];
                        if (draftQ.trim()) {
                          finalQuestions.push({
                            id: Date.now(),
                            q: draftQ.trim(),
                            image: draftImage.trim(),
                            options: draftOptions.map(o => ({ text: o.text || 'Option', image: o.image || '' })),
                            correct: draftCorrect,
                            explanation: draftExplanation.trim() || 'Calculated from chemical/mathematical principles.'
                          });
                        }
                        if (finalQuestions.length === 0) return;

                        setEdtechQuizQuestions(finalQuestions);
                        setQuizTitle(createQuizTitle.trim() || 'Classroom Pop Quiz');
                        setQuizIdx(0);
                        setQuizScore(0);
                        setQuizStreak(0);
                        setQuizSelected(null);
                        setQuizCompleted(false);
                        setQuizMode('take');
                        sfx.playReaction();
                      }}
                      disabled={createQuestionsList.length === 0 && !draftQ.trim()}
                      style={{
                        flex: '1 1 140px',
                        padding: '11px 16px',
                        borderRadius: '24px',
                        backgroundColor: (createQuestionsList.length > 0 || draftQ.trim()) ? '#8ec39c' : '#333333',
                        color: (createQuestionsList.length > 0 || draftQ.trim()) ? '#0e1b12' : '#888888',
                        fontWeight: 700,
                        fontSize: '12px',
                        border: 'none',
                        cursor: (createQuestionsList.length > 0 || draftQ.trim()) ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span className="icon" style={{ fontSize: '16px' }}>send</span>
                      <span>Post to Session</span>
                    </button>

                    <button
                      onClick={() => {
                        let finalQuestions = [...createQuestionsList];
                        if (draftQ.trim()) {
                          finalQuestions.push({
                            id: Date.now(),
                            q: draftQ.trim(),
                            image: draftImage.trim(),
                            options: draftOptions.map(o => ({ text: o.text || 'Option', image: o.image || '' })),
                            correct: draftCorrect,
                            explanation: draftExplanation.trim() || 'Calculated from chemical/mathematical principles.'
                          });
                        }
                        if (finalQuestions.length === 0) return;

                        setEdtechQuizQuestions(finalQuestions);
                        setQuizTitle(createQuizTitle.trim() || 'Classroom Pop Quiz');
                        setQuizIdx(0);
                        setQuizScore(0);
                        setQuizStreak(0);
                        setQuizSelected(null);
                        setQuizCompleted(false);
                        setQuizMode('take');
                        sfx.playReaction();
                        onStartStageSharing?.('quiz');
                      }}
                      disabled={createQuestionsList.length === 0 && !draftQ.trim()}
                      style={{
                        flex: '1 1 140px',
                        padding: '11px 16px',
                        borderRadius: '24px',
                        backgroundColor: (createQuestionsList.length > 0 || draftQ.trim()) ? 'rgba(142, 195, 156, 0.18)' : '#252628',
                        color: (createQuestionsList.length > 0 || draftQ.trim()) ? '#8ec39c' : '#666',
                        border: '1px solid rgba(142, 195, 156, 0.35)',
                        fontWeight: 600,
                        fontSize: '12px',
                        cursor: (createQuestionsList.length > 0 || draftQ.trim()) ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span className="icon" style={{ fontSize: '16px' }}>co_present</span>
                      <span>Post & Present</span>
                    </button>

                    <button
                      onClick={() => setQuizMode('take')}
                      style={{
                        padding: '11px 14px',
                        borderRadius: '24px',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        color: '#c4c7c5',
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 2: GIVE / TAKE QUIZ */}
              {quizMode === 'take' && (
                <>
                  {!quizCompleted ? (
                    <>
                      {/* Quiz Header: Progress & Score Bar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#16171a',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.06)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="icon" style={{ color: '#a8cded', fontSize: '17px' }}>quiz</span>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>
                            Question {quizIdx + 1} of {edtechQuizQuestions.length}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#a8cded', fontWeight: 600 }}>
                            {quizScore} pts
                          </span>
                          {quizStreak > 1 && (
                            <span style={{ fontSize: '11px', backgroundColor: 'rgba(234, 67, 53, 0.12)', color: '#ff8a80', padding: '2px 6px', borderRadius: '6px', fontWeight: 600 }}>
                              🔥 {quizStreak}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Card with LaTeX & Image Support */}
                      <div
                        style={{
                          backgroundColor: '#18191c',
                          borderRadius: '12px',
                          padding: '16px',
                          border: '1px solid rgba(255, 255, 255, 0.06)'
                        }}
                      >
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff', lineHeight: 1.5, marginBottom: edtechQuizQuestions[quizIdx].image ? '12px' : '16px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <MathRenderer text={edtechQuizQuestions[quizIdx].q} />
                        </div>

                        {/* Question Image if present */}
                        {edtechQuizQuestions[quizIdx].image && (
                          <div style={{ marginBottom: '14px', textAlign: 'center', backgroundColor: '#101114', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <img
                              src={edtechQuizQuestions[quizIdx].image}
                              alt="Question Diagram"
                              style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '6px' }}
                            />
                          </div>
                        )}

                        {/* Options Grid */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {edtechQuizQuestions[quizIdx].options.map((optObj, optIdx) => {
                            const isChosen = quizSelected === optIdx;
                            const isCorrect = optIdx === edtechQuizQuestions[quizIdx].correct;
                            const hasAnswered = quizSelected !== null;

                            let cardBg = isLight ? '#f5f3ef' : '#141517';
                            let cardBorder = 'rgba(255, 255, 255, 0.06)';
                            let textColor = '#d2d3d7';

                            if (hasAnswered) {
                              if (isCorrect) {
                                cardBg = 'rgba(168, 205, 237, 0.12)';
                                cardBorder = '#a8cded';
                                textColor = '#c2e7ff';
                              } else if (isChosen && !isCorrect) {
                                cardBg = 'rgba(234, 67, 53, 0.12)';
                                cardBorder = 'rgba(234, 67, 53, 0.5)';
                                textColor = '#f28b82';
                              }
                            }

                            return (
                              <div
                                key={optIdx}
                                onClick={() => {
                                  if (quizSelected === null) {
                                    setQuizSelected(optIdx);
                                    if (optIdx === edtechQuizQuestions[quizIdx].correct) {
                                      setQuizScore(s => s + 100);
                                      setQuizStreak(st => st + 1);
                                      sfx.playReaction();
                                    } else {
                                      setQuizStreak(0);
                                      sfx.playToggle(false);
                                    }
                                  }
                                }}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                  padding: '10px 14px',
                                  borderRadius: '10px',
                                  backgroundColor: cardBg,
                                  border: `1px solid ${cardBorder}`,
                                  cursor: quizSelected === null ? 'pointer' : 'default',
                                  transition: 'background-color 0.15s ease'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: isChosen ? (isCorrect ? '#a8cded' : '#ea4335') : 'rgba(255,255,255,0.06)',
                                      color: isChosen ? '#111215' : '#9aa0a6',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 600,
                                      fontSize: '11px',
                                      flexShrink: 0
                                    }}
                                  >
                                    {['A', 'B', 'C', 'D'][optIdx]}
                                  </div>
                                  <span style={{ fontSize: '13px', color: textColor, flex: 1, fontWeight: isChosen ? 500 : 400, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                    <MathRenderer text={typeof optObj === 'string' ? optObj : optObj.text} />
                                  </span>
                                  {hasAnswered && isCorrect && (
                                    <span className="icon" style={{ color: '#a8cded', fontSize: '18px' }}>check_circle</span>
                                  )}
                                  {hasAnswered && isChosen && !isCorrect && (
                                    <span className="icon" style={{ color: '#ea4335', fontSize: '18px' }}>cancel</span>
                                  )}
                                </div>

                                {/* Option Image if present */}
                                {typeof optObj === 'object' && optObj.image && (
                                  <div style={{ paddingLeft: '34px' }}>
                                    <img src={optObj.image} alt={`Option ${optIdx}`} style={{ maxHeight: '80px', borderRadius: '4px' }} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Box with KaTeX Math */}
                        {quizSelected !== null && (
                          <div
                            style={{
                              marginTop: '14px',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              fontSize: '12px',
                              lineHeight: 1.5,
                              color: '#c4c7c5',
                              overflowX: 'auto',
                              WebkitOverflowScrolling: 'touch'
                            }}
                          >
                            <div style={{ fontWeight: 600, color: quizSelected === edtechQuizQuestions[quizIdx].correct ? '#a8cded' : '#f28b82', marginBottom: '4px', fontSize: '11px' }}>
                              {quizSelected === edtechQuizQuestions[quizIdx].correct ? '✓ Correct Explanation:' : '✗ Solution:'}
                            </div>
                            <MathRenderer text={edtechQuizQuestions[quizIdx].explanation} />
                          </div>
                        )}

                        {/* Next Question / View Results Button */}
                        {quizSelected !== null && (
                          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => {
                                if (quizIdx < edtechQuizQuestions.length - 1) {
                                  setQuizIdx(idx => idx + 1);
                                  setQuizSelected(null);
                                  sfx.playToggle(true);
                                } else {
                                  setQuizCompleted(true);
                                  sfx.playReaction();
                                }
                              }}
                              style={{
                                padding: '8px 18px',
                                borderRadius: '18px',
                                backgroundColor: '#a8cded',
                                border: 'none',
                                color: '#0e1720',
                                fontWeight: 600,
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>{quizIdx < edtechQuizQuestions.length - 1 ? 'Next' : 'Results'}</span>
                              <span className="icon" style={{ fontSize: '16px' }}>arrow_forward</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    /* TROPHY RESULTS SCREEN */
                    <div
                      style={{
                        backgroundColor: '#16171a',
                        borderRadius: '12px',
                        padding: '24px 18px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{ fontSize: '36px' }}>🏆</div>
                      <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                        Quiz Completed!
                      </h3>
                      <div style={{ fontSize: '13px', color: '#9aa0a6' }}>
                        Final Score: <strong style={{ color: '#a8cded' }}>{quizScore} pts</strong> out of {edtechQuizQuestions.length * 100} pts
                      </div>
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          fontSize: '12px',
                          color: '#c4c7c5'
                        }}
                      >
                        Completed <strong>{quizTitle}</strong> with live evaluations.
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button
                          onClick={() => {
                            setQuizIdx(0);
                            setQuizScore(0);
                            setQuizStreak(0);
                            setQuizSelected(null);
                            setQuizCompleted(false);
                            sfx.playReaction();
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '16px',
                            backgroundColor: '#a8cded',
                            color: '#0e1720',
                            fontWeight: 600,
                            fontSize: '12px',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Retake Quiz
                        </button>
                        <button
                          onClick={() => {
                            setQuizMode('create');
                            setQuizCompleted(false);
                            sfx.playToggle(true);
                          }}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            color: '#ffffff',
                            fontSize: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            cursor: 'pointer'
                          }}
                        >
                          + New Quiz
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* FLASHCARDS */}
          {activeActivity === 'flashcards' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <FlashcardsDeck onShareToStage={() => onStartStageSharing?.('flashcards')} theme={theme} />
            </div>
          )}

          {/* DEDICATED HOST CONTROLS */}
          {activeActivity === 'host_controls' && (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
              {/* Host Management Master Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: `1px solid ${cBorder}` }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: cText }}>Host management</div>
                  <div style={{ fontSize: '12px', color: cSubtle, marginTop: '2px', maxWidth: '240px' }}>
                    Lets you restrict what participants can do in the meeting
                  </div>
                </div>
                <label className="m3-switch">
                  <input
                    type="checkbox"
                    checked={hostManagement}
                    onChange={() => setHostManagement(!hostManagement)}
                  />
                  <span className="m3-slider round"></span>
                </label>
              </div>

              {/* Let Everyone Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: hostManagement ? 1 : 0.4, pointerEvents: hostManagement ? 'auto' : 'none' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: isLight ? '#0b57d0' : '#a8c7fa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Let everyone
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>present_to_all</span>
                    <div>
                      <div style={{ fontSize: '14px', color: cText }}>Share their screen</div>
                      <div style={{ fontSize: '11px', color: cSubtle }}>Allow presenting display</div>
                    </div>
                  </div>
                  <label className="m3-switch">
                    <input
                      type="checkbox"
                      checked={allowShareScreen}
                      onChange={() => setAllowShareScreen(!allowShareScreen)}
                    />
                    <span className="m3-slider round"></span>
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>chat</span>
                    <div>
                      <div style={{ fontSize: '14px', color: cText }}>Send chat messages</div>
                      <div style={{ fontSize: '11px', color: cSubtle }}>In-call text & files</div>
                    </div>
                  </div>
                  <label className="m3-switch">
                    <input
                      type="checkbox"
                      checked={allowChat}
                      onChange={() => setAllowChat(!allowChat)}
                    />
                    <span className="m3-slider round"></span>
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>mic</span>
                    <div>
                      <div style={{ fontSize: '14px', color: cText }}>Turn on microphone</div>
                      <div style={{ fontSize: '11px', color: cSubtle }}>Allow participant speaking</div>
                    </div>
                  </div>
                  <label className="m3-switch">
                    <input
                      type="checkbox"
                      checked={allowTurnOnMic}
                      onChange={() => setAllowTurnOnMic(!allowTurnOnMic)}
                    />
                    <span className="m3-slider round"></span>
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>videocam</span>
                    <div>
                      <div style={{ fontSize: '14px', color: cText }}>Turn on video camera</div>
                      <div style={{ fontSize: '11px', color: cSubtle }}>Allow participant webcam</div>
                    </div>
                  </div>
                  <label className="m3-switch">
                    <input
                      type="checkbox"
                      checked={allowTurnOnVideo}
                      onChange={() => setAllowTurnOnVideo(!allowTurnOnVideo)}
                    />
                    <span className="m3-slider round"></span>
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="icon" style={{ color: cSubtle, fontSize: '20px' }}>sentiment_satisfied</span>
                    <div>
                      <div style={{ fontSize: '14px', color: cText }}>Send reactions</div>
                      <div style={{ fontSize: '11px', color: cSubtle }}>Emoji floating reactions</div>
                    </div>
                  </div>
                  <label className="m3-switch">
                    <input
                      type="checkbox"
                      checked={allowSendReactions}
                      onChange={() => setAllowSendReactions(!allowSendReactions)}
                    />
                    <span className="m3-slider round"></span>
                  </label>
                </div>
              </div>

              {/* Meeting Access Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px', borderTop: `1px solid ${cBorder}` }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: isLight ? '#0b57d0' : '#a8c7fa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Meeting access
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: cText }}>Quick access</div>
                    <div style={{ fontSize: '11px', color: cSubtle, maxWidth: '240px' }}>
                      When turned off, anyone not invited must ask to join
                    </div>
                  </div>
                  <label className="m3-switch">
                    <input
                      type="checkbox"
                      checked={quickAccess}
                      onChange={() => setQuickAccess(!quickAccess)}
                    />
                    <span className="m3-slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS (TABBED: AUDIO, VIDEO, HOST CONTROLS) */}
          {activeActivity === 'settings' && (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflowY: 'auto' }}>
              {/* Settings Nav Tabs */}
              <div style={{ display: 'flex', gap: '6px', background: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '12px', border: `1px solid ${cBorder}` }}>
                {['audio', 'video', 'host'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSettingsTab(tab)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      color: settingsTab === tab ? (isLight ? '#1a1814' : '#001d35') : cSubtle,
                      backgroundColor: settingsTab === tab ? (isLight ? '#ffffff' : '#c2e7ff') : 'transparent',
                      boxShadow: settingsTab === tab && isLight ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      border: 'none'
                    }}
                  >
                    {tab === 'host' ? 'Host' : tab}
                  </button>
                ))}
              </div>

              {/* Tab 1: Audio */}
              {settingsTab === 'audio' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: cText }}>Audio Devices</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#9aa0a6' }}>Microphone</span>
                    <select style={{ backgroundColor: isLight ? '#f5f3ef' : '#131314', color: cText, border: `1px solid ${cBorder}`, padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                      <option>Default - MacBook Pro Microphone</option>
                      <option>External USB Microphone</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#9aa0a6' }}>Speakers</span>
                    <select style={{ backgroundColor: isLight ? '#f5f3ef' : '#131314', color: cText, border: `1px solid ${cBorder}`, padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                      <option>Default - MacBook Pro Speakers</option>
                      <option>Headphones (Built-in)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: cText }}>Noise cancellation</div>
                      <div style={{ fontSize: '11px', color: '#8e918f' }}>Filters background sounds</div>
                    </div>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#89b754', width: '18px', height: '18px' }} />
                  </div>
                </div>
              )}

              {/* Tab 2: Video */}
              {settingsTab === 'video' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: cText }}>Video Devices</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#9aa0a6' }}>Camera</span>
                    <select style={{ backgroundColor: isLight ? '#f5f3ef' : '#131314', color: cText, border: `1px solid ${cBorder}`, padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                      <option>FaceTime HD Camera (Built-in)</option>
                      <option>Virtual Camera</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#9aa0a6' }}>Send resolution (maximum)</span>
                    <select style={{ backgroundColor: isLight ? '#f5f3ef' : '#131314', color: cText, border: `1px solid ${cBorder}`, padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                      <option>High definition (720p)</option>
                      <option>Full HD (1080p)</option>
                      <option>Standard definition (360p)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: cText }}>Low-light video boost</div>
                      <div style={{ fontSize: '11px', color: '#8e918f' }}>Brightens video in dark rooms</div>
                    </div>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#89b754', width: '18px', height: '18px' }} />
                  </div>
                </div>
              )}

              {/* Tab 3: Embedded Host Controls */}
              {settingsTab === 'host' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '14px', color: cText }}>Host management</div>
                      <div style={{ fontSize: '11px', color: cSubtle }}>Restrict participant permissions</div>
                    </div>
                    <label className="m3-switch">
                      <input
                        type="checkbox"
                        checked={hostManagement}
                        onChange={() => setHostManagement(!hostManagement)}
                      />
                      <span className="m3-slider round"></span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: hostManagement ? 1 : 0.4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: cText }}>Let everyone share screen</span>
                      <input
                        type="checkbox"
                        checked={allowShareScreen}
                        onChange={() => setAllowShareScreen(!allowShareScreen)}
                        style={{ accentColor: '#89b754', width: '18px', height: '18px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: cText }}>Let everyone send messages</span>
                      <input
                        type="checkbox"
                        checked={allowChat}
                        onChange={() => setAllowChat(!allowChat)}
                        style={{ accentColor: '#89b754', width: '18px', height: '18px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: cText }}>Let everyone turn on mic</span>
                      <input
                        type="checkbox"
                        checked={allowTurnOnMic}
                        onChange={() => setAllowTurnOnMic(!allowTurnOnMic)}
                        style={{ accentColor: '#89b754', width: '18px', height: '18px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: cText }}>Let everyone turn on video</span>
                      <input
                        type="checkbox"
                        checked={allowTurnOnVideo}
                        onChange={() => setAllowTurnOnVideo(!allowTurnOnVideo)}
                        style={{ accentColor: '#89b754', width: '18px', height: '18px' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
