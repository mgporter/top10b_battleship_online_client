import React from "react";

function GameRow({roomNumber, playerList, row}) {

  return (
    <li id={roomNumber} className="join-game-game-row">
      <p className="game-row">{row}</p>
      <p className="game-number">Game #{roomNumber}</p>
      {playerList.map((player) => (
        <p key={player.id} className="game-members">{player.name}</p>
      ))}
    </li>
  )

}

export default GameRow;