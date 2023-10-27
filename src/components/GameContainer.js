import { useState, useEffect, useContext } from "react";
import { connectionStatus, LobbyColors, MessageTypes } from '../enums';
import { PlayerIdContext, PlayerNameContext } from "../PlayerProvider";
import { SocketContext, wsStatusContext } from "../SocketProvider";

export default function GameContainer({appState, setAppState}) {

  // load contexts
  const playerName = useContext(PlayerNameContext);
  const playerId = useContext(PlayerIdContext);
  const socket = useContext(SocketContext);
  const wsStatus = useContext(wsStatusContext);

  return (
    <div></div>
  )

}