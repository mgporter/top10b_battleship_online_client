import { useState, useEffect, useContext } from "react";
import '../../css/roomselection.css'
import GameRow from "./GameRow";
import MessageWindow from "../../MessageWindow";
import { connectionStatus, MessageTypes } from '../../enums';
import { PlayerIdContext, PlayerNameContext, SetPlayerNameContext } from "../../PlayerProvider";
import { SocketContext, wsStatusContext } from "../../SocketProvider";

const colors = {
  playerJoin: "green",
  playerLeave: "red",
  emphasis: "yellow",
  standard: "white",
}

function RoomSelectionContainer() {

  // set useStates
  const [gameRooms, setGameRooms] = useState([]);
  const [messages, setMessages] = useState([{
    message: "Welcome to Battleship Online!",
    color: colors.emphasis,
  }]);

  // load contexts
  const playerName = useContext(PlayerNameContext);
  const playerId = useContext(PlayerIdContext);
  const setPlayerName = useContext(SetPlayerNameContext);
  const socket = useContext(SocketContext);
  const wsStatus = useContext(wsStatusContext);

  // console.log(socket);
  // console.log(socket.ws.readyState);
  // console.log(playerName);

  // Do this on mount
  useEffect(() => {
    updateGameRooms();
  }, []);  

  useEffect(() => {
    let subscriptionObj = null;
    if (wsStatus === connectionStatus.OPEN) {
      console.log("subscribing to /lobby and sending join message")
      subscriptionObj = socket.subscribe("/lobby", onMessageReceived);
      socket.send("/app/joinLobby", {}, JSON.stringify({sender: {id: playerId, name: playerName}, messageType: 'JOINLOBBY'}));
    }
    return (subscriptionObj) => {
      if (subscriptionObj) {
        socket.unsubscribe(subscriptionObj.id);
      }
    }
  }, [wsStatus]);



  function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);
    let lobbyMessage;

    switch (message.messageType) {

      case MessageTypes.JOINLOBBY: {
        if (message.sender.id === playerId) {
          lobbyMessage = {
            message: `You have joined the lobby!`,
            color: colors.playerJoin,
          }
        } else {
          lobbyMessage = {
            message: `${message.sender.name} has joined the lobby!`,
            color: colors.playerJoin,
          }
        }
        break;
      }

      case MessageTypes.CREATEDGAME: {
        lobbyMessage = {
          message: `${message.sender.name} has created a new game.`,
          color: colors.standard,
        }
        updateGameRooms();
        break;
      }
    }

    setMessages((prev) => prev.concat([lobbyMessage]));
    
  }

  function updateGameRooms() {
    getGameRoomList().then((data) => {
      setGameRooms(data);
    })
  }

  async function getGameRoomList() {
    let data;
    let dataArr;
    let response;

    try {
      response = await fetch("http://localhost:8080/gamerooms");
      data = await response.json();
      dataArr = Object.values(data);
    } catch(e) {
      console.log(e);
    }

    return dataArr;
  }

  const gameRoomList = gameRooms.map((gameroom, i) => {
    return <GameRow key={gameroom.roomNumber} {...gameroom} row={i + 1} />
  });

  function createGameHandler() {
    console.log(playerName)
    const player = {
      playerName: playerName,
      id: playerId,
    }

    postGameRoom(player).then(() => {
      updateGameRooms();
    });

  }

  async function postGameRoom(playerObj) {
    let response;
    const data = JSON.stringify(playerObj);

    try {
      response = await fetch("http://localhost:8080/gamerooms", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: data,
      });
    } catch(e) {
      console.log(e);
    }

    return response.json();
  }


  return (
    <div id="lobby-container">
      <MessageWindow messages={messages} />
      <div id="room-selection-container">
        <h2>Create or join a game</h2>
        <div id="room-selection-name-box">
          <p>My name:</p>
          <textarea spellCheck="false" 
            rows="1" 
            id="player-name-input" 
            placeholder="Battleship Player" 
            maxLength="24" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}></textarea>
        </div>
        <button onClick={createGameHandler} type="button">Create a game</button>
        <hr />
        <ul id="join-game-box">{gameRoomList}</ul>
      </div>
    </div>
  );

}

export default RoomSelectionContainer;