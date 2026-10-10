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
  const cText = isLight ? '#1a1814' : '#ffffff';
  const cSubtle = isLight ? '#6b6560' : '#9aa0a6';
  const cBorder = isLight ? '#e8e4de' : 'rgba(255, 255, 255, 0.12)';
  const cBg = isLight ? '#ffffff' : '#28292a';
  const cInputBg = isLight ? '#f5f3ef' : '#28292a';

  const [deckIdx, setDeckIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState(DECKS[0].cards);
  const [mastered, setMastered] = useState(new Set());

  const currentDeck = DECKS[deckIdx];
  const currentCard = cards[cardIdx] || cards[0];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    sfx.playToggle(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCardIdx((prev) => (prev + 1) % cards.length);
    sfx.playReaction();
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCardIdx((prev) => (prev - 1 + cards.length) % cards.length);
    sfx.playReaction();
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCardIdx(0);
    setIsFlipped(false);
    sfx.playToggle(true);
  };

  const toggleMastered = () => {
    const next = new Set(mastered);
    if (next.has(cardIdx)) next.delete(cardIdx);
    else next.add(cardIdx);
    setMastered(next);
    sfx.playReaction();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: isStage ? '32px' : '16px',
        boxSizing: 'border-box',
        gap: '20px'
      }}
    >
      {/* Top Deck Info & Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: isStage ? '720px' : '340px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="icon" style={{ color: '#89b754', fontSize: '20px' }}>style</span>
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
              backgroundColor: cInputBg,
              color: cText,
              border: `1px solid ${cBorder}`,
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {DECKS.map((d, i) => (
              <option key={d.id} value={i} style={{ backgroundColor: isLight ? '#ffffff' : '#28292a', color: cText }}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onShareToStage && !isStage && (
            <button
              onClick={onShareToStage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 12px',
                borderRadius: '16px',
                backgroundColor: isLight ? '#fef3e2' : 'rgba(168, 199, 250, 0.16)',
                color: isLight ? '#f48120' : '#a8c7fa',
                border: isLight ? '1px solid #fbd38d' : 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Present study cards to stage"
            >
              <span className="icon" style={{ fontSize: '15px' }}>present_to_all</span>
              <span>Present</span>
            </button>
          )}

          <button
            onClick={handleShuffle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '16px',
              backgroundColor: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.08)',
              color: cSubtle,
              border: isLight ? `1px solid ${cBorder}` : 'none',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            title="Shuffle deck"
          >
            <span className="icon" style={{ fontSize: '15px' }}>shuffle</span>
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: isStage ? '720px' : '340px',
          fontSize: '12px',
          color: cSubtle
        }}
      >
        <span>Card {cardIdx + 1} of {cards.length}</span>
        <span>{mastered.size} mastered</span>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        style={{
          width: '100%',
          maxWidth: isStage ? '720px' : '340px',
          height: isStage ? '360px' : '240px',
          perspective: '1000px',
          cursor: 'pointer'
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '24px',
            backgroundColor: isFlipped ? (isLight ? '#f0fdf4' : '#1e293b') : (isLight ? '#ffffff' : '#28292a'),
            border: isFlipped ? '2px solid #89b754' : `1px solid ${cBorder}`,
            boxShadow: isLight ? '0 8px 30px rgba(0, 0, 0, 0.08)' : '0 16px 40px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px',
            boxSizing: 'border-box',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Card Tag */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transform: isFlipped ? 'rotateY(180deg)' : 'none'
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: isFlipped ? '#2e7d32' : (isLight ? '#f48120' : '#a8c7fa'),
                backgroundColor: isFlipped ? 'rgba(137, 183, 84, 0.15)' : (isLight ? '#fef3e2' : 'rgba(168, 199, 250, 0.15)'),
                padding: '4px 10px',
                borderRadius: '8px'
              }}
            >
              {isFlipped ? 'Answer' : 'Question'}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMastered();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: mastered.has(cardIdx) ? '#89b754' : (isLight ? '#a5a09a' : '#5f6368'),
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
              title="Mark as learned"
            >
              <span className={`icon ${mastered.has(cardIdx) ? 'filled' : ''}`} style={{ fontSize: '18px' }}>
                {mastered.has(cardIdx) ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </button>
          </div>

          {/* Card Body */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '12px',
              fontSize: isStage ? '20px' : '15px',
              fontWeight: 500,
              lineHeight: 1.5,
              color: cText,
              transform: isFlipped ? 'rotateY(180deg)' : 'none'
            }}
          >
            {isFlipped ? currentCard.a : currentCard.q}
          </div>

          {/* Card Footer Hint */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '11px',
              color: cSubtle,
              transform: isFlipped ? 'rotateY(180deg)' : 'none'
            }}
          >
            Click card to flip
          </div>
        </div>
      </div>

      {/* Navigation Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          width: '100%',
          maxWidth: isStage ? '720px' : '340px'
        }}
      >
        <button
          onClick={handlePrev}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: isLight ? '#f5f3ef' : '#28292a',
            border: `1px solid ${cBorder}`,
            color: cText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          }}
          title="Previous card"
        >
          <span className="icon" style={{ fontSize: '20px' }}>arrow_back</span>
        </button>

        <button
          onClick={handleFlip}
          style={{
            padding: '10px 24px',
            borderRadius: '24px',
            backgroundColor: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${cBorder}`,
            color: cText,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: isLight ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
          }}
        >
          <span className="icon" style={{ fontSize: '18px', color: isLight ? '#f48120' : '#89b754' }}>flip</span>
          <span>Flip</span>
        </button>

        <button
          onClick={handleNext}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: isLight ? '#f5f3ef' : '#28292a',
            border: `1px solid ${cBorder}`,
            color: cText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          }}
          title="Next card"
        >
          <span className="icon" style={{ fontSize: '20px' }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
