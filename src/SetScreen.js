import { useContext, useState, useRef, useCallback, useEffect } from 'react';
import RoomSelectionContainer from './components/roomselection/RoomSelectionContainer';
import GameContainer from './components/GameContainer';
import { ApplicationState, MessageTypes, inGameMessages } from './enums';
import { AppStateContext, SetAppStateContext } from './AppStateProvider';
import { PlayerContext, PlayerNameContext, SetPlayerIdContext, SetPlayerNameContext } from './PlayerProvider';
import useUpdateServerName from "./useUpdateServerName";
import { setInGameMessagesContext } from './InGameMessageProvider';
import useSocketSend from './useSocketSend';
import { endpoints } from './Endpoints';
import getSocket from './getSocket';

export default function SetScreen() {
  console.log("SetScreen")

  const appState = useContext(AppStateContext);
  const { setPlayerName, setPlayerId } = useContext(PlayerContext);
  const roomNumberRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {

    function setCredentials(e) {
      const name = e.detail.name;
      const id = e.detail.id;

      const initialName = localStorage.getItem("playerName");

      setPlayerId(id);
      if (!initialName) setPlayerName(name);
      else {
        setPlayerName(initialName);
        socket.send("/app/changeName", {}, initialName);
      }

      window.dispatchEvent(new Event("wsConnected"));
    }

    window.addEventListener("credentialsReceived", setCredentials);

    return () => {
      window.removeEventListener("credentialsReceived", setCredentials);
    }
  }, [setPlayerName, setPlayerId, socket])



  const showLobby = appState === ApplicationState.ROOM_SELECTION;

  return (<>
    {showLobby ? (
      <RoomSelectionContainer roomNumberRef={roomNumberRef} />
    ) : (
      <GameContainer roomNumberRef={roomNumberRef} />
    )}
  </>)
}