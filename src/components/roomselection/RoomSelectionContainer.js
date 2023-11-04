import { useState, useEffect, useContext } from "react";
import './roomselection.css'
import GameRow from "./GameRow";
import MessageWindow from "../MessageWindow";
import { ApplicationState, connectionStatus, LobbyColors, MessageTypes } from '../../enums';
import { PlayerIdContext, PlayerNameContext, SetPlayerNameContext } from "../../PlayerProvider";
import { SocketContext, wsStatusContext } from "../../SocketProvider";
import { parseLobbyMessage, getGameRoomList, postGameRoom } from "./fetchdata";
import JoinGameDialog from "./JoinGameDialog";
import { SetAppStateContext } from "../../AppStateProvider";


export default function RoomSelectionContainer({setRoomNum}) {

  // set useStates
  const [gameRooms, setGameRooms] = useState([]);
  const [messages, setMessages] = useState([{
    message: "Welcome to Battleship Online!",
    color: LobbyColors.emphasis,
  }]);
  const [showJoinGameDialog, setShowJoinGameDialog] = useState({show: false});
  const [errorFetchingGamerooms, setErrorFetchingGamerooms] = useState(false);

  // load contexts
  const playerName = useContext(PlayerNameContext);
  const playerId = useContext(PlayerIdContext);
  const setPlayerName = useContext(SetPlayerNameContext);
  const socket = useContext(SocketContext);
  const wsStatus = useContext(wsStatusContext);
  const setAppState = useContext(SetAppStateContext);

  // Do this on mount
  useEffect(() => {

    /* Need to add abort signal in cleanup function */

    getGameRoomList().then((data) => {
      // If the HttpStatus code is 400 or greater, then we had a server error, and should not set the data
      if (data && data.length >= 2 && data[1] >= 400) setErrorFetchingGamerooms(true);
      else if (data) setGameRooms(data);
    })
  }, []);  

  useEffect(() => {
    if (wsStatus !== connectionStatus.OPEN) return
    console.log("subscribing to /lobby and sending join message")
    const subscription = socket.subscribe("/lobby", onMessageReceived);
    socket.send("/app/joinLobby", {}, JSON.stringify({sender: {id: playerId, name: playerName}, messageType: MessageTypes.JOINLOBBY}));
    
    return () => {
      if (subscription) subscription.unsubscribe();
    }
  }, [wsStatus]);


  function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);

    if (message.messageType === MessageTypes.CREATEDGAME) {
      const newGame = {
        roomNumber: message.roomNumber,
        playerList: []
      }
      setGameRooms((prev) => [newGame].concat(prev));
    }
    
    if (message.messageType === MessageTypes.JOINGAME) {
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
      setGameRooms((prev) => prev.map(updateGameRoomsOnJoin));
    }

    if (message.messageType === MessageTypes.EXITEDGAME) {
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
    }

    if (message.messageType === MessageTypes.GAMEREMOVED) {
      const roomNumber = message.roomNumber;

      const updateGameRoomsOnRemove = (room) => {
          return room.roomNumber != roomNumber;
        } 

      setGameRooms((prev) => prev.filter(updateGameRoomsOnRemove));
    };

    const lobbyMessage = parseLobbyMessage(message, playerId, playerName);
    setMessages((prev) => prev.concat([lobbyMessage]));
  }

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
      connecting: false,
    });
  }

  function joinGame(room) {

    // Send message to tell the server that the player has joined the room
    socket.send("/app/joinGame", {}, JSON.stringify({
      sender: {id: playerId, name: playerName}, 
      messageType: MessageTypes.JOINGAME,
      roomNumber: room
    }));
    
    // Set the room number so that GameContainer knows what room it is
    setRoomNum(room);

    // Set the application state to the next phase (which loads the GameContainer)
    setAppState(ApplicationState.GAME_INITIALIZED);
  }

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
        {errorFetchingGamerooms && (
          <p style={{marginTop: "48px", fontSize: "1.6rem", alignSelf: "center"}}>Error connecting to the game server.</p>
        )}
        {wsStatus === connectionStatus.ERROR && (
          <p style={{marginTop: "48px", fontSize: "1.6rem", alignSelf: "center"}}>Error connecting to Web Sockets.</p>
        )}
        { gameRooms.length === 0 ? (
          <p style={{alignSelf: "center"}}>No Games to display yet. Click on the "Create Game" button to start one!</p>
        ) : (
          <ul id="join-game-box">
          {gameRooms.map((gameroom, i) => (
            <GameRow onClick={() => handleGameSelection(gameroom)} key={gameroom.roomNumber} {...gameroom} row={i + 1} />
          ))}
          </ul>
        )}
      </div>
    </div>
  );

}