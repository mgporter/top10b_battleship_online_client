import { useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import './roomselectioncontainer.css'
import MessageWindow from "./MessageWindow";
import { LobbyColors, MessageTypes } from '../../enums';
import { PlayerIdContext, PlayerNameContext } from "../../PlayerProvider";
import { parseLobbyMessage } from "./fetchdata";
import RoomSelectionWindow from "./RoomSelectionWindow";
import useSubscription from "../../useSubscription";
import useSocketSend from "../../useSocketSend";
import useFetch from "../../useFetch";
import { endpoints } from "../../Endpoints";
import githubLogo from "../../images/github-logo.png"
import { C } from "../../Constants";

export default function RoomSelectionContainer({roomNumberRef}) {

  console.log("ROOM SELECTION CONTAINER RENDERED")

  const [messages, setMessages] = useState([{
    message: "Welcome to Battleship Online!",
    color: LobbyColors.emphasis,
  }]);

  const playerName = useContext(PlayerNameContext);
  const playerId = useContext(PlayerIdContext);

  const socketSend = useSocketSend();

  const getGameRooms = useFetch(endpoints.getGameRooms);

  

  useEffect(() => {
    getGameRooms.request();
  }, [])




  const onPublicMessageReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);

    const lobbyMessage = parseLobbyMessage(message, playerId, playerName);
    setMessages((prev) => prev.concat([lobbyMessage]));

    switch(message.type) {

      case MessageTypes.CREATEDGAME: {
        const newGame = {
          roomNumber: message.roomNumber,
          playerList: []
        }
        getGameRooms.updateData((prev) => [newGame].concat(prev));
        break;
      }

      case MessageTypes.JOINGAME: {
        const roomNumber = message.roomNumber;
        console.log(message);

        const updateGameRoomsOnJoin = (room) => {
          if (room.roomNumber === roomNumber) {
            const num = room.roomNumber;
            const list = [...room.playerList, {id: message.sender.id, name: message.sender.name}];
            return {roomNumber: num, playerList: list};
          } else {
            return room;
          } 
        };
        getGameRooms.updateData((prev) => prev.map(updateGameRoomsOnJoin));
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
        getGameRooms.updateData((prev) => prev.map(updateGameRoomsOnExit));
        break;
      }

      case MessageTypes.GAMEREMOVED: {
        const roomNumber = message.roomNumber;

        const updateGameRoomsOnRemove = (room) => {
            return room.roomNumber != roomNumber;
          } 
  
        getGameRooms.updateData((prev) => prev.filter(updateGameRoomsOnRemove));
        break;
      }
    }
  }, [getGameRooms])

  const publicLobbySub = useSubscription("/lobby", onPublicMessageReceived, "lobby");

  useEffect(() => {
    if (publicLobbySub) socketSend.send("/app/joinLobby", playerName);
  }, [publicLobbySub])


  return (
    <div id="lobby-container">
      <div className="logo-title">
        <h1>BATTLESHIP!ER</h1>
        <h2>online</h2>
        <div className='link-container'>
          <a href={C.githubLink} target="_blank" className="created-by-container">
            <img src={githubLogo} alt="Source code hosted on GitHub" />
            <span>Created by mgporter</span>
          </a>
        </div>
      </div>
      <MessageWindow messages={messages} />
      <RoomSelectionWindow
        roomNumberRef={roomNumberRef}
        getGameRooms={getGameRooms}
      />
    </div>
  );

}