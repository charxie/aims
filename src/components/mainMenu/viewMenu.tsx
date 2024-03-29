/*
 * @Copyright 2024. Institute for Future Intelligence, Inc.
 */

import { MenuProps } from 'antd';
import i18n from '../../i18n/i18n';
import { useStore } from '../../stores/common';
import { LabelMark, MenuItem } from '../menuItem';
import {
  AutoRotateCheckBox,
  AxesCheckBox,
  BackgroundColor,
  ColoringRadioGroup,
  ContainerCheckBox,
  EnergyGraphCheckBox,
  FogCheckBox,
  GalleryCheckBox,
  MaterialRadioGroup,
  SpaceshipDisplayModeRadioGroup,
  StyleRadioGroup,
  VdwBondsCheckBox,
} from '../contextMenu/defaultMenuItems';
import { usePrimitiveStore } from '../../stores/commonPrimitive';
import { ProjectType } from '../../constants.ts';

export const resetView = () => {
  usePrimitiveStore.getState().resetView();
};

export const zoomView = (scale: number) => {
  usePrimitiveStore.getState().zoomView(scale);
};

export const createViewMenu = (keyHome: string, isMac: boolean) => {
  const lang = { lng: useStore.getState().language };
  const projectType = useStore.getState().projectState.type;

  const handleResetView = () => {
    resetView();
  };

  const handleZoomOut = () => {
    zoomView(1.1);
  };

  const handleZoomIn = () => {
    zoomView(0.9);
  };

  const items: MenuProps['items'] = [];

  items.push({
    key: 'reset-view',
    label: (
      <MenuItem hasPadding={true} onClick={handleResetView}>
        {i18n.t('menu.view.ResetView', lang)}
        <LabelMark>({keyHome})</LabelMark>
      </MenuItem>
    ),
  });

  items.push({
    key: 'zoom-out-view',
    label: (
      <MenuItem hasPadding={true} onClick={handleZoomOut}>
        {i18n.t('menu.view.ZoomOut', lang)}
        <LabelMark>({isMac ? '⌘' : 'Ctrl'}+])</LabelMark>
      </MenuItem>
    ),
  });

  items.push({
    key: 'zoom-in-view',
    label: (
      <MenuItem hasPadding={true} onClick={handleZoomIn}>
        {i18n.t('menu.view.ZoomIn', lang)}
        <LabelMark>({isMac ? '⌘' : 'Ctrl'}+[)</LabelMark>
      </MenuItem>
    ),
  });

  items.push({
    key: 'gallery-check-box',
    label: <GalleryCheckBox />,
  });

  items.push({
    key: 'auto-rotate-check-box',
    label: <AutoRotateCheckBox isMac={isMac} />,
  });

  items.push({
    key: 'axes-check-box',
    label: <AxesCheckBox />,
  });

  items.push({
    key: 'container-check-box',
    label: <ContainerCheckBox />,
  });

  if (projectType === ProjectType.MOLECULAR_MODELING) {
    items.push({
      key: 'vdw-bonds-check-box',
      label: <VdwBondsCheckBox />,
    });

    items.push({
      key: 'energy-graph-check-box',
      label: <EnergyGraphCheckBox />,
    });
  }

  items.push({
    key: 'foggy-check-box',
    label: <FogCheckBox />,
  });

  items.push({
    key: 'background-color',
    label: <BackgroundColor />,
  });

  if (projectType === ProjectType.DRUG_DISCOVERY) {
    items.push({
      key: 'spaceship-display-mode',
      label: <MenuItem hasPadding={true}>{i18n.t('spaceship.SpaceshipDisplay', lang)}</MenuItem>,
      children: [
        {
          key: 'spaceship-display-mode-radio-group',
          label: <SpaceshipDisplayModeRadioGroup />,
          style: { backgroundColor: 'white' },
        },
      ],
    });
  }

  items.push({
    key: 'display-style',
    label: <MenuItem hasPadding={true}>{i18n.t('molecularViewer.Style', lang)}</MenuItem>,
    children: [
      {
        key: 'molecular-viewer-style-radio-group',
        label: <StyleRadioGroup />,
        style: { backgroundColor: 'white' },
      },
    ],
  });

  items.push({
    key: 'display-material',
    label: <MenuItem hasPadding={true}>{i18n.t('molecularViewer.Material', lang)}</MenuItem>,
    children: [
      {
        key: 'molecular-viewer-material-radio-group',
        label: <MaterialRadioGroup />,
        style: { backgroundColor: 'white' },
      },
    ],
  });

  items.push({
    key: 'display-coloring',
    label: <MenuItem hasPadding={true}>{i18n.t('molecularViewer.Color', lang)}</MenuItem>,
    children: [
      {
        key: 'molecular-viewer-coloring-radio-group',
        label: <ColoringRadioGroup />,
        style: { backgroundColor: 'white' },
      },
    ],
  });

  return items;
};
