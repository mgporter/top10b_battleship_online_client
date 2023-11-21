import swordsImg from "../../images/swords_crossed.svg";
import { memo } from "react";

const GameRow = memo(function GameRow({roomNumber, playerList, row, onClick, idx}) {

  // const playerString = playerList.reduce((s, player, i) => {
  //   if (i != 0) return s + ", " + player.name
  //   else return s + <span className="test">player.name</span>;
  // }, "");

  const players = playerList.map((player, i) => {
    return <span key={i}>{i > 0 && ", "}<span className={player.loading ? "game-member-loading" : ""}>{player.name}</span></span>
  })

  const atLeastTwoPlayers = playerList.length >= 2;

  return (
    <li onClick={onClick} id={idx} className="join-game-game-row">
      <p className="game-row">{row}</p>
      <p className="game-number">Game #{roomNumber}</p>
      {atLeastTwoPlayers && <img src={swordsImg} className="game-in-progress-img"/>}
      <p className="game-members">{players}</p>
    </li>
  )

});

export default GameRow;