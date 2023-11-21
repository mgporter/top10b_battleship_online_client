import { useCallback, useContext, useEffect, useRef } from "react";
import { C } from "../../Constants";
import './opponentboard.css';
import { Events, PacketType, battleStatsActions, inGameMessages, shipStatsActions } from "../../enums";
import { displayShipOnOpponentBoard, handleAttackResult, coordinateToDOMCell } from "../logic/boardhelperfunctions";
import { setInGameMessagesContext } from "../../InGameMessageProvider";
import EventEmitter from "../../EventEmitter";

/* Create the board cells once on load */
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
  setReadyToAttackOpponent,
  dispatchBattleStats,
  shipStats,
  dispatchShipStats,
  showOpponentPanels
}) {

  const opponentboardRef = useRef(null);
  const boardOverlayRef = useRef(null);
  const pingRef = useRef(null);
  const opponentPanelRef = useRef(null);
  const currentAttackResult = useRef(null);
  const setInGameMessages = useContext(setInGameMessagesContext);


  useEffect(() => {
    if (showOpponentPanels)
      opponentPanelRef.current.classList.add('slidein');
  }, [showOpponentPanels])

  useEffect(() => {
    if (readyToAttackOpponent) {
      opponentboardRef.current.classList.add("boardflash");
      opponentboardRef.current.classList.remove("disable-hover");
    } else {
      opponentboardRef.current.classList.remove("boardflash");
      opponentboardRef.current.classList.add("disable-hover");
    }
  }, [readyToAttackOpponent])


  const handleMiss = useCallback((targetCell, loadingData = false) => {
    targetCell.classList.add("miss");
    dispatchBattleStats(battleStatsActions.incrementMyShotsFired);
    if (loadingData === false) setInGameMessages(inGameMessages.ATTACKMISSED);
  }, [dispatchBattleStats, setInGameMessages]);

  const handleHit = useCallback((targetCell, loadingData = false) => {
    targetCell.classList.add("hit");
    dispatchBattleStats(battleStatsActions.incrementMyShotsHit);
    if (loadingData === false) setInGameMessages(inGameMessages.ATTACKHITSHIP, currentAttackResult.current.shipType);
  }, [dispatchBattleStats, setInGameMessages]);

  const handleSink = useCallback((targetCell, loadingData = false) => {
    targetCell.classList.add("hit");
    dispatchBattleStats(battleStatsActions.incrementMyShotsHit);
    if (loadingData === false) {
      dispatchShipStats({type: shipStatsActions.INCREMENTOPPONENTSHIPSUNK})
      setInGameMessages(inGameMessages.ATTACKSUNKSHIP, currentAttackResult.current.shipType);
      displayShipOnOpponentBoard(boardOverlayRef, currentAttackResult.current);
    }
  }, [dispatchBattleStats, dispatchShipStats, setInGameMessages]);

  const loadGameData = useCallback((data) => {
    const opponentSunkShips = data.opponentSunkShips;
    const myAttacks = data.myAttacks;

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

    dispatchShipStats({type: shipStatsActions.SETOPPONENTSHIPSUNK, data: opponentSunkShips.length})
    
  }, [dispatchShipStats, handleHit, handleMiss, handleSink])


  useEffect(() => {
    EventEmitter.subscribe(Events.MYATTACKRESULTSRECEIVED, "OppoBoard", (attackPacket) => {
      currentAttackResult.current = attackPacket;
      handleAttackResult(
        opponentboardRef,
        pingRef,
        attackPacket,
        handleMiss,
        handleHit,
        handleSink
      );
    });
    return () => {
      EventEmitter.unsubscribe(Events.MYATTACKRESULTSRECEIVED, "OppoBoard");
    }
  }, [handleMiss, handleHit, handleSink])

  useEffect(() => {
    EventEmitter.subscribe(Events.LOADSAVEDGAME, "OppoBoard", loadGameData);
    return () => {
      EventEmitter.unsubscribe(Events.LOADSAVEDGAME, "OppoBoard");
    }
  }, [loadGameData])



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
      <p>Currently {shipStats.opponentShipsSunk} of {C.totalShips} ships sunk</p>
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