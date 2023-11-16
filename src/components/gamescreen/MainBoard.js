import './mainboard.css';
import { useState, useRef, useEffect, useContext } from 'react';
import { C } from '../../Constants';
import Gameboard from '../logic/gameboard';
import { ApplicationState, Avatars, PacketType, battleStatsActions, inGameMessages } from '../../enums';
import ModelContainer from "./ModelContainer";
import { PlayerNameContext } from '../../PlayerProvider';
import { AppStateContext } from '../../AppStateProvider';
import ShipPlacement from '../logic/shipplacement';
import { addHitToHealthStatus, handleAttackResult } from '../logic/boardhelperfunctions';
import { setInGameMessagesContext } from '../../InGameMessageProvider';

/* Create the board cells once on load */
// const cells = (createBoardCells("playerboard"))();

const cells = (function createPlayerboardCells() {
  const cellArr = []
  for (let i = 0; i < C.gameboardRows; i++) {
    for (let j = 0; j < C.gameboardColumns; j++) {
      cellArr.push(<div key={i + "_" + j} className='cell playerboard' data-row={i} data-column={j}></div>)
    }
  }
  return cellArr;
})();


// const board = new Gameboard();
// const shipPlacement = ShipPlacement(board);
let board;
let shipPlacement;
const directions = Object.keys(C.paths);

export default function MainBoard({
  mainboardFlash, 
  mainboardHover,
  shipToPlace,
  sendPacket,
  setPlayerShipsSunk,
  setShipsPlaced,
  shipsPlaced,
  attackResultOpponent,
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


  /* Handle the attack results when they are received */
  useEffect(() => {
    if (!attackResultOpponent) return;

    handleAttackResult(
      playerboardRef,
      pingRef,
      attackResultOpponent,
      handleMiss,
      handleHit,
      handleSink
    );
    
  }, [attackResultOpponent])


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

  function handleMiss() {
    dispatchBattleStats(battleStatsActions.incrementOpponentShotsFired);
    setInGameMessages(inGameMessages.OPPONENTMISSED);
  }

  function handleHit() {
    addHitToHealthStatus(board, attackResultOpponent.row, attackResultOpponent.col);
    dispatchBattleStats(battleStatsActions.incrementOpponentShotsHit);
    setInGameMessages(inGameMessages.OPPONENTHITSHIP, attackResultOpponent.shipType);
  }

  function handleSink() {
    addHitToHealthStatus(board, attackResultOpponent.row, attackResultOpponent.col);
    setPlayerShipsSunk((prev) => prev + 1);
    modelRef.current.sinkShip(attackResultOpponent.shipType);
    dispatchBattleStats(battleStatsActions.incrementOpponentShotsHit);
    setInGameMessages(inGameMessages.OPPONENTSUNKSHIP, attackResultOpponent.shipType);
  }


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
      <ModelContainer 
        modelRef={modelRef} 
        playerboardRef={playerboardRef} 
        mainElementRef={mainElementRef}
        gameContainerRef={gameContainerRef}
      />
    </>
  )
}