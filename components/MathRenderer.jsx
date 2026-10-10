'use client';

import React, { useEffect, useState } from 'react';

/**
 * MathRenderer parses and renders mixed text containing LaTeX/KaTeX math
 * Delimiters supported:
 * - $$math$$ for display math
 * - $math$ for inline math
 * - Raw LaTeX expressions with backslashes
 */
export default function MathRenderer({ text = '', className = '', style = {} }) {
  const [katexLoaded, setKatexLoaded] = useState(typeof window !== 'undefined' && !!window.katex);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.katex) {
      setKatexLoaded(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.katex) {
        setKatexLoaded(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const safeStr = typeof text === 'string' ? text : (text?.text ? String(text.text) : (text ? String(text) : ''));
  if (!safeStr) return null;

  // If text contains $...$ or $$...$$
  const renderMathString = (str) => {
    const raw = typeof str === 'string' ? str : (str?.text ? String(str.text) : (str ? String(str) : ''));
    if (!katexLoaded || typeof window === 'undefined' || !window.katex) {
      return <span>{raw}</span>;
    }

    // Split text by $$...$$ and $...$
    const parts = [];
    const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(raw)) !== null) {
      // Plain text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: str.substring(lastIndex, match.index)
        });
      }

      const token = match[0];
      if (token.startsWith('$$') && token.endsWith('$$')) {
        parts.push({
          type: 'display-math',
          content: token.slice(2, -2).trim()
        });
      } else if (token.startsWith('$') && token.endsWith('$')) {
        parts.push({
          type: 'inline-math',
          content: token.slice(1, -1).trim()
        });
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push({
        type: 'text',
        content: str.substring(lastIndex)
      });
    }

    // If no $ delimiters were found, but contains raw LaTeX commands (e.g. \int, \frac, \text)
    if (parts.length === 1 && parts[0].type === 'text' && /\\[a-zA-Z]/.test(str)) {
      try {
        const rendered = window.katex.renderToString(str, {
          displayMode: false,
          throwOnError: false
        });
        return <span dangerouslySetInnerHTML={{ __html: rendered }} />;
      } catch (e) {
        return <span>{str}</span>;
      }
    }

    return (
      <>
        {parts.map((part, idx) => {
          if (part.type === 'text') {
            return <span key={idx}>{part.content}</span>;
          }
          try {
            const html = window.katex.renderToString(part.content, {
              displayMode: part.type === 'display-math',
              throwOnError: false
            });
            return (
              <span
                key={idx}
                dangerouslySetInnerHTML={{ __html: html }}
                style={{
                  display: part.type === 'display-math' ? 'block' : 'inline',
                  margin: part.type === 'display-math' ? '8px 0' : '0 2px'
                }}
              />
            );
          } catch (e) {
            return <code key={idx} style={{ color: '#89b754', padding: '1px 4px' }}>${part.content}$</code>;
          }
        })}
      </>
    );
  };

  return (
    <span className={className} style={{ display: 'inline', ...style }}>
      {renderMathString(safeStr)}
    </span>
  );
}
