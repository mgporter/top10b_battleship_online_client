import { useState, useEffect, useContext, useCallback } from "react";
import './roomselectioncontainer.css'
import MessageWindow from "./MessageWindow";
import { LobbyColors, MessageTypes, PacketType } from '../../enums';
import { PlayerContext } from "../../PlayerProvider";
import { parseLobbyMessage } from "./fetchdata";
import RoomSelectionWindow from "./RoomSelectionWindow";
import useSubscription from "../../useSubscription";
import useFetch from "../../useFetch";
import { endpoints } from "../../Endpoints";
import githubLogo from "../../images/github-logo.png"
import { C } from "../../Constants";
import useWebSocketStatus from "../../useWebSocketStatus";
import useSocketSend from "../../useSocketSend";

export default function RoomSelectionContainer({roomNumberRef}) {

  console.log("RoomSelectionContainer")

  const [messages, setMessages] = useState([{
    message: "Welcome to Battleship Online!",
    color: LobbyColors.emphasis,
  }]);

  const [lobbyLoaded, setLobbyLoaded] = useState(false);
  const {playerName, playerId} = useContext(PlayerContext);
  const [requestGameRooms, updateGameRooms, gameRooms] = useFetch(endpoints.getGameRooms);
  const wsStatus = useWebSocketStatus();
  const sendPacket = useSocketSend();

  useEffect(() => {
    requestGameRooms();
  }, [requestGameRooms])

  const onPublicMessageReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);

    const lobbyMessage = parseLobbyMessage(message, playerId, playerName);
    setMessages((prev) => [...prev, lobbyMessage]);

    switch(message.type) {

      case MessageTypes.CREATEDGAME: {
        const newGame = {
          roomNumber: message.roomNumber,
          playerList: []
        }
        updateGameRooms((prev) => [newGame, ...prev]);
        break;
      }

      case MessageTypes.JOINGAME: {
        const roomNumber = message.roomNumber;
        const updateGameRoomsOnJoin = (room) => {
          if (room.roomNumber === roomNumber) {
            const num = room.roomNumber;
            const list = [...room.playerList, {id: message.sender.id, name: message.sender.name}];
            return {roomNumber: num, playerList: list};
          } else {
            return room;
          } 
        };
        updateGameRooms((prev) => prev.map(updateGameRoomsOnJoin));
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
        updateGameRooms((prev) => prev.map(updateGameRoomsOnExit));
        break;
      }

      case MessageTypes.GAMEREMOVED: {
        const roomNumber = message.roomNumber;
        const updateGameRoomsOnRemove = (room) => {
            return room.roomNumber != roomNumber;
          } 
        updateGameRooms((prev) => prev.filter(updateGameRoomsOnRemove));
        break;
      }
    }
  }, [updateGameRooms, playerId, playerName])

  useSubscription("/lobby", onPublicMessageReceived, "lobby");
  
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
      <MessageWindow messages={messages} />
      <RoomSelectionWindow
        roomNumberRef={roomNumberRef}
        gameRooms={gameRooms}
      />
    </div>
  );

}