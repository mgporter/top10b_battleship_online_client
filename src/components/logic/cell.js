export default function Cell() {
  let _hasShip = false;
  let ship = null;
  let alreadyHit = false;
  let shipPartNumber = null;

  function addShip(newShip, partNumber = null) {
    if (_hasShip) {
      throw new Error('Cannot place a ship on top of an existing ship');
    } else {
      _hasShip = true;
      ship = newShip;
      shipPartNumber = partNumber;
    }
  }

  function getShipPartNumber() {
    return shipPartNumber;
  }

  function removeShip() {
    _hasShip = false;
    ship = null;
  }

  function hasShip() {
    return _hasShip;
  }

  function getShip() {
    return ship;
  }

  function addHit() {
    if (alreadyHit) {
      throw new Error('Cannot target a space that has already been targeted');
    } else {
      // Return the ship if one is here, otherwise return null
      alreadyHit = true;
      if (_hasShip) return ship;
      return null;
    }
  }

  function hasBeenAttacked() {
    return alreadyHit;
  }

  return {
    hasShip,
    addShip,
    getShipPartNumber,
    getShip,
    addHit,
    hasBeenAttacked,
    removeShip,
  };
}
