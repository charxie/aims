/*
 * @Copyright 2023-2024. Institute for Future Intelligence, Inc.
 */

import { Filter } from './Filter';
import { DataColoring, ProjectType, SpaceshipDisplayMode } from './constants';
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
  loadedMolecule: MoleculeData | null;
  targetProtein: MoleculeData | null;
  selectedProperty: string | null;
  dataColoring: DataColoring;
  sortDescending: boolean | null;
  ranges: Range[] | null;
  filters: Filter[] | null;
  hiddenProperties: string[] | null;
  counter: number;
  xAxisNameScatteredPlot: string | null;
  yAxisNameScatteredPlot: string | null;
  dotSizeScatteredPlot: number | null;
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

  drugMoleculeRoll: number;
  drugMoleculePitch: number;
  drugMoleculeYaw: number;
  drugMoleculeX: number;
  drugMoleculeY: number;
  drugMoleculeZ: number;

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
