import React, { useState, useRef, useEffect } from 'react';
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

interface ViewportSettingsProps {
  components: OBC.Components;
  world: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>;
}

export const ViewportSettings: React.FC<ViewportSettingsProps> = ({ components, world }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [gridVisible, setGridVisible] = useState(true);
  const [projection, setProjection] = useState<'Perspective' | 'Orthographic'>('Perspective');
  const menuRef = useRef<HTMLDivElement>(null);

  const grids = components.get(OBC.Grids);
  const worldGrid = grids.list.get(world.uuid);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleGrid = () => {
    if (worldGrid) {
      worldGrid.visible = !gridVisible;
      setGridVisible(!gridVisible);
    }
  };

  const handleProjectionChange = (newProjection: 'Perspective' | 'Orthographic') => {
    world.camera.projection.set(newProjection);
    if (world.renderer) {
      world.renderer.postproduction.updateCamera();
    }
    setProjection(newProjection);
  };

  return (
    <div ref={menuRef} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 100 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '0.5rem',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '0.25rem',
          color: 'var(--bim-ui_bg-contrast-100)',
          cursor: 'pointer',
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bim-ui_bg-contrast-20)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        ⚙️
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.25rem',
            width: '15rem',
            backgroundColor: 'var(--bim-ui_bg-base)',
            border: '1px solid var(--bim-ui_bg-contrast-40)',
            borderRadius: '0.25rem',
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          {worldGrid && (
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.9rem',
                color: 'var(--bim-ui_bg-contrast-100)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bim-ui_bg-contrast-20)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <input
                type="checkbox"
                checked={gridVisible}
                onChange={handleToggleGrid}
                style={{ cursor: 'pointer' }}
              />
              Grid
            </label>
          )}

          <div style={{
            borderTop: '1px solid var(--bim-ui_bg-contrast-40)',
            paddingTop: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.85rem',
              color: 'var(--bim-ui_bg-contrast-60)',
              marginBottom: '0.5rem',
              paddingLeft: '0.5rem'
            }}>
              Camera Projection
            </div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.9rem',
                color: 'var(--bim-ui_bg-contrast-100)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bim-ui_bg-contrast-20)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <input
                type="radio"
                checked={projection === 'Perspective'}
                onChange={() => handleProjectionChange('Perspective')}
                style={{ cursor: 'pointer' }}
              />
              Perspective
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.9rem',
                color: 'var(--bim-ui_bg-contrast-100)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bim-ui_bg-contrast-20)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <input
                type="radio"
                checked={projection === 'Orthographic'}
                onChange={() => handleProjectionChange('Orthographic')}
                style={{ cursor: 'pointer' }}
              />
              Orthographic
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

