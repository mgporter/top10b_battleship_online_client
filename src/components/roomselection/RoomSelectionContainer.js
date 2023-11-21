import { useState, useEffect, useContext, useCallback } from "react";
import './roomselectioncontainer.css'
import MessageWindow from "./MessageWindow";
import { ApplicationState, LobbyColors, MessageTypes } from '../../enums';
import { PlayerContext } from "../../PlayerProvider";
import { parseLobbyMessage } from "./lobbyhelperfunctions";
import RoomSelectionWindow from "./RoomSelectionWindow";
import useSubscription from "../../useSubscription";
import githubLogo from "../../images/github-logo.png"
import { C } from "../../Constants";
import useSocketSend from "../../useSocketSend";
import { SetAppStateContext } from "../../AppStateProvider";

export default function RoomSelectionContainer({roomNumberRef}) {

  const [messages, setMessages] = useState([{
    message: "Welcome to Battleship Online!",
    color: LobbyColors.emphasis,
  }]);

  const setAppState = useContext(SetAppStateContext);
  const { playerId } = useContext(PlayerContext);
  const [gameRooms, setGameRooms] = useState(null);
  const sendPacket = useSocketSend();


  const onPublicMessageReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);

    const lobbyMessage = parseLobbyMessage(message, playerId);
    setMessages((prev) => [...prev, lobbyMessage]);

    if (!gameRooms) return;

    switch(message.type) {

      case MessageTypes.CREATEDGAME: {
        const newGame = {
          roomNumber: message.roomNumber,
          playerList: [{name: message.sender.name, id: message.sender.id, loading: true}]
        }
        setGameRooms((prev) => [...prev, newGame]);
        break;
      }

      case MessageTypes.JOINGAME: {
        const updateGameRoomsOnJoin = (room) => {
          if (room.roomNumber === message.roomNumber) {
            const newList = room.playerList.filter(player => player.id != message.sender.id);
            const list = [...newList, {id: message.sender.id, name: message.sender.name}];
            return {roomNumber: room.roomNumber, playerList: list};
          } else {
            return room;
          } 
        };
        setGameRooms((prev) => prev.map(updateGameRoomsOnJoin));
        break;
      }

      case MessageTypes.EXITEDGAME: {
        const roomNumber = message.roomNumber;
        const updateGameRoomsOnExit = (room) => {
          if (room.roomNumber === roomNumber) {
            const num = room.roomNumber;
            const list = room.playerList.filter(player => player.id != message.sender.id);
            return {roomNumber: num, playerList: list};
          } else {
            return room;
          } 
        };
        setGameRooms((prev) => prev.map(updateGameRoomsOnExit));
        break;
      }

      case MessageTypes.GAMEREMOVED: {
        const roomNumber = message.roomNumber;
        const updateGameRoomsOnRemove = (room) => {
            return room.roomNumber != roomNumber;
          } 
        setGameRooms((prev) => prev.filter(updateGameRoomsOnRemove));
        break;
      }
    }
  }, [playerId, gameRooms])

  useSubscription("/lobby", onPublicMessageReceived, "lobby");
  

  const onPrivateMsgReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);

    switch(message.type) {

      case MessageTypes.GAMEROOMLIST: {
        setGameRooms(message.gameRoomList);
        break;
      }

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
        break;
      }

      case MessageTypes.REJECTEDJOIN_ROOM_FULL: {
        break;
      }

      case MessageTypes.REJECTEDJOIN_GAME_NOT_FOUND: {
        break;
      }
    }

  }, [setAppState]);

  useSubscription("/user/queue/lobby", onPrivateMsgReceived, "lobbyPrivateMsg");

  /* Subscribe to the lobby on mount, or when the socket opens. */
  useEffect(() => {
    sendPacket(MessageTypes.JOINLOBBY);
  }, [sendPacket]);

  
  return (
    <div id="lobby-container">
      <div className="logo-title">
        <h1>BATTLESHIP!</h1>
        <h2>online</h2>
        <div className='link-container'>
          <a href={C.githubLink} target="_blank" rel="noreferrer" className="created-by-container">
            <img src={githubLogo} alt="Source code hosted on GitHub" />
            <span>Created by mgporter</span>
          </a>
        </div>
      </div>
      <MessageWindow messages={messages} setMessages={setMessages} />
      <RoomSelectionWindow
        roomNumberRef={roomNumberRef}
        gameRooms={gameRooms}
      />
    </div>
  );

}