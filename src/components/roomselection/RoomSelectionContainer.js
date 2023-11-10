import { useState, useEffect, useContext } from "react";
import './roomselectioncontainer.css'
import MessageWindow from "./MessageWindow";
import { ApplicationState, connectionStatus, LobbyColors, MessageTypes } from '../../enums';
import { PlayerIdContext, PlayerNameContext, SetPlayerIdContext, SetPlayerNameContext } from "../../PlayerProvider";
import { parseLobbyMessage, getGameRoomList, postGameRoom } from "./fetchdata";
import { SetAppStateContext } from "../../AppStateProvider";
import RoomSelectionWindow from "./RoomSelectionWindow";
import useSubscription from "../../useSubscription";
import useSocketSend from "../../useSocketSend";

export default function RoomSelectionContainer({roomNumberRef, updateNameOnServer}) {

  const [gameRooms, setGameRooms] = useState([]);
  const [messages, setMessages] = useState([{
    message: "Welcome to Battleship Online!",
    color: LobbyColors.emphasis,
  }]);

  const playerName = useContext(PlayerNameContext);
  const playerId = useContext(PlayerIdContext);

  const socketSend = useSocketSend();

  const publicLobbySub = useSubscription("/lobby", onPublicMessageReceived);

  useEffect(() => {
    if (publicLobbySub) socketSend.send("/app/joinLobby", playerName);
  }, [publicLobbySub])


  function onPublicMessageReceived(payload) {
    const message = JSON.parse(payload.body);

    const lobbyMessage = parseLobbyMessage(message, playerId, playerName);
    setMessages((prev) => prev.concat([lobbyMessage]));

    switch(message.messageType) {

      case MessageTypes.CREATEDGAME: {
        const newGame = {
          roomNumber: message.roomNumber,
          playerList: []
        }
        setGameRooms((prev) => [newGame].concat(prev));
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
  }






  return (
    <div id="lobby-container">
      <MessageWindow messages={messages} />
      <RoomSelectionWindow 
        updateNameOnServer={updateNameOnServer}
        roomNumberRef={roomNumberRef}
        gameRooms={gameRooms}
        setGameRooms={setGameRooms}
      />
    </div>
  );

}