'use client';

export default function PipPlaceholder({ userName, getDiceBearAvatar, onReturnToTab, theme }) {
  const isLight = theme === 'light';
  return (
    <div
      className="pip-placeholder"
      style={{ background: isLight ? '#f5f3ef' : '#0e0f10' }}
    >
      <img src={getDiceBearAvatar(userName)} alt={userName} className="pip-ph-avatar" />
      <p className="pip-ph-title" style={{ color: isLight ? '#1a1814' : '#e3e3e3' }}>
        Your call is in another window
      </p>
      <p className="pip-ph-sub" style={{ color: isLight ? '#6b6560' : '#5f6368' }}>
        Switch to the floating window to see your video
      </p>
      <button className="pip-ph-btn" onClick={onReturnToTab}
        style={{
          background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
          border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
          color: isLight ? '#0b57d0' : '#a8c7fa',
        }}
      >
        <span className="icon" style={{ fontSize: '16px' }}>picture_in_picture_alt</span>
        <span>Return to this tab</span>
      </button>
    </div>
  );
}
