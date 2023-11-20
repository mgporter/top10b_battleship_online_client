import { useCallback, useContext, useEffect, useRef } from "react";
import { PlayerContext, PlayerIdContext, PlayerNameContext, SetPlayerIdContext } from "../../PlayerProvider";
import { ApplicationState, MessageTypes, PacketType } from "../../enums";
import { postGameRoom } from "./fetchdata";
import NameInput from "./NameInput";
import GameRoomList from "./GameRoomList";
import { endpoints } from "../../Endpoints";
import { SetAppStateContext } from "../../AppStateProvider";
import useSubscription from "../../useSubscription";
import useSocketSend from "../../useSocketSend";
import useWebSocketStatus from "../../useWebSocketStatus";

export default function RoomSelectionWindow({
  roomNumberRef, 
  gameRooms
}) {

  // console.log("RoomSelectionWindow")

  const {playerName, setPlayerName, playerId, setPlayerId} = useContext(PlayerContext);
  const setAppState = useContext(SetAppStateContext);
  const roomSelectionWindowRef = useRef(null);
  const sendPacket = useSocketSend();

  const onPrivateMsgReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);

    switch(message.type) {
      case MessageTypes.ACCEPTEDJOIN: {
        setAppState(ApplicationState.GAME_INITIALIZED);
        break;
      }

      /* These messages are sent from the server, but we will
      not do anything with them right now. The client already
      checks that the game is joinable and valid, so we should 
      only receive these messages if the client fails at this 
      somehow.  */
      
      case MessageTypes.REJECTEDJOIN_ALREADY_IN_GAME: {
        roomNumberRef.current = null;
        break;
      }

      case MessageTypes.REJECTEDJOIN_ROOM_FULL: {
        roomNumberRef.current = null;
        break;
      }

      case MessageTypes.REJECTEDJOIN_GAME_NOT_FOUND: {
        roomNumberRef.current = null;
        break;
      }
    }

  }, [setAppState]);

  useEffect(() => {
    roomSelectionWindowRef.current.classList.add('slidein');
  }, [])

  useSubscription("/user/queue/lobby", onPrivateMsgReceived, "lobbyPrivateMsg");

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