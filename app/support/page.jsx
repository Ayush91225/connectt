'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SupportPage() {
  const [testStatus, setTestStatus] = useState({
    webrtc: 'Checking...',
    camera: 'Checking...',
    mic: 'Checking...',
    websocket: 'Checking...',
    latency: '...'
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '', topic: 'general' });

  // Run live browser capability & network diagnostic
  useEffect(() => {
    async function runDiagnostics() {
      // 1. WebRTC Support
      const hasWebRTC = typeof window !== 'undefined' && 'RTCPeerConnection' in window;
      setTestStatus(prev => ({ ...prev, webrtc: hasWebRTC ? 'Supported (P2P Mesh Ready)' : 'Unsupported' }));

      // 2. Media Devices
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasCam = devices.some(d => d.kind === 'videoinput');
          const hasMic = devices.some(d => d.kind === 'audioinput');
          setTestStatus(prev => ({
            ...prev,
            camera: hasCam ? 'Detected' : 'No camera found',
            mic: hasMic ? 'Detected' : 'No microphone found'
          }));
        } catch (e) {
          setTestStatus(prev => ({
            ...prev,
            camera: 'Permission needed',
            mic: 'Permission needed'
          }));
        }
      }

      // 3. WebSocket Latency Ping
      const t0 = performance.now();
      try {
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${proto}//${window.location.host}/ws?roomId=diagnostics&userId=diag-check`);
        ws.onopen = () => {
          const rtt = Math.round(performance.now() - t0);
          setTestStatus(prev => ({
            ...prev,
            websocket: 'Connected',
            latency: `${rtt} ms`
          }));
          ws.close();
        };
        ws.onerror = () => {
          setTestStatus(prev => ({ ...prev, websocket: 'Unavailable', latency: 'N/A' }));
        };
      } catch (e) {
        setTestStatus(prev => ({ ...prev, websocket: 'Unavailable', latency: 'N/A' }));
      }
    }

    runDiagnostics();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setContactSubmitted(true);
  };

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
          <Link href="/about" style={{ fontSize: '14px', color: '#5f6368', textDecoration: 'none', fontWeight: 500 }}>
            About
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
            Open Demo Call
          </Link>
        </div>
      </header>

      {/* Main Support Content */}
      <main style={{
        flex: 1,
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%',
        padding: '48px 24px 80px',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#1a1814', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
            Connectt Support & Diagnostics
          </h1>
          <p style={{ fontSize: '16px', color: '#5f6368', margin: 0 }}>
            Need help with your meeting, screen sharing, or enterprise setup? We're here for you.
          </p>
        </div>

        {/* Live Diagnostics Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e8e4de',
          padding: '28px',
          marginBottom: '36px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <span className="icon" style={{ fontSize: '22px', color: '#1e8e3e' }}>speed</span>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1814', margin: 0 }}>
              Live System & Network Diagnostics
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafd', border: '1px solid #e8f0fe' }}>
              <div style={{ fontSize: '12px', color: '#5f6368' }}>WebRTC Engine</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0b57d0', marginTop: '4px' }}>{testStatus.webrtc}</div>
            </div>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafd', border: '1px solid #e8f0fe' }}>
              <div style={{ fontSize: '12px', color: '#5f6368' }}>Camera Hardware</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1814', marginTop: '4px' }}>{testStatus.camera}</div>
            </div>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafd', border: '1px solid #e8f0fe' }}>
              <div style={{ fontSize: '12px', color: '#5f6368' }}>Microphone Hardware</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1814', marginTop: '4px' }}>{testStatus.mic}</div>
            </div>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafd', border: '1px solid #e8f0fe' }}>
              <div style={{ fontSize: '12px', color: '#5f6368' }}>Real-time Gateway</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e8e3e', marginTop: '4px' }}>{testStatus.websocket}</div>
            </div>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafd', border: '1px solid #e8f0fe' }}>
              <div style={{ fontSize: '12px', color: '#5f6368' }}>Server Latency (RTT)</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1814', marginTop: '4px' }}>{testStatus.latency}</div>
            </div>
          </div>
        </div>

        {/* FAQs and Contact Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '28px'
        }}>
          {/* FAQs */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e8e4de',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1814', margin: 0 }}>
              Frequently Asked Questions
            </h2>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1814', marginBottom: '6px' }}>
                How do I grant camera and mic permissions?
              </div>
              <p style={{ fontSize: '13px', color: '#5f6368', lineHeight: 1.5, margin: 0 }}>
                Click the padlock icon beside <code>connectt.live</code> in your browser address bar. Ensure Camera and Microphone are set to "Allow", then reload the page.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1814', marginBottom: '6px' }}>
                Does screen sharing include computer audio?
              </div>
              <p style={{ fontSize: '13px', color: '#5f6368', lineHeight: 1.5, margin: 0 }}>
                Yes! When presenting a Chrome tab or full screen, check the "Share tab audio" or "Share system audio" checkbox in the browser prompt to stream sound to everyone.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1814', marginBottom: '6px' }}>
                How do collaborative tools work?
              </div>
              <p style={{ fontSize: '13px', color: '#5f6368', lineHeight: 1.5, margin: 0 }}>
                Tools like Whiteboard, YouTube watch parties, Slide decks, and Desmos calculators are synchronized peer-to-peer using real-time WebSockets. When the host pauses or draws, changes reflect instantly across all participant screens.
              </p>
            </div>
          </div>

          {/* Contact Support Form */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e8e4de',
            padding: '28px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1814', margin: '0 0 16px 0' }}>
              Contact Team Navchetna
            </h2>

            {contactSubmitted ? (
              <div style={{
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: '#e6f4ea',
                border: '1px solid #ceead6',
                textAlign: 'center'
              }}>
                <span className="icon" style={{ fontSize: '32px', color: '#1e8e3e' }}>check_circle</span>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e8e3e', marginTop: '8px' }}>
                  Thank you! Message received.
                </div>
                <p style={{ fontSize: '13px', color: '#5f6368', marginTop: '6px' }}>
                  Our engineering team will get back to your email ({formData.email}) shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#5f6368', display: 'block', marginBottom: '4px' }}>
                    YOUR NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #dadce0',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#5f6368', display: 'block', marginBottom: '4px' }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@company.com"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #dadce0',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#5f6368', display: 'block', marginBottom: '4px' }}>
                    MESSAGE OR ISSUE DESCRIPTION
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe what you need assistance with..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #dadce0',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '12px 20px',
                    borderRadius: '9999px',
                    backgroundColor: '#0b57d0',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '6px',
                    boxShadow: '0 2px 8px rgba(11,87,208,0.25)'
                  }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

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
        <Link href="/about" style={{ color: '#5f6368', textDecoration: 'none' }}>About</Link>
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
