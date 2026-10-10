'use client';

import React, { useState } from 'react';
import MathRenderer from './MathRenderer';
import { sfx } from '../lib/audio';

export default function QuizStage({
  onStopPresenting,
  userName = 'You',
  initialQuestions = null,
  theme = 'light'
}) {
  const isLight = theme === 'light';
  const cBg = isLight ? '#ffffff' : '#0f1013';
  const cHeaderBg = isLight ? '#fbfbfb' : '#131417';
  const cCardBg = isLight ? '#fbfbfb' : '#151619';
  const cInnerBg = isLight ? '#ffffff' : '#101114';
  const cBorder = isLight ? '#e8e4de' : 'rgba(255, 255, 255, 0.06)';
  const cText = isLight ? '#1a1814' : '#ffffff';
  const cSubtle = isLight ? '#6b6560' : '#9aa0a6';

  const [quizMode, setQuizMode] = useState('take'); // 'take' | 'create'
  const [quizTitle, setQuizTitle] = useState('Calculus & Chemical Reactions');
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Default STEM Questions
  const [questions, setQuestions] = useState(initialQuestions || [
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
      explanation: 'Using polar coordinates substitution $\\left(\\int_{-\\infty}^{\\infty} e^{-x^2} dx\\right)^2 = \\int_0^{2\\pi} d\\theta \\int_0^\\infty r e^{-r^2} dr = \\pi$, taking the square root gives $\\sqrt{\\pi}$.'
    },
    {
      id: 2,
      q: 'In the complete stoichiometric combustion of methane, identify coefficient $x$: $$\\text{CH}_4 + x\\text{O}_2 \\longrightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}$$',
      image: '',
      options: [
        { text: '$x = 1$', image: '' },
        { text: '$x = 2$', image: '' },
        { text: '$x = 3$', image: '' },
        { text: '$x = 4$', image: '' }
      ],
      correct: 1,
      explanation: 'Balancing oxygen atoms: The right side has $2 + 2 = 4$ oxygen atoms. Therefore $x = 2$ provides $2 \\times 2 = 4$ oxygen atoms.'
    },
    {
      id: 3,
      q: 'Compute the fundamental trigonometric limit: $$\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$$',
      image: '',
      options: [
        { text: '$0$', image: '' },
        { text: '$1$', image: '' },
        { text: '$3$', image: '' },
        { text: 'Does not exist', image: '' }
      ],
      correct: 2,
      explanation: 'By standard limit property: $\\lim_{x \\to 0} \\frac{\\sin(kx)}{x} = k$. Hence with $k = 3$, the limit equals $3$.'
    }
  ]);

  // Creator state
  const [draftTitle, setDraftTitle] = useState('');
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
  const [stagedQuestions, setStagedQuestions] = useState([]);

  const currentQ = questions[quizIdx] || questions[0];

  const handleSelectOption = (idx) => {
    if (quizSelected !== null) return;
    setQuizSelected(idx);
    if (idx === currentQ.correct) {
      setQuizScore(s => s + 100);
      setQuizStreak(st => st + 1);
      sfx.playReaction();
    } else {
      setQuizStreak(0);
      sfx.playToggle(false);
    }
  };

  const handleNext = () => {
    if (quizIdx < questions.length - 1) {
      setQuizIdx(i => i + 1);
      setQuizSelected(null);
      sfx.playToggle(true);
    } else {
      setQuizCompleted(true);
      sfx.playReaction();
    }
  };

  const handleAddQuestionToDraft = () => {
    if (!draftQ.trim()) return;
    const newEntry = {
      id: Date.now(),
      q: draftQ.trim(),
      image: draftImage.trim(),
      options: draftOptions.map((o, i) => ({
        text: o.text.trim() || `Option ${['A', 'B', 'C', 'D'][i]}`,
        image: o.image.trim()
      })),
      correct: draftCorrect,
      explanation: draftExplanation.trim() || 'Calculated from STEM principles.'
    };
    setStagedQuestions([...stagedQuestions, newEntry]);
    setDraftQ('');
    setDraftImage('');
    setDraftOptions([
      { text: '', image: '' },
      { text: '', image: '' },
      { text: '', image: '' },
      { text: '', image: '' }
    ]);
    setDraftCorrect(0);
    setDraftExplanation('');
    sfx.playReaction();
  };

  const handlePostQuizToClass = () => {
    let finalSet = [...stagedQuestions];
    if (draftQ.trim()) {
      finalSet.push({
        id: Date.now(),
        q: draftQ.trim(),
        image: draftImage.trim(),
        options: draftOptions.map((o, i) => ({
          text: o.text.trim() || `Option ${['A', 'B', 'C', 'D'][i]}`,
          image: o.image.trim()
        })),
        correct: draftCorrect,
        explanation: draftExplanation.trim() || 'Calculated from STEM principles.'
      });
    }
    if (finalSet.length === 0) return;

    if (draftTitle.trim()) setQuizTitle(draftTitle.trim());
    setQuestions(finalSet);
    setQuizIdx(0);
    setQuizScore(0);
    setQuizStreak(0);
    setQuizSelected(null);
    setQuizCompleted(false);
    setQuizMode('take');
    sfx.playReaction();
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: cBg,
        color: cText,
        overflow: 'hidden'
      }}
    >
      {/* Minimal Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px clamp(16px, 3vw, 28px)',
          borderBottom: `1px solid ${cBorder}`,
          backgroundColor: cHeaderBg,
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="icon" style={{ fontSize: '18px', color: '#a8cded' }}>quiz</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: cText }}>
            {quizTitle}
          </span>
          <span style={{ color: isLight ? '#e8e4de' : 'rgba(255, 255, 255, 0.15)', fontSize: '12px' }}>•</span>
          <span style={{ fontSize: '12px', color: cSubtle }}>
            {quizMode === 'create' ? 'Draft Mode' : `Question ${quizIdx + 1} of ${questions.length}`}
          </span>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {quizMode === 'take' && !quizCompleted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#a8cded', fontWeight: 600 }}>
                {quizScore} pts
              </span>
              {quizStreak > 1 && (
                <span
                  style={{
                    fontSize: '11px',
                    color: '#ff8a80',
                    backgroundColor: 'rgba(234, 67, 53, 0.12)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontWeight: 600
                  }}
                >
                  🔥 {quizStreak}
                </span>
              )}
            </div>
          )}

          {quizMode === 'take' ? (
            <button
              onClick={() => {
                setQuizMode('create');
                setStagedQuestions([]);
                setDraftTitle('');
                setDraftQ('');
                setDraftImage('');
                setDraftOptions([
                  { text: '', image: '' },
                  { text: '', image: '' },
                  { text: '', image: '' },
                  { text: '', image: '' }
                ]);
                setDraftCorrect(0);
                setDraftExplanation('');
                sfx.playToggle(true);
              }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#c4c7c5',
                fontSize: '11px',
                fontWeight: 500,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer'
              }}
            >
              + Create
            </button>
          ) : (
            <button
              onClick={() => setQuizMode('take')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: '#9aa0a6',
                fontSize: '11px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}

          {onStopPresenting && (
            <button
              onClick={onStopPresenting}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: '#9aa0a6',
                fontSize: '11px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span className="icon" style={{ fontSize: '14px' }}>close</span>
              <span>Exit</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'clamp(16px, 3.5vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: quizCompleted ? 'center' : 'flex-start'
        }}
      >
        {/* STUDENT MODE */}
        {quizMode === 'take' && !quizCompleted && (
          <div
            style={{
              width: '100%',
              maxWidth: '780px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            {/* Question Container */}
            <div
              style={{
                backgroundColor: cCardBg,
                borderRadius: '12px',
                padding: 'clamp(20px, 3vw, 28px)',
                border: `1px solid ${cBorder}`
              }}
            >
              {/* Question Text */}
              <div
                style={{
                  fontSize: 'clamp(16px, 2.2vw, 19px)',
                  fontWeight: 500,
                  lineHeight: 1.5,
                  color: cText,
                  marginBottom: currentQ.image ? '16px' : '22px',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <MathRenderer text={currentQ.q} />
              </div>

              {/* Optional Question Diagram */}
              {currentQ.image && (
                <div
                  style={{
                    marginBottom: '20px',
                    textAlign: 'center',
                    backgroundColor: cInnerBg,
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${cBorder}`
                  }}
                >
                  <img
                    src={currentQ.image}
                    alt="Question Diagram"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      borderRadius: '6px'
                    }}
                  />
                </div>
              )}

              {/* Responsive Options Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(260px, 46%, 370px), 1fr))',
                  gap: '10px',
                  width: '100%'
                }}
              >
                {currentQ.options.map((optObj, optIdx) => {
                  const isChosen = quizSelected === optIdx;
                  const isCorrect = optIdx === currentQ.correct;
                  const hasAnswered = quizSelected !== null;

                  let cardBg = isLight ? '#ffffff' : '#191a1e';
                  let cardBorder = cBorder;
                  let textColor = cText;

                  if (hasAnswered) {
                    if (isCorrect) {
                      cardBg = isLight ? '#f0f9ff' : 'rgba(168, 205, 237, 0.12)';
                      cardBorder = '#a8cded';
                      textColor = isLight ? '#0284c7' : '#c2e7ff';
                    } else if (isChosen && !isCorrect) {
                      cardBg = isLight ? '#fef2f2' : 'rgba(234, 67, 53, 0.12)';
                      cardBorder = 'rgba(234, 67, 53, 0.5)';
                      textColor = isLight ? '#dc2626' : '#f28b82';
                    }
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        backgroundColor: cardBg,
                        border: `1px solid ${cardBorder}`,
                        cursor: quizSelected === null ? 'pointer' : 'default',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'background-color 0.15s ease, border-color 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: isChosen
                              ? (isCorrect ? '#a8cded' : '#ea4335')
                              : 'rgba(255, 255, 255, 0.06)',
                            color: isChosen ? '#111215' : '#9aa0a6',
                            fontWeight: 600,
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {['A', 'B', 'C', 'D'][optIdx]}
                        </div>

                        <div
                          style={{
                            fontSize: '14px',
                            color: textColor,
                            fontWeight: isChosen ? 500 : 400,
                            flex: 1,
                            overflowX: 'auto',
                            WebkitOverflowScrolling: 'touch'
                          }}
                        >
                          <MathRenderer text={typeof optObj === 'string' ? optObj : optObj.text} />
                        </div>

                        {hasAnswered && isCorrect && (
                          <span className="icon" style={{ color: '#a8cded', fontSize: '18px' }}>check_circle</span>
                        )}
                        {hasAnswered && isChosen && !isCorrect && (
                          <span className="icon" style={{ color: '#ea4335', fontSize: '18px' }}>cancel</span>
                        )}
                      </div>

                      {typeof optObj === 'object' && optObj?.image && (
                        <div style={{ paddingLeft: '34px' }}>
                          <img
                            src={optObj.image}
                            alt={`Option ${optIdx}`}
                            style={{ maxHeight: '80px', borderRadius: '4px', objectFit: 'contain' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Minimal Explanation Breakdown */}
              {quizSelected !== null && (
                <div
                  style={{
                    marginTop: '18px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    color: '#c4c7c5',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: quizSelected === currentQ.correct ? '#a8cded' : '#f28b82',
                      marginBottom: '4px',
                      fontSize: '12px'
                    }}
                  >
                    {quizSelected === currentQ.correct ? '✓ Correct Explanation:' : '✗ Solution:'}
                  </div>
                  <MathRenderer text={currentQ.explanation} />
                </div>
              )}

              {/* Next Button */}
              {quizSelected !== null && (
                <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleNext}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '20px',
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
                    <span>{quizIdx < questions.length - 1 ? 'Next' : 'Results'}</span>
                    <span className="icon" style={{ fontSize: '16px' }}>arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESULTS SCREEN */}
        {quizCompleted && (
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#151619',
              borderRadius: '14px',
              padding: '28px 24px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <div style={{ fontSize: '40px' }}>🏆</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
              Quiz Completed
            </h3>
            <div style={{ fontSize: '13px', color: '#9aa0a6' }}>
              Final Score: <strong style={{ color: '#a8cded' }}>{quizScore} pts</strong> out of {questions.length * 100} pts
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
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
                  padding: '8px 18px',
                  borderRadius: '16px',
                  backgroundColor: '#a8cded',
                  color: '#0e1720',
                  fontWeight: 600,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Retake
              </button>
              <button
                onClick={() => {
                  setQuizMode('create');
                  setQuizCompleted(false);
                  sfx.playToggle(true);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  color: '#c4c7c5',
                  fontSize: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer'
                }}
              >
                + Create New
              </button>
            </div>
          </div>
        )}

        {/* CREATOR VIEW */}
        {quizMode === 'create' && (
          <div
            style={{
              width: '100%',
              maxWidth: '740px',
              backgroundColor: '#151619',
              borderRadius: '12px',
              padding: 'clamp(16px, 2.5vw, 24px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div>
              <label style={{ fontSize: '11px', color: '#9aa0a6', fontWeight: 600 }}>QUIZ TITLE</label>
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="e.g. Organic Chemistry & Calculus"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#101114',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                  marginTop: '4px'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '11px', color: '#a8cded', fontWeight: 600 }}>
                  QUESTION #{stagedQuestions.length + 1}
                </label>
                <span style={{ fontSize: '11px', color: '#747775' }}>Supports $math$ and $\text&#123;chem&#125;$</span>
              </div>
              <textarea
                value={draftQ}
                onChange={(e) => setDraftQ(e.target.value)}
                placeholder="Type question or LaTeX formula (e.g. $$\int_0^1 x^2 dx$$)..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#101114',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                  marginTop: '4px'
                }}
              />
            </div>

            {draftQ && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(168, 205, 237, 0.06)',
                  border: '1px solid rgba(168, 205, 237, 0.15)',
                  fontSize: '13px',
                  color: '#d4e7f8',
                  overflowX: 'auto'
                }}
              >
                <MathRenderer text={draftQ} />
              </div>
            )}

            <div>
              <label style={{ fontSize: '11px', color: '#9aa0a6', fontWeight: 600 }}>IMAGE URL (OPTIONAL)</label>
              <input
                type="text"
                value={draftImage}
                onChange={(e) => setDraftImage(e.target.value)}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#101114',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none',
                  marginTop: '4px'
                }}
              />
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', color: '#9aa0a6', fontWeight: 600 }}>OPTIONS</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                {draftOptions.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#121316',
                      border: draftCorrect === optIdx ? '1px solid #a8cded' : '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <input
                      type="radio"
                      name="minimalCorrect"
                      checked={draftCorrect === optIdx}
                      onChange={() => setDraftCorrect(optIdx)}
                      style={{ accentColor: '#a8cded', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: draftCorrect === optIdx ? '#a8cded' : '#777' }}>
                      {['A', 'B', 'C', 'D'][optIdx]}
                    </span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const copy = [...draftOptions];
                        copy[optIdx].text = e.target.value;
                        setDraftOptions(copy);
                      }}
                      placeholder={`Option ${['A', 'B', 'C', 'D'][optIdx]} or $math$...`}
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#9aa0a6', fontWeight: 600 }}>EXPLANATION</label>
              <input
                type="text"
                value={draftExplanation}
                onChange={(e) => setDraftExplanation(e.target.value)}
                placeholder="Solution explanation with $math$..."
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#101114',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none',
                  marginTop: '4px'
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                onClick={handleAddQuestionToDraft}
                disabled={!draftQ.trim()}
                style={{
                  padding: '6px 14px',
                  borderRadius: '14px',
                  backgroundColor: draftQ.trim() ? 'rgba(168, 205, 237, 0.12)' : 'transparent',
                  color: draftQ.trim() ? '#a8cded' : '#555',
                  border: '1px solid rgba(168, 205, 237, 0.2)',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: draftQ.trim() ? 'pointer' : 'default'
                }}
              >
                + Add Question ({stagedQuestions.length} staged)
              </button>

              <button
                onClick={handlePostQuizToClass}
                disabled={stagedQuestions.length === 0 && !draftQ.trim()}
                style={{
                  padding: '6px 18px',
                  borderRadius: '14px',
                  backgroundColor: (stagedQuestions.length > 0 || draftQ.trim()) ? '#a8cded' : '#222',
                  color: (stagedQuestions.length > 0 || draftQ.trim()) ? '#0e1720' : '#666',
                  fontWeight: 600,
                  fontSize: '12px',
                  border: 'none',
                  cursor: (stagedQuestions.length > 0 || draftQ.trim()) ? 'pointer' : 'default'
                }}
              >
                Post to Class
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
