'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { sfx } from '../lib/audio';

// Unicode piece representation
const PIECE_SYMBOLS = {
  w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
  b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' }
};

export default function ChessGame({ onShareToStage, theme = 'light' }) {
  const isLight = theme === 'light';
  const cText = isLight ? '#1a1814' : '#ffffff';
  const cSubtle = isLight ? '#6b6560' : '#9aa0a6';
  const cBorder = isLight ? '#e8e4de' : 'rgba(255, 255, 255, 0.15)';
  const cPillBg = isLight ? '#f5f3ef' : 'rgba(255, 255, 255, 0.08)';

  const [game, setGame] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null); // 'e2', 'e4', etc.
  const [validMoves, setValidMoves] = useState([]); // list of target square strings
  const [history, setHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState('Game in progress');
  const [capturedPieces, setCapturedPieces] = useState({ w: [], b: [] });

  const board = useMemo(() => game.board(), [game]);
  const turn = game.turn(); // 'w' or 'b'
  const isCheck = game.inCheck();
  const isGameOver = game.isGameOver();

  useEffect(() => {
    if (game.isCheckmate()) {
      setGameStatus(`Checkmate! ${turn === 'w' ? 'Black' : 'White'} wins!`);
    } else if (game.isDraw()) {
      setGameStatus('Game drawn (Stalemate / Insufficient material)');
    } else if (isCheck) {
      setGameStatus(`Check! ${turn === 'w' ? "White" : "Black"} is in check`);
    } else {
      setGameStatus(turn === 'w' ? "White's turn" : "Black's turn");
    }
  }, [game, turn, isCheck, isGameOver]);

  const squareToCoords = (square) => {
    const col = square.charCodeAt(0) - 97; // a -> 0
    const row = 8 - parseInt(square[1], 10); // 8 -> 0
    return [row, col];
  };

  const coordsToSquare = (r, c) => {
    const col = String.fromCharCode(97 + c);
    const row = 8 - r;
    return `${col}${row}`;
  };

  const handleSquareClick = (r, c) => {
    const sq = coordsToSquare(r, c);
    const piece = game.get(sq);

    // If square already selected
    if (selectedSquare) {
      if (selectedSquare === sq) {
        // Deselect
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      // If clicked another piece of the same color, switch selection
      if (piece && piece.color === turn) {
        setSelectedSquare(sq);
        const moves = game.moves({ square: sq, verbose: true });
        setValidMoves(moves.map((m) => m.to));
        return;
      }

      // Check if move is valid
      if (validMoves.includes(sq)) {
        try {
          const moveRes = game.move({
            from: selectedSquare,
            to: sq,
            promotion: 'q' // auto promote to Queen for simplicity
          });

          if (moveRes) {
            // Track captured pieces
            if (moveRes.captured) {
              const capColor = moveRes.color === 'w' ? 'b' : 'w';
              setCapturedPieces((prev) => ({
                ...prev,
                [capColor]: [...prev[capColor], moveRes.captured]
              }));
            }

            // Update history
            setHistory((prev) => [moveRes.san, ...prev.slice(0, 11)]);
            sfx.playToggle(true);

            // Create new instance for state trigger
            const newGame = new Chess(game.fen());
            setGame(newGame);
          }
        } catch (err) {
          console.warn('Illegal move attempted:', err);
        }

        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      // Selecting piece
      if (piece && piece.color === turn) {
        setSelectedSquare(sq);
        const moves = game.moves({ square: sq, verbose: true });
        setValidMoves(moves.map((m) => m.to));
      }
    }
  };

  const handleReset = () => {
    const newG = new Chess();
    setGame(newG);
    setSelectedSquare(null);
    setValidMoves([]);
    setHistory([]);
    setCapturedPieces({ w: [], b: [] });
    sfx.playToggle(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', padding: '16px', boxSizing: 'border-box' }}>
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: turn === 'w' ? (isLight ? '#f48120' : '#ffffff') : '#2d6a4f',
              boxShadow: isCheck ? '0 0 8px #ea4335' : 'none'
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 600, color: isCheck ? '#d93025' : cText }}>
            {gameStatus}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {onShareToStage && (
            <button
              onClick={onShareToStage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '16px',
                backgroundColor: isLight ? '#fef3e2' : 'rgba(168, 199, 250, 0.16)',
                color: isLight ? '#f48120' : '#a8c7fa',
                border: isLight ? '1px solid #fbd38d' : 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Present chess board on main stage"
            >
              <span className="icon" style={{ fontSize: '15px' }}>present_to_all</span>
              <span>Present</span>
            </button>
          )}

          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '16px',
              backgroundColor: cPillBg,
              color: cSubtle,
              border: isLight ? `1px solid ${cBorder}` : 'none',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            title="Reset Chess Board"
          >
            <span className="icon" style={{ fontSize: '15px' }}>restart_alt</span>
            <span>New Game</span>
          </button>
        </div>
      </div>

      {/* Captured by White */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '22px', width: '100%', paddingLeft: '8px', fontSize: '16px', color: isLight ? '#555' : '#bdc1c6' }}>
        {capturedPieces.b.map((p, idx) => (
          <span key={idx}>{PIECE_SYMBOLS.b[p] || p}</span>
        ))}
      </div>

      {/* Real 8x8 Chess Board */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gridTemplateRows: 'repeat(8, 1fr)',
          width: '100%',
          maxWidth: '340px',
          aspectRatio: '1 / 1',
          border: `2px solid ${cBorder}`,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: isLight ? '0 4px 16px rgba(0, 0, 0, 0.08)' : '0 8px 24px rgba(0, 0, 0, 0.5)'
        }}
      >
        {board.map((rowArr, r) =>
          rowArr.map((piece, c) => {
            const sq = coordsToSquare(r, c);
            const isLight = (r + c) % 2 === 0;
            const isSelected = selectedSquare === sq;
            const isValidTarget = validMoves.includes(sq);

            let bg = isLight ? '#e2d6b5' : '#b88b4a';
            if (isSelected) bg = '#7b61ff';
            else if (isValidTarget && piece) bg = '#ea4335';

            return (
              <div
                key={sq}
                onClick={() => handleSquareClick(r, c)}
                style={{
                  backgroundColor: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  fontSize: 'clamp(20px, 4vw, 28px)',
                  userSelect: 'none',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {/* Piece Character */}
                {piece && (
                  <span
                    style={{
                      color: piece.color === 'w' ? '#ffffff' : '#1a1a1a',
                      textShadow: piece.color === 'w' ? '0 1px 3px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.4)',
                      transform: isSelected ? 'scale(1.15)' : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    {PIECE_SYMBOLS[piece.color][piece.type]}
                  </span>
                )}

                {/* Valid Move Circle Indicator */}
                {isValidTarget && !piece && (
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.35)',
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Captured by Black */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '22px', width: '100%', paddingLeft: '8px', fontSize: '16px', color: cText }}>
        {capturedPieces.w.map((p, idx) => (
          <span key={idx}>{PIECE_SYMBOLS.w[p] || p}</span>
        ))}
      </div>

      {/* Move History Log */}
      {history.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            width: '100%',
            maxWidth: '340px',
            padding: '6px 10px',
            backgroundColor: isLight ? '#f5f3ef' : '#18181b',
            border: `1px solid ${cBorder}`,
            borderRadius: '10px',
            fontSize: '12px',
            color: isLight ? '#f48120' : '#a8c7fa'
          }}
        >
          <span style={{ color: cSubtle, fontWeight: 600 }}>History:</span>
          {history.map((m, idx) => (
            <span
              key={idx}
              style={{
                backgroundColor: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
                border: isLight ? `1px solid ${cBorder}` : 'none',
                color: cText,
                padding: '2px 6px',
                borderRadius: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              {m}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
