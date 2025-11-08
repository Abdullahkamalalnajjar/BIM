import React, { useState } from 'react';
import * as OBC from "@thatopen/components";

interface ModelsPanelProps {
  components: OBC.Components;
}

export const ModelsPanel: React.FC<ModelsPanelProps> = ({ components }) => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);

  const ifcLoader = components.get(OBC.IfcLoader);
  const fragments = components.get(OBC.FragmentsManager);

  const handleAddIfcModel = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.accept = ".ifc";

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      setLoading(true);
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        await ifcLoader.load(bytes, true, file.name.replace(".ifc", ""));
        setModels(prev => [...prev, file.name]);
      } catch (error) {
        console.error("Error loading IFC:", error);
      } finally {
        setLoading(false);
      }
    });

    input.addEventListener("cancel", () => setLoading(false));
    input.click();
  };

  const handleAddFragmentsModel = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.accept = ".frag";

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      setLoading(true);
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        await fragments.core.load(bytes, {
          modelId: file.name.replace(".frag", ""),
        });
        setModels(prev => [...prev, file.name]);
      } catch (error) {
        console.error("Error loading fragments:", error);
      } finally {
        setLoading(false);
      }
    });

    input.addEventListener("cancel", () => setLoading(false));
    input.click();
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
        <span style={{ fontSize: '1.2rem' }}>📦</span>
        <span className="card-label">Models</span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleAddIfcModel}
            disabled={loading}
            style={{
              flex: 1,
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
            {loading ? 'Loading...' : 'Add IFC'}
          </button>
          <button
            onClick={handleAddFragmentsModel}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: 'var(--bim-ui_bg-contrast-40)',
              border: 'none',
              borderRadius: '0.25rem',
              color: 'var(--bim-ui_bg-contrast-100)',
              cursor: loading ? 'wait' : 'pointer',
              fontSize: '0.9rem',
              opacity: loading ? 0.6 : 1
            }}
          >
            Add Fragments
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {models.length === 0 ? (
          <div style={{
            padding: '1rem',
            textAlign: 'center',
            color: 'var(--bim-ui_bg-contrast-60)',
            fontSize: '0.9rem'
          }}>
            No models loaded. Click "Add IFC" or "Add Fragments" to load a model.
          </div>
        ) : (
          models.map((model, index) => (
            <div
              key={index}
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bim-ui_bg-contrast-20)',
                borderRadius: '0.25rem',
                fontSize: '0.9rem',
                color: 'var(--bim-ui_bg-contrast-100)'
              }}
            >
              {model}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

