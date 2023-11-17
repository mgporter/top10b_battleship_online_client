import { C } from "../../Constants";

export function shipFromJSON(JsonShip) {
  const ship = Ship(JsonShip.type);
  ship.setId(JsonShip.shipId);
  ship.setDirection(JsonShip.direction);
  ship.setHits(JsonShip.hits);

  for (let coord of JsonShip.location) {
    ship.addCoordinateToLocation([coord.row, coord.col]);
  }
  
  return ship;
}

export default function Ship(type) {
  let hits = 0;
  let shipId = null;
  let coordinates = [];
  let direction = 0;

  function getType() {
    return type;
  }

  function getDisplayName() {
    return C.ships[type].displayName;
  }

  function getLength() {
    return C.ships[type].size;
  }

  function setDirection(newDirection) {
    direction = newDirection;
  }

  function getDirection() {
    return direction;
  }

  function setId(id) {
    shipId = id;
  }

  function getId() {
    return shipId;
  }

  /* Changed from "hit()" */
  function receiveHit() {
    hits += 1;
  }

  function setHits(newHits) {
    hits = newHits;
  }

  function getHitCount() {
    return hits;
  }

  function isSunk() {
    return hits < getLength() ? false : true;
  }

  function setLocation(coordinateList) {
    for (let coordinate of coordinateList) {
      coordinates.push(coordinate);
    }
  }

  function addCoordinateToLocation(coordinate) {
    coordinates.push(coordinate);
  }

  function resetLocation() {
    coordinates = [];
  }

  function getLocation() {
    return coordinates;
  }

  function isPlaced() {
    return coordinates.length > 0;
  }

  function getStartingCoordinates() {
    if (coordinates.length === 0) return [null, null];
    return coordinates[0];
  }

  return {
    getType,
    getDisplayName,
    getLength,
    setDirection,
    getDirection,
    setId,
    getId,
    receiveHit,
    setHits,
    getHitCount,
    isSunk,
    isPlaced,
    setLocation,
    addCoordinateToLocation,
    getLocation,
    resetLocation,
    getStartingCoordinates
  };
}
