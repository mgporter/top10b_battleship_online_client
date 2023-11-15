import { useContext, useEffect, useRef, useState } from "react";
import { C } from "../../Constants";
import './opponentboard.css';
import { PacketType, battleStatsActions, inGameMessages } from "../../enums";
import { displayShipOnOpponentBoard, handleAttackResult } from "../logic/boardhelperfunctions";
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
  setOpponentShipsSunk
}) {

  // const [opponentShipsSunk, setOpponentShipsSunk] = useState(0);
  const opponentboardRef = useRef(null);
  const boardOverlayRef = useRef(null);
  const pingRef = useRef(null);
  const opponentPanelRef = useRef(null);

  const setInGameMessages = useContext(setInGameMessagesContext);

  useEffect(() => {
    opponentPanelRef.current.classList.add('slidein');
  }, [])

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


  function handleMiss() {
    dispatchBattleStats(battleStatsActions.incrementMyShotsFired);
    setInGameMessages(inGameMessages.ATTACKMISSED);
  }

  function handleHit() {
    dispatchBattleStats(battleStatsActions.incrementMyShotsHit);
    setInGameMessages(inGameMessages.ATTACKHITSHIP, attackResultPlayer.shipType);
  }

  function handleSink() {
    displayShipOnOpponentBoard(boardOverlayRef, attackResultPlayer);
    setOpponentShipsSunk((prev) => prev + 1);
    dispatchBattleStats(battleStatsActions.incrementMyShotsHit);
    setInGameMessages(inGameMessages.ATTACKSUNKSHIP, attackResultPlayer.shipType);
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