function GameRow({roomNumber, playerList, row, onClick}) {

  const playerString = playerList.reduce((s, player, i) => {
    if (i != 0) return s + ", " + player.name
    else return s + player.name;
  }, "");

  return (
    <li onClick={onClick} id={roomNumber} className="join-game-game-row">
      <p className="game-row">{row}</p>
      <p className="game-number">Game #{roomNumber}</p>
      <p className="game-members">{playerString}</p>
    </li>
  )

}

export default GameRow;