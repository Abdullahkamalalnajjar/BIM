import React, { useState, useEffect } from 'react';
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

interface ElementsDataPanelProps {
  components: OBC.Components;
}

export const ElementsDataPanel: React.FC<ElementsDataPanelProps> = ({ components }) => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);

  const highlighter = components.get(OBF.Highlighter);

  useEffect(() => {
    const handleSelect = (modelIdMap: any) => {
      setSelectedData(modelIdMap);
    };

    const handleClear = () => {
      setSelectedData(null);
    };

    highlighter.events.select.onHighlight.add(handleSelect);
    highlighter.events.select.onClear.add(handleClear);

    return () => {
      highlighter.events.select.onHighlight.remove(handleSelect);
      highlighter.events.select.onClear.remove(handleClear);
    };
  }, [components]);

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
        <span style={{ fontSize: '1.2rem' }}>📋</span>
        <span className="card-label">Selection Data</span>
      </div>

      <div style={{ display: 'flex', gap: '0.375rem' }}>
        <input
          type="text"
          placeholder="Search..."
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: 'var(--bim-ui_bg-contrast-20)',
            border: '1px solid var(--bim-ui_bg-contrast-40)',
            borderRadius: '0.25rem',
            color: 'var(--bim-ui_bg-contrast-100)',
            fontSize: '0.9rem'
          }}
        />
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            padding: '0.5rem',
            backgroundColor: 'var(--bim-ui_bg-contrast-40)',
            border: 'none',
            borderRadius: '0.25rem',
            color: 'var(--bim-ui_bg-contrast-100)',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
          title="Expand/Collapse"
        >
          ⤢
        </button>
        <button
          style={{
            padding: '0.5rem',
            backgroundColor: 'var(--bim-ui_bg-contrast-40)',
            border: 'none',
            borderRadius: '0.25rem',
            color: 'var(--bim-ui_bg-contrast-100)',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
          title="Export Data"
        >
          📤
        </button>
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto'
      }}>
        {!selectedData || Object.keys(selectedData).length === 0 ? (
          <div style={{
            padding: '1rem',
            textAlign: 'center',
            color: 'var(--bim-ui_bg-contrast-60)',
            fontSize: '0.9rem'
          }}>
            Select an element to view its properties
          </div>
        ) : (
          <div style={{
            padding: '0.5rem',
            fontSize: '0.85rem',
            color: 'var(--bim-ui_bg-contrast-100)'
          }}>
            <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Selected Elements
            </div>
            <pre style={{
              whiteSpace: expanded ? 'pre-wrap' : 'pre',
              overflow: 'auto',
              backgroundColor: 'var(--bim-ui_bg-contrast-10)',
              padding: '0.5rem',
              borderRadius: '0.25rem'
            }}>
              {JSON.stringify(selectedData, null, expanded ? 2 : 0)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

