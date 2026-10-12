'use client';

import React, { useState, useEffect, useRef } from 'react';

function getGreeting(name = 'Ayushmaan') {
  const hour = new Date().getHours();
  let greet = 'Working late';
  if (hour >= 5 && hour < 12) greet = 'Good morning';
  else if (hour >= 12 && hour < 17) greet = 'Good afternoon';
  else if (hour >= 17 && hour < 23) greet = 'Good evening';
  return `${greet}, ${name}.`;
}

const DEFAULT_SUGGESTIONS = [
  {
    title: 'Summarize meeting takeaways',
    subtitle: 'Generate bulleted notes and action items for attendees',
    action: 'Could you give me a structured template for summarizing today\'s class meeting, including key takeaways and student action items?'
  },
  {
    title: 'Draft interactive quiz questions',
    subtitle: 'Create 3 quick multiple-choice questions for the class',
    action: 'Please generate 3 engaging multiple-choice quiz questions with 4 options each and explain the correct answers.'
  },
  {
    title: 'Explain a STEM concept with formulas',
    subtitle: 'Break down physics or math principles step-by-step',
    action: 'Explain the concept of Conservation of Angular Momentum with real-life examples and key mathematical formulas.'
  },
  {
    title: 'Prepare classroom discussion points',
    subtitle: 'Structure discussion prompts to boost student participation',
    action: 'Suggest 4 interactive discussion prompts to engage passive students during a live collaborative lecture.'
  }
];

export default function GuruAIPanel({ isOpen, onClose, userName = 'Ayushmaan' }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversations, setConversations] = useState([
    { id: '1', title: 'New Conversation', date: 'Today' }
  ]);
  const [currentConvId, setCurrentConvId] = useState('1');
  const [showConvDropdown, setShowConvDropdown] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isGenerating) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsGenerating(true);

    // Update conversation title if first message
    if (messages.length === 0) {
      const newTitle = text.length > 28 ? `${text.substring(0, 28)}...` : text;
      setConversations((prev) =>
        prev.map((c) => (c.id === currentConvId ? { ...c, title: newTitle } : c))
      );
    }

    // Simulate intelligent Guru AI Copilot response
    setTimeout(() => {
      let replyContent = '';
      const lower = text.toLowerCase();

      if (lower.includes('quiz')) {
        replyContent = `Here is a quick 3-question quiz for your session:\n\n**Question 1:** What is the primary role of a catalytic converter in an exhaust system?\n- A) Reduce fuel consumption\n- B) Convert toxic gases into less harmful pollutants *(Correct)*\n- C) Increase engine horsepower\n- D) Cool exhaust gases\n\n**Question 2:** Which wavelength in visible light has the highest energy per photon?\n- A) Red\n- B) Green\n- C) Violet *(Correct)*\n- D) Yellow\n\n**Question 3:** What is the SI unit of electric capacitance?\n- A) Henry\n- B) Farad *(Correct)*\n- C) Ohm\n- D) Tesla\n\n*Would you like me to broadcast these directly to student screens via the live Quiz widget?*`;
      } else if (lower.includes('summar') || lower.includes('takeaway')) {
        replyContent = `Here is a structured meeting summary template tailored for Connectt:\n\n### 📋 Session Summary\n- **Topic:** Interactive Lecture & Classroom Review\n- **Host:** ${userName}\n- **Date:** ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n\n#### 🎯 Key Takeaways:\n1. Core concepts established and verified with real-time student polling.\n2. Whiteboard collaboration recorded for archive and distribution.\n3. Homework exercises assigned for subsequent cohort batch review.\n\n#### ⚡ Action Items:\n- Review session notes in the HomeGuru Library.\n- Submit response questions before next week's broadcast.`;
      } else if (lower.includes('formula') || lower.includes('momentum') || lower.includes('stem')) {
        replyContent = `### ⚛️ Conservation of Angular Momentum\n\nWhen no external torque acts on a system, total angular momentum $L$ remains constant:\n\n$$\\mathbf{L} = I \\boldsymbol{\\omega} = \\text{constant}$$\n\nWhere:\n- **$I$** is the moment of inertia (distribution of mass relative to axis of rotation)\n- **$\\boldsymbol{\\omega}$** is the angular velocity\n\n**Real-World Application:**\nA spinning ice skater pulls their arms inward $\\rightarrow$ $I$ decreases $\\rightarrow$ $\\boldsymbol{\\omega}$ increases sharply to conserve momentum!`;
      } else {
        replyContent = `I understand! Here is what I can assist with regarding **"${text}"**:\n\n1. **Live Collaboration:** You can share screen, activate the interactive whiteboard, or spin up live quizzes directly from the bottom controls in Connectt.\n2. **Curriculum Alignment:** All shared media and notes can be synchronized with your HomeGuru course cohorts.\n3. **Assistance:** Let me know if you would like me to draft notes, formulate questions, or explain technical concepts step-by-step.`;
      }

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'guru_ai',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 850);
  };

  const handleStartNew = () => {
    const newId = Date.now().toString();
    const newConv = { id: newId, title: 'New Conversation', date: 'Today' };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConvId(newId);
    setMessages([]);
    setShowConvDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          zIndex: 998,
          backdropFilter: 'blur(2px)',
          transition: 'opacity 0.2s ease'
        }}
      />

      {/* Slide-out Sidebar Panel */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 'min(420px, 100vw)',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #e8e4de',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.08)',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        }}
        aria-label="Guru AI Copilot"
      >
        {/* ─── 1. Header ─── */}
        <div
          style={{
            height: '58px',
            borderBottom: '1px solid #e8e4de',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            backgroundColor: '#ffffff',
            flexShrink: 0
          }}
        >
          {/* Left: Brand Mascot & Conversation Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            <img
              src="/guruai.png"
              alt="Guru AI"
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
            <button
              type="button"
              onClick={() => setShowConvDropdown(!showConvDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1a1814',
                padding: '4px 6px',
                borderRadius: '6px'
              }}
            >
              <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conversations.find((c) => c.id === currentConvId)?.title || 'Guru AI Copilot'}
              </span>
              <span className="icon" style={{ fontSize: '16px', color: '#6b6560' }}>
                expand_more
              </span>
            </button>

            {/* Conversation History Dropdown */}
            {showConvDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #e8e4de',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  width: '230px',
                  zIndex: 1010,
                  padding: '6px 0'
                }}
              >
                <button
                  type="button"
                  onClick={handleStartNew}
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#f48120',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span className="icon" style={{ fontSize: '16px' }}>add</span>
                  <span>Start New Chat</span>
                </button>
                <div style={{ height: '1px', backgroundColor: '#e8e4de', margin: '4px 0' }} />
                {conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setCurrentConvId(c.id);
                      setShowConvDropdown(false);
                    }}
                    style={{
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: c.id === currentConvId ? 600 : 400,
                      color: c.id === currentConvId ? '#1a1814' : '#6b6560',
                      backgroundColor: c.id === currentConvId ? '#f5f3ef' : 'transparent',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {c.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Header Controls: New Chat (+) & Close (✕) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={handleStartNew}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b6560',
                cursor: 'pointer'
              }}
              title="New Conversation"
            >
              <span className="icon" style={{ fontSize: '18px' }}>add</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b6560',
                cursor: 'pointer'
              }}
              title="Close panel"
            >
              <span className="icon" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
        </div>

        {/* ─── 2. Support Banner ─── */}
        <div style={{ padding: '12px 16px 0 16px', flexShrink: 0 }}>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid #e8e4de',
              backgroundColor: '#fbfbfb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1814' }}>
              Need more help?
            </span>
            <a
              href="https://uat.homeguruworld.in/dashboard/settings?tab=support"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid #e8e4de',
                backgroundColor: '#ffffff',
                color: '#1a1814',
                textDecoration: 'none',
                transition: 'background-color 0.15s ease'
              }}
            >
              Support
            </a>
          </div>
        </div>

        {/* ─── 3. Message Feed / Empty State Body ─── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {messages.length === 0 ? (
            /* Empty State */
            <div
              style={{
                margin: 'auto 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '10px 0'
              }}
            >
              <img
                src="/guruai.png"
                alt="Guru AI Mascot"
                style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: '12px' }}
              />
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1a1814',
                  margin: '0 0 4px 0',
                  letterSpacing: '-0.02em'
                }}
              >
                {getGreeting(userName)}
              </h3>
              <p style={{ fontSize: '12px', color: '#6b6560', margin: '0 0 20px 0' }}>
                What are we doing today?
              </p>

              {/* Suggestion Prompt Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                {DEFAULT_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(s.action)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #e8e4de',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fbfbfb';
                      e.currentTarget.style.borderColor = 'rgba(244, 129, 32, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#e8e4de';
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1814' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b6560', marginTop: '2px' }}>
                      {s.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Message History */
            <>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    width: '100%'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '88%',
                      padding: '10px 14px',
                      borderRadius: m.sender === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                      backgroundColor: m.sender === 'user' ? '#1a1814' : '#f7f6f3',
                      color: m.sender === 'user' ? '#ffffff' : '#1a1814',
                      border: m.sender === 'user' ? 'none' : '1px solid #e8e4de',
                      fontSize: '12.5px',
                      lineHeight: 1.55,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {m.sender === 'guru_ai' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '6px',
                          color: '#f48120',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        <img src="/guruai.png" alt="Guru AI" style={{ width: '13px', height: '13px' }} />
                        <span>Guru AI Copilot</span>
                      </div>
                    )}
                    {m.content}
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#a8a39d',
                      marginTop: '3px',
                      marginRight: m.sender === 'user' ? '4px' : '0',
                      marginLeft: m.sender === 'user' ? '0' : '4px'
                    }}
                  >
                    {m.timestamp}
                  </span>
                </div>
              ))}

              {isGenerating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b6560', fontSize: '11px', padding: '6px 0' }}>
                  <img src="/guruai.png" alt="Guru AI" style={{ width: '14px', height: '14px', animation: 'spin 2s linear infinite' }} />
                  <span>Guru AI is analyzing and drafting response...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* ─── 4. Input Area ─── */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #e8e4de',
            backgroundColor: '#ffffff',
            flexShrink: 0
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '14px',
              border: '1px solid #e8e4de',
              backgroundColor: '#fbfbfb',
              transition: 'border-color 0.15s ease'
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask Guru AI anything..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                resize: 'none',
                fontSize: '13px',
                color: '#1a1814',
                lineHeight: 1.4,
                maxHeight: '120px',
                fontFamily: 'inherit'
              }}
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isGenerating}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: inputValue.trim() && !isGenerating ? '#f48120' : '#e8e4de',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputValue.trim() && !isGenerating ? 'pointer' : 'default',
                transition: 'background-color 0.15s ease',
                flexShrink: 0,
                border: 'none'
              }}
            >
              <span className="icon" style={{ fontSize: '18px' }}>arrow_upward</span>
            </button>
          </div>

          <div
            style={{
              fontSize: '10.5px',
              color: '#a8a39d',
              textAlign: 'center',
              marginTop: '8px'
            }}
          >
            Guru AI can make mistakes. Verify important information.
          </div>
        </div>
      </aside>
    </>
  );
}
