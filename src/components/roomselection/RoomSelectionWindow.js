import { useCallback, useContext, useEffect, useRef } from "react";
import { PlayerContext, PlayerIdContext, PlayerNameContext, SetPlayerIdContext } from "../../PlayerProvider";
import { ApplicationState, MessageTypes } from "../../enums";
import { postGameRoom } from "./fetchdata";
import NameInput from "./NameInput";
import GameRoomList from "./GameRoomList";
import { endpoints } from "../../Endpoints";
import { SetAppStateContext } from "../../AppStateProvider";
import useSubscription from "../../useSubscription";
import useSocketSend from "../../useSocketSend";

export default function RoomSelectionWindow({
  roomNumberRef, 
  gameRooms
}) {

  const {playerName, setPlayerName, playerId, setPlayerId} = useContext(PlayerContext);
  const setAppState = useContext(SetAppStateContext);
  const roomSelectionWindowRef = useRef(null);
  const sendTo = useSocketSend();

  const onPrivateMsgReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);

    switch(message.type) {
      case MessageTypes.ACCEPTEDJOIN: {
        setAppState(ApplicationState.GAME_INITIALIZED);
        break;
      }

      case MessageTypes.CREDENTIALS: {
        setPlayerId(message.id);
        if (!playerName) setPlayerName(message.name);
        sendTo("/app/joinLobby", playerName);
        break;
      }
    }

  }, [sendTo, setAppState, playerName, setPlayerName, setPlayerId]);

  useEffect(() => {
    roomSelectionWindowRef.current.classList.add('slidein');
  }, [])

  const updateCallback = useSubscription("/user/queue/lobby", onPrivateMsgReceived, "lobbyPrivateMsg");

  useEffect(() => {
    updateCallback(onPrivateMsgReceived)
  }, [updateCallback, onPrivateMsgReceived])


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
    sendTo(endpoints.joinGame, {
      messageType: MessageTypes.JOINGAME,
      roomNumber: room});
  }, [sendTo])

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