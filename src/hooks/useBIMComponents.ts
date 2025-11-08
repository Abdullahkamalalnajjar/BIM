import { useEffect, useState } from 'react';
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

export const useBIMComponents = (viewportRef: HTMLDivElement | null) => {
  const [components, setComponents] = useState<OBC.Components | null>(null);
  const [world, setWorld] = useState<OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer> | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!viewportRef) return;

    const initComponents = async () => {
      console.log("🚀 Starting BIM initialization...");
      console.log("✅ Viewport element:", viewportRef.offsetWidth, "x", viewportRef.offsetHeight);

      // Setup Components
      const comps = new OBC.Components();
      const worlds = comps.get(OBC.Worlds);

      const newWorld = worlds.create<
        OBC.SimpleScene,
        OBC.OrthoPerspectiveCamera,
        OBF.PostproductionRenderer
      >();

      newWorld.name = "Main";
      newWorld.scene = new OBC.SimpleScene(comps);
      newWorld.scene.setup();
      newWorld.scene.three.background = new THREE.Color(0x1a1d23);

      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log("✅ Viewport is ready, now initializing renderer...");

      newWorld.renderer = new OBF.PostproductionRenderer(comps, viewportRef);
      newWorld.camera = new OBC.OrthoPerspectiveCamera(comps);
      newWorld.camera.threePersp.near = 0.01;
      newWorld.camera.threePersp.updateProjectionMatrix();
      newWorld.camera.controls.restThreshold = 0.05;

      const worldGrid = comps.get(OBC.Grids).create(newWorld);
      worldGrid.material.uniforms.uColor.value = new THREE.Color(0x494b50);
      worldGrid.material.uniforms.uSize1.value = 2;
      worldGrid.material.uniforms.uSize2.value = 8;

      const resizeWorld = () => {
        newWorld.renderer?.resize();
        newWorld.camera.updateAspect();
      };

      window.addEventListener("resize", resizeWorld);

      newWorld.dynamicAnchor = false;

      console.log("✅ Initializing components...");
      comps.init();

      // Give it a moment to settle
      await new Promise(resolve => setTimeout(resolve, 150));

      // Final resize to ensure everything is correct
      if (newWorld.renderer) {
        console.log("🔄 Resizing renderer...");
        newWorld.renderer.resize();
        newWorld.camera.updateAspect();
        console.log("✅ Renderer resized successfully");
      }

      comps.get(OBC.Raycasters).get(newWorld);

      const { postproduction } = newWorld.renderer;
      postproduction.enabled = true;
      postproduction.style = OBF.PostproductionAspect.COLOR_SHADOWS;

      const { aoPass, edgesPass } = newWorld.renderer.postproduction;

      edgesPass.color = new THREE.Color(0x494b50);

      const aoParameters = {
        radius: 0.25,
        distanceExponent: 1,
        thickness: 1,
        scale: 1,
        samples: 16,
        distanceFallOff: 1,
        screenSpaceRadius: true,
      };

      const pdParameters = {
        lumaPhi: 10,
        depthPhi: 2,
        normalPhi: 3,
        radius: 4,
        radiusExponent: 1,
        rings: 2,
        samples: 16,
      };

      aoPass.updateGtaoMaterial(aoParameters);
      aoPass.updatePdMaterial(pdParameters);

      const fragments = comps.get(OBC.FragmentsManager);

      // Determine worker path based on environment
      let workerPath: string;
      if (import.meta.env.DEV) {
        workerPath = "/node_modules/@thatopen/fragments/dist/Worker/worker.mjs";
      } else {
        workerPath = "/worker.mjs";
      }

      console.log("🔧 Initializing fragments worker");
      console.log("📍 Worker path:", workerPath);

      try {
        await fragments.init(workerPath);
        console.log("✅ Fragments worker initialized successfully!");

        // Suppress worker errors
        const core = fragments.core as any;
        if (core && core.worker) {
          const worker = core.worker;
          worker.onerror = (event: any) => {
            const errorMsg = event.message || "";
            if (errorMsg && errorMsg !== "undefined" && !errorMsg.includes("undefined:undefined")) {
              console.error("🔴 Worker error:", errorMsg);
            }
            event.stopPropagation?.();
            event.preventDefault?.();
            return false;
          };
        }
      } catch (error) {
        console.error("❌ Failed to initialize fragments worker:", error);
      }

      try {
        fragments.core.models.materials.list.onItemSet.add(({ value: material }) => {
          const isLod = "isLodMaterial" in material && material.isLodMaterial;
          if (isLod && newWorld.renderer) {
            newWorld.renderer.postproduction.basePass.isolatedMaterials.push(material);
          }
        });
      } catch (error) {
        console.error("❌ Error setting up materials handler:", error);
      }

      newWorld.camera.projection.onChanged.add(() => {
        for (const [_, model] of fragments.list) {
          model.useCamera(newWorld.camera.three);
        }
      });

      newWorld.camera.controls.addEventListener("rest", () => {
        fragments.core.update(true);
      });

      const ifcLoader = comps.get(OBC.IfcLoader);
      await ifcLoader.setup({
        autoSetWasm: false,
        wasm: { absolute: true, path: "https://unpkg.com/web-ifc@0.0.72/" },
      });

      const highlighter = comps.get(OBF.Highlighter);
      highlighter.setup({
        world: newWorld,
        selectMaterialDefinition: {
          color: new THREE.Color("#bcf124"),
          renderedFaces: 1,
          opacity: 1,
          transparent: false,
        },
      });

      // Clipper Setup
      const clipper = comps.get(OBC.Clipper);
      viewportRef.addEventListener('dblclick', () => {
        if (clipper.enabled) clipper.create(newWorld);
      });

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === "Delete" || event.code === "Backspace") {
          clipper.delete(newWorld);
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      // Length Measurement Setup
      const lengthMeasurer = comps.get(OBF.LengthMeasurement);
      lengthMeasurer.world = newWorld;
      lengthMeasurer.color = new THREE.Color("#6528d7");

      lengthMeasurer.list.onItemAdded.add((line) => {
        const center = new THREE.Vector3();
        line.getCenter(center);
        const radius = line.distance() / 3;
        const sphere = new THREE.Sphere(center, radius);
        newWorld.camera.controls.fitToSphere(sphere, true);
      });

      // Area Measurement Setup
      const areaMeasurer = comps.get(OBF.AreaMeasurement);
      areaMeasurer.world = newWorld;
      areaMeasurer.color = new THREE.Color("#6528d7");

      areaMeasurer.list.onItemAdded.add((area) => {
        if (!area.boundingBox) return;
        const sphere = new THREE.Sphere();
        area.boundingBox.getBoundingSphere(sphere);
        newWorld.camera.controls.fitToSphere(sphere, true);
      });

      const handleAreaKeyDown = (event: KeyboardEvent) => {
        if (event.code === "Enter" || event.code === "NumpadEnter") {
          areaMeasurer.endCreation();
        }
      };

      window.addEventListener("keydown", handleAreaKeyDown);

      // Define what happens when a fragments model has been loaded
      fragments.list.onItemSet.add(async ({ value: model }) => {
        model.useCamera(newWorld.camera.three);
        model.getClippingPlanesEvent = () => {
          return Array.from(newWorld.renderer!.three.clippingPlanes) || [];
        };
        newWorld.scene.three.add(model.object);
        await fragments.core.update(true);
      });

      setComponents(comps);
      setWorld(newWorld);
      setInitialized(true);

      console.log("✅ All initialization complete!");
    };

    initComponents();
  }, [viewportRef]);

  return { components, world, initialized };
};
