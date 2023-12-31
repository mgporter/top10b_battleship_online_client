import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import battleshipOBJ from '../../models/battleship.obj';
import carrierGLB from '../../models/charles_de_gaulle_french_aircraft_carrier.glb';
import patrolBoatGLB from '../../models/smallwarship.glb';
import submarineGLB from '../../models/the_project_941__akula__typhoon_submarine.glb';
import destroyerGLB from '../../models/bengaluru_class_destroyer_d67.glb';
import gridGLB from '../../models/grid_4_x_4_navigation.glb';

const normalizers = {
  // Position is with front at 0,0, with end going to the right
  // -47.88
  // direction components are: position.x, position.y, position.z, rotation.y/1.5708, rotation.z/1.5708
  battleship: {
    rotation: [-1.5708, 0, 0],
    scale: [7.4, 7.4, 7.4],
    position: [-17, -0.12, -23.2],
    spaceOffset: [0, 0], // allows up to add or subtract a little extra space
    up: [-23.74286, -0.12, -14.235552, 0, 3],
    down: [-23.74286, -0.12, -30.23555, 0, 1],
    left: [-15.74286, -0.12, -22.035552, 0, 0],
    right: [-31.54286, -0.12, -22.035552, 0, 2],
  },
  carrier: {
    rotation: [0, -1.5708, 0],
    scale: [0.0045, 0.0045, 0.0055],
    position: [-14, 0.66, -23.6],
    spaceOffset: [0, 0],
    up: [-23.971433, 0.66, -12.435552, 2, 0],
    down: [-23.971432, 0.66, -32.835552, 0, 0],
    left: [-13.571432, 0.66, -22.035552, 3, 0],
    right: [-34.371432, 0.66, -22.035552, 1, 0],
  },
  patrolBoat: {
    rotation: [0, 1.5708, 0],
    scale: [0.08, 0.08, 0.08],
    position: [-22.2, 0.32, -25],
    spaceOffset: [0.18, 0.11],
    up: [-24.314288, 0.32, -19.191108, 0, 0],
    down: [-24.314288, 0.32, -26.191108, 2, 0],
    left: [-21.514288, 0.32, -23.791108, 1, 0],
    right: [-27.914288, 0.32, -23.791108, 3, 0],
  },
  submarine: {
    rotation: [0, -1.5708, 0],
    scale: [0.51, 0.51, 0.51],
    position: [-19.8, 0, -24.4],
    spaceOffset: [0, 0],
    up: [-23.714288, 0, -17.235552, 2, 0],
    down: [-23.714288, 0, -27.435552, 0, 0],
    left: [-18.514288, 0, -22.435552, 3, 0],
    right: [-29.114288, 0, -22.435552, 1, 0],
  },
  destroyer: {
    rotation: [0, 3.14159, 0],
    scale: [3, 3, 3],
    position: [-19.2, -0.22, -23.4],
    spaceOffset: [0, 0],
    up: [-23.914288, -0.22, -16.635552, 1, 0],
    down: [-23.914288, -0.22, -27.835552, 3, 0],
    left: [-18.114288, -0.22, -22.235552, 2, 0],
    right: [-29.514288, -0.22, -22.235552, 0, 0],
  },
  grid: {
    rotation: [0, 0, 0],
    scale: [5, 5, 5],
    position: [0, 0, 1.9],
    spaceOffset: [0, 0],
    up: [0, 0, 0, 0, 0],
    down: [0, 0, 0, 0, 0],
    left: [0, 0, 0, 0, 0],
    right: [0, 0, 0, 0, 0],
  },
  explosion: {
    rotation: [0, 0, 0],
    scale: [0.1, 0.1, 0.1],
    position: [0, 1, 0],
    spaceOffset: [0, 0],
    up: [0, 1, 0, 0, 0],
    down: [0, 1, 0, 0, 0],
    left: [0, 1, 0, 0, 0],
    right: [0, 1, 0, 0, 0],
  },
};

export default function Model() {
  const enableDebugMode = false;

  const playerBoard = document.getElementById('playerboard');
  const mainElement = document.querySelector('main');
  const OBJloader = new OBJLoader();
  const GLTFloader = new GLTFLoader();
  const ships = {};
  let playerBoardRect = playerBoard.getBoundingClientRect();

  // Create scene, camera, and renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46.5, 2, 0.1, 1000);
  ships['camera'] = camera; // Add the camera to the ships array so we can access it easily for debugging

  // Create player canvas and append it
  const playerCanvas = document.createElement('canvas');
  playerCanvas.id = 'playercanvas';
  const renderer = new THREE.WebGLRenderer({
    canvas: playerCanvas,
    alpha: true,
    antialias: true,
  });
  document.body.appendChild(renderer.domElement);

  // Add lights to scene
  const light = new THREE.AmbientLight(0x404040, 1);
  const spotLight = new THREE.DirectionalLight(0xffffff, 3);
  scene.add(light);
  scene.add(spotLight);

  // Set camera position
  camera.position.set(0, 27.2, 41.8);
  camera.rotation.set(-0.730865, 0, 0);

  // Load the ship models.
  const loadModelPromises = [
    loadModel(carrierGLB, 'carrier', 'glb'),
    loadModel(battleshipOBJ, 'battleship', 'obj'),
    loadModel(patrolBoatGLB, 'patrolBoat', 'glb'),
    loadModel(submarineGLB, 'submarine', 'glb'),
    loadModel(destroyerGLB, 'destroyer', 'glb'),
  ];

  Promise.all(loadModelPromises).then(() => {
    window.dispatchEvent(new Event('all_models_loaded'));
  });

  // window.addEventListener('keydown', (e) => {
  //   setOpacity(ships['battleship'], 0.5);
  //   animate();
  // });

  // function setOpacity(model, value) {
  //   if (model.material) {
  //     model.material.transparent = true;
  //     model.material.opacity = value;
  //   } else {
  //     const children = model.children;
  //     children.forEach((child) => {
  //       setOpacity(child, value);
  //     });
  //   }
  //   console.log(ships['battleship']);
  // }

  // Resize renderer on window resize event
  window.addEventListener('resize', resizeCanvasToDisplaySize);
  setTimeout(resizeCanvasToDisplaySize, 100);

  function resizeCanvasToDisplaySize() {
    // This is one of the most important functions. It keeps the 3d model space (controlled by
    // WebGL) locked to the playerboard grid (controlled by CSS)
    const windowWidth = window.innerWidth;
    const widthModifier = windowWidth * 0.41688;

    // The playerboard should be about 42% of the screen space
    playerBoard.style.width = `${widthModifier}px`;

    // Set the perspective based on the size of the playerboard. This must be done BEFORE
    // the size of the playerCanvas is set below.
    mainElement.style.perspective = `${widthModifier}px`;

    playerBoardRect = playerBoard.getBoundingClientRect();
    const overflowTop = playerBoardRect.height / 10;
    const overflowBottom = playerBoardRect.height / 40;
    const width = playerBoardRect.width;
    const height = playerBoardRect.height + overflowTop + overflowBottom;

    playerCanvas.style.top = `${playerBoardRect.top - overflowTop}px`;
    playerCanvas.style.left = `${playerBoardRect.left}px`;
    playerCanvas.style.height = `${height}px`;
    playerCanvas.style.width = `${width}px`;

    const dpr = window.devicePixelRatio;
    renderer.setPixelRatio(dpr);

    renderer.setSize(width, height, true);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function loadModel(modelFile, name, type) {
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

  function initializeModelOnLoad(model) {
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

  function addModelToScene(modelName, direction, firstRow, firstColumn) {
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

    scene.add(ship);
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }

  function sinkShip(shipName) {
    const start = Date.now();
    const animationLength = 3000;
    const ship = ships[shipName];
    let axis = '';
    let offsetMultiply = 1;
    let offsetAdd = 0;
    let oldPosY = 0;
    let sinkAmount = 0;
    switch (shipName) {
      case 'patrolBoat':
        ship.rotation.order = 'XYZ';
        axis = 'z';
        offsetMultiply = -1;
        oldPosY = ship.position.y;
        sinkAmount = -2;
        break;
      case 'destroyer':
        ship.rotation.order = 'YXZ';
        axis = 'x';
        oldPosY = ship.position.y;
        sinkAmount = 0.6;
        break;
      case 'submarine':
        ship.rotation.order = 'XYZ';
        axis = 'z';
        oldPosY = ship.position.y;
        sinkAmount = -1;
        break;
      case 'battleship':
        ship.rotation.order = 'XYZ';
        if (ship.dataDirection === 'left' || ship.dataDirection === 'right') {
          axis = 'x';
          offsetAdd = -1.5708;
        } else {
          axis = 'y';
          offsetAdd = 0;
        }

        offsetMultiply = -1;
        oldPosY = ship.position.y;
        sinkAmount = 1;
        break;
      case 'carrier':
        ship.rotation.order = 'YXZ';
        axis = 'z';
        oldPosY = ship.position.y;
        sinkAmount = 0;
        break;
    }
    const leftRight =
      ship.dataDirection === 'left' || ship.dataDirection === 'right'
        ? true
        : false;

    animate();

    function animate() {
      const animation = requestAnimationFrame(animate);
      const normalizedFrame = (Date.now() - start) / animationLength; // number between 0 and 1
      const normalizedRotation = parametricTransform(normalizedFrame);
      ship.rotation[axis] =
        normalizedRotation * -3.14159 * offsetMultiply + offsetAdd;
      ship.position.y = normalizedRotation * sinkAmount + oldPosY;

      renderer.render(scene, camera);

      if (normalizedFrame > 1) {
        cancelAnimationFrame(animation);
      }
    }
  }

  function parametricTransform(t) {
    return (t * t) / (2 * (t * t - t) + 1);
  }

  function debugMode(moveObject = 'camera') {
    if (!enableDebugMode) return;

    // The grid is useful for debugging as we can use it to align the 3d canvas space
    // with the CSS grid in the DOM
    loadModel(gridGLB, 'grid', 'glb').then((model) => {
      scene.add(model);
      render();
    });

    let moveAmountX = 0.2;
    let moveAmountY = 0.2;

    // These keybindings let us move a model around in the 3D space do that
    // we can get it lined up with everything else
    window.addEventListener('keydown', (e) => {
      if (e.key === 'e') {
        ships[moveObject].position.z += moveAmountY;
        console.log(
          `ships[moveObject].position.z ${ships[moveObject].position.z}`
        );
      }
      if (e.key === 'd') {
        ships[moveObject].position.z -= moveAmountY;
        console.log(
          `ships[moveObject].position.z ${ships[moveObject].position.z}`
        );
      }
      if (e.key === 'r') {
        ships[moveObject].position.y += moveAmountY;
        console.log(
          `ships[moveObject].position.y ${ships[moveObject].position.y}`
        );
      }
      if (e.key === 'f') {
        ships[moveObject].position.y -= moveAmountY;
        console.log(
          `ships[moveObject].position.y ${ships[moveObject].position.y}`
        );
      }
      if (e.key === 't') {
        ships[moveObject].position.x += moveAmountX;
        console.log(
          `ships[moveObject].position.x ${ships[moveObject].position.x}`
        );
      }
      if (e.key === 'g') {
        ships[moveObject].position.x -= moveAmountX;
        console.log(
          `ships[moveObject].position.x ${ships[moveObject].position.x}`
        );
      }
      if (e.key === 'w') {
        ships[moveObject].rotation.x += moveAmountX / 100;
        console.log(`rotation.x ${ships[moveObject].rotation.x}`);
      }
      if (e.key === 's') {
        ships[moveObject].rotation.x -= moveAmountX / 100;
        console.log(`rotation.x ${ships[moveObject].rotation.x}`);
      }
      if (e.key === 'y') {
        ships[moveObject].rotation.z += 1.5708;
        console.log(`rotation.z ${ships[moveObject].rotation.z}`);
      }
      if (e.key === 'h') {
        ships[moveObject].rotation.z -= 1.5708;
        console.log(`rotation.z ${ships[moveObject].rotation.z}`);
      }
      if (e.key === 'q') {
        ships[moveObject].rotation.y += 1.5708;
        console.log(`rotation.y ${ships[moveObject].rotation.y}`);
      }
      if (e.key === 'a') {
        ships[moveObject].rotation.y -= 1.5708;
        console.log(`rotation.y ${ships[moveObject].rotation.y}`);
      }
    });
  }

  debugMode();

  return {
    addModelToScene,
    resizeCanvasToDisplaySize,
    sinkShip,
  };
}
