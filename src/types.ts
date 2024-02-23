/*
 * @Copyright 2023-2024. Institute for Future Intelligence, Inc.
 */

import { Filter } from './Filter';
import { DataColoring, GraphType, LabelType, ProjectType, SpaceshipDisplayMode } from './constants';
import { MolecularViewerColoring, MolecularViewerMaterial, MolecularViewerStyle } from './view/displayOptions';

// use null for undefined, as we need to persist this in Firebase
export interface ProjectState {
  key: string;
  owner: string | null;
  time: string;
  timestamp: number;
  type: ProjectType;
  title: string | null;
  description: string | null;
  molecules: MoleculeData[];
  selectedMolecule: MoleculeData | null;
  testMolecule: MoleculeData | null;
  targetProtein: MoleculeData | null;
  selectedProperty: string | null;
  dataColoring: DataColoring;
  sortDescending: boolean | null;
  ranges: Range[] | null;
  filters: Filter[] | null;
  hiddenProperties: string[] | null;
  counter: number;
  xAxisNameScatterPlot: string | null;
  yAxisNameScatterPlot: string | null;
  xMinScatterPlot: number;
  xMaxScatterPlot: number;
  yMinScatterPlot: number;
  yMaxScatterPlot: number;
  xLinesScatterPlot: boolean;
  yLinesScatterPlot: boolean;
  dotSizeScatterPlot: number | null;
  thumbnailWidth: number | null;

  cameraPosition: number[];
  cameraRotation: number[];
  cameraUp: number[];
  panCenter: number[];

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

  testMoleculeRotation: number[]; // euler angles
  testMoleculeTranslation: number[]; // translation displacement along x, y, z axes
  testMoleculeVelocity: number[]; // velocity along x, y, z axes
  // testMoleculeAcceleration: number[]; // acceleration along x, y, z axes

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
}

export interface DatumEntry {
  [key: string]: number | undefined | string | boolean;
}

export interface Range {
  variable: string;
  minimum: number;
  maximum: number;
}

export interface MoleculeData {
  name: string;
  internal?: boolean;
  url?: string;
  invisible?: boolean;
  excluded?: boolean;
}

export interface ActionInfo {
  readonly timestamp: number;
  readonly name: string;
}
