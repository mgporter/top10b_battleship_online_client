import { useContext } from "react";
import { PlayerIdContext, PlayerNameContext } from "../../PlayerProvider";
import { MessageTypes } from "../../enums";
import { postGameRoom } from "./fetchdata";
import NameInput from "./NameInput";
import GameRoomList from "./GameRoomList";
import useSocketSend from "../../useSocketSend";

export default function RoomSelectionWindow({
  updateNameOnServer, 
  roomNumberRef, 
  gameRooms, 
  setGameRooms,
  transitionStatus
}) {

  const playerName = useContext(PlayerNameContext);
  const playerId = useContext(PlayerIdContext);
  const socketSend = useSocketSend();

  function createGameHandler() {
    const player = {
      playerName: playerName,
      id: playerId,
    }

    // Tell the server about our game and add it to the database
    postGameRoom(player).then((data) => {
      // Join the game after the server creates it
      joinGame(data.roomNumber);
    }).catch((e) => {
      console.log(e);
    });

  }

  function joinGame(room) {
    roomNumberRef.current = room;

    // Attempt to join the room. The server will respond with an ACCEPTEDJOIN or REJECTEDJOIN
    socketSend.send("/app/joinGame", {
      messageType: MessageTypes.JOINGAME,
      roomNumber: room});
  }


  return (
    <div id="room-selection-container" className={`${transitionStatus}`}>
      <h2>Create or join a game</h2>
      <NameInput updateNameOnServer={updateNameOnServer} />
      <button className="create-game-button button" onClick={createGameHandler} type="button">Create a game</button>
      <hr />
      <GameRoomList 
        joinGame={joinGame}
        gameRooms={gameRooms}
        setGameRooms={setGameRooms} />
    </div>
  )
}