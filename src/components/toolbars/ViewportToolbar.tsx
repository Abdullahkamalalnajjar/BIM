import React, { useState } from 'react';
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as THREE from "three";
import { tooltips } from '../../globals';

interface ViewportToolbarProps {
  components: OBC.Components;
  world: OBC.World;
}

const originalColors = new Map<
  FRAGS.BIMMaterial,
  { color: number; transparent: boolean; opacity: number }
>();

const setModelTransparent = (components: OBC.Components) => {
  const fragments = components.get(OBC.FragmentsManager);
  const materials = [...fragments.core.models.materials.list.values()];

  for (const material of materials) {
    if (material.userData.customId) continue;
    let color: number | undefined;
    if ("color" in material) {
      color = material.color.getHex();
    } else {
      color = material.lodColor.getHex();
    }

    originalColors.set(material, {
      color,
      transparent: material.transparent,
      opacity: material.opacity,
    });

    material.transparent = true;
    material.opacity = 0.05;
    material.needsUpdate = true;
    if ("color" in material) {
      material.color.setColorName("white");
    } else {
      material.lodColor.setColorName("white");
    }
  }
};

const restoreModelMaterials = () => {
  for (const [material, data] of originalColors) {
    const { color, transparent, opacity } = data;
    material.transparent = transparent;
    material.opacity = opacity;
    if ("color" in material) {
      material.color.setHex(color);
    } else {
      material.lodColor.setHex(color);
    }
    material.needsUpdate = true;
  }
  originalColors.clear();
};

export const ViewportToolbar: React.FC<ViewportToolbarProps> = ({ components, world }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [ghostMode, setGhostMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#ff0000");

  const highlighter = components.get(OBF.Highlighter);
  const hider = components.get(OBC.Hider);

  const handleToggleGhost = () => {
    if (originalColors.size) {
      restoreModelMaterials();
      setGhostMode(false);
    } else {
      setModelTransparent(components);
      setGhostMode(true);
    }
  };

  const handleFocus = async () => {
    if (!(world.camera instanceof OBC.SimpleCamera)) return;
    setLoading('focus');
    try {
      const selection = highlighter.selection.select;
      await world.camera.fitToItems(
        OBC.ModelIdMapUtils.isEmpty(selection) ? undefined : selection,
      );
    } finally {
      setLoading(null);
    }
  };

  const handleHide = async () => {
    const selection = highlighter.selection.select;
    if (OBC.ModelIdMapUtils.isEmpty(selection)) return;
    setLoading('hide');
    try {
      await hider.set(false, selection);
    } finally {
      setLoading(null);
    }
  };

  const handleIsolate = async () => {
    const selection = highlighter.selection.select;
    if (OBC.ModelIdMapUtils.isEmpty(selection)) return;
    setLoading('isolate');
    try {
      await hider.isolate(selection);
    } finally {
      setLoading(null);
    }
  };

  const handleShowAll = async () => {
    setLoading('showAll');
    try {
      await hider.set(true);
    } finally {
      setLoading(null);
    }
  };

  const handleApplyColor = async () => {
    const selection = highlighter.selection.select;
    if (OBC.ModelIdMapUtils.isEmpty(selection) || !selectedColor) return;

    setLoading('color');
    try {
      const color = new THREE.Color(selectedColor);
      const style = [...highlighter.styles.entries()].find(([, definition]) => {
        if (!definition) return false;
        return definition.color.getHex() === color.getHex();
      });

      if (style) {
        const name = style[0];
        if (name === "select") return;
        await highlighter.highlightByID(name, selection, false, false);
      } else {
        highlighter.styles.set(selectedColor, {
          color,
          renderedFaces: FRAGS.RenderedFaces.ONE,
          opacity: 1,
          transparent: false,
        });
        await highlighter.highlightByID(selectedColor, selection, false, false);
      }
      await highlighter.clear("select");
    } finally {
      setLoading(null);
    }
  };

  const buttonStyle = (active = false) => ({
    padding: '0.5rem 0.75rem',
    backgroundColor: active ? 'var(--bim-ui_accent-base)' : 'var(--bim-ui_bg-contrast-20)',
    border: 'none',
    borderRadius: '0.25rem',
    color: 'var(--bim-ui_bg-contrast-100)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem'
  });

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      padding: '0.75rem',
      backgroundColor: 'var(--bim-ui_bg-base)',
      borderTop: '1px solid var(--bim-ui_bg-contrast-40)',
      borderRadius: '0.25rem',
      margin: '0.5rem'
    }}>
      {/* Visibility Section */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--bim-ui_bg-contrast-60)' }}>👁️ Visibility</span>
        <button
          onClick={handleShowAll}
          disabled={loading === 'showAll'}
          style={buttonStyle()}
          title={tooltips.SHOW_ALL.TITLE}
        >
          {loading === 'showAll' ? '⏳' : '👁️'} Show All
        </button>
        <button
          onClick={handleToggleGhost}
          style={buttonStyle(ghostMode)}
          title={tooltips.GHOST.TITLE}
        >
          👻 Ghost
        </button>
      </div>

      <div style={{ width: '1px', backgroundColor: 'var(--bim-ui_bg-contrast-40)' }} />

      {/* Selection Section */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--bim-ui_bg-contrast-60)' }}>🎯 Selection</span>
        {world.camera instanceof OBC.SimpleCamera && (
          <button
            onClick={handleFocus}
            disabled={loading === 'focus'}
            style={buttonStyle()}
            title={tooltips.FOCUS.TITLE}
          >
            {loading === 'focus' ? '⏳' : '🔍'} Focus
          </button>
        )}
        <button
          onClick={handleHide}
          disabled={loading === 'hide'}
          style={buttonStyle()}
          title={tooltips.HIDE.TITLE}
        >
          {loading === 'hide' ? '⏳' : '🙈'} Hide
        </button>
        <button
          onClick={handleIsolate}
          disabled={loading === 'isolate'}
          style={buttonStyle()}
          title={tooltips.ISOLATE.TITLE}
        >
          {loading === 'isolate' ? '⏳' : '🎯'} Isolate
        </button>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            style={{
              width: '2rem',
              height: '2rem',
              border: '1px solid var(--bim-ui_bg-contrast-40)',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          />
          <button
            onClick={handleApplyColor}
            disabled={loading === 'color'}
            style={buttonStyle()}
          >
            {loading === 'color' ? '⏳' : '🎨'} Apply
          </button>
        </div>
      </div>
    </div>
  );
};

