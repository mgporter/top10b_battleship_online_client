import battleshipSide from './images/battleship-side.png';
import carrierSide from './images/carrier-side.png';
import submarineSide from './images/submarine-side.png';
import patrolBoatSide from './images/patrolBoat-side.png';
import destroyerSide from './images/destroyer-side.png';

import battleshipTop from './images/battleship-top.png';
import carrierTop from './images/carrier-top.png';
import submarineTop from './images/submarine-top.png';
import patrolBoatTop from './images/patrolBoat-top.png';
import destroyerTop from './images/destroyer-top.png';

import playerCaptainAvatar from './images/avatar_1.png';

import { ShipType, Avatars } from './enums';

export const C = {
  numberOfPlayers: 2,
  gameboardRows: 10,
  gameboardColumns: 10,
  numberOfModelsToLoad: 5,
  gameSpeed: 1,
  messageDuration: 1500,       /* How long messages are displayed in the game screen in ms */
  totalShips: 5,
  ships: {
    [ShipType.PATROLBOAT]: {
      displayName: 'Patrol Boat',
      size: 2,
      sideimg: patrolBoatSide,
      topimg: patrolBoatTop,
      numberAllowed: 1,
    },
    [ShipType.DESTROYER]: {
      displayName: 'Destroyer',
      size: 3,
      sideimg: destroyerSide,
      topimg: destroyerTop,
      numberAllowed: 1,
    },
    [ShipType.SUBMARINE]: {
      displayName: 'Submarine',
      size: 3,
      sideimg: submarineSide,
      topimg: submarineTop,
      numberAllowed: 1,
    },
    [ShipType.BATTLESHIP]: {
      displayName: 'Battleship',
      size: 4,
      sideimg: battleshipSide,
      topimg: battleshipTop,
      numberAllowed: 1,
    },
    [ShipType.CARRIER]: {
      displayName: 'Carrier',
      size: 5,
      sideimg: carrierSide,
      topimg: carrierTop,
      numberAllowed: 1,
    },
  },
  paths: {
    left: [0, 1],
    up: [1, 0],
    right: [0, -1],
    down: [-1, 0],
  },
  avatars: {
    [Avatars.PLAYERCAPTAIN]: playerCaptainAvatar,
  },
  serverPrefix: process.env.REACT_APP_SERVERPREFIX
};