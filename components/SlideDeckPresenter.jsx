'use client';

import React, { useState, useRef, useEffect } from 'react';
import { sfx } from '../lib/audio';

export default function SlideDeckPresenter({ theme = 'light' }) {
  const isLight = theme === 'light';
  const cBg = isLight ? '#fbfbfb' : '#0c0d0f';
  const cText = isLight ? '#1a1814' : '#ffffff';
  const cSubtle = isLight ? '#6b6560' : '#9aa0a6';
  const cBorder = isLight ? '#e8e4de' : 'rgba(255, 255, 255, 0.1)';
  const [uploadedFile, setUploadedFile] = useState(null); // { name, type, url, pageCount }
  const [currentPage, setCurrentPage] = useState(1);
  const [laserActive, setLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const totalPages = uploadedFile?.pageCount || 1;

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(p => p + 1);
      sfx.playReaction();
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1);
      sfx.playReaction();
    }
  };

  const processFile = (file) => {
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isPpt = file.name.endsWith('.ppt') || file.name.endsWith('.pptx');

    setUploadedFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      type: isPdf ? 'pdf' : (isPpt ? 'pptx' : 'doc'),
      url: fileUrl,
      pageCount: isPdf ? 12 : 8
    });
    setCurrentPage(1);
    sfx.playReaction();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleMouseMove = (e) => {
    if (!laserActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setLaserPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Keyboard navigation
  useEffect(() => {
    if (!uploadedFile) return;
    const handleKey = (e) => {
      if (['ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [uploadedFile, currentPage, totalPages]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: cBg,
        color: cText,
        fontFamily: "'Segoe UI', Roboto, -apple-system, sans-serif",
        overflow: 'hidden'
      }}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.ppt,.pptx"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* ACTIVE PRESENTATION VIEW */}
      {uploadedFile ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            backgroundColor: isLight ? '#f5f3ef' : '#0a0a0c',
            overflow: 'hidden'
          }}
          onMouseMove={handleMouseMove}
        >
          {/* Laser Pointer Dot */}
          {laserActive && (
            <div
              style={{
                position: 'absolute',
                top: laserPos.y - 8,
                left: laserPos.x - 8,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#ea4335',
                boxShadow: '0 0 16px #ea4335, 0 0 24px #ea4335',
                pointerEvents: 'none',
                zIndex: 999
              }}
            />
          )}

          {/* Main Presentation Surface */}
          <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {uploadedFile.type === 'pdf' ? (
              <iframe
                src={`${uploadedFile.url}#page=${currentPage}&toolbar=0&navpanes=0`}
                title={uploadedFile.name}
                style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#1a1a1d' }}
              />
            ) : (
              /* PowerPoint Presentation Frame */
              <div
                style={{
                  width: '90%',
                  maxWidth: '880px',
                  height: '80%',
                  backgroundColor: isLight ? '#ffffff' : '#161719',
                  borderRadius: '16px',
                  border: `1px solid ${cBorder}`,
                  boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    backgroundColor: isLight ? '#fef3e2' : 'rgba(210, 71, 38, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <span className="icon" style={{ fontSize: '32px', color: '#d24726' }}>slideshow</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: cText, margin: '0 0 6px 0' }}>
                  {uploadedFile.name}
                </h3>
                <p style={{ fontSize: '13px', color: cSubtle, margin: '0 0 20px 0' }}>
                  Slide {currentPage} of {totalPages} • PowerPoint Presentation Deck
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handlePrev}
                    disabled={currentPage <= 1}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '18px',
                      backgroundColor: isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.08)',
                      color: currentPage <= 1 ? (isLight ? '#c7c4be' : '#555') : (isLight ? '#1a1814' : '#fff'),
                      border: isLight ? `1px solid ${cBorder}` : 'none',
                      fontSize: '13px',
                      cursor: currentPage <= 1 ? 'default' : 'pointer'
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentPage >= totalPages}
                    style={{
                      padding: '8px 22px',
                      borderRadius: '18px',
                      backgroundColor: currentPage >= totalPages
                        ? (isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.08)')
                        : (isLight ? '#f48120' : '#89b754'),
                      color: currentPage >= totalPages
                        ? (isLight ? '#c7c4be' : '#555')
                        : (isLight ? '#ffffff' : '#000'),
                      border: isLight && currentPage >= totalPages ? `1px solid ${cBorder}` : 'none',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: currentPage >= totalPages ? 'default' : 'pointer'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Minimal Floating Presenter Pill Bar at Bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(24, 25, 27, 0.94)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${cBorder}`,
              boxShadow: isLight ? '0 4px 20px rgba(0, 0, 0, 0.1)' : '0 8px 32px rgba(0, 0, 0, 0.6)',
              borderRadius: '28px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 50
            }}
          >
            {/* Prev Button */}
            <button
              onClick={handlePrev}
              disabled={currentPage <= 1}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: currentPage <= 1 ? 'transparent' : (isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.08)'),
                color: currentPage <= 1 ? (isLight ? '#c7c4be' : '#555') : (isLight ? '#1a1814' : '#fff'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: currentPage <= 1 ? 'default' : 'pointer'
              }}
              title="Previous slide (Left Arrow)"
            >
              <span className="icon" style={{ fontSize: '18px' }}>chevron_left</span>
            </button>

            {/* Page Count */}
            <span style={{ fontSize: '13px', fontWeight: 500, color: cText, minWidth: '70px', textAlign: 'center' }}>
              {currentPage} / {totalPages}
            </span>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: currentPage >= totalPages ? 'transparent' : (isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.08)'),
                color: currentPage >= totalPages ? (isLight ? '#c7c4be' : '#555') : (isLight ? '#1a1814' : '#fff'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: currentPage >= totalPages ? 'default' : 'pointer'
              }}
              title="Next slide (Right Arrow)"
            >
              <span className="icon" style={{ fontSize: '18px' }}>chevron_right</span>
            </button>

            <div style={{ width: '1px', height: '18px', backgroundColor: cBorder }} />

            {/* Laser Pointer Mode */}
            <button
              onClick={() => setLaserActive(!laserActive)}
              style={{
                padding: '4px 10px',
                borderRadius: '14px',
                backgroundColor: laserActive ? 'rgba(234, 67, 53, 0.15)' : 'transparent',
                border: laserActive ? '1px solid #ea4335' : '1px solid transparent',
                color: laserActive ? '#ea4335' : cSubtle,
                fontSize: '12px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
              title="Laser pointer"
            >
              <span className="icon" style={{ fontSize: '16px' }}>highlight</span>
              <span>Laser</span>
            </button>

            <div style={{ width: '1px', height: '18px', backgroundColor: cBorder }} />

            {/* Change File Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '4px 10px',
                borderRadius: '14px',
                backgroundColor: 'transparent',
                border: 'none',
                color: cSubtle,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
              title="Upload new presentation"
            >
              <span className="icon" style={{ fontSize: '16px' }}>upload_file</span>
              <span>Replace</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                setUploadedFile(null);
                sfx.playToggle(false);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '14px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#d93025',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
              title="Reset presentation"
            >
              <span className="icon" style={{ fontSize: '16px' }}>close</span>
              <span>Close</span>
            </button>
          </div>
        </div>
      ) : (
        /* MINIMALIST EMPTY STATE WITH GENEROUS WHITESPACE */
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
            backgroundColor: cBg
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '24px',
              backgroundColor: isDragging ? (isLight ? 'rgba(244, 129, 32, 0.08)' : 'rgba(137, 183, 84, 0.08)') : 'transparent',
              border: isDragging ? `2px dashed ${isLight ? '#f48120' : '#89b754'}` : 'none',
              borderRadius: '24px',
              transition: 'all 0.2s ease'
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: cText, margin: '0 0 10px 0', letterSpacing: '-0.4px' }}>
              Present Slides or Documents
            </h2>
            <p style={{ fontSize: '14px', color: cSubtle, margin: '0 0 28px 0', lineHeight: 1.5, maxWidth: '400px' }}>
              Upload your presentation deck to present live with synchronized slide navigation.
            </p>

            {/* Choose Document Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '12px 28px',
                borderRadius: '24px',
                backgroundColor: isLight ? '#ffffff' : '#ffffff',
                color: isLight ? '#1a1814' : '#000000',
                border: isLight ? `1px solid ${cBorder}` : 'none',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: isLight ? '0 2px 8px rgba(0, 0, 0, 0.06)' : '0 4px 16px rgba(0, 0, 0, 0.3)',
                marginBottom: '16px'
              }}
            >
              <span className="icon" style={{ fontSize: '20px' }}>upload_file</span>
              <span>Choose Document (.pdf, .pptx)</span>
            </button>

            <div style={{ fontSize: '12px', color: isLight ? '#8a8580' : '#747775' }}>
              or drag & drop your presentation file here
            </div>

            <div style={{ fontSize: '11px', color: isLight ? '#a5a09a' : '#555', marginTop: '24px' }}>
              Supported formats: PDF, Microsoft PowerPoint (PPT, PPTX)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
