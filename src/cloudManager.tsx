/*
 * @Copyright 2024. Institute for Future Intelligence, Inc.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from './stores/common';
import { usePrimitiveStore } from './stores/commonPrimitive';
import * as Selector from './stores/selector';
import dayjs from 'dayjs';
import 'antd/dist/reset.css';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { showError, showInfo } from './helpers';
import { ClassID, DataColoring, FirebaseName, ProjectInfo, ProjectType, SchoolID, User } from './types';
import Spinner from './components/spinner';
import i18n from './i18n/i18n';
import { Util } from './Util';
import MainToolBar from './mainToolBar';
import ProjectListPanel from './projectListPanel';
import { fetchProject } from './cloudProjectUtil';

export interface CloudManagerProps {
  viewOnly: boolean;
}

const useFlag = (flag: boolean, fn: Function, setFlag: () => void) => {
  useEffect(() => {
    if (flag) {
      fn();
      setFlag();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flag]);
};

const CloudManager = ({ viewOnly = false }: CloudManagerProps) => {
  const setCommonStore = useStore(Selector.set);
  const setPrimitiveStore = usePrimitiveStore(Selector.setPrimitiveStore);
  const language = useStore(Selector.language);
  const user = useStore(Selector.user);
  const showProjectListPanel = usePrimitiveStore(Selector.showProjectListPanel);
  const createProjectFlag = usePrimitiveStore(Selector.createProjectFlag);
  const saveProjectFlag = usePrimitiveStore(Selector.saveProjectFlag);
  const curateMoleculeToProjectFlag = usePrimitiveStore(Selector.curateMoleculeToProjectFlag);
  const showProjectsFlag = usePrimitiveStore(Selector.showProjectsFlag);
  const updateProjectsFlag = usePrimitiveStore(Selector.updateProjectsFlag);

  const [loading, setLoading] = useState(false);
  const [updateFlag, setUpdateFlag] = useState(false);
  const [projectArray, setProjectArray] = useState<any[]>([]);
  const [updateProjectArrayFlag, setUpdateProjectArrayFlag] = useState(false);
  const myProjects = useRef<ProjectInfo[] | void>(); // Not sure why I need to use ref to store this
  const firstAccountSettings = useRef<boolean>(true);

  const lang = useMemo(() => {
    return { lng: language };
  }, [language]);

  useEffect(() => {
    const config = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
    };
    let initialize = firebase.apps.length === 0; // no app, should initialize
    if (firebase.apps.length === 1 && firebase.apps[0].name === FirebaseName.LOG_DATA) {
      initialize = true; // if there is only the logger app, should initialize
    }
    if (initialize) {
      firebase.initializeApp(config);
    } else {
      firebase.app(); // if already initialized, use the default one
    }

    // don't enable persistence as we often need to open multiple tabs
    // firebase.firestore().enablePersistence()
    //   .catch((err) => {
    //     if (err.code === 'failed-precondition') {
    //       showWarning('Firestore: Multiple tabs open, persistence can only be enabled in one tab at a time.', 10);
    //     } else if (err.code === 'unimplemented') {
    //       showWarning('Firestore: The current browser does not support offline persistence, 10');
    //     }
    //   });

    // do not use firebase.auth().currentUser - currentUser might be null because the auth object has not finished initializing.
    // If you use an observer to keep track of the user's sign-in status, you don't need to handle this case.
    firebase.auth().onAuthStateChanged((u) => {
      const params = new URLSearchParams(window.location.search);
      const title = params.get('title');
      if (u) {
        setCommonStore((state) => {
          if (state.user) {
            state.user.uid = u.uid;
            state.user.displayName = u.displayName;
            state.user.email = u.email;
            state.user.photoURL = u.photoURL;
          }
          state.cloudFile = title ?? undefined;
        });
      }
    });
    init();
    window.addEventListener('popstate', handlePopStateEvent);
    return () => {
      window.removeEventListener('popstate', handlePopStateEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePopStateEvent = () => {
    if (viewOnly) return;
    const p = new URLSearchParams(window.location.search);
    const userid = p.get('userid');
    const title = p.get('title');
    if (userid && title) {
      // TODO
    }
  };

  useEffect(() => {
    if (myProjects.current) {
      const arr: any[] = [];
      myProjects.current.forEach((f, i) => {
        arr.push({
          key: i.toString(),
          owner: f.owner,
          title: f.title,
          time: dayjs(new Date(f.timestamp)).format('MM/DD/YYYY hh:mm A'),
          timestamp: f.timestamp,
          description: f.description,
          dataColoring: f.dataColoring,
          selectedProperty: f.selectedProperty,
          sortDescending: f.sortDescending,
          xAxisNameScatteredPlot: f.xAxisNameScatteredPlot,
          yAxisNameScatteredPlot: f.yAxisNameScatteredPlot,
          dotSizeScatteredPlot: f.dotSizeScatteredPlot,
          thumbnailWidth: f.thumbnailWidth,
          type: f.type,
          molecules: f.molecules,
          ranges: f.ranges ?? [],
          filters: f.filters ?? [],
          hiddenProperties: f.hiddenProperties ?? [],
          counter: f.counter,
          action: '',
        });
      });
      arr.sort((a, b) => b.timestamp - a.timestamp);
      setProjectArray(arr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myProjects.current, updateProjectArrayFlag]);

  useFlag(createProjectFlag, createNewProject, () => setPrimitiveStore('createProjectFlag', false));

  useFlag(saveProjectFlag, saveProjectAs, () => setPrimitiveStore('saveProjectFlag', false));

  useFlag(showProjectsFlag, showMyProjectsList, () => setPrimitiveStore('showProjectsFlag', false));

  useFlag(updateProjectsFlag, hideMyProjectsList, () => setPrimitiveStore('updateProjectsFlag', false));

  useFlag(curateMoleculeToProjectFlag, curateMoleculeToProject, () =>
    setPrimitiveStore('curateMoleculeToProjectFlag', false),
  );

  useEffect(() => {
    if (firstAccountSettings.current) {
      firstAccountSettings.current = false;
    } else {
      saveAccountSettings(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.schoolID, user.classID]);

  const init = () => {
    const params = new URLSearchParams(window.location.search);
    const userid = params.get('userid');
    if (userid) {
      const title = params.get('title');
      const project = params.get('project');
      if (project) {
        setLoading(true);
        fetchProject(userid, project, setProjectState).finally(() => {
          setLoading(false);
        });
        if (title) {
          // openDesignFile(userid, title);
        }
      } else {
        if (title) {
          // openCloudFile(userid, title);
        }
      }
    } else {
      setCommonStore((state) => {
        // make sure that the cloud file state is consistent with the URL
        // state.cloudFile = undefined;
      });
    }
  };

  const signIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        setCommonStore((state) => {
          if (result.user) {
            state.user.uid = result.user.uid;
            state.user.email = result.user.email;
            state.user.displayName = result.user.displayName;
            state.user.photoURL = result.user.photoURL;
            registerUser({ ...state.user }).then(() => {
              // ignore
            });
          }
        });
      })
      .catch((error) => {
        console.log(error);
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          showError(i18n.t('message.CannotSignIn', lang) + ': ' + error);
        }
      });
  };

  const registerUser = async (user: User): Promise<any> => {
    const firestore = firebase.firestore();
    let noLogging = false;
    let userCount = 0;
    let schoolID = SchoolID.UNKNOWN;
    let classID = ClassID.UNKNOWN;
    let likes: string[] = [];
    let published: string[] = [];
    let aliases: string[] = [];
    const found = await firestore
      .collection('users')
      .get()
      .then((querySnapshot) => {
        userCount = querySnapshot.size;
        for (const doc of querySnapshot.docs) {
          if (doc.id === user.uid) {
            const docData = doc.data();
            noLogging = !!docData.noLogging;
            schoolID = docData.schoolID ? (docData.schoolID as SchoolID) : SchoolID.UNKNOWN;
            classID = docData.classID ? (docData.classID as ClassID) : ClassID.UNKNOWN;
            if (docData.likes) likes = docData.likes;
            if (docData.published) published = docData.published;
            if (docData.aliases) aliases = docData.aliases;
            return true;
          }
        }
        return false;
      });
    if (found) {
      setCommonStore((state) => {
        state.user.noLogging = noLogging;
        state.user.schoolID = schoolID;
        state.user.classID = classID;
        state.user.likes = likes;
        state.user.published = published;
        state.user.aliases = aliases;
      });
      usePrimitiveStore.getState().set((state) => {
        state.userCount = userCount;
      });
      user.noLogging = noLogging;
      user.schoolID = schoolID;
      user.classID = classID;
      user.likes = likes;
      user.published = published;
      user.aliases = aliases;
    } else {
      if (user.uid) {
        firestore
          .collection('users')
          .doc(user.uid)
          .set({
            uid: user.uid,
            noLogging: !!user.noLogging,
            schoolID: user.schoolID ?? SchoolID.UNKNOWN,
            classID: user.classID ?? ClassID.UNKNOWN,
            since: dayjs(new Date()).format('MM/DD/YYYY hh:mm A'),
            os: Util.getOS(),
          })
          .then(() => {
            showInfo(i18n.t('message.YourAccountWasCreated', lang));
          })
          .catch((error) => {
            showError(i18n.t('message.CannotCreateAccount', lang) + ': ' + error);
          });
      }
    }
  };

  const signOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        setCommonStore((state) => {
          state.user.uid = null;
          state.user.email = null;
          state.user.displayName = null;
          state.user.photoURL = null;
          state.user.likes = [];
          state.user.published = [];
          state.user.aliases = [];
          state.cloudFile = undefined; // if there is a current cloud file
        });
        usePrimitiveStore.getState().set((state) => {
          state.showAccountSettingsPanel = false;
          state.showProjectListPanel = false;
        });
      })
      .catch((error) => {
        showError(i18n.t('message.CannotSignOut', lang) + ': ' + error);
      });
  };

  const saveAccountSettings = (user: User) => {
    if (user.uid) {
      const firestore = firebase.firestore();
      firestore
        .collection('users')
        .doc(user.uid)
        .update({
          schoolID: user.schoolID ?? SchoolID.UNKNOWN,
          classID: user.classID ?? ClassID.UNKNOWN,
        })
        .then(() => {
          showInfo(i18n.t('message.YourAccountSettingsWereSaved', lang));
        })
        .catch((error) => {
          showError(i18n.t('message.CannotSaveYourAccountSettings', lang) + ': ' + error);
        });
    }
  };

  // fetch owner's projects from the cloud
  const fetchMyProjects = async (silent: boolean) => {
    if (!user.uid) return;
    if (!silent) setLoading(true);
    myProjects.current = await firebase
      .firestore()
      .collection('users')
      .doc(user.uid)
      .collection('projects')
      .get()
      .then((querySnapshot) => {
        const a: ProjectInfo[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          a.push({
            owner: user.uid,
            title: doc.id,
            timestamp: data.timestamp,
            description: data.description,
            dataColoring: data.dataColoring,
            selectedProperty: data.selectedProperty,
            sortDescending: data.sortDescending,
            xAxisNameScatteredPlot: data.xAxisNameScatteredPlot,
            yAxisNameScatteredPlot: data.yAxisNameScatteredPlot,
            dotSizeScatteredPlot: data.dotSizeScatteredPlot,
            thumbnailWidth: data.thumbnailWidth,
            type: data.type,
            molecules: data.molecules ?? [],
            ranges: data.ranges ?? [],
            filters: data.filters ?? [],
            hiddenProperties: data.hiddenProperties ?? [],
            counter: data.counter ?? 0,
          } as ProjectInfo);
        });
        return a;
      })
      .catch((error) => {
        showError(i18n.t('message.CannotOpenYourProjects', lang) + ': ' + error);
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  const listMyProjects = (show: boolean) => {
    if (user.uid) {
      fetchMyProjects(!show).then(() => {
        if (show) {
          usePrimitiveStore.getState().set((state) => {
            state.showProjectListPanel = true;
          });
        }
        setUpdateProjectArrayFlag(!updateProjectArrayFlag);
      });
    }
  };

  const deleteProject = (title: string) => {
    if (!user.uid) return;
    firebase
      .firestore()
      .collection('users')
      .doc(user.uid)
      .collection('projects')
      .doc(title)
      .delete()
      .then(() => {
        if (myProjects.current && user.uid) {
          setUpdateFlag(!updateFlag);
        }
        setCommonStore((state) => {
          if (title === state.projectInfo.title) {
            state.projectInfo.title = null;
            state.projectInfo.description = null;
            state.projectInfo.dataColoring = DataColoring.ALL;
            state.projectInfo.selectedProperty = null;
            state.projectInfo.sortDescending = false;
            state.projectInfo.xAxisNameScatteredPlot = null;
            state.projectInfo.yAxisNameScatteredPlot = null;
            state.projectInfo.dotSizeScatteredPlot = 5;
            state.projectInfo.thumbnailWidth = 200;
            state.projectInfo.counter = 0;
            state.projectInfo.molecules = [];
            state.projectInfo.ranges = [];
            state.projectInfo.filters = [];
            state.projectInfo.hiddenProperties = [];
            state.projectView = false;
          }
        });
      })
      .catch((error) => {
        showError(i18n.t('message.CannotDeleteProject', lang) + ': ' + error);
      });
  };

  const renameProject = (oldTitle: string, newTitle: string) => {
    // check if the new project title is already taken
    fetchMyProjects(false).then(() => {
      let exist = false;
      if (myProjects.current) {
        for (const p of myProjects.current) {
          if (p.title === newTitle) {
            exist = true;
            break;
          }
        }
      }
      if (exist) {
        showInfo(i18n.t('message.TitleUsedChooseDifferentOne', lang) + ': ' + newTitle);
      } else {
        if (!user.uid) return;
        const files = firebase.firestore().collection('users').doc(user.uid).collection('projects');
        files
          .doc(oldTitle)
          .get()
          .then((doc) => {
            if (doc && doc.exists) {
              const data = doc.data();
              if (data && user.uid) {
                // TODO
              }
            }
          })
          .catch((error) => {
            showError(i18n.t('message.CannotRenameProject', lang) + ': ' + error);
          });
      }
    });
  };

  const setProjectState = (projectInfo: ProjectInfo) => {
    setCommonStore((state) => {
      state.projectInfo = { ...projectInfo };
      state.projectView = true;
    });
    usePrimitiveStore.getState().set((state) => {
      state.updateProjectsFlag = true;
    });
  };

  const addMoleculeToProject = (
    projectType: string,
    projectTitle: string,
    moleculeTitle: string,
    thumbnailWidth: number,
  ) => {
    if (!user.uid) return;
    // TODO
  };

  function createNewProject() {
    if (!user || !user.uid) return;
    const title = usePrimitiveStore.getState().projectTitle;
    if (!title) {
      showError(i18n.t('message.CannotCreateNewProjectWithoutTitle', lang) + '.');
      return;
    }
    const t = title.trim();
    if (t.length === 0) {
      showError(i18n.t('message.CannotCreateNewProjectWithoutTitle', lang) + '.');
      return;
    }
    // check if the project title is already used
    fetchMyProjects(false).then(() => {
      let exist = false;
      if (myProjects.current) {
        for (const p of myProjects.current) {
          if (p.title === t) {
            exist = true;
            break;
          }
        }
      }
      if (exist) {
        showInfo(i18n.t('message.TitleUsedChooseDifferentOne', lang) + ': ' + t);
      } else {
        if (user && user.uid) {
          const type = usePrimitiveStore.getState().projectType ?? ProjectType.DEFAULT;
          const description = usePrimitiveStore.getState().projectDescription ?? null;
          const timestamp = new Date().getTime();
          const counter = 0;
          firebase
            .firestore()
            .collection('users')
            .doc(user.uid)
            .collection('projects')
            .doc(t)
            .set({
              owner: user.uid,
              timestamp,
              type,
              description,
              counter,
              molecules: [],
              ranges: [],
              filters: [],
              hiddenParameters: [],
            })
            .then(() => {
              setCommonStore((state) => {
                state.projectView = true;
                // update the local copy as well
                state.projectInfo.owner = user.uid;
                state.projectInfo.type = type;
                state.projectInfo.title = title;
                state.projectInfo.description = description;
                state.projectInfo.counter = 0;
                state.projectInfo.dataColoring = DataColoring.ALL;
                state.projectInfo.selectedProperty = null;
                state.projectInfo.sortDescending = false;
                state.projectInfo.xAxisNameScatteredPlot = null;
                state.projectInfo.yAxisNameScatteredPlot = null;
                state.projectInfo.dotSizeScatteredPlot = 5;
                state.projectInfo.thumbnailWidth = 200;
                state.projectInfo.molecules = [];
                state.projectInfo.ranges = [];
                state.projectInfo.filters = [];
                state.projectInfo.hiddenProperties = [];
              });
            })
            .catch((error) => {
              showError(i18n.t('message.CannotCreateNewProject', lang) + ': ' + error);
            })
            .finally(() => {
              // if the project list panel is open, update it
              if (showProjectListPanel) {
                fetchMyProjects(false).then(() => {
                  setUpdateFlag(!updateFlag);
                });
              }
              setLoading(false);
            });
        }
      }
    });
  }

  function saveProjectAs() {
    if (!user || !user.uid) return;
    const title = usePrimitiveStore.getState().projectTitle;
    if (!title) {
      showError(i18n.t('message.CannotCreateNewProjectWithoutTitle', lang) + '.');
      return;
    }
    const t = title.trim();
    if (t.length === 0) {
      showError(i18n.t('message.CannotCreateNewProjectWithoutTitle', lang) + '.');
      return;
    }
    // check if the project title is already taken
    fetchMyProjects(false).then(() => {
      let exist = false;
      if (myProjects.current) {
        for (const p of myProjects.current) {
          if (p.title === t) {
            exist = true;
            break;
          }
        }
      }
      if (exist) {
        showInfo(i18n.t('message.TitleUsedChooseDifferentOne', lang) + ': ' + t);
      } else {
        if (user && user.uid) {
          // TODO
        }
      }
    });
  }

  function curateMoleculeToProject() {
    const projectOwner = useStore.getState().projectInfo.owner;
    if (user.uid !== projectOwner) {
      showInfo(i18n.t('message.CannotAddDesignToProjectOwnedByOthers', lang));
    } else {
      const projectTitle = useStore.getState().projectInfo.title;
      if (projectTitle) {
        setLoading(true);
        const projectType = useStore.getState().projectInfo.type ?? ProjectType.DEFAULT;
        const thumbnailWidth = useStore.getState().projectInfo.thumbnailWidth ?? 200;
        const counter = useStore.getState().projectInfo.counter ?? 0;
        addMoleculeToProject(projectType, projectTitle, projectTitle + ' ' + counter, thumbnailWidth);
      }
    }
  }

  function showMyProjectsList() {
    listMyProjects(true);
  }

  function hideMyProjectsList() {
    listMyProjects(false);
    setUpdateFlag(!updateFlag);
  }

  return viewOnly ? (
    <></>
  ) : (
    <>
      {loading && <Spinner />}
      <MainToolBar signIn={signIn} signOut={signOut} />
      {showProjectListPanel && myProjects.current && (
        <ProjectListPanel
          projects={projectArray}
          setProjectState={setProjectState}
          deleteProject={deleteProject}
          renameProject={renameProject}
        />
      )}
    </>
  );
};

export default React.memo(CloudManager);