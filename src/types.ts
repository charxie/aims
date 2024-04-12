/*
 * @Copyright 2023-2024. Institute for Future Intelligence, Inc.
 */

import { Object3DNode } from '@react-three/fiber';
import { Filter } from './Filter';
import { DataColoring, GraphType, LabelType, ProjectType, SpaceshipDisplayMode } from './constants';
import { MolecularViewerColoring, MolecularViewerMaterial, MolecularViewerStyle } from './view/displayOptions';
import RCGroup from './lib/gfx/RCGroup';
import { Molecule } from './models/Molecule.ts';

declare module '@react-three/fiber' {
  interface ThreeElements {
    rCGroup: Object3DNode<RCGroup, typeof RCGroup>;
  }
}

// use null for undefined, as we need to persist this in Firebase
export interface ProjectState {
  key: string;
  owner: string | null;
  time: string;
  timestamp: number;
  type: ProjectType;
  title: string | null;
  description: string | null;
  molecules: MoleculeInterface[]; // molecules in the project gallery
  numberOfColumns: number;
  selectedMolecule: MoleculeInterface | null;
  ligand: MoleculeInterface | null;
  protein: MoleculeInterface | null;
  selectedProperty: string | null;
  dataColoring: DataColoring;
  sortDescending: boolean | null;
  ranges: Range[] | null;
  filters: Filter[] | null;
  hiddenProperties: string[] | null;
  counter: number;
  xAxisNameScatterPlot: string | null;
  yAxisNameScatterPlot: string | null;
  xFormula: string | null;
  yFormula: string | null;
  xMinScatterPlot: number;
  xMaxScatterPlot: number;
  yMinScatterPlot: number;
  yMaxScatterPlot: number;
  xLinesScatterPlot: boolean;
  yLinesScatterPlot: boolean;
  lineWidthScatterPlot: number;
  dotSizeScatterPlot: number;

  cameraPosition: number[];
  cameraRotation: number[];
  cameraUp: number[];
  panCenter: number[];

  hideGallery: boolean;

  chamberViewerPercentWidth: number;
  chamberViewerAxes: boolean;
  chamberViewerStyle: MolecularViewerStyle;
  chamberViewerMaterial: MolecularViewerMaterial;
  chamberViewerColoring: MolecularViewerColoring;
  chamberViewerFoggy: boolean;
  chamberViewerBackground: string;
  chamberViewerSelector: string;

  rotationStep: number;
  translationStep: number;

  ligandTransform: MoleculeTransform;
  ligandVelocity: number[]; // velocity along x, y, z axes
  // ligandAcceleration: number[]; // acceleration along x, y, z axes

  spaceshipDisplayMode: SpaceshipDisplayMode;
  spaceshipRoll: number;
  spaceshipPitch: number;
  spaceshipYaw: number;
  spaceshipX: number;
  spaceshipY: number;
  spaceshipZ: number;
  spaceshipSize: number;

  projectViewerStyle: MolecularViewerStyle;
  projectViewerMaterial: MolecularViewerMaterial;
  projectViewerBackground: string;

  graphType: GraphType;
  labelType: LabelType;

  xyPlaneVisible: boolean;
  yzPlaneVisible: boolean;
  xzPlaneVisible: boolean;
  xyPlanePosition: number;
  yzPlanePosition: number;
  xzPlanePosition: number;

  testMolecules: Molecule[]; // molecules in the reaction chamber
  molecularContainer: MolecularContainer;
  molecularContainerVisible: boolean;
  vdwBondsVisible: boolean;
  vdwBondCutoffRelative: number;
  momentumVisible: boolean;
  momentumScaleFactor: number;
  forceVisible: boolean;
  forceScaleFactor: number;
  kineticEnergyScaleFactor: number;
  energyGraphVisible: boolean;
  trajectoryAtomIndices: number[];
  angularBondsVisible: boolean;
  torsionalBondsVisible: boolean;

  timeStep: number;
  refreshInterval: number;
  collectInterval: number;
  constantTemperature: boolean;
  temperature: number; // if temperature is constant, what value
  pressure: number; // if pressure is constant, what value (TODO)
}

export interface MolecularContainer {
  lx: number;
  ly: number;
  lz: number;
}

export interface DatumEntry {
  [key: string]: number | undefined | string | boolean;
}

export interface Range {
  variable: string;
  minimum: number;
  maximum: number;
}

export interface MoleculeInterface {
  name: string;
  url?: string;
  internal?: boolean;
  invisible?: boolean;
  excluded?: boolean;
}

export interface MoleculeTransform {
  x: number;
  y: number;
  z: number;
  euler: number[];
}

export interface ActionInfo {
  readonly timestamp: number;
  readonly name: string;
}
