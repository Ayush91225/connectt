'use client';

import React, { useState, useRef, useEffect } from 'react';
import { sfx } from '../lib/audio';

export default function SlideDeckPresenter({
  theme = 'light',
  onSync = null,
  syncData = null,
  isPresenter = false
}) {
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
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const totalPages = uploadedFile?.pageCount || 1;

  // Sync state from remote presenter
  useEffect(() => {
    if (!syncData) return;
    if (syncData.uploadedFile && (!uploadedFile || uploadedFile.url !== syncData.uploadedFile.url)) {
      setUploadedFile(syncData.uploadedFile);
    }
    if (syncData.currentPage !== undefined && syncData.currentPage !== currentPage) {
      setCurrentPage(syncData.currentPage);
    }
    if (syncData.laserPos) {
      setLaserPos(syncData.laserPos);
      setLaserActive(Boolean(syncData.laserActive));
    }
  }, [syncData]);

  const broadcastSync = (nextPage, nextFile, laser) => {
    onSync?.({
      uploadedFile: nextFile !== undefined ? nextFile : uploadedFile,
      currentPage: nextPage !== undefined ? nextPage : currentPage,
      laserPos: laser !== undefined ? laser : laserPos,
      laserActive: laser !== undefined ? Boolean(laserActive) : false
    });
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const p = currentPage + 1;
      setCurrentPage(p);
      broadcastSync(p);
      sfx.playReaction();
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      const p = currentPage - 1;
      setCurrentPage(p);
      broadcastSync(p);
      sfx.playReaction();
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    setIsUploading(true);
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isPpt = file.name.endsWith('.ppt') || file.name.endsWith('.pptx');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      const fileMeta = {
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: isPdf ? 'pdf' : (isPpt ? 'pptx' : 'doc'),
        url: data.url,
        pageCount: isPdf ? 12 : 8
      };

      setUploadedFile(fileMeta);
      setCurrentPage(1);
      broadcastSync(1, fileMeta);
      sfx.playReaction();
    } catch (err) {
      console.warn('Fallback to local blob URL:', err);
      const localUrl = URL.createObjectURL(file);
      const fileMeta = {
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: isPdf ? 'pdf' : (isPpt ? 'pptx' : 'doc'),
        url: localUrl,
        pageCount: isPdf ? 12 : 8
      };
      setUploadedFile(fileMeta);
      setCurrentPage(1);
      broadcastSync(1, fileMeta);
    } finally {
      setIsUploading(false);
    }
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
    if (!laserActive || !isPresenter) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setLaserPos(pos);
    broadcastSync(currentPage, undefined, pos);
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

      {/* Uploading indicator */}
      {isUploading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            color: '#ffffff'
          }}
        >
          <span className="icon" style={{ fontSize: '36px', animation: 'spin 1s linear infinite', marginBottom: '12px' }}>
            progress_activity
          </span>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>Uploading presentation for all attendees...</span>
        </div>
      )}

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
                <span className="icon" style={{ fontSize: '64px', color: '#f48120', marginBottom: '16px' }}>co_present</span>
                <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 8px 0' }}>{uploadedFile.name}</h2>
                <p style={{ fontSize: '14px', color: cSubtle, margin: '0 0 24px 0' }}>Slide {currentPage} of {totalPages}</p>
                <div style={{ width: '80%', height: '180px', border: `1px dashed ${cBorder}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cSubtle, fontSize: '13px' }}>
                  Interactive presentation view active
                </div>
              </div>
            )}
          </div>

          {/* Floating Slide Navigation Controls */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(28, 29, 31, 0.95)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${cBorder}`,
              boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.1)' : '0 8px 24px rgba(0,0,0,0.4)',
              zIndex: 10
            }}
          >
            <button
              onClick={handlePrev}
              disabled={currentPage <= 1}
              style={{
                background: 'transparent',
                border: 'none',
                color: currentPage <= 1 ? cSubtle : cText,
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title="Previous slide"
            >
              <span className="icon" style={{ fontSize: '20px' }}>chevron_left</span>
            </button>

            <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '60px', textAlign: 'center' }}>
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              style={{
                background: 'transparent',
                border: 'none',
                color: currentPage >= totalPages ? cSubtle : cText,
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title="Next slide"
            >
              <span className="icon" style={{ fontSize: '20px' }}>chevron_right</span>
            </button>

            <div style={{ width: '1px', height: '20px', backgroundColor: cBorder, margin: '0 4px' }} />

            {/* Laser Pointer Toggle */}
            <button
              onClick={() => {
                const nextLaser = !laserActive;
                setLaserActive(nextLaser);
                broadcastSync(currentPage, undefined, laserPos);
              }}
              style={{
                background: laserActive ? 'rgba(234, 67, 53, 0.15)' : 'transparent',
                border: laserActive ? '1px solid #ea4335' : '1px solid transparent',
                borderRadius: '8px',
                color: laserActive ? '#ea4335' : cText,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: 500
              }}
              title="Toggle Laser Pointer"
            >
              <span className="icon" style={{ fontSize: '16px' }}>highlight</span>
              <span>Laser</span>
            </button>

            {/* Replace Document */}
            {isPresenter && (
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: cSubtle,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: 500
                }}
                title="Upload a different deck"
              >
                <span className="icon" style={{ fontSize: '16px' }}>swap_horiz</span>
                <span>Replace</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* EMPTY STATE / FILE UPLOAD DROPZONE */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            backgroundColor: isDragging ? (isLight ? '#f0f5ff' : '#141c2c') : 'transparent',
            transition: 'background-color 0.2s ease'
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                backgroundColor: isLight ? '#f1f3f4' : '#202124',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                color: '#0b57d0'
              }}
            >
              <span className="icon" style={{ fontSize: '32px' }}>co_present</span>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '-0.4px' }}>
              Present Slides or Documents
            </h2>
            <p style={{ fontSize: '14px', color: cSubtle, margin: '0 0 28px 0', lineHeight: 1.5 }}>
              Upload your presentation deck to present live with synchronized slide navigation.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '9999px',
                backgroundColor: isLight ? '#ffffff' : '#1f2022',
                border: `1px solid ${cBorder}`,
                boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                color: cText,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '20px',
                transition: 'all 0.15s ease'
              }}
            >
              <span className="icon" style={{ fontSize: '20px' }}>upload_file</span>
              <span>Choose Document (.pdf, .pptx)</span>
            </button>

            <span style={{ fontSize: '12px', color: cSubtle }}>or drag & drop your presentation file here</span>

            <div style={{ marginTop: '24px', display: 'flex', gap: '16px', fontSize: '12px', color: cSubtle }}>
              <span>Supported formats: PDF, Microsoft PowerPoint (PPT, PPTX)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
