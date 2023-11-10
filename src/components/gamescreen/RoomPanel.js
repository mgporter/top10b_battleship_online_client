import { PlayerType } from "../../enums";
import './roompanel.css';

export default function RoomPanel({roomNum, playerList, playersIDtoName, playerId}) {

  const currentPlayerMarker = "(You)";
  const observers = playerList.observerList;
  const idToName = playersIDtoName.current;

  console.log(playerList.playerOne)
  console.log(playerId)

  return (
    <div className="section-block room-panel">
      <h1 className="game-title">BATTLESHIP!</h1>
      <h2 className="room-num">Room#: {roomNum}</h2>
      <ul className="room-list">
        <li>Player 1: {playerList.playerOne ? idToName[playerList.playerOne] : "Waiting for another player..."} {playerList.playerOne === playerId && currentPlayerMarker}</li>
        <li>Player 2: {playerList.playerTwo ? idToName[playerList.playerTwo] : "Waiting for another player..."} {playerList.playerTwo === playerId && currentPlayerMarker}</li>
        {observers.length > 0 && observers.map((player, i) => (
          <li key={i}>observer: {idToName[player]} {player === playerId && currentPlayerMarker}</li>
        ))}
      </ul>
    </div>
  )
}