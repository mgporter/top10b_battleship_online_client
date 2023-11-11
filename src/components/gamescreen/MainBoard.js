import './mainboard.css';
import { useState, useRef, useEffect, useContext } from 'react';
import { C } from '../../Constants';
import Gameboard from '../logic/gameboard';
import { ApplicationState, Avatars, PacketType, battleStatsActions } from '../../enums';
import ModelContainer from "./ModelContainer";
import { PlayerNameContext } from '../../PlayerProvider';
import { AppStateContext } from '../../AppStateProvider';
import ShipPlacement from '../logic/shipplacement';
import { createBoardCells, pingBoard, addHitToHealthStatus } from '../logic/boardhelperfunctions';

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
  setMainMessages,
  setShipsPlaced,
  attackResultOpponent,
  dispatchBattleStats}) {

  const [mouseOverCell, setMouseOverCell] = useState(null);
  const [directionIndex, setDirectionIndex] = useState(0);

  const playerboardElement = useRef(null);
  const pingRef = useRef(null);
  const modelRef = useRef(null);
  const placementCells = useRef(null);

  const playerName = useContext(PlayerNameContext);
  const appState = useContext(AppStateContext);

  // shipPlacement.setPlayerboardElement(playerboardElement);

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
    shipPlacement.setPlayerboardElement(playerboardElement);
  }, []);

  /* Color cells in when the opponent's attack results are received */
  useEffect(() => {
    if (!attackResultOpponent) return;
    
    pingBoard(
      playerboardElement,
      pingRef,
      attackResultOpponent.row,
      attackResultOpponent.col,
      attackResultOpponent.result);

    if (attackResultOpponent.result === PacketType.ATTACK_MISSED) {
      dispatchBattleStats(battleStatsActions.incrementOpponentShotsFired);
    } else if (attackResultOpponent.result === PacketType.ATTACK_HITSHIP) {
      addHitToHealthStatus(board, attackResultOpponent.row, attackResultOpponent.col);
      dispatchBattleStats(battleStatsActions.incrementOpponentShotsHit);
    } else if (attackResultOpponent.result === PacketType.ATTACK_SUNKSHIP) {
      addHitToHealthStatus(board, attackResultOpponent.row, attackResultOpponent.col);
      setPlayerShipsSunk((prev) => prev + 1);
      modelRef.current.sinkShip(attackResultOpponent.shipType);
      dispatchBattleStats(battleStatsActions.incrementOpponentShotsHit);
    }
    
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


  /* Handle ship placement when a user clicks on a cell */
  function placeShip(clickedCell) {
    if (!placementCells.current) return;

    shipToPlace.current.setDirection(directionIndex);

     /* For the first time a ship is placed only */
    if (!shipToPlace.current.isPlaced()) {
      
      setMainMessages((prev) => {
        const newMessage = {
          avatar: Avatars.PLAYERCAPTAIN,
          sender: playerName,
          color: "yellow",
          text: `We have placed our ${shipToPlace.current.getDisplayName()}`
        }
  
        return [...prev, newMessage];
      })

      sendPacket(PacketType.PLACED_SHIP);

      /* Only add the ship to the shipsPlaced array the first time it is placed */
      setShipsPlaced((prev) => [...prev, shipToPlace.current]);

      /* Remove boardflash in case it is still on */
      playerboardElement.current.classList.remove('boardflash')
    }

    shipPlacement.placeShip(shipToPlace.current, placementCells.current);

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
      <main className="section-block main-board-container">
          <div id="playerboard" 
            ref={playerboardElement}
            className={`${mainboardFlash ? "boardflash" : ""} ${mainboardHover ? "" : "disable-hover"}`}
            onClick={handleCellClick}
            onMouseOver={handleCellMouseOver}
            onMouseLeave={disablePlacementHighlighting}
          >
            {cells}
          <div className="ping-container" ref={pingRef}><div className="ping-ring"></div></div>
          </div>
      </main>
      <ModelContainer modelRef={modelRef} />
    </>
  )
}