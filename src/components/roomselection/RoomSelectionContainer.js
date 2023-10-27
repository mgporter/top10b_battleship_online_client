import { useState, useEffect, useContext } from "react";
import '../../css/roomselection.css'
import GameRow from "./GameRow";
import MessageWindow from "../../MessageWindow";
import { ApplicationState, connectionStatus, LobbyColors, MessageTypes } from '../../enums';
import { PlayerIdContext, PlayerNameContext, SetPlayerNameContext } from "../../PlayerProvider";
import { SocketContext, wsStatusContext } from "../../SocketProvider";
import { parseLobbyMessage, getGameRoomList, postGameRoom } from "./fetchdata";
import JoinGameDialog from "./JoinGameDialog";


export default function RoomSelectionContainer({appState, setAppState}) {

  // set useStates
  const [gameRooms, setGameRooms] = useState([]);
  const [messages, setMessages] = useState([{
    message: "Welcome to Battleship Online!",
    color: LobbyColors.emphasis,
  }]);
  const [showJoinGameDialog, setShowJoinGameDialog] = useState({show: false});

  // load contexts
  const playerName = useContext(PlayerNameContext);
  const playerId = useContext(PlayerIdContext);
  const setPlayerName = useContext(SetPlayerNameContext);
  const socket = useContext(SocketContext);
  const wsStatus = useContext(wsStatusContext);

  // Do this on mount
  useEffect(() => {
    updateGameRooms();
  }, []);  

  useEffect(() => {
    let subscriptionObj = null;
    if (wsStatus === connectionStatus.OPEN) {
      console.log("subscribing to /lobby and sending join message")
      subscriptionObj = socket.subscribe("/lobby", onMessageReceived);
      socket.send("/app/joinLobby", {}, JSON.stringify({sender: {id: playerId, name: playerName}, messageType: MessageTypes.JOINLOBBY}));
    }
    return (subscriptionObj) => {
      if (subscriptionObj) {
        socket.unsubscribe(subscriptionObj.id);
      }
    }
  }, [wsStatus]);


  function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);
    console.log("onMessageReceived called")

    if (message.messageType === MessageTypes.CREATEDGAME) {
      const newGame = {
        roomNumber: message.game.roomNumber,
        playerList: message.game.playerList,
      }
      setGameRooms((prev) => [newGame].concat(prev));
    }
    
    if (message.messageType === MessageTypes.JOINGAME) {
      const roomNumber = message.game.roomNumber;

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
    }

    const lobbyMessage = parseLobbyMessage(message, playerId, playerName);
    setMessages((prev) => prev.concat([lobbyMessage]));
  }

  function updateGameRooms() {
    getGameRoomList().then((data) => {
      setGameRooms(data);
    })
  }

  function createGameHandler() {
    const player = {
      playerName: playerName,
      id: playerId,
    }
    postGameRoom(player);
  }

  function updateNameOnServer() {
    socket.send("/app/changeName", {}, playerName);
  }

  function handleGameSelection(gameroom) {
    const gameNumber = gameroom.roomNumber;
    const players = gameroom.playerList.map(player => player.name);
    setShowJoinGameDialog({
      show: true,
      room: gameNumber,
      players: players,
    });
  }

  function joinGame(room) {
    setShowJoinGameDialog({show: false});
    socket.send("/app/joinGame", {}, JSON.stringify({
      sender: {id: playerId, name: playerName}, 
      messageType: MessageTypes.JOINGAME,
      game: {roomNumber: room}}));
    setAppState(ApplicationState.SHIP_PLACEMENT);
  }
  
  const gameRoomList = gameRooms.map((gameroom, i) => {
    return <GameRow onClick={() => handleGameSelection(gameroom)} key={gameroom.roomNumber} {...gameroom} row={i + 1} />
  });

  return (
    <div id="lobby-container">
      {showJoinGameDialog.show && <JoinGameDialog {...showJoinGameDialog} 
        setShowJoinGameDialog={setShowJoinGameDialog}
        joinGame={joinGame}>
          </JoinGameDialog>}
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
            onChange={(e) => setPlayerName(e.target.value)}
            onBlur={updateNameOnServer}></textarea>
        </div>
        <button onClick={createGameHandler} type="button">Create a game</button>
        <hr />
        <ul id="join-game-box">{gameRoomList}</ul>
      </div>
    </div>
  );

}