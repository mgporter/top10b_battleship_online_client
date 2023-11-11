import MainBoard from "./MainBoard";
import ShipHealthPanel from "./ShipHealthPanel";
import ShipPlacementPanel from "./ShipPlacementPanel";
import { ApplicationState, ShipType } from "../../enums";
import { useState, useRef, useEffect, useContext } from "react";
import Ship from "../logic/ship";

import { C } from "../../Constants";
import { AppStateContext } from "../../AppStateProvider";


let ships;

export default function MainboardAndPanel({
  setMainMessages, 
  sendPacket,
  attackResultOpponent,
  readyToAttackOpponent,
  dispatchBattleStats,
  playerShipsSunk,
  setPlayerShipsSunk,
  addShipTransitionStatus
}) {

  const [shipClicked, setShipClicked] = useState(null);
  const [leftPanelFlash, setLeftPanelFlash] = useState(true);
  const [mainboardFlash, setMainboardFlash] = useState(false);
  const [mainboardHover, setMainboardHover] = useState(false);
  const [shipsPlaced, setShipsPlaced] = useState([]);
  // const [playerShipsSunk, setPlayerShipsSunk] = useState(0);

  const shipToPlace = useRef(null);
  const firstPlacement = useRef(true);

  const appState = useContext(AppStateContext);

  useEffect(() => {

    ships = [];

    let shipId = 0;
    for (let shipType in ShipType) {
      for (let i = 0; i < C.ships[shipType].numberAllowed; i++) {
        const ship = Ship(shipType);
        ship.setId(++shipId);
        ships.push(ship);
      }
    }

  }, [])

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
    if (appState !== ApplicationState.ATTACK_PHASE) return;
    if (readyToAttackOpponent) {
      setMainboardFlash(false);
    } else {
      setMainboardFlash(true);
    }
  }, [readyToAttackOpponent])


  useEffect(() => {
    if (appState === ApplicationState.ATTACK_PHASE) {
      setMainboardHover(false);
    } else if (appState === ApplicationState.GAME_END) {
      setMainboardFlash(false);
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
          shipsPlaced={shipsPlaced}
          addShipTransitionStatus={addShipTransitionStatus} />}
        {showShipHealthPanel && <ShipHealthPanel 
          shipsPlaced={shipsPlaced}
          playerShipsSunk={playerShipsSunk}
        />}
        <MainBoard 
          mainboardFlash={mainboardFlash} 
          mainboardHover={mainboardHover}
          shipToPlace={shipToPlace}
          sendPacket={sendPacket}
          setPlayerShipsSunk={setPlayerShipsSunk}
          setMainMessages={setMainMessages} 
          setShipsPlaced={setShipsPlaced}
          attackResultOpponent={attackResultOpponent}
          dispatchBattleStats={dispatchBattleStats}
        />
    </>
  )
}