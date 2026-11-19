'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('engineering');

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0b0d',
        color: '#f3f4f6',
        fontFamily: "'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden'
      }}
    >
      {/* Navigation Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: '68px',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(10, 11, 13, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#ffffff' }}>
          <img src="/connectt.png" alt="connectt.live" style={{ width: '30px', height: '30px' }} />
          <span style={{ fontSize: '19px', fontWeight: 700, letterSpacing: '-0.4px' }}>
            connectt<span style={{ color: '#3b82f6' }}>.live</span>
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/home" style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>
            Meetings
          </Link>
          <Link href="/support" style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>
            System Status & Support
          </Link>
          <Link
            href="/sen-mvwh-cyc"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              padding: '9px 20px',
              borderRadius: '9999px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              textDecoration: 'none',
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            Launch Instant Meeting
          </Link>
        </nav>
      </header>

      {/* Main Scrollable Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Hero Section */}
        <section
          style={{
            position: 'relative',
            padding: '90px 24px 70px',
            textAlign: 'center',
            maxWidth: '1080px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '540px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(10, 11, 13, 0) 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.3px',
                marginBottom: '28px'
              }}
            >
              <span>Navchetna Technologies</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span>Enterprise Video Collaboration Platform</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(38px, 6vw, 68px)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-1.5px',
                color: '#ffffff',
                margin: '0 auto 24px',
                maxWidth: '920px'
              }}
            >
              Real-time video with all your tools <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #93c5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>built directly in</span>.
            </h1>

            <p
              style={{
                fontSize: 'clamp(17px, 2vw, 21px)',
                lineHeight: 1.6,
                color: '#9ca3af',
                maxWidth: '780px',
                margin: '0 auto 40px'
              }}
            >
              Connectt eliminates fragmented apps by embedding vector whiteboards, live slide decks, mathematical computation, and interactive workspaces directly inside the call.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/home"
                style={{
                  padding: '14px 32px',
                  borderRadius: '9999px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '15px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 24px rgba(37, 99, 235, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                Start Meeting Now
              </Link>
              <Link
                href="/demo"
                style={{
                  padding: '14px 28px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  color: '#e5e7eb',
                  fontWeight: 600,
                  fontSize: '15px',
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.15s ease'
                }}
              >
                Experience Live Demo
              </Link>
            </div>
          </div>
        </section>

        {/* High-Level Architecture Key Metrics */}
        <section
          style={{
            maxWidth: '1120px',
            margin: '0 auto 80px',
            width: '100%',
            padding: '0 24px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              backgroundColor: '#111317',
              padding: '36px 32px',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '20px' }}>
              <div style={{ fontSize: '42px', fontWeight: 800, color: '#60a5fa', letterSpacing: '-1px' }}>&lt;100ms</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginTop: '6px' }}>Sub-100ms Latency</div>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px', lineHeight: 1.5 }}>
                Zero-lag WebRTC peer engine ensuring instant, crystal-clear voice and video.
              </div>
            </div>

            <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '20px' }}>
              <div style={{ fontSize: '42px', fontWeight: 800, color: '#34d399', letterSpacing: '-1px' }}>99.9%</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginTop: '6px' }}>Enterprise SLA</div>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px', lineHeight: 1.5 }}>
                Redundant distributed signaling hubs designed for zero-downtime reliability.
              </div>
            </div>

            <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '20px' }}>
              <div style={{ fontSize: '42px', fontWeight: 800, color: '#f59e0b', letterSpacing: '-1px' }}>10x</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginTop: '6px' }}>Cost Efficiency</div>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px', lineHeight: 1.5 }}>
                Up to 10x lower total cost of ownership compared to legacy video licensing.
              </div>
            </div>

            <div>
              <div style={{ fontSize: '42px', fontWeight: 800, color: '#a78bfa', letterSpacing: '-1px' }}>0</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginTop: '6px' }}>Extra Tabs Needed</div>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px', lineHeight: 1.5 }}>
                Whiteboard, slide decks, math calculators, and code running natively in-call.
              </div>
            </div>
          </div>
        </section>

        {/* Feature Showcase Grid */}
        <section
          style={{
            maxWidth: '1120px',
            margin: '0 auto 100px',
            width: '100%',
            padding: '0 24px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.8px', margin: '0 0 16px 0' }}>
              Built for How Teams Actually Work
            </h2>
            <p style={{ fontSize: '17px', color: '#9ca3af', margin: 0, maxWidth: '640px', margin: '0 auto' }}>
              Instead of switching between Zoom, Miro, Google Slides, and tabs, Connectt brings all your working surfaces directly into the video stream.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}
          >
            {/* Feature 1 */}
            <div
              style={{
                backgroundColor: '#121418',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ fontSize: '24px', color: '#fbbf24' }}>gesture</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Collaborative Excalidraw Canvas</h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
                High-performance vector whiteboard powered by Excalidraw. Sketch architecture diagrams, wireframes, flowcharts, and system designs simultaneously with all participants.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                backgroundColor: '#121418',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ fontSize: '24px', color: '#60a5fa' }}>co_present</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Synchronized Slide Presenter</h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
                Upload PDF and presentation decks to broadcast synchronously. Features remote slide control, live laser pointer highlighting, and presenter camera picture-in-picture.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                backgroundColor: '#121418',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(52, 211, 153, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ fontSize: '24px', color: '#34d399' }}>calculate</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Desmos Graphing & Computing</h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
                Integrated graphing and scientific calculators for STEM education and data review. Modify mathematical models and visualize functions together in real-time.
              </p>
            </div>

            {/* Feature 4 */}
            <div
              style={{
                backgroundColor: '#121418',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ fontSize: '24px', color: '#f87171' }}>smart_display</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Synchronized Media Watch Parties</h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
                Stream YouTube tutorials, keynote talks, or training videos with host play/pause and timestamp alignment across every connected participant.
              </p>
            </div>

            {/* Feature 5 */}
            <div
              style={{
                backgroundColor: '#121418',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(167, 139, 250, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ fontSize: '24px', color: '#c084fc' }}>code</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: 0 }}>RUX Cloud Code Studio</h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
                Pair-programming code editor with syntax highlighting, live debugging, and multi-cursor collaboration for technical interviews and engineering reviews.
              </p>
            </div>

            {/* Feature 6 */}
            <div
              style={{
                backgroundColor: '#121418',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(14, 165, 233, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="icon" style={{ fontSize: '24px', color: '#38bdf8' }}>quiz</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 200, color: '#ffffff', margin: 0 }}>Live Quizzes & Flashcards</h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
                Keep teams engaged with real-time multiple-choice quizzes, flashcard revisions, and chess puzzles to break ice and measure retention.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section
          style={{
            maxWidth: '1120px',
            margin: '0 auto 100px',
            width: '100%',
            padding: '0 24px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.6px', margin: '0 0 12px 0' }}>
              How Connectt Compares
            </h2>
            <p style={{ fontSize: '16px', color: '#9ca3af', margin: 0 }}>
              The modern alternative to legacy video conferencing platforms.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#111317',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflowX: 'auto'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '640px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '20px 24px', color: '#9ca3af', fontSize: '14px', fontWeight: 600 }}>Capability</th>
                  <th style={{ padding: '20px 24px', color: '#60a5fa', fontSize: '15px', fontWeight: 700 }}>Connectt.live</th>
                  <th style={{ padding: '20px 24px', color: '#9ca3af', fontSize: '14px', fontWeight: 600 }}>Zoom Enterprise</th>
                  <th style={{ padding: '20px 24px', color: '#9ca3af', fontSize: '14px', fontWeight: 600 }}>Google Meet</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '14px', color: '#d1d5db' }}>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>Live Shared Whiteboard</td>
                  <td style={{ padding: '16px 24px', color: '#34d399', fontWeight: 600 }}>Built-in (Excalidraw)</td>
                  <td style={{ padding: '16px 24px', color: '#9ca3af' }}>Basic / Extra Add-on</td>
                  <td style={{ padding: '16px 24px', color: '#9ca3af' }}>External Jamboard tab</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>Synced Slide & PDF Presenter</td>
                  <td style={{ padding: '16px 24px', color: '#34d399', fontWeight: 600 }}>Yes, with laser pointer</td>
                  <td style={{ padding: '16px 24px', color: '#9ca3af' }}>Screen capture only</td>
                  <td style={{ padding: '16px 24px', color: '#9ca3af' }}>Tab share only</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>Desmos Mathematical Computing</td>
                  <td style={{ padding: '16px 24px', color: '#34d399', fontWeight: 600 }}>Native in-stage</td>
                  <td style={{ padding: '16px 24px', color: '#ef4444' }}>No</td>
                  <td style={{ padding: '16px 24px', color: '#ef4444' }}>No</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>Host Controls & Moderation</td>
                  <td style={{ padding: '16px 24px', color: '#34d399', fontWeight: 600 }}>Complete Mute All & Room Lock</td>
                  <td style={{ padding: '16px 24px', color: '#9ca3af' }}>Yes</td>
                  <td style={{ padding: '16px 24px', color: '#9ca3af' }}>Yes</td>
                </tr>
                <tr>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>Cost per Host</td>
                  <td style={{ padding: '16px 24px', color: '#34d399', fontWeight: 700 }}>Starting at $0 / Up to 10x lower</td>
                  <td style={{ padding: '16px 24px', color: '#9ca3af' }}>$15 – $25 / month</td>
                  <td style={{ padding: '16px 24px', color: '#9ca3af' }}>Part of Workspace ($6 – $18/mo)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Enterprise Security & Infrastructure */}
        <section
          style={{
            backgroundColor: '#111317',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '80px 24px'
          }}
        >
          <div style={{ maxWidth: '1120px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.6px', margin: '0 0 12px 0' }}>
                Enterprise Security & Architecture
              </h2>
              <p style={{ fontSize: '16px', color: '#9ca3af', margin: 0 }}>
                Engineered by Navchetna Technologies for privacy-first enterprise communications.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}
            >
              <div style={{ backgroundColor: '#181a20', padding: '28px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span className="icon" style={{ fontSize: '32px', color: '#3b82f6', marginBottom: '12px', display: 'block' }}>lock</span>
                <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>DTLS / SRTP Encryption</h4>
                <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
                  All media tracks and real-time signaling streams are secured end-to-end with enterprise-grade encryption.
                </p>
              </div>

              <div style={{ backgroundColor: '#181a20', padding: '28px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span className="icon" style={{ fontSize: '32px', color: '#10b981', marginBottom: '12px', display: 'block' }}>shield</span>
                <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>Zero Third-Party Telemetry</h4>
                <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
                  We do not sell data, profile users, or inject tracking cookies into meeting sessions. Your video streams remain strictly confidential.
                </p>
              </div>

              <div style={{ backgroundColor: '#181a20', padding: '28px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span className="icon" style={{ fontSize: '32px', color: '#8b5cf6', marginBottom: '12px', display: 'block' }}>dns</span>
                <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>Private Cloud & On-Prem</h4>
                <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
                  Enterprise customers can deploy Connectt orchestrators within their own VPC, private Kubernetes clusters, or dedicated bare-metal servers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          style={{
            padding: '90px 24px',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.8px', margin: '0 0 16px 0' }}>
            Ready to upgrade your meetings?
          </h2>
          <p style={{ fontSize: '17px', color: '#9ca3af', lineHeight: 1.6, margin: '0 0 36px 0' }}>
            Try Connectt today with no installation, no logins, and zero fees for early adopters.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/home"
              style={{
                padding: '14px 36px',
                borderRadius: '9999px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '16px',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)'
              }}
            >
              Start Free Meeting
            </Link>
            <a
              href="mailto:contact@navchetna.tech"
              style={{
                padding: '14px 28px',
                borderRadius: '9999px',
                backgroundColor: 'transparent',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '16px',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              Contact Navchetna Sales
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '32px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          maxWidth: '1120px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          fontSize: '13px',
          color: '#6b7280'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/connectt.png" alt="connectt" style={{ width: '20px', height: '20px' }} />
          <span>© 2026 Navchetna Technologies. All rights reserved.</span>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="https://www.navchetna.tech/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>
            Terms of Service
          </a>
          <a href="https://www.navchetna.tech/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>
            Privacy Policy
          </a>
          <Link href="/support" style={{ color: '#9ca3af', textDecoration: 'none' }}>
            Diagnostics & Support
          </Link>
        </div>
      </footer>
    </div>
  );
}
