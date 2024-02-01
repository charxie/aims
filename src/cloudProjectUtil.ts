/*
 * @Copyright 2024. Institute for Future Intelligence, Inc.
 */

import { useStore } from './stores/common';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import { showError, showInfo } from './helpers';
import i18n from './i18n/i18n';
import { MoleculeData, Range, ProjectState } from './types';
import { usePrimitiveStore } from './stores/commonPrimitive';
import { DataColoring, ProjectType, SpaceshipDisplayMode } from './constants';
import { MolecularViewerColoring, MolecularViewerMaterial, MolecularViewerStyle } from './view/displayOptions';
import dayjs from 'dayjs';

export const fetchProject = async (userid: string, project: string, setProjectState: (ps: ProjectState) => void) => {
  const lang = { lng: useStore.getState().language };
  await firebase
    .firestore()
    .collection('users')
    .doc(userid)
    .collection('projects')
    .doc(project)
    .get()
    .then((doc) => {
      const data = doc.data();
      if (data) {
        setProjectState({
          owner: userid,
          title: doc.id,
          key: data.key ?? data.timestamp,
          timestamp: data.timestamp,
          time: data.time ?? dayjs(new Date(data.timestamp)).format('MM/DD/YYYY hh:mm A'),
          description: data.description,
          dataColoring: data.dataColoring ?? DataColoring.ALL,
          type: data.type,
          molecules: data.molecules,
          loadedMolecule: data.loadedMolecule,
          targetProtein: data.targetProtein,
          ranges: data.ranges,
          filters: data.filters,
          hiddenProperties: data.hiddenProperties,
          counter: data.counter ?? 0,
          selectedProperty: data.selectedProperty,
          sortDescending: data.sortDescending,
          xAxisNameScatteredPlot: data.xAxisNameScatteredPlot,
          yAxisNameScatteredPlot: data.yAxisNameScatteredPlot,
          dotSizeScatteredPlot: data.dotSizeScatteredPlot,
          thumbnailWidth: data.thumbnailWidth,

          chamberViewerPercentWidth: data.chamberViewerPercentWidth ?? 50,
          chamberViewerAxes: data.chamberViewerAxes ?? true,
          chamberViewerStyle: data.chamberViewerStyle ?? MolecularViewerStyle.QuickSurface,
          chamberViewerMaterial: data.chamberViewerMaterial ?? MolecularViewerMaterial.Soft,
          chamberViewerColoring: data.chamberViewerColoring ?? MolecularViewerColoring.SecondaryStructure,
          chamberViewerFoggy: !!data.chamberViewerFoggy,
          chamberViewerBackground: data.chamberViewerBackground ?? 'black',
          chamberViewerSelector: data.chamberViewerSelector ?? 'all',

          drugMoleculeRoll: data.drugMoleculeRoll ?? 0,
          drugMoleculePitch: data.drugMoleculePitch ?? 0,
          drugMoleculeYaw: data.drugMoleculeYaw ?? 0,
          drugMoleculeX: data.drugMoleculeX ?? 0,
          drugMoleculeY: data.drugMoleculeY ?? 0,
          drugMoleculeZ: data.drugMoleculeZ ?? 0,

          spaceshipDisplayMode: data.spaceshipDisplayMode ?? SpaceshipDisplayMode.NONE,
          spaceshipSize: data.spaceshipSize ?? 1,
          spaceshipRoll: data.spaceshipRoll ?? 0,
          spaceshipPitch: data.spaceshipPitch ?? 0,
          spaceshipYaw: data.spaceshipYaw ?? 0,
          spaceshipX: data.spaceshipX ?? 0,
          spaceshipY: data.spaceshipY ?? 0,
          spaceshipZ: data.spaceshipZ ?? 0,

          projectViewerStyle: data.projectViewerStyle ?? MolecularViewerStyle.Stick,
          projectViewerMaterial: data.projectViewerMaterial ?? MolecularViewerMaterial.Soft,
          projectViewerBackground: data.projectViewerBackground ?? 'white',

          cameraPosition: data.cameraPosition,
          cameraRotation: data.cameraRotation,
          cameraUp: data.cameraUp,
          panCenter: data.panCenter,
        } as ProjectState);
      } else {
        showError(i18n.t('message.CannotOpenProject', lang) + ': ' + project);
      }
    })
    .catch((error) => {
      showError(i18n.t('message.CannotOpenProject', lang) + ': ' + error);
    });
};

export const removeMoleculeFromProject = (userid: string, projectTitle: string, molecule: MoleculeData) => {
  const lang = { lng: useStore.getState().language };
  return firebase
    .firestore()
    .collection('users')
    .doc(userid)
    .collection('projects')
    .doc(projectTitle)
    .update({
      molecules: firebase.firestore.FieldValue.arrayRemove(molecule),
    })
    .then(() => {
      usePrimitiveStore.getState().set((state) => {
        state.updateProjectsFlag = true;
      });
      // also delete the molecule
      firebase
        .firestore()
        .collection('users')
        .doc(userid)
        .collection('molecules')
        .doc(molecule.name)
        .delete()
        .then(() => {
          showInfo(i18n.t('message.MoleculeRemovedFromProject', lang) + '.');
        })
        .catch((error) => {
          showError(i18n.t('message.CannotDeleteCloudFile', lang) + ': ' + error);
        });
    })
    .catch((error) => {
      showError(i18n.t('message.CannotRemoveMoleculeFromProject', lang) + ': ' + error);
    });
};

export const updateHiddenProperties = (
  userid: string,
  projectTitle: string,
  hiddenProperty: string,
  add: boolean, // true is to add, false is to remove
) => {
  const lang = { lng: useStore.getState().language };
  return firebase
    .firestore()
    .collection('users')
    .doc(userid)
    .collection('projects')
    .doc(projectTitle)
    .update({
      hiddenProperties: add
        ? firebase.firestore.FieldValue.arrayUnion(hiddenProperty)
        : firebase.firestore.FieldValue.arrayRemove(hiddenProperty),
    })
    .then(() => {
      // ignore
    })
    .catch((error) => {
      showError(i18n.t('message.CannotUpdateProject', lang) + ': ' + error);
    });
};

export const addRange = (userid: string, projectTitle: string, range: Range) => {
  const lang = { lng: useStore.getState().language };
  return firebase
    .firestore()
    .collection('users')
    .doc(userid)
    .collection('projects')
    .doc(projectTitle)
    .update({
      ranges: firebase.firestore.FieldValue.arrayUnion(range),
    })
    .then(() => {
      // ignore
    })
    .catch((error) => {
      showError(i18n.t('message.CannotUpdateProject', lang) + ': ' + error);
    });
};

export const updateRanges = (userid: string, projectTitle: string, ranges: Range[]) => {
  const lang = { lng: useStore.getState().language };
  return firebase
    .firestore()
    .collection('users')
    .doc(userid)
    .collection('projects')
    .doc(projectTitle)
    .update({ ranges })
    .then(() => {
      // ignore
    })
    .catch((error) => {
      showError(i18n.t('message.CannotUpdateProject', lang) + ': ' + error);
    });
};

export const updateDescription = (userid: string, projectTitle: string, description: string | null) => {
  const lang = { lng: useStore.getState().language };
  return firebase
    .firestore()
    .collection('users')
    .doc(userid)
    .collection('projects')
    .doc(projectTitle)
    .update({ description })
    .then(() => {
      // ignore
    })
    .catch((error) => {
      showError(i18n.t('message.CannotUpdateProject', lang) + ': ' + error);
    });
};

export const updateDataColoring = (userid: string, projectTitle: string, dataColoring: DataColoring) => {
  const lang = { lng: useStore.getState().language };
  return firebase
    .firestore()
    .collection('users')
    .doc(userid)
    .collection('projects')
    .doc(projectTitle)
    .update({ dataColoring })
    .then(() => {
      // ignore
    })
    .catch((error) => {
      showError(i18n.t('message.CannotUpdateProject', lang) + ': ' + error);
    });
};

export const updateSelectedProperty = (userid: string, projectTitle: string, selectedProperty: string | null) => {
  const lang = { lng: useStore.getState().language };
  return firebase
    .firestore()
    .collection('users')
    .doc(userid)
    .collection('projects')
    .doc(projectTitle)
    .update({ selectedProperty })
    .then(() => {
      // ignore
    })
    .catch((error) => {
      showError(i18n.t('message.CannotUpdateProject', lang) + ': ' + error);
    });
};

export const updateXAxisNameScatteredPlot = (
  userid: string,
  projectTitle: string,
  xAxisNameScatteredPlot: string | null,
) => {
  const lang = { lng: useStore.getState().language };
  return firebase
    .firestore()
    .collection('users')
    .doc(userid)
    .collection('projects')
    .doc(projectTitle)
    .update({ xAxisNameScatteredPlot })
    .then(() => {
      // ignore
    })
    .catch((error) => {
      showError(i18n.t('message.CannotUpdateProject', lang) + ': ' + error);
    });
};

export const updateYAxisNameScatteredPlot = (
  userid: string,
  projectTitle: string,
  yAxisNameScatteredPlot: string | null,
) => {
  const lang = { lng: useStore.getState().language };
  return firebase
    .firestore()
    .collection('users')
    .doc(userid)
    .collection('projects')
    .doc(projectTitle)
    .update({ yAxisNameScatteredPlot })
    .then(() => {
      // ignore
    })
    .catch((error) => {
      showError(i18n.t('message.CannotUpdateProject', lang) + ': ' + error);
    });
};

export const updateDotSizeScatteredPlot = (userid: string, projectTitle: string, dotSizeScatteredPlot: number) => {
  const lang = { lng: useStore.getState().language };
  return firebase
    .firestore()
    .collection('users')
    .doc(userid)
    .collection('projects')
    .doc(projectTitle)
    .update({ dotSizeScatteredPlot })
    .then(() => {
      // ignore
    })
    .catch((error) => {
      showError(i18n.t('message.CannotUpdateProject', lang) + ': ' + error);
    });
};

export const updateThumbnailWidth = (userid: string, projectTitle: string, thumbnailWidth: number) => {
  const lang = { lng: useStore.getState().language };
  return firebase
    .firestore()
    .collection('users')
    .doc(userid)
    .collection('projects')
    .doc(projectTitle)
    .update({ thumbnailWidth })
    .then(() => {
      // ignore
    })
    .catch((error) => {
      showError(i18n.t('message.CannotUpdateProject', lang) + ': ' + error);
    });
};

export const createMolecule = (type: ProjectType, name: string, url?: string): MoleculeData => {
  const molecule = { name, url } as MoleculeData;
  switch (type) {
    case ProjectType.DRUG_DISCOVERY:
      break;
  }
  return molecule;
};

export const getImageData = (image: HTMLImageElement) => {
  const c = document.createElement('canvas');
  c.width = image.width;
  c.height = image.height;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.drawImage(image, 1, 1); // 1 is for padding
  }
  return c.toDataURL();
};

export const copyMolecule = (original: string, copy: string, owner: string | null, userid: string) => {
  const lang = { lng: useStore.getState().language };
  firebase
    .firestore()
    .collection('users')
    .doc(owner ?? userid)
    .collection('designs')
    .doc(original)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data) {
          firebase
            .firestore()
            .collection('users')
            .doc(userid)
            .collection('molecules')
            .doc(copy)
            .set(data)
            .then(() => {
              showInfo(i18n.t('message.CloudFileCopied', lang) + ': ' + copy);
            })
            .catch((error) => {
              showError(i18n.t('message.CannotWriteCloudFile', lang) + ': ' + error);
            });
        }
      } else {
        showError(i18n.t('message.CannotReadCloudFile', lang));
      }
    })
    .catch((error) => {
      showError(i18n.t('message.CannotReadCloudFile', lang) + ': ' + error);
    });
};

export const updateMoleculeVisibility = (userid: string, projectTitle: string, molecule: MoleculeData) => {
  const lang = { lng: useStore.getState().language };
  firebase
    .firestore()
    .collection('users')
    .doc(userid)
    .collection('projects')
    .doc(projectTitle)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data) {
          const updatedMolecules: MoleculeData[] = [];
          updatedMolecules.push(...data.molecules);
          // Get the index of the molecule to be modified by the visibility
          let index = -1;
          for (const [i, d] of updatedMolecules.entries()) {
            if (d.name === molecule.name) {
              index = i;
              break;
            }
          }
          // If found, update the design in the array
          if (index >= 0) {
            updatedMolecules[index].invisible = !molecule.invisible;
            // Finally, upload the updated design array back to Firestore
            firebase
              .firestore()
              .collection('users')
              .doc(userid)
              .collection('projects')
              .doc(projectTitle)
              .update({ molecules: updatedMolecules })
              .then(() => {
                // ignore
              })
              .catch((error) => {
                showError(i18n.t('message.CannotUpdateProject', lang) + ': ' + error);
              });
          }
        }
      }
    })
    .catch((error) => {
      showError(i18n.t('message.CannotFetchProjectData', lang) + ': ' + error);
    })
    .finally(() => {
      // ignore
    });
};
