import './mainboard.css';
import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { C } from '../../Constants';
import Gameboard from '../logic/gameboard';
import { ApplicationState, Avatars, Events, PacketType, battleStatsActions, inGameMessages, shipStatsActions } from '../../enums';
import ModelContainerMemo from "./ModelContainer";
import { AppStateContext } from '../../AppStateProvider';
import ShipPlacement from '../logic/shipplacement';
import { addHitToHealthStatus, handleAttackResult, coordinateToDOMCell } from '../logic/boardhelperfunctions';
import { setInGameMessagesContext } from '../../InGameMessageProvider';
import { shipFromJSON } from '../logic/ship';
import EventEmitter from '../../EventEmitter';

/* Create the board cells once on load */

const cells = (function createPlayerboardCells() {
  const cellArr = []
  for (let i = 0; i < C.gameboardRows; i++) {
    for (let j = 0; j < C.gameboardColumns; j++) {
      cellArr.push(<div key={i + "_" + j} className='cell playerboard' data-row={i} data-column={j}></div>)
    }
  }
  return cellArr;
})();

let board;
let shipPlacement;
const directions = Object.keys(C.paths);

export default function MainBoard({
  mainboardFlash, 
  mainboardHover,
  shipToPlace,
  sendPacket,
  dispatchShipStats,
  setShipsPlaced,
  shipsPlaced,
  dispatchBattleStats,
  gameContainerRef
}) {

  const [mouseOverCell, setMouseOverCell] = useState(null);
  const [directionIndex, setDirectionIndex] = useState(0);

  const playerboardRef = useRef(null);
  const pingRef = useRef(null);
  const modelRef = useRef(null);
  const placementCells = useRef(null);
  const mainElementRef = useRef(null);
  const currentAttackResult = useRef(null);

  const appState = useContext(AppStateContext);
  const setInGameMessages = useContext(setInGameMessagesContext);

  /* Add highlighting to cells whenever the user's mouse hovers over a cell */
  if (mouseOverCell && shipToPlace.current) {
    shipPlacement.removeHighlightedCells(placementCells.current);
    placementCells.current = shipPlacement.highlightCells(
      mouseOverCell,
      shipToPlace,
      directions[directionIndex]
    )
  }

  useEffect(() => {
    board = new Gameboard();
    shipPlacement = ShipPlacement(board);
    shipPlacement.setPlayerboardElement(playerboardRef);
  }, []);

  /* Add event listeners for wheel and keydown events to change the ship's direction */
  useEffect(() => {
    function changeShipDirection(e) {
      if (e.deltaY < 0 || e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setDirectionIndex((prev) => (prev + 1) % 4)
      } else if (e.deltaY >= 0 || e.key === "ArrowRight" || e.key === "ArrowDown") {
        setDirectionIndex((prev) => (prev + 3) % 4)
      }
    }
    document.addEventListener('wheel', changeShipDirection);
    document.addEventListener('keydown', changeShipDirection);
    return () => {
      document.removeEventListener('wheel', changeShipDirection);
      document.removeEventListener('keydown', changeShipDirection);
    }
  }, [])



  const handleMiss = useCallback((targetCell, loadingData = false) => {
    targetCell.classList.add("miss");
    dispatchBattleStats(battleStatsActions.incrementOpponentShotsFired);
    if (loadingData === false) setInGameMessages(inGameMessages.OPPONENTMISSED);
  }, [dispatchBattleStats, setInGameMessages]);

  const handleHit = useCallback((targetCell, loadingData = false, row = null, col = null) => {
    targetCell.classList.add("hit");
    dispatchBattleStats(battleStatsActions.incrementOpponentShotsHit);
    console.log(row, col)
    if (loadingData === false) {
      setInGameMessages(inGameMessages.OPPONENTHITSHIP, currentAttackResult.current.shipType);
      addHitToHealthStatus(board, currentAttackResult.current.row, currentAttackResult.current.col);
    } else {
      addHitToHealthStatus(board, row, col);
    }
  }, [dispatchBattleStats, setInGameMessages]);

  const handleSink = useCallback((targetCell, loadingData = false, row = null, col = null) => {
    targetCell.classList.add("hit");
    dispatchBattleStats(battleStatsActions.incrementOpponentShotsHit);
    if (loadingData === false) {
      dispatchShipStats({type: shipStatsActions.INCREMENTPLAYERSHIPSUNK})
      setInGameMessages(inGameMessages.OPPONENTSUNKSHIP, currentAttackResult.current.shipType);
      addHitToHealthStatus(board, currentAttackResult.current.row, currentAttackResult.current.col);
      modelRef.current.sinkShip(currentAttackResult.current.shipType);
    } else {
      addHitToHealthStatus(board, row, col);
    }
  }, [dispatchBattleStats, dispatchShipStats, setInGameMessages]);

  const loadGameData = useCallback((data) => {
    const myShips = data.myShips;
    const opponentAttacks = data.opponentAttacks;

    let mySunkShips = 0;
    for (let JsonShip of myShips) {
      const ship = shipFromJSON(JsonShip);
      setShipsPlaced((prev) => [...prev, ship]);
      shipPlacement.placeShip(ship, ship.getLocation());

      modelRef.current.addModelToScene(
        ship.getType(),
        directions[ship.getDirection()],
        ship.getStartingCoordinates()[0],
        ship.getStartingCoordinates()[1]
      );
      
      if (ship.isSunk()) {
        modelRef.current.sinkShip(ship.getType());
        mySunkShips++;
      }
    }

    dispatchShipStats({type: shipStatsActions.SETPLAYERSHIPSSUNK, data: mySunkShips})

    modelRef.current.resizeCanvasToDisplaySize();
    playerboardRef.current.classList.add("fade-in-result");

    /* Give the Ship Health Container some time to load and get in the screen,
     * otherwise handleMiss/Hit/Sink will run before they are rendered to the DOM.
     * We also fade in the colors on the attacked cells, and add an
     * event listener on the last cell to turn off the fade.
     * This is a temporary solution for now.
     */

    setTimeout(() => {
      let targetCell;
      for (let attack of opponentAttacks) {
        targetCell = coordinateToDOMCell([attack.row, attack.col], playerboardRef);
        if (attack.result === PacketType.M) handleMiss(targetCell, true);
        else if (attack.result === PacketType.H) handleHit(targetCell, true, attack.row, attack.col);
        else if (attack.result === PacketType.S) handleSink(targetCell, true, attack.row, attack.col);
      }

      // If the player did not make any attacks, this will be null
      if (targetCell) 
        targetCell.addEventListener("transitionend" , () => {
          playerboardRef.current.classList.remove("fade-in-result");
        }, {once: true});
    }, 100)

  }, [dispatchShipStats, setShipsPlaced, handleMiss, handleHit, handleSink]);

  useEffect(() => {
    EventEmitter.subscribe(Events.OPPONENTATTACKRECEIVED, "MainBoard", (attackPacket) => {
      currentAttackResult.current = attackPacket;
      handleAttackResult(
        playerboardRef,
        pingRef,
        attackPacket,
        handleMiss,
        handleHit,
        handleSink
      );
    });
    return () => {
      EventEmitter.unsubscribe(Events.OPPONENTATTACKRECEIVED, "MainBoard");
    }
  }, [handleMiss, handleHit, handleSink])

  useEffect(() => {
    EventEmitter.subscribe(Events.LOADSAVEDGAME, "MainBoard", loadGameData);
    return () => {
      EventEmitter.unsubscribe(Events.LOADSAVEDGAME, "MainBoard");
    }
  }, [loadGameData])


  /* Handle ship placement when a user clicks on a cell */
  function placeShip(clickedCell) {
    if (!placementCells.current) return;

    shipToPlace.current.setDirection(directionIndex);

     /* For the first time any particular ship is placed only */
    if (!shipToPlace.current.isPlaced()) {

      /* Handle messages */
      if (shipsPlaced.length === 0) {
        setInGameMessages(inGameMessages.FIRSTSHIPPLACED, shipToPlace.current.getType());
      } else if (shipsPlaced.length >= C.totalShips - 1) {
        setInGameMessages(inGameMessages.ALLSHIPSPLACED, shipToPlace.current.getType());
      } else {
        setInGameMessages(inGameMessages.SHIPPLACED, shipToPlace.current.getType());
      }
      
      sendPacket(PacketType.PLACED_SHIP, shipsPlaced.length + 1);

      /* Only add the ship to the shipsPlaced array the first time it is placed */
      setShipsPlaced((prev) => [...prev, shipToPlace.current]);
      dispatchShipStats({type: shipStatsActions.INCREMENTPLAYERSHIPPLACED});

      /* Remove boardflash in case it is still on */
      playerboardRef.current.classList.remove('boardflash')
    }

    shipPlacement.placeShip(shipToPlace.current, placementCells.current);

    /* Add the model to the playercanvas */
    modelRef.current.addModelToScene(
      shipToPlace.current.getType(),
      directions[directionIndex],
      clickedCell[0],
      clickedCell[1]
    );

    /* Let the 3d Canvas reposition itself after setting down a ship */
    modelRef.current.resizeCanvasToDisplaySize();
  }

  function disablePlacementHighlighting() {
    shipPlacement.removeHighlightedCells(null);
    setMouseOverCell(null);
  }

  function handleCellClick(e) {
    if (appState === ApplicationState.SHIP_PLACEMENT && isValidCell(e)) {
      placeShip([Number(e.target.dataset.row), Number(e.target.dataset.column)]);
    }
  }

  function handleCellMouseOver(e) {
    if (appState === ApplicationState.SHIP_PLACEMENT && isValidCell(e)) {
      setMouseOverCell([Number(e.target.dataset.row), Number(e.target.dataset.column)]);
    }
  }

  function isValidCell(e) {
    return Boolean(e.target.dataset.row);
  }


  return (
    <>
      <main className="section-block main-board-container" ref={mainElementRef}>
          <div id="playerboard" 
            ref={playerboardRef}
            className={`${mainboardFlash ? "boardflash" : ""} ${mainboardHover ? "" : "disable-hover"}`}
            onClick={handleCellClick}
            onMouseOver={handleCellMouseOver}
            onMouseLeave={disablePlacementHighlighting}
          >
            {cells}
          <div className="ping-container" ref={pingRef}><div className="ping-ring"></div></div>
          </div>
      </main>
      <ModelContainerMemo 
        modelRef={modelRef} 
        playerboardRef={playerboardRef} 
        mainElementRef={mainElementRef}
        gameContainerRef={gameContainerRef}
      />
    </>
  )
}