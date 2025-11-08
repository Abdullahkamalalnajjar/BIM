import React, { useState } from 'react';

interface SidebarProps {
  currentLayout: string;
  onLayoutChange: (layout: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentLayout, onLayoutChange }) => {
  const [compact, setCompact] = useState(true);

  const layouts = {
    'Viewer': '📦'
  };

  const handleLayoutClick = (layout: string) => {
    onLayoutChange(layout);
    window.location.hash = layout;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRight: '1px solid var(--bim-ui_bg-contrast-40)',
        padding: '0.5rem',
        gridArea: 'sidebar'
      }}
    >
      <div className="sidebar">
        {Object.entries(layouts).map(([layout]) => (
          <button
            key={layout}
            onClick={() => handleLayoutClick(layout)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              border: 'none',
              borderRadius: '0.25rem',
              backgroundColor: currentLayout === layout ? 'var(--bim-ui_main-base)' : 'transparent',
              color: 'var(--bim-ui_bg-contrast-100)',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
            onMouseOver={(e) => {
              if (currentLayout !== layout) {
                e.currentTarget.style.backgroundColor = 'var(--bim-ui_bg-contrast-20)';
              }
            }}
            onMouseOut={(e) => {
              if (currentLayout !== layout) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>📦</span>
            {!compact && <span>{layout}</span>}
          </button>
        ))}
      </div>
      <button
        onClick={() => setCompact(!compact)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          border: 'none',
          borderRadius: compact ? '100%' : '0.25rem',
          backgroundColor: 'transparent',
          color: 'var(--bim-ui_bg-contrast-100)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          width: 'fit-content'
        }}
      >
        <span>{compact ? '→' : '←'}</span>
        {!compact && <span>Collapse</span>}
      </button>
    </div>
  );
};

