/*
 * @Copyright 2024-2025. Institute for Future Intelligence, Inc.
 */

import {
  FlightControl,
  SpaceshipDisplayMode,
  UNIT_VECTOR_NEG_X,
  UNIT_VECTOR_NEG_Y,
  UNIT_VECTOR_NEG_Z,
  UNIT_VECTOR_POS_X,
  UNIT_VECTOR_POS_Y,
  UNIT_VECTOR_POS_Z,
} from './constants.ts';
import { Euler, Quaternion } from 'three';
import { useStore } from './stores/common.ts';
import { useRefStore } from './stores/commonRef.ts';
import { invalidate } from '@react-three/fiber';
import { MoleculeTransform } from './types.ts';

let flyTimeout = -1;

export const startFlying = (control: FlightControl) => {
  if (flyTimeout === -1) {
    loop(control);
  }
};

export const stopFlying = () => {
  clearTimeout(flyTimeout);
  flyTimeout = -1;
};

const saveEuler = (rotation: number[], euler: Euler) => {
  rotation[0] = euler.x;
  rotation[1] = euler.y;
  rotation[2] = euler.z;
};

const loop = (control: FlightControl) => {
  const rotationStep = useStore.getState().projectState.rotationStep;
  const translationStep = useStore.getState().projectState.translationStep;
  if (useStore.getState().projectState.spaceshipDisplayMode === SpaceshipDisplayMode.OUTSIDE_VIEW) {
    useStore.getState().set((state) => {
      if (state.projectState.spaceshipRoll === undefined) state.projectState.spaceshipRoll = 0;
      if (state.projectState.spaceshipPitch === undefined) state.projectState.spaceshipPitch = 0;
      if (state.projectState.spaceshipYaw === undefined) state.projectState.spaceshipYaw = 0;
      if (state.projectState.spaceshipZ === undefined) state.projectState.spaceshipZ = 0;
      switch (control) {
        case FlightControl.RollLeft:
          state.projectState.spaceshipRoll += rotationStep;
          break;
        case FlightControl.RollRight:
          state.projectState.spaceshipRoll -= rotationStep;
          break;
        case FlightControl.PitchUp:
          state.projectState.spaceshipPitch += rotationStep;
          break;
        case FlightControl.PitchDown:
          state.projectState.spaceshipPitch -= rotationStep;
          break;
        case FlightControl.YawLeft:
          state.projectState.spaceshipYaw += rotationStep;
          break;
        case FlightControl.YawRight:
          state.projectState.spaceshipYaw -= rotationStep;
          break;
        case FlightControl.MoveForward:
          state.projectState.spaceshipZ -= translationStep;
          break;
        case FlightControl.MoveBackward:
          state.projectState.spaceshipZ += translationStep;
          break;
      }
    });
  } else {
    useStore.getState().set((state) => {
      // make sure that these are initialized
      if (!state.projectState.ligandTransform) {
        state.projectState.ligandTransform = { x: 0, y: 0, z: 0, euler: [0, 0, 0] } as MoleculeTransform;
      }
      if (!state.projectState.ligandVelocity) state.projectState.ligandVelocity = [0, 0, 0];

      // translation
      let dx = 0;
      let dy = 0;
      let dz = 0;
      switch (control) {
        case FlightControl.TranslateInPositiveX:
          dx = translationStep;
          break;
        case FlightControl.TranslateInNegativeX:
          dx = -translationStep;
          break;
        case FlightControl.TranslateInPositiveY:
          dy = translationStep;
          break;
        case FlightControl.TranslateInNegativeY:
          dy = -translationStep;
          break;
        case FlightControl.TranslateInPositiveZ:
          dz = translationStep;
          break;
        case FlightControl.TranslateInNegativeZ:
          dz = -translationStep;
          break;
      }
      const ref = useRefStore.getState().ligandRef;
      if (ref && ref.current) {
        ref.current.position.x += dx;
        ref.current.position.y += dy;
        ref.current.position.z += dz;
        state.projectState.ligandTransform.x = ref.current.position.x;
        state.projectState.ligandTransform.y = ref.current.position.y;
        state.projectState.ligandTransform.z = ref.current.position.z;
        invalidate();
      }

      // rotation
      switch (control) {
        case FlightControl.RotateAroundXClockwise: {
          state.projectState.ligandTransform.euler[0] += rotationStep;
          const ref = useRefStore.getState().ligandRef;
          if (ref && ref.current) {
            ref.current.applyQuaternion(new Quaternion().setFromAxisAngle(UNIT_VECTOR_POS_X, rotationStep));
            invalidate();
            saveEuler(state.projectState.ligandTransform.euler, ref.current.rotation);
          }
          break;
        }
        case FlightControl.RotateAroundXCounterclockwise: {
          state.projectState.ligandTransform.euler[0] -= rotationStep;
          const ref = useRefStore.getState().ligandRef;
          if (ref && ref.current) {
            ref.current.applyQuaternion(new Quaternion().setFromAxisAngle(UNIT_VECTOR_NEG_X, rotationStep));
            invalidate();
            saveEuler(state.projectState.ligandTransform.euler, ref.current.rotation);
          }
          break;
        }
        case FlightControl.RotateAroundYClockwise: {
          state.projectState.ligandTransform.euler[1] += rotationStep;
          const ref = useRefStore.getState().ligandRef;
          if (ref && ref.current) {
            ref.current.applyQuaternion(new Quaternion().setFromAxisAngle(UNIT_VECTOR_POS_Y, rotationStep));
            invalidate();
            saveEuler(state.projectState.ligandTransform.euler, ref.current.rotation);
          }
          break;
        }
        case FlightControl.RotateAroundYCounterclockwise: {
          state.projectState.ligandTransform.euler[1] -= rotationStep;
          const ref = useRefStore.getState().ligandRef;
          if (ref && ref.current) {
            ref.current.applyQuaternion(new Quaternion().setFromAxisAngle(UNIT_VECTOR_NEG_Y, rotationStep));
            invalidate();
            saveEuler(state.projectState.ligandTransform.euler, ref.current.rotation);
          }
          break;
        }
        case FlightControl.RotateAroundZClockwise: {
          state.projectState.ligandTransform.euler[2] += rotationStep;
          const ref = useRefStore.getState().ligandRef;
          if (ref && ref.current) {
            ref.current.applyQuaternion(new Quaternion().setFromAxisAngle(UNIT_VECTOR_POS_Z, rotationStep));
            invalidate();
            saveEuler(state.projectState.ligandTransform.euler, ref.current.rotation);
          }
          break;
        }
        case FlightControl.RotateAroundZCounterclockwise: {
          state.projectState.ligandTransform.euler[2] -= rotationStep;
          const ref = useRefStore.getState().ligandRef;
          if (ref && ref.current) {
            ref.current.applyQuaternion(new Quaternion().setFromAxisAngle(UNIT_VECTOR_NEG_Z, rotationStep));
            invalidate();
            saveEuler(state.projectState.ligandTransform.euler, ref.current.rotation);
          }
          break;
        }
      }
    });
  }
  flyTimeout = window.setTimeout(loop, 100, control);
};
