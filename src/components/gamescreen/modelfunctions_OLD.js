import { normalizers } from './modelpositions';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const OBJloader = new OBJLoader();
const GLTFloader = new GLTFLoader();
const ships = {};

export function loadModel(modelFile, name, type) {
  if (type === 'obj') {
    return new Promise((resolve) => {
      OBJloader.load(
        modelFile,
        (obj) => {
          obj.name = name;
          initializeModelOnLoad(obj);
          resolve(obj);
        },
        (progressEvent) => {
          window.dispatchEvent(new ProgressEvent('model_loaded'));
        }
      );
    });
  } else if (type === 'glb') {
    return new Promise((resolve) => {
      GLTFloader.load(
        modelFile,
        (gltf) => {
          gltf.scene.name = name;
          initializeModelOnLoad(gltf.scene);
          resolve(gltf.scene);
        },
        (progressEvent) => {
          window.dispatchEvent(new ProgressEvent('model_loaded'));
        }
      );
    });
  }
}

export function initializeModelOnLoad(model) {
  // Set default position
  const normalizer = normalizers[model.name];
  model.scale.set(
    normalizer.scale[0],
    normalizer.scale[1],
    normalizer.scale[2]
  );
  model.rotation.set(
    normalizer.rotation[0],
    normalizer.rotation[1],
    normalizer.rotation[2]
  );
  model.position.set(
    normalizer.position[0],
    normalizer.position[1],
    normalizer.position[2]
  );

  // Add a reference to the ship to our ships object, so we can retreive it later
  ships[model.name] = model;
}

export function addModelToScene(modelName, direction, firstRow, firstColumn) {
  const ship = ships[modelName];
  ship.dataDirection = direction;
  const normalizer = normalizers[modelName];

  // The columns (y axis) are the Z axis in three.js
  const posX =
    normalizer[direction][0] +
    (5.3 + normalizer.spaceOffset[0]) * firstColumn;
  const posZ =
    normalizer[direction][2] + (5.32 + normalizer.spaceOffset[1]) * firstRow;
  const rotY = normalizer[direction][3] * 1.5708;
  const rotZ = normalizer[direction][4] * 1.5708;

  ship.position.x = posX;
  ship.position.z = posZ;
  ship.rotation.y = rotY;
  ship.rotation.z = rotZ;

  // scene.add(ship);
  // render();
}