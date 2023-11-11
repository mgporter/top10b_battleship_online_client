import { useEffect, useRef, useState } from "react";
import { C } from "../../Constants";
import './opponentboard.css';
import { PacketType, battleStatsActions } from "../../enums";
import { createBoardCells, pingBoard, displayShipOnOpponentBoard } from "../logic/boardhelperfunctions";

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
  rightSideMenusTransitionStatus
}) {

  // const [opponentShipsSunk, setOpponentShipsSunk] = useState(0);
  const opponentboardRef = useRef(null);
  const boardOverlayRef = useRef(null);
  const pingRef = useRef(null);

  useEffect(() => {
    if (!attackResultPlayer) return;

    pingBoard(
      opponentboardRef,
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

      displayShipOnOpponentBoard(boardOverlayRef, attackResultPlayer);
      // window.addEventListener('resize', setImagePosition);
      setOpponentShipsSunk((prev) => prev + 1);
      dispatchBattleStats(battleStatsActions.incrementMyShotsHit);

    }

    return;

    // return () => {
    //   window.removeEventListener('resize', setImagePosition);
    // }

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

  function handleCellClick(e) {
    if (!isValidCell(e)) return;
    setReadyToAttackOpponent(false);
    sendPacket(PacketType.ATTACK, [Number(e.target.dataset.row), Number(e.target.dataset.column)]);
  }

  function isValidCell(e) {
    return Boolean(e.target.dataset.row);
  }

  return (
    <div className={`section-block opponent-board-container ${rightSideMenusTransitionStatus}`}>
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