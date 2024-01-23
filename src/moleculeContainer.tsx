/*
 * @Copyright 2024. Institute for Future Intelligence, Inc.
 */

import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  DEFAULT_CAMERA_POSITION,
  DEFAULT_FOV,
  DEFAULT_LIGHT_INTENSITY,
  DEFAULT_SHADOW_CAMERA_FAR,
  HALF_PI,
} from './constants';
import { OrbitControls } from '@react-three/drei';
import MolecularViewer from './view/molecularViewer';
import { MoleculeData } from './types';
import { useStore } from './stores/common';
import * as Selector from './stores/selector';
import { MolecularViewerColoring } from './view/displayOptions';
import { Sphere, Vector3 } from 'three';
import { usePrimitiveStore } from './stores/commonPrimitive';

export interface MoleculeContainerProps {
  width: number;
  height: number;
  moleculeData: MoleculeData | null;
  hovered: boolean;
  selected: boolean;
  shininess: number;
}

const MoleculeContainer = ({ width, height, moleculeData, hovered, selected, shininess }: MoleculeContainerProps) => {
  const setCommonStore = useStore(Selector.set);
  const viewerStyle = useStore(Selector.projectViewerStyle);
  const viewerMaterial = useStore(Selector.projectViewerMaterial);
  const viewerBackground = useStore(Selector.projectViewerBackground);
  const setChanged = usePrimitiveStore(Selector.setChanged);

  const [cameraPosition, setCameraPosition] = useState<number[]>(DEFAULT_CAMERA_POSITION);
  const orbitControlsRef = useRef<any>(null);

  const onControlEnd = (e: any) => {
    const camera = e.target.object;
    const p = camera.position as Vector3;
    setCameraPosition([p.x, p.y, p.z]);
  };

  const onLoaded = (boundingSphere: Sphere) => {
    if (orbitControlsRef?.current) {
      const r = 3 * boundingSphere.radius;
      orbitControlsRef.current.object.position.set(r, r, r);
      orbitControlsRef.current.target.set(0, 0, 0);
      orbitControlsRef.current.update();
    }
  };

  return (
    <>
      <Canvas
        shadows={false}
        gl={{ preserveDrawingBuffer: true, logarithmicDepthBuffer: true, antialias: true }}
        frameloop={'demand'}
        style={{
          transition: '.5s ease',
          height: height + 'px',
          width: width + 'px',
          backgroundColor: viewerBackground,
          borderRadius: '10px',
          border: selected ? '2px solid red' : '1px solid gray',
          opacity: moleculeData?.excluded ? 0.25 : 1,
        }}
        camera={{
          fov: DEFAULT_FOV,
          far: DEFAULT_SHADOW_CAMERA_FAR,
          up: [0, 0, 1],
          position: new Vector3().fromArray(cameraPosition),
          rotation: [HALF_PI / 2, 0, HALF_PI / 2],
        }}
        onMouseDown={() => {
          setCommonStore((state) => {
            state.selectedMolecule = moleculeData !== state.selectedMolecule ? moleculeData : null;
          });
          setChanged(true);
        }}
        onDoubleClick={() => {
          setCommonStore((state) => {
            state.selectedMolecule = moleculeData;
            state.loadedMolecule = moleculeData;
          });
        }}
      >
        <OrbitControls
          ref={orbitControlsRef}
          enableDamping={true}
          onEnd={onControlEnd}
          onChange={(e) => {
            if (!e) return;
            const camera = e.target.object;
            setCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
          }}
        />
        <directionalLight
          name={'Directional Light'}
          color="white"
          position={new Vector3().fromArray(cameraPosition ?? DEFAULT_CAMERA_POSITION)}
          intensity={DEFAULT_LIGHT_INTENSITY}
          castShadow={false}
        />
        {moleculeData && (
          <MolecularViewer
            moleculeData={moleculeData}
            style={viewerStyle}
            material={viewerMaterial}
            coloring={MolecularViewerColoring.Element}
            onLoaded={onLoaded}
          />
        )}
      </Canvas>
    </>
  );
};

export default React.memo(MoleculeContainer);