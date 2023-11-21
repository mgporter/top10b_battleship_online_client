import { useCallback, useContext, useEffect, useRef } from "react";
import { PlayerContext } from "../../PlayerProvider";
import { MessageTypes } from "../../enums";
import { postGameRoom } from "./lobbyhelperfunctions";
import NameInput from "./NameInput";
import GameRoomList from "./GameRoomList";
import useSocketSend from "../../useSocketSend";

export default function RoomSelectionWindow({
  roomNumberRef, 
  gameRooms
}) {

  const {playerName, playerId } = useContext(PlayerContext);
  const roomSelectionWindowRef = useRef(null);
  const sendPacket = useSocketSend();

  useEffect(() => {
    roomSelectionWindowRef.current.classList.add('slidein');
  }, [])


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

  const joinGame = useCallback((room) => {
    roomNumberRef.current = room;

    // Attempt to join the room. The server will respond 
    // with an ACCEPTEDJOIN or REJECTEDJOIN
    sendPacket(MessageTypes.JOINGAME, {
      messageType: MessageTypes.JOINGAME,
      roomNumber: room});
  }, [sendPacket, roomNumberRef])

  return (
    <div id="room-selection-container" ref={roomSelectionWindowRef}>
      <h2>Create or join a game</h2>
      <NameInput />
      <button className="create-game-button button" onClick={createGameHandler} type="button">Create a game</button>
      <hr />
      <GameRoomList 
        joinGame={joinGame}
        gameRooms={gameRooms} />
    </div>
  )
}