'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fbfbfb',
      color: '#1a1814',
      fontFamily: "'Google Sans', Roboto, -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Header */}
      <header style={{
        height: '64px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e8e4de'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1a1814' }}>
          <img src="/connectt.png" alt="connectt.live" style={{ width: '28px', height: '28px' }} />
          <span style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.3px' }}>
            connectt<span style={{ color: '#0b57d0' }}>.live</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ fontSize: '14px', color: '#5f6368', textDecoration: 'none', fontWeight: 500 }}>
            Home
          </Link>
          <Link href="/support" style={{ fontSize: '14px', color: '#5f6368', textDecoration: 'none', fontWeight: 500 }}>
            Support
          </Link>
          <Link href="/demo" style={{
            fontSize: '13px',
            fontWeight: 600,
            padding: '8px 18px',
            borderRadius: '9999px',
            backgroundColor: '#0b57d0',
            color: '#ffffff',
            textDecoration: 'none'
          }}>
            Try Live Demo
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '80px 24px 60px',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 14px',
          borderRadius: '9999px',
          backgroundColor: '#e8f0fe',
          color: '#1967d2',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '24px'
        }}>
          <span>By Navchetna Technologies</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 54px)',
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-1px',
          color: '#1a1814',
          margin: '0 0 20px 0'
        }}>
          Everything in one room.
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          lineHeight: 1.6,
          color: '#5f6368',
          margin: '0 auto 36px',
          maxWidth: '720px'
        }}>
          Low-latency video meetings with collaboration tools built directly into the call — designed for high-performance teams, classrooms, and B2B enterprises.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            padding: '12px 28px',
            borderRadius: '9999px',
            backgroundColor: '#0b57d0',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '15px',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(11,87,208,0.25)'
          }}>
            Start a Meeting
          </Link>
          <Link href="/demo" style={{
            padding: '12px 24px',
            borderRadius: '9999px',
            backgroundColor: '#ffffff',
            color: '#1a1814',
            fontWeight: 600,
            fontSize: '15px',
            textDecoration: 'none',
            border: '1px solid #dadce0'
          }}>
            Explore Demo Stage
          </Link>
        </div>
      </section>

      {/* Metrics Row */}
      <section style={{
        maxWidth: '1060px',
        margin: '0 auto 60px',
        width: '100%',
        padding: '0 24px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          backgroundColor: '#ffffff',
          padding: '32px 28px',
          borderRadius: '24px',
          border: '1px solid #e8e4de',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#0b57d0', letterSpacing: '-0.5px' }}>&lt;100ms</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1814', marginTop: '6px' }}>Ultra-Low Latency</div>
            <div style={{ fontSize: '13px', color: '#5f6368', marginTop: '4px' }}>WebRTC real-time peer mesh for natural conversations</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#1e8e3e', letterSpacing: '-0.5px' }}>99.9%</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1814', marginTop: '6px' }}>High Availability SLA</div>
            <div style={{ fontSize: '13px', color: '#5f6368', marginTop: '4px' }}>Redundant multi-region AWS IVS & Go Orchestration</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#d93025', letterSpacing: '-0.5px' }}>Up to 10x</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1814', marginTop: '6px' }}>Cost Efficiency</div>
            <div style={{ fontSize: '13px', color: '#5f6368', marginTop: '4px' }}>Fraction of legacy enterprise video conferencing fees</div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section style={{
        maxWidth: '1060px',
        margin: '0 auto 80px',
        width: '100%',
        padding: '0 24px',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 600, color: '#1a1814', margin: '0 0 12px 0' }}>
            Why Teams Choose Connectt
          </h2>
          <p style={{ fontSize: '16px', color: '#5f6368', margin: 0 }}>
            Put the collaboration tools inside the meeting itself with zero extra tabs or subscriptions.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '24px'
        }}>
          {/* Card 1: Whiteboard */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid #e8e4de',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#fef7e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="icon" style={{ fontSize: '24px', color: '#f2994a' }}>gesture</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1814', margin: 0 }}>Shared Live Whiteboard</h3>
            <p style={{ fontSize: '14px', color: '#5f6368', lineHeight: 1.6, margin: 0 }}>
              Open a collaborative canvas powered by Excalidraw right in the call. Sketch diagrams, system architectures, and mathematical proofs live with zero sync lag.
            </p>
          </div>

          {/* Card 2: Slides & Numbers */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid #e8e4de',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="icon" style={{ fontSize: '24px', color: '#1a73e8' }}>co_present</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1814', margin: 0 }}>Slide Deck & Calculators</h3>
            <p style={{ fontSize: '14px', color: '#5f6368', lineHeight: 1.6, margin: 0 }}>
              Present PDF or PPT decks while remaining visible on camera with synchronized slide turns, laser pointing, and built-in Desmos graphing & scientific computation.
            </p>
          </div>

          {/* Card 3: Interactive Quizzes & Media */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid #e8e4de',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="icon" style={{ fontSize: '24px', color: '#1e8e3e' }}>smart_display</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1814', margin: 0 }}>Watch Parties & Quizzes</h3>
            <p style={{ fontSize: '14px', color: '#5f6368', lineHeight: 1.6, margin: 0 }}>
              Watch synchronized YouTube lectures together with host play/pause control, plus classroom quizzes, flashcards, and chess games for team bonding and education.
            </p>
          </div>
        </div>
      </section>

      {/* Who It Is For */}
      <section style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e8e4de',
        borderBottom: '1px solid #e8e4de',
        padding: '64px 24px'
      }}>
        <div style={{ maxWidth: '1060px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 600, color: '#1a1814', margin: '0 0 10px 0' }}>
              Designed For Real-World Workflows
            </h2>
            <p style={{ fontSize: '15px', color: '#5f6368', margin: 0 }}>
              Four specialized environments in one unified meeting workspace.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}>
            <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#f8fafd', border: '1px solid #e8f0fe' }}>
              <div style={{ fontWeight: 600, fontSize: '16px', color: '#0b57d0', marginBottom: '8px' }}>B2B & Enterprise Teams</div>
              <p style={{ fontSize: '13px', color: '#5f6368', lineHeight: 1.5, margin: 0 }}>
                Instant decision-making, fast customer demos, and executive review sessions with high-definition audio & screen sharing.
              </p>
            </div>
            <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#f8fafd', border: '1px solid #e8f0fe' }}>
              <div style={{ fontWeight: 600, fontSize: '16px', color: '#0b57d0', marginBottom: '8px' }}>Educators & Academies</div>
              <p style={{ fontSize: '13px', color: '#5f6368', lineHeight: 1.5, margin: 0 }}>
                Interactive live classroom teaching with synchronized whiteboards, math formulas, quizzes, and countdown timers.
              </p>
            </div>
            <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#f8fafd', border: '1px solid #e8f0fe' }}>
              <div style={{ fontWeight: 600, fontSize: '16px', color: '#0b57d0', marginBottom: '8px' }}>Remote & Hybrid Work</div>
              <p style={{ fontSize: '13px', color: '#5f6368', lineHeight: 1.5, margin: 0 }}>
                Keep teams connected across timezones without app fatigue. No software installation needed — runs in any modern browser.
              </p>
            </div>
            <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#f8fafd', border: '1px solid #e8f0fe' }}>
              <div style={{ fontWeight: 600, fontSize: '16px', color: '#0b57d0', marginBottom: '8px' }}>Webinar & Event Hosts</div>
              <p style={{ fontSize: '13px', color: '#5f6368', lineHeight: 1.5, margin: 0 }}>
                Reliable stage presentations, audience participation controls, Q&A hand-raising, and persistent recording ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        padding: '32px 24px',
        textAlign: 'center',
        borderTop: '1px solid #e8e4de',
        backgroundColor: '#ffffff',
        fontSize: '13px',
        color: '#727775',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px'
      }}>
        <Link href="/" style={{ color: '#5f6368', textDecoration: 'none' }}>Home</Link>
        <Link href="/support" style={{ color: '#5f6368', textDecoration: 'none' }}>Support</Link>
        <a href="https://www.navchetna.tech/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#5f6368', textDecoration: 'none' }}>
          Terms of Service
        </a>
        <a href="https://www.navchetna.tech/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#5f6368', textDecoration: 'none' }}>
          Privacy Policy
        </a>
        <span>© 2026 connectt.live by Navchetna Technologies</span>
      </footer>
    </div>
  );
}
