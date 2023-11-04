import { C } from "../../Constants";
import { ShipType } from "../../enums";

export default function Ship(type) {
  let hits = 0;
  let shipId = null;
  let coordinates = [];

  function getType() {
    return type;
  }

  function getDisplayName() {
    return C.ships[type].displayName;
  }

  function getLength() {
    return C.ships[type].size;
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

  function getLocation() {
    return coordinates;
  }

  function isPlaced() {
    return coordinates.length > 0;
  }

  function getStartingCoordinates() {
    if (coordinates.length === 0) throw new Error("Ship coordinates not set yet");
    return coordinates[0];
  }

  return {
    getType,
    getDisplayName,
    getLength,
    setId,
    getId,
    receiveHit,
    getHitCount,
    isSunk,
    isPlaced,
    setLocation,
    getLocation,
    getStartingCoordinates
  };
}
