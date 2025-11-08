import React from 'react';
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { ModelsPanel } from './panels/ModelsPanel';
import { ElementsDataPanel } from './panels/ElementsDataPanel';
import { ViewpointsPanel } from './panels/ViewpointsPanel';
import { ViewportToolbar } from './toolbars/ViewportToolbar';
import { ViewportSettings } from './buttons/ViewportSettings';
import { CONTENT_GRID_GAP, SMALL_COLUMN_WIDTH } from '../globals';

interface ContentGridProps {
  components: OBC.Components;
  world: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  layout: string;
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  components,
  world,
  viewportRef,
  layout
}) => {
  if (layout !== "Viewer") {
    return null;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplate: `
          "models viewer elementData" 1fr
          "viewpoints viewer elementData" 1fr
          / ${SMALL_COLUMN_WIDTH} 1fr ${SMALL_COLUMN_WIDTH}
        `,
        padding: CONTENT_GRID_GAP,
        gap: CONTENT_GRID_GAP,
        gridArea: 'contentGrid',
        overflow: 'hidden'
      }}
    >
      <div style={{ gridArea: 'models' }}>
        <ModelsPanel components={components} />
      </div>

      <div style={{ gridArea: 'viewer', position: 'relative' }}>
        <div className="dashboard-card" style={{ padding: 0, height: '100%', overflow: 'hidden' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Viewport Container */}
            <div
              ref={viewportRef}
              style={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
                minWidth: '400px',
                display: 'block',
                position: 'relative'
              }}
            />

            <ViewportSettings components={components} world={world} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              pointerEvents: 'auto'
            }}>
              <ViewportToolbar components={components} world={world} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ gridArea: 'elementData' }}>
        <ElementsDataPanel components={components} />
      </div>

      <div style={{ gridArea: 'viewpoints' }}>
        <ViewpointsPanel components={components} world={world} />
      </div>
    </div>
  );
};
