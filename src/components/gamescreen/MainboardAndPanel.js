import MainBoard from "./MainBoard";
import ShipHealthPanel from "./ShipHealthPanel";
import ShipPlacementPanel from "./ShipPlacementPanel";
import { ApplicationState, ShipType } from "../../enums";
import { useState, useRef, useEffect, useContext } from "react";
import Ship from "../logic/ship";

import { C } from "../../Constants";
import { AppStateContext } from "../../AppStateProvider";

const ships = (function createShips() {

  /* Create an array of ships and give each ship a unique ID */

  const ships = [];
  let shipId = 0;
  for (let shipType in ShipType) {
    for (let i = 0; i < C.ships[shipType].numberAllowed; i++) {
      const ship = Ship(shipType);
      ship.setId(++shipId);
      ships.push(ship);
    }
  }

  return ships;
})();

export default function MainboardAndPanel({
  setMainMessages, 
  sendPacket,
  playerShipsSunk,
  attackResultOpponent,
  readyToAttackOpponent
}) {

  const [shipClicked, setShipClicked] = useState(null);
  const [leftPanelFlash, setLeftPanelFlash] = useState(true);
  const [mainboardFlash, setMainboardFlash] = useState(false);
  const [mainboardHover, setMainboardHover] = useState(false);
  const [shipsPlaced, setShipsPlaced] = useState([]);

  const shipToPlace = useRef(null);
  const firstPlacement = useRef(true);

  const appState = useContext(AppStateContext);

  useEffect(() => {
    if (!shipClicked) return;
    shipToPlace.current = ships.filter(s => s.getType() === shipClicked)[0];

    if (firstPlacement) {
      setMainboardHover(true);
      setMainboardFlash(true);
      setLeftPanelFlash(false);
    }

    firstPlacement.current = false;

  }, [shipClicked])


  useEffect(() => {
    console.log("ReadytoAttackOpponent variable changed")
    if (appState !== ApplicationState.ATTACK_PHASE) return;
    if (readyToAttackOpponent) {
      setMainboardFlash(false);
    } else {
      setMainboardFlash(true);
    }
  }, [readyToAttackOpponent])


  useEffect(() => {
    console.log("Appstate changed")
    if (appState === ApplicationState.ATTACK_PHASE) {
      
      setMainboardHover(false);
    }
  }, [appState])

  const showPlaceShipsPanel = 
    appState === ApplicationState.GAME_INITIALIZED || 
    appState === ApplicationState.SHIP_PLACEMENT ||
    appState === ApplicationState.SHIPS_PLACED_AND_STARTED;
  const showShipHealthPanel = appState === ApplicationState.ATTACK_PHASE || appState === ApplicationState.GAME_END;

  return (
    <>
        {showPlaceShipsPanel && <ShipPlacementPanel 
          setShipClicked={setShipClicked} 
          leftPanelFlash={leftPanelFlash}
          sendPacket={sendPacket}
          shipsPlaced={shipsPlaced} />}
        {showShipHealthPanel && <ShipHealthPanel 
          shipsPlaced={shipsPlaced}
          playerShipsSunk={playerShipsSunk}
        />}
        <MainBoard 
          mainboardFlash={mainboardFlash} 
          mainboardHover={mainboardHover}
          shipToPlace={shipToPlace}
          sendPacket={sendPacket}
          setMainMessages={setMainMessages} 
          setShipsPlaced={setShipsPlaced}
          attackResultOpponent={attackResultOpponent}
        />
    </>
  )
}