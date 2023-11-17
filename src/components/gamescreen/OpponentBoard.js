import { useContext, useEffect, useRef, useState } from "react";
import { C } from "../../Constants";
import './opponentboard.css';
import { PacketType, battleStatsActions, inGameMessages } from "../../enums";
import { displayShipOnOpponentBoard, handleAttackResult, coordinateToDOMCell } from "../logic/boardhelperfunctions";
import { setInGameMessagesContext } from "../../InGameMessageProvider";

/* Create the board cells once on load */
// const cells = createBoardCells("opponentboard");

const cells = (function createOpponentboardCells() {
  const cellArr = []
  for (let i = 0; i < C.gameboardRows; i++) {
    for (let j = 0; j < C.gameboardColumns; j++) {
      cellArr.push(<div key={i + "_" + j} className='cell opponentboard' data-row={i} data-column={j}></div>)
    }
  }
  return cellArr;
})();

export default function OpponentBoard({
  readyToAttackOpponent, 
  sendPacket, 
  attackResultPlayer,
  setReadyToAttackOpponent,
  dispatchBattleStats,
  opponentShipsSunk,
  setOpponentShipsSunk,
  gameStateData
}) {

  const opponentboardRef = useRef(null);
  const boardOverlayRef = useRef(null);
  const pingRef = useRef(null);
  const opponentPanelRef = useRef(null);

  const setInGameMessages = useContext(setInGameMessagesContext);

  useEffect(() => {
    opponentPanelRef.current.classList.add('slidein');
  }, [])

  /* If the player is joining a game that was in progress, then the current
  game state will be loaded here */
  useEffect(() => {
   if (!gameStateData) return;
    const opponentSunkShips = gameStateData.opponentSunkShips;
    const myAttacks = gameStateData.myAttacks;

    for (let attack of myAttacks) {
      const targetCell = coordinateToDOMCell([attack.row, attack.col], opponentboardRef);
      if (attack.result === PacketType.M) handleMiss(targetCell, true);
      else if (attack.result === PacketType.H) handleHit(targetCell, true);
      else if (attack.result === PacketType.S) handleSink(targetCell, true);
    }

    for (let sunkShip of opponentSunkShips) {
      displayShipOnOpponentBoard(boardOverlayRef, {
        shipType: sunkShip.type,
        direction: sunkShip.direction,
        startingRow: sunkShip.location[0].row,
        startingCol: sunkShip.location[0].col
      });
    }

    setOpponentShipsSunk(opponentSunkShips.length);

  }, [gameStateData])

  useEffect(() => {
    if (!attackResultPlayer) return;

    handleAttackResult(
      opponentboardRef,
      pingRef,
      attackResultPlayer,
      handleMiss,
      handleHit,
      handleSink
    );

  }, [attackResultPlayer])


  useEffect(() => {
    if (readyToAttackOpponent) {
      opponentboardRef.current.classList.add("boardflash");
      opponentboardRef.current.classList.remove("disable-hover");
    } else {
      opponentboardRef.current.classList.remove("boardflash");
      opponentboardRef.current.classList.add("disable-hover");
    }
  }, [readyToAttackOpponent])


  function handleMiss(targetCell, loadingData = false) {
    targetCell.classList.add("miss");
    dispatchBattleStats(battleStatsActions.incrementMyShotsFired);
    if (loadingData === false) setInGameMessages(inGameMessages.ATTACKMISSED);
  }

  function handleHit(targetCell, loadingData = false) {
    targetCell.classList.add("hit");
    dispatchBattleStats(battleStatsActions.incrementMyShotsHit);
    if (loadingData === false) setInGameMessages(inGameMessages.ATTACKHITSHIP, attackResultPlayer.shipType);
  }

  function handleSink(targetCell, loadingData = false) {
    targetCell.classList.add("hit");
    dispatchBattleStats(battleStatsActions.incrementMyShotsHit);
    if (loadingData === false) {
      setOpponentShipsSunk((prev) => prev + 1);
      setInGameMessages(inGameMessages.ATTACKSUNKSHIP, attackResultPlayer.shipType);
      displayShipOnOpponentBoard(boardOverlayRef, attackResultPlayer);
    }
  }

  function handleCellClick(e) {
    if (!isValidCell(e)) return;
    setReadyToAttackOpponent(false);
    sendPacket(PacketType.ATTACK, [Number(e.target.dataset.row), Number(e.target.dataset.column)]);
  }

  function isValidCell(e) {
    return Boolean(e.target.dataset.row);
  }

  return (
    <div ref={opponentPanelRef} className="section-block opponent-board-container">
      <h2>Opponent:</h2>
      <p>Currently {opponentShipsSunk} of {C.totalShips} ships sunk</p>
      <div ref={opponentboardRef}
        className="miniboard disable-hover"
        onClick={handleCellClick}
      >
        {cells}
      <div className="miniboard-overlay" ref={boardOverlayRef}></div>
      <div className="ping-container" ref={pingRef}><div className="ping-ring"></div></div>
      </div>
    </div>
  )
}