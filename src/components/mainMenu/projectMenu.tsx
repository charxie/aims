/*
 * @Copyright 2024. Institute for Future Intelligence, Inc.
 */

import { MenuProps } from 'antd';
import i18n from '../../i18n/i18n';
import { useStore } from '../../stores/common';
import { usePrimitiveStore } from '../../stores/commonPrimitive';
import { useState } from 'react';
import { useLanguage } from '../../hooks';
import { LabelMark, MenuItem } from '../menuItem';
import CreateNewProjectDialog from './createNewProjectDialog';

const CreateNewProjectItem = ({ isMac }: { isMac: boolean }) => {
  const [dialogVisible, setDialogVisible] = useState(false);

  const lang = useLanguage();

  const handleClick = () => {
    setDialogVisible(true);
    if (useStore.getState().loggable) {
      useStore.getState().set((state) => {
        state.actionInfo = {
          name: 'Create New Project',
          timestamp: new Date().getTime(),
        };
      });
    }
  };

  return (
    <>
      <MenuItem hasPadding={false} onClick={handleClick}>
        {i18n.t('menu.project.CreateNewProject', lang)}
        <LabelMark>({isMac ? '⌘' : 'Ctrl'}+F)</LabelMark>...
      </MenuItem>
      {dialogVisible && <CreateNewProjectDialog saveAs={false} setDialogVisible={setDialogVisible} />}
    </>
  );
};

const SaveAsCloudProjectItem = ({ isMac }: { isMac: boolean }) => {
  const [dialogVisible, setDialogVisible] = useState(false);

  const lang = useLanguage();

  const handleClick = () => {
    setDialogVisible(true);
    if (useStore.getState().loggable) {
      useStore.getState().set((state) => {
        state.actionInfo = {
          name: 'Save Project As',
          timestamp: new Date().getTime(),
        };
      });
    }
  };

  return (
    <>
      <MenuItem hasPadding={false} onClick={handleClick}>
        {i18n.t('menu.project.SaveAsCloudProject', lang)}
        <LabelMark>({isMac ? '⌘' : 'Ctrl'}+Shift+S)</LabelMark>...
      </MenuItem>
      {/*{saveProjectAsDialogVisible && (*/}
      {/*    <CreateNewProjectDialog saveAs={true} setDialogVisible={setSaveProjectAsDialogVisible} />*/}
      {/*)}*/}
    </>
  );
};

const SaveCloudProjectItem = ({ isMac }: { isMac: boolean }) => {
  const [dialogVisible, setDialogVisible] = useState(false);

  const lang = useLanguage();

  const handleClick = () => {
    setDialogVisible(true);
    if (useStore.getState().loggable) {
      useStore.getState().set((state) => {
        state.actionInfo = {
          name: 'Save Cloud Project',
          timestamp: new Date().getTime(),
        };
      });
    }
  };

  return (
    <>
      <MenuItem hasPadding={false} onClick={handleClick}>
        {i18n.t('menu.project.SaveCloudProject', lang)}
        <LabelMark>({isMac ? '⌘' : 'Ctrl'}+S)</LabelMark>...
      </MenuItem>
      {/*{dialogVisible && (*/}
      {/*    <CreateNewProjectDialog saveAs={true} setDialogVisible={dialogVisible} />*/}
      {/*)}*/}
    </>
  );
};

const ListCloudProjectItem = ({ isMac }: { isMac: boolean }) => {
  const setCommonStore = useStore.getState().set;
  const lang = useLanguage();

  const handleClick = () => {
    usePrimitiveStore.getState().set((state) => {
      state.showProjectsFlag = true;
    });
    setCommonStore((state) => {
      state.selectedFloatingWindow = 'projectListPanel';
    });
    if (useStore.getState().loggable) {
      setCommonStore((state) => {
        state.actionInfo = {
          name: 'List Projects',
          timestamp: new Date().getTime(),
        };
      });
    }
  };

  return (
    <>
      <MenuItem hasPadding={false} onClick={handleClick}>
        {i18n.t('menu.project.OpenCloudProject', lang)}
        <LabelMark>({isMac ? '⌘' : 'Ctrl'}+O)</LabelMark>...
      </MenuItem>
    </>
  );
};

export const createProjectMenu = (viewOnly: boolean, isMac: boolean) => {
  const items: MenuProps['items'] = [];

  // create-new-project
  items.push({
    key: 'create-new-project',
    label: <CreateNewProjectItem isMac={isMac} />,
  });

  // list-cloud-project
  items.push({
    key: 'list-cloud-project',
    label: <ListCloudProjectItem isMac={isMac} />,
  });

  // save-cloud-project
  items.push({
    key: 'save-cloud-project',
    label: <SaveCloudProjectItem isMac={isMac} />,
  });

  // save-as-cloud-project
  items.push({
    key: 'save-as-cloud-project',
    label: <SaveAsCloudProjectItem isMac={isMac} />,
  });

  return items;
};
