import React, { useState } from 'react';
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

interface ViewpointsPanelProps {
  components: OBC.Components;
  world: OBC.World;
}

export const ViewpointsPanel: React.FC<ViewpointsPanelProps> = ({ components, world }) => {
  const [viewpoints, setViewpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreateViewpoint = async () => {
    setLoading(true);
    try {
      const manager = components.get(OBC.Viewpoints);
      const highlighter = components.get(OBF.Highlighter);
      const fragments = components.get(OBC.FragmentsManager);

      const viewpoint = manager.create();
      viewpoint.world = world ?? null;
      await viewpoint.updateCamera();

      // Add elements from current selection
      const selection = highlighter.selection.select;
      if (!OBC.ModelIdMapUtils.isEmpty(selection)) {
        const guids = await fragments.modelIdMapToGuids(selection);
        viewpoint.selectionComponents.add(...guids);
      }

      // Update the viewpoint colors based on the highlighter
      for (const [style, definition] of highlighter.styles) {
        if (!definition) continue;
        const map = highlighter.selection[style];
        if (OBC.ModelIdMapUtils.isEmpty(map)) continue;
        const guids = await fragments.modelIdMapToGuids(map);
        viewpoint.componentColors.set(definition.color.getHexString(), guids);
      }

      setViewpoints(prev => [...prev, { id: viewpoint.guid, name: `Viewpoint ${prev.length + 1}` }]);
    } catch (error) {
      console.error("Error creating viewpoint:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="dashboard-card"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--bim-ui_bg-contrast-40)'
      }}>
        <span style={{ fontSize: '1.2rem' }}>📷</span>
        <span className="card-label">Viewpoints</span>
      </div>

      <button
        onClick={handleCreateViewpoint}
        disabled={loading}
        style={{
          padding: '0.5rem',
          backgroundColor: 'var(--bim-ui_main-base, #4179b5)',
          border: 'none',
          borderRadius: '0.25rem',
          color: 'white',
          cursor: loading ? 'wait' : 'pointer',
          fontSize: '0.9rem',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? 'Creating...' : 'Add Viewpoint'}
      </button>

      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {viewpoints.length === 0 ? (
          <div style={{
            padding: '1rem',
            textAlign: 'center',
            color: 'var(--bim-ui_bg-contrast-60)',
            fontSize: '0.9rem'
          }}>
            No viewpoints created. Click "Add Viewpoint" to create one.
          </div>
        ) : (
          viewpoints.map((vp, index) => (
            <div
              key={index}
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bim-ui_bg-contrast-20)',
                borderRadius: '0.25rem',
                fontSize: '0.9rem',
                color: 'var(--bim-ui_bg-contrast-100)',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bim-ui_bg-contrast-40)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bim-ui_bg-contrast-20)';
              }}
            >
              {vp.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

