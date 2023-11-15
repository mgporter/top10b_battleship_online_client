import { useCallback, useContext, useEffect, useRef } from "react";
import { PlayerIdContext, PlayerNameContext } from "../../PlayerProvider";
import { MessageTypes } from "../../enums";
import { postGameRoom } from "./fetchdata";
import NameInput from "./NameInput";
import GameRoomList from "./GameRoomList";
import useSocketSend from "../../useSocketSend";
import { endpoints } from "../../Endpoints";

export default function RoomSelectionWindow({
  roomNumberRef, 
  getGameRooms
}) {

  const playerName = useContext(PlayerNameContext);
  const playerId = useContext(PlayerIdContext);
  const socketSend = useSocketSend();
  const roomSelectionWindowRef = useRef(null);

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

    // Attempt to join the room. The server will respond with an ACCEPTEDJOIN or REJECTEDJOIN
    socketSend.send(endpoints.joinGame, {
      messageType: MessageTypes.JOINGAME,
      roomNumber: room});
  }, [socketSend])

  return (
    <div id="room-selection-container" ref={roomSelectionWindowRef}>
      <h2>Create or join a game</h2>
      <NameInput />
      <button className="create-game-button button" onClick={createGameHandler} type="button">Create a game</button>
      <hr />
      <GameRoomList 
        joinGame={joinGame}
        getGameRooms={getGameRooms} />
    </div>
  )
}