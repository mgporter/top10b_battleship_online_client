import { useState, useEffect, useContext, useRef } from "react";
import { ApplicationState, connectionStatus, LobbyColors, MessageTypes, PacketType } from '../enums';
import { PlayerIdContext, PlayerNameContext } from "../PlayerProvider";
import { SocketContext, wsStatusContext } from "../SocketProvider";
import WaitingForPlayersDialog from "./shipplacement/WaitingForPlayersDialog";
import { updatePlayerList } from "./helperfunctions.js";

export default function GameContainer({appState, setAppState, roomNum}) {

  const [playerList, setPlayerList] = useState([]);

  // load contexts
  const playerName = useContext(PlayerNameContext);
  const playerId = useContext(PlayerIdContext);
  const socket = useContext(SocketContext);
  const wsStatus = useContext(wsStatusContext);

  const playersIDtoName = useRef({});

  // use ID to name for message name conversion
  // For rendered list, get name and add to useState list. First two are players 1 and 2 respectively.

  useEffect(() => {

    if (wsStatus !== connectionStatus.OPEN) return
    console.log("subscribing to /gameroom")
    const subscription = socket.subscribe(`/game/${roomNum}`, onMessageReceived);
    socket.send("/app/wsReady", {}, JSON.stringify({playerId: playerId, roomNumber: roomNum, type: PacketType.GAME_INITIALIZED}));
    
    return () => {
      if (subscription) subscription.unsubscribe();
    }
  }, [wsStatus]);

  function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);

    if (message.type === PacketType.GAME_START) {
      setAppState(ApplicationState.SHIP_PLACEMENT);
    }

    if (message.type === PacketType.ANNOUNCE_NAME &&
        !playersIDtoName.current.hasOwnProperty(message.id)) {
      playersIDtoName.current = {...playersIDtoName.current, [message.id]: message.name};
      updatePlayerList(setPlayerList, message, playerId);
    }

  }

  return (
    <div id="game-container">
    {appState === ApplicationState.GAME_INITIALIZED && (
      <WaitingForPlayersDialog />
    )}
    {appState === ApplicationState.SHIP_PLACEMENT && (
      <RoomPanel roomNum={roomNum} />
      <MessageArea />
      <LeftPanel />
      <MainBoard />
      <CreditsBlock />
      {appState === ApplicationState.ATTACK_PHASE && (
        <OpponentBoard />
        <BottomRightPanel />
      )}
    )}

    </div>
  )

}