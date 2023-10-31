import { PlayerType } from "../../enums";

export default function RoomPanel({roomNum, playerList, playersIDtoName, playerId}) {

  const currentPlayerMarker = "(You)";
  const observers = playerList.observerList;
  const idToName = playersIDtoName.current;

  return (
    <div className="room-panel">
      <h1>BATTLESHIP!</h1>
      <h2>Room#: {roomNum}</h2>
      <p>Currently in room:</p>
      <ul>
        <li>Player 1: {playerList.playerOne ? idToName[playerList.playerOne] : "Waiting for another player..."} {playerList.playerOne === playerId && currentPlayerMarker}</li>
        <li>Player 2: {playerList.playerTwo ? idToName[playerList.playerTwo] : "Waiting for another player..."} {playerList.playerTwo === playerId && currentPlayerMarker}</li>
        {observers.length > 0 && observers.map((player, i) => (
          <li key={i}>observer: {idToName[player]} {player === playerId && currentPlayerMarker}</li>
        ))}
      </ul>
    </div>
  )
}