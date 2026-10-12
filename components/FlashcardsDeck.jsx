'use client';

import React, { useState } from 'react';
import { sfx } from '../lib/audio';

const DECKS = [
  {
    id: 'cs',
    name: 'Computer Science & Web',
    cards: [
      { q: 'What is the Virtual DOM and how does React use it?', a: 'A lightweight in-memory representation of the real DOM. React diffs changes using reconciliation and batches updates for minimal DOM manipulation.' },
      { q: 'Explain the difference between TCP and UDP.', a: 'TCP is connection-oriented, reliable with error checking and ordering. UDP is connectionless, fast, and lightweight with no delivery guarantees.' },
      { q: 'What is WebRTC and how does it establish peer connections?', a: 'WebRTC enables real-time peer-to-peer audio, video, and data communication directly between browsers using ICE, STUN, and TURN protocols.' },
      { q: 'What is the time complexity of QuickSort?', a: 'Average time complexity is O(n log n). Worst-case complexity is O(n²) when poor pivots are chosen repeatedly.' },
      { q: 'What is CAP theorem in distributed systems?', a: 'A distributed system can guarantee at most two of three properties simultaneously: Consistency, Availability, and Partition Tolerance.' }
    ]
  },
  {
    id: 'system_design',
    name: 'System Design & Architecture',
    cards: [
      { q: 'What is Database Sharding?', a: 'A horizontal database partitioning technique where data rows are split across separate database server instances based on a shard key.' },
      { q: 'What is a Content Delivery Network (CDN)?', a: 'A distributed network of proxy edge servers placed geographically close to users to deliver cached static content with low latency.' },
      { q: 'Difference between Horizontal vs Vertical Scaling?', a: 'Horizontal scaling (scale out) adds more servers. Vertical scaling (scale up) adds more compute/RAM/storage power to a single existing server.' }
    ]
  }
];

export default function FlashcardsDeck({ onShareToStage, isStage = false, theme = 'light' }) {
  const isLight = theme === 'light';
  const cText    = isLight ? '#1a1814' : '#ffffff';
  const cSubtle  = isLight ? '#6b6560' : '#9aa0a6';
  const cBorder  = isLight ? '#e8e4de' : 'rgba(255,255,255,0.12)';
  const cSurface = isLight ? '#f5f3ef' : '#28292a';
  const cBg      = isLight ? '#ffffff' : '#1e1f20';

  const [deckIdx,   setDeckIdx]   = useState(0);
  const [cardIdx,   setCardIdx]   = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards,     setCards]     = useState(DECKS[0].cards);
  const [mastered,  setMastered]  = useState(new Set());

  const currentCard = cards[cardIdx] || cards[0];
  const isMastered  = mastered.has(cardIdx);

  const flip = () => { setIsFlipped(f => !f); sfx.playToggle(!isFlipped); };

  const next = () => {
    setIsFlipped(false);
    setTimeout(() => setCardIdx(i => (i + 1) % cards.length), 80);
    sfx.playReaction();
  };

  const prev = () => {
    setIsFlipped(false);
    setTimeout(() => setCardIdx(i => (i - 1 + cards.length) % cards.length), 80);
    sfx.playReaction();
  };

  const shuffle = () => {
    setCards(c => [...c].sort(() => Math.random() - 0.5));
    setCardIdx(0);
    setIsFlipped(false);
    sfx.playToggle(true);
  };

  const toggleMastered = (e) => {
    e.stopPropagation();
    setMastered(prev => {
      const next = new Set(prev);
      next.has(cardIdx) ? next.delete(cardIdx) : next.add(cardIdx);
      return next;
    });
    sfx.playReaction();
  };

  const progress = Math.round(((cardIdx + 1) / cards.length) * 100);

  return (
    <>
      <style>{`
        .fc-card-scene {
          width: 100%;
          perspective: 900px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .fc-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 20px;
        }
        .fc-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .fc-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          padding: clamp(14px, 4vw, 24px);
          box-sizing: border-box;
          overflow: hidden;
        }
        .fc-face-front {
          background: ${isLight ? '#ffffff' : '#28292a'};
          border: 1px solid ${cBorder};
          box-shadow: ${isLight ? '0 4px 20px rgba(0,0,0,0.07)' : '0 8px 32px rgba(0,0,0,0.4)'};
        }
        .fc-face-back {
          background: ${isLight ? '#f0fdf4' : '#1a2e1a'};
          border: 2px solid #89b754;
          transform: rotateY(180deg);
        }
        .fc-body-text {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: clamp(14px, 1.4vw, 22px);
          font-weight: 500;
          line-height: 1.6;
          color: ${cText};
          overflow-y: auto;
          padding: 8px 0;
          word-break: break-word;
        }
        .fc-body-text::-webkit-scrollbar { width: 3px; }
        .fc-body-text::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 3px; }
        .fc-nav-btn {
          width: ${isStage ? '52px' : '42px'};
          height: ${isStage ? '52px' : '42px'};
          border-radius: 50%;
          background: ${cSurface};
          border: 1px solid ${cBorder};
          color: ${cText};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .fc-nav-btn:hover { background: ${isLight ? '#ebe7e1' : '#303134'}; }
        .fc-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: all 0.2s;
        }
      `}</style>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: isStage ? 'clamp(16px, 3vh, 40px) clamp(16px, 8vw, 120px)' : '14px 16px',
        paddingBottom: isStage ? 'clamp(24px, 4vh, 56px)' : '18px',
        boxSizing: 'border-box',
        gap: isStage ? '10px' : '12px',
        overflow: 'hidden',
        fontFamily: 'Google Sans, Roboto, sans-serif',
        maxWidth: isStage ? '860px' : 'none',
        marginLeft: isStage ? 'auto' : 0,
        marginRight: isStage ? 'auto' : 0,
      }}>

        {/* ── TOP BAR ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexShrink: 0 }}>
          <select
            value={deckIdx}
            onChange={(e) => {
              const idx = parseInt(e.target.value, 10);
              setDeckIdx(idx);
              setCards(DECKS[idx].cards);
              setCardIdx(0);
              setIsFlipped(false);
              setMastered(new Set());
            }}
            style={{
              flex: 1,
              minWidth: 0,
              backgroundColor: cSurface,
              color: cText,
              border: `1px solid ${cBorder}`,
              borderRadius: '10px',
              padding: '7px 10px',
              fontSize: '12px',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {DECKS.map((d, i) => (
              <option key={d.id} value={i} style={{ backgroundColor: isLight ? '#fff' : '#28292a', color: cText }}>
                {d.name}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            {onShareToStage && !isStage && (
              <button
                onClick={onShareToStage}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 10px', borderRadius: '10px', backgroundColor: isLight ? '#fef3e2' : 'rgba(168,199,250,0.14)', color: isLight ? '#f48120' : '#a8c7fa', border: isLight ? '1px solid #fbd38d' : '1px solid rgba(168,199,250,0.25)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <span className="icon" style={{ fontSize: '15px' }}>present_to_all</span>
                <span className="fc-hide-xs">Present</span>
              </button>
            )}
            <button
              onClick={shuffle}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 10px', borderRadius: '10px', backgroundColor: cSurface, color: cSubtle, border: `1px solid ${cBorder}`, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              title="Shuffle"
            >
              <span className="icon" style={{ fontSize: '15px' }}>shuffle</span>
              <span className="fc-hide-xs">Shuffle</span>
            </button>
          </div>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ fontSize: '11px', color: cSubtle }}>
              {cardIdx + 1} / {cards.length}
            </span>
            <span style={{ fontSize: '11px', color: '#89b754', fontWeight: 600 }}>
              {mastered.size} mastered
            </span>
          </div>
          <div style={{ height: '3px', borderRadius: '3px', backgroundColor: isLight ? '#e8e4de' : 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#89b754', borderRadius: '3px', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* ── FLIP CARD ── */}
        <div
          className="fc-card-scene"
          onClick={flip}
          style={{ height: isStage ? 'clamp(200px, 35vh, 420px)' : 'clamp(160px, 38vw, 240px)' }}
        >
          <div className={`fc-card-inner ${isFlipped ? 'flipped' : ''}`} style={{ height: '100%' }}>
            {/* FRONT */}
            <div className="fc-face fc-face-front">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: isLight ? '#f48120' : '#a8c7fa', backgroundColor: isLight ? '#fef3e2' : 'rgba(168,199,250,0.12)', padding: '3px 8px', borderRadius: '6px' }}>
                  Question
                </span>
                <button onClick={toggleMastered} style={{ background: 'transparent', border: 'none', color: isMastered ? '#89b754' : cSubtle, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}>
                  <span className={`icon ${isMastered ? 'filled' : ''}`} style={{ fontSize: '18px' }}>
                    {isMastered ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </button>
              </div>
              <div className="fc-body-text">{currentCard.q}</div>
              <div style={{ textAlign: 'center', fontSize: '10px', color: cSubtle, marginTop: '6px' }}>Tap to reveal answer</div>
            </div>

            {/* BACK */}
            <div className="fc-face fc-face-back">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#2e7d32', backgroundColor: 'rgba(137,183,84,0.15)', padding: '3px 8px', borderRadius: '6px' }}>
                  Answer
                </span>
                <button onClick={toggleMastered} style={{ background: 'transparent', border: 'none', color: isMastered ? '#89b754' : cSubtle, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}>
                  <span className={`icon ${isMastered ? 'filled' : ''}`} style={{ fontSize: '18px' }}>
                    {isMastered ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </button>
              </div>
              <div className="fc-body-text" style={{ color: isLight ? '#1a3a1a' : '#c8e6c9' }}>{currentCard.a}</div>
              <div style={{ textAlign: 'center', fontSize: '10px', color: '#89b754', marginTop: '6px', opacity: 0.7 }}>Tap to flip back</div>
            </div>
          </div>
        </div>

        {/* ── DOT INDICATORS ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexShrink: 0, flexWrap: 'wrap', padding: '0 8px' }}>
          {cards.map((_, i) => (
            <div
              key={i}
              onClick={() => { setCardIdx(i); setIsFlipped(false); }}
              className="fc-dot"
              style={{
                backgroundColor: i === cardIdx ? '#89b754' : mastered.has(i) ? (isLight ? '#c8e6c9' : '#2e7d32') : (isLight ? '#e8e4de' : 'rgba(255,255,255,0.15)'),
                transform: i === cardIdx ? 'scale(1.3)' : 'scale(1)',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>

        {/* ── NAV CONTROLS ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexShrink: 0, paddingBottom: isStage ? 'clamp(8px, 2vh, 20px)' : 0 }}>
          <button className="fc-nav-btn" onClick={prev} title="Previous">
            <span className="icon" style={{ fontSize: '20px' }}>arrow_back</span>
          </button>

          <button
            onClick={flip}
            style={{ flex: 1, maxWidth: isStage ? '220px' : '160px', padding: isStage ? '13px 0' : '10px 0', borderRadius: '24px', backgroundColor: isFlipped ? '#89b754' : (isLight ? '#ffffff' : 'rgba(255,255,255,0.08)'), border: isFlipped ? 'none' : `1px solid ${cBorder}`, color: isFlipped ? '#ffffff' : cText, fontSize: isStage ? '15px' : '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
          >
            <span className="icon" style={{ fontSize: '17px', color: isFlipped ? '#ffffff' : (isLight ? '#f48120' : '#89b754') }}>flip</span>
            <span>{isFlipped ? 'Show Q' : 'Flip'}</span>
          </button>

          <button className="fc-nav-btn" onClick={next} title="Next">
            <span className="icon" style={{ fontSize: '20px' }}>arrow_forward</span>
          </button>
        </div>

        {/* ── MARK MASTERED FULL-WIDTH ── */}
        <button
          onClick={toggleMastered}
          style={{ flexShrink: 0, width: '100%', padding: '9px', borderRadius: '12px', backgroundColor: isMastered ? 'rgba(137,183,84,0.12)' : (isLight ? '#f5f3ef' : 'rgba(255,255,255,0.05)'), border: isMastered ? '1px solid rgba(137,183,84,0.4)' : `1px solid ${cBorder}`, color: isMastered ? '#89b754' : cSubtle, fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
        >
          <span className={`icon ${isMastered ? 'filled' : ''}`} style={{ fontSize: '16px' }}>
            {isMastered ? 'check_circle' : 'radio_button_unchecked'}
          </span>
          <span>{isMastered ? 'Marked as mastered' : 'Mark as mastered'}</span>
        </button>

      </div>
    </>
  );
}
