import MainBoard from "./MainBoard";
import ShipHealthPanel from "./ShipHealthPanel";
import ShipPlacementPanel from "./ShipPlacementPanel";
import { ApplicationState, ShipType, inGameMessages } from "../../enums";
import { useState, useRef, useEffect, useContext, memo } from "react";
import Ship from "../logic/ship";

import { C } from "../../Constants";
import { AppStateContext } from "../../AppStateProvider";
import { setInGameMessagesContext } from "../../InGameMessageProvider";


let ships;

const MainboardAndPanel = memo(function MainboardAndPanel({
  sendPacket,
  attackResultOpponent,
  readyToAttackOpponent,
  dispatchBattleStats,
  shipStats,
  dispatchShipStats,
  gameContainerRef
}) {

  const [shipClicked, setShipClicked] = useState(null);
  const [leftPanelFlash, setLeftPanelFlash] = useState(true);
  const [mainboardFlash, setMainboardFlash] = useState(false);
  const [mainboardHover, setMainboardHover] = useState(false);
  const [shipsPlaced, setShipsPlaced] = useState([]);

  const shipToPlace = useRef(null);
  const firstPlacement = useRef(true);

  const appState = useContext(AppStateContext);
  const setInGameMessages = useContext(setInGameMessagesContext);

  useEffect(() => {
    // Create player's ships
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

    /* Add visual indicators the first time the user clicks a ship */
    if (firstPlacement) {
      setMainboardHover(true);
      setMainboardFlash(true);
      setLeftPanelFlash(false);
    }

    /* Handle messages */
    if (shipsPlaced.length === 0) {
      setInGameMessages(inGameMessages.FIRSTSHIPSELECTED, shipClicked);
    } else if (shipsPlaced.length === C.totalShips) {
      // do nothing
    } else {
      setInGameMessages(inGameMessages.SHIPSELECTED, shipClicked);
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
  }, [readyToAttackOpponent, appState])


  useEffect(() => {
    if (appState === ApplicationState.ATTACK_PHASE) {
      setMainboardHover(false);
      // shipPlacementPanelRef.current.classList.add('slideout');
      // shipHealthPanelRef.current.classList.add('slidein');
    } else if (appState === ApplicationState.GAME_END) {
      setMainboardFlash(false);
      setMainboardHover(false);
    }
  }, [appState])

  return (
    <>
        <ShipPlacementPanel 
          setShipClicked={setShipClicked} 
          leftPanelFlash={leftPanelFlash}
          sendPacket={sendPacket}
          shipsPlaced={shipsPlaced}
        />
        <ShipHealthPanel 
          shipsPlaced={shipsPlaced}
          shipStats={shipStats}
        />
        <MainBoard 
          mainboardFlash={mainboardFlash} 
          mainboardHover={mainboardHover}
          shipToPlace={shipToPlace}
          sendPacket={sendPacket}
          dispatchShipStats={dispatchShipStats}
          shipsPlaced={shipsPlaced}
          setShipsPlaced={setShipsPlaced}
          attackResultOpponent={attackResultOpponent}
          dispatchBattleStats={dispatchBattleStats}
          gameContainerRef={gameContainerRef}
        />
    </>
  )
})

export default MainboardAndPanel;