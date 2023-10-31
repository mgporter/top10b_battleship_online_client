import { useState, useEffect, useContext, useRef } from "react";
import { ApplicationState, connectionStatus, LobbyColors, MessageTypes, PacketType } from '../enums';
import { PlayerIdContext, PlayerNameContext } from "../PlayerProvider";
import { SocketContext, wsStatusContext } from "../SocketProvider";
import "../css/gamecontainer.css";
import WaitingForPlayersDialog from "./shipplacement/WaitingForPlayersDialog";
import { updatePlayerList } from "./helperfunctions.js";
import BottomRightPanel from "./gamescreen/BottomRightPanel";
import CreditsBlock from "./gamescreen/CreditsBlock";
import LeftPanel from "./gamescreen/LeftPanel";
import MainBoard from "./gamescreen/MainBoard";
import MessageArea from "./gamescreen/MessageArea";
import OpponentBoard from "./gamescreen/OpponentBoard";
import RoomPanel from "./gamescreen/RoomPanel";

export default function GameContainer({appState, setAppState, roomNum}) {

  const [playerList, setPlayerList] = useState({playerOne: null, playerTwo: null, observerList: []});

  // load contexts
  const playerName = useContext(PlayerNameContext);
  const playerId = useContext(PlayerIdContext);
  const socket = useContext(SocketContext);
  const wsStatus = useContext(wsStatusContext);

  const playersIDtoName = useRef({});

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
    console.log(message);

    if (message.type === PacketType.GAME_START) {
      setAppState(ApplicationState.SHIP_PLACEMENT);
    }

    if (message.type === PacketType.PLAYERLIST_UPDATE) {
      updatePlayerList(setPlayerList, message, playersIDtoName, playerId);
    }

  }

  return (
    <div id="game-container">
      <RoomPanel roomNum={roomNum} playerList={playerList} playersIDtoName={playersIDtoName} playerId={playerId} />
    {appState === ApplicationState.GAME_INITIALIZED && (
      <WaitingForPlayersDialog />
    )}
    {appState === ApplicationState.SHIP_PLACEMENT && (
      <>
        <MessageArea />
        <LeftPanel />
        <MainBoard />
        <CreditsBlock />
        {appState === ApplicationState.ATTACK_PHASE && (
          <>
            <OpponentBoard />
            <BottomRightPanel />
          </>
        )}
      </>
    )}

    </div>
  )

}