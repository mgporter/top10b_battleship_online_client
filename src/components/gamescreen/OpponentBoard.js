import { useEffect, useRef } from "react";
import { C } from "../../Constants";
import './opponentboard.css';
import { PacketType } from "../../enums";

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
  opponentShipsSunk, 
  readyToAttackOpponent, 
  sendPacket, 
  attackResultPlayer,
  setReadyToAttackOpponent
}) {

  const opponentboardElement = useRef(null);

  if (attackResultPlayer) {
    const targetCell = coordinateToDOMCell([attackResultPlayer.row, attackResultPlayer.col]);

    console.log(attackResultPlayer.type)

    if (attackResultPlayer.result === PacketType.ATTACK_MISSED) {
      targetCell.classList.add('miss');
    } else if (attackResultPlayer.result === PacketType.ATTACK_HITSHIP) {
      targetCell.classList.add('hit');
    } else if (attackResultPlayer.result === PacketType.ATTACK_SUNKSHIP) {
      targetCell.classList.add('hit');
    }
  }


  useEffect(() => {
    console.log("readytoattackopponent changed")
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

  function coordinateToDOMCell(cellCoordinates) {
    return opponentboardElement.current.querySelector(`.cell[data-row="${cellCoordinates[0]}"][data-column="${cellCoordinates[1]}"]`)
  };

  return (
    <div className="section-block opponent-board-container">
      <h2>Opponent:</h2>
      <p>Currently {opponentShipsSunk} of {C.totalShips} ships sunk</p>
      <div ref={opponentboardElement}
        className="miniboard disable-hover"
        onClick={handleCellClick}
      >
        {cells}
      <div className="ping-container"><div className="ping-ring"></div></div>
      </div>
    </div>
  )
}