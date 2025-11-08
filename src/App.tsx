import React, { useEffect, useRef, useState } from 'react';
import { useBIMComponents } from './hooks/useBIMComponents';
import { Sidebar } from './components/Sidebar';
import { ContentGrid } from './components/ContentGrid';

const App: React.FC = () => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<string>("Viewer");
  const { components, world, initialized } = useBIMComponents(viewportRef.current);

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && hash === "Viewer") {
        setLayout(hash);
      } else {
        setLayout("Viewer");
        window.location.hash = "Viewer";
      }
    };

    // Set initial layout
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!initialized || !components || !world) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'var(--bim-ui_bg-contrast-100)',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>Loading BIM Viewer...</div>
        <div
          ref={viewportRef}
          style={{
            width: '800px',
            height: '600px',
            minHeight: '400px',
            minWidth: '400px',
            display: 'block',
            position: 'relative',
            visibility: 'hidden'
          }}
        />
      </div>
    );
  }

  return (
    <div
      id="app"
      style={{
        height: '100vh',
        width: '100vw',
        display: 'grid',
        gridTemplate: `"sidebar contentGrid" 1fr / auto 1fr`
      }}
    >
      <Sidebar
        currentLayout={layout}
        onLayoutChange={setLayout}
      />
      <ContentGrid
        components={components}
        world={world}
        viewportRef={viewportRef}
        layout={layout}
      />
    </div>
  );
};

export default App;
