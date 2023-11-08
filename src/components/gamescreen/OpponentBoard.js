import { useEffect, useRef, useState } from "react";
import { C } from "../../Constants";
import './opponentboard.css';
import { PacketType, battleStatsActions } from "../../enums";
import { createBoardCells, pingBoard, displayShipOnOpponentBoard } from "./boardhelperfunctions";

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
  setOpponentShipsSunk
}) {

  // const [opponentShipsSunk, setOpponentShipsSunk] = useState(0);
  const opponentboardElement = useRef(null);
  const pingRef = useRef(null);

  useEffect(() => {
    if (!attackResultPlayer) return;

    pingBoard(
      opponentboardElement,
      pingRef,
      attackResultPlayer.row,
      attackResultPlayer.col,
      attackResultPlayer.result);

    console.log("RESULT RECEIVED: " + attackResultPlayer.result)
    
    let setImagePosition;
    if (attackResultPlayer.result === PacketType.ATTACK_MISSED) {
      dispatchBattleStats(battleStatsActions.incrementMyShotsFired);
    } else if (attackResultPlayer.result === PacketType.ATTACK_HITSHIP) {
      dispatchBattleStats(battleStatsActions.incrementMyShotsHit);
    } else if (attackResultPlayer.result === PacketType.ATTACK_SUNKSHIP) {
      setImagePosition = displayShipOnOpponentBoard(opponentboardElement, attackResultPlayer);
      window.addEventListener('resize', setImagePosition);
      setOpponentShipsSunk((prev) => prev + 1);
      dispatchBattleStats(battleStatsActions.incrementMyShotsHit);
    }
    
    // dispatchBattleStats(battleStatsActions.incrementMyShotsFired);

    // if (attackResultPlayer.result === PacketType.ATTACK_HITSHIP) {
    //   dispatchBattleStats(battleStatsActions.incrementMyShotsHit);
    // } else if (attackResultPlayer.result === PacketType.ATTACK_SUNKSHIP) {
    //   displayShipOnOpponentBoard(opponentboardElement, attackResultPlayer);
    //   setOpponentShipsSunk((prev) => prev + 1);
    //   dispatchBattleStats(battleStatsActions.incrementMyShotsHit);
    // }

    return () => {
      window.removeEventListener('resize', setImagePosition);
    }

  }, [attackResultPlayer])


  useEffect(() => {
    if (readyToAttackOpponent) {
      opponentboardElement.current.classList.add("boardflash");
      opponentboardElement.current.classList.remove("disable-hover");
    } else {
      opponentboardElement.current.classList.remove("boardflash");
      opponentboardElement.current.classList.add("disable-hover");
    }
  }, [readyToAttackOpponent])

  function handleCellClick(e) {
    if (!isValidCell(e)) return;
    setReadyToAttackOpponent(false);
    sendPacket(PacketType.ATTACK, [Number(e.target.dataset.row), Number(e.target.dataset.column)]);
  }

  function isValidCell(e) {
    return Boolean(e.target.dataset.row);
  }

  return (
    <div className="section-block opponent-board-container">
      <h2>Opponent:</h2>
      <p>Currently {opponentShipsSunk} of {C.totalShips} ships sunk</p>
      <div ref={opponentboardElement}
        className="miniboard disable-hover"
        onClick={handleCellClick}
      >
        {cells}
      <div className="ping-container" ref={pingRef}><div className="ping-ring"></div></div>
      </div>
    </div>
  )
}