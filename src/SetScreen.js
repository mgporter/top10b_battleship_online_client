import { useContext, useRef, useEffect } from 'react';
import RoomSelectionContainer from './components/roomselection/RoomSelectionContainer';
import GameContainer from './components/GameContainer';
import { ApplicationState } from './enums';
import { AppStateContext } from './AppStateProvider';
import { PlayerContext } from './PlayerProvider';
import InGameMessageProvider from './InGameMessageProvider';
import getSocket from './getSocket';

export default function SetScreen() {

  const appState = useContext(AppStateContext);
  const { setPlayerName, setPlayerId } = useContext(PlayerContext);
  const roomNumberRef = useRef(null);
  const socket = getSocket();

  /**
   * Open a subscription to receive the playerId and default
   * name from the server. If the player already has a name
   * in localStorage, then that name will be used. After this
   * process is complete, the socket is set as connected, so that
   * other subscriptions can occur. */

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
      <InGameMessageProvider>
        <GameContainer roomNumberRef={roomNumberRef} />
      </InGameMessageProvider>
    )}
  </>)
}