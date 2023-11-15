import { useContext, useState, useRef, useCallback } from 'react';
import RoomSelectionContainer from './components/roomselection/RoomSelectionContainer';
import GameContainer from './components/GameContainer';
import { ApplicationState, MessageTypes } from './enums';
import { AppStateContext, SetAppStateContext } from './AppStateProvider';
import useSubscription from './useSubscription';
import { PlayerNameContext, SetPlayerIdContext, SetPlayerNameContext } from './PlayerProvider';
import useUpdateServerName from "./useUpdateServerName";
import InGameMessageProvider from './InGameMessageProvider';
import useSocketSend from './useSocketSend';
import { endpoints } from './Endpoints';

export default function SetScreen() {
  console.log("SETSCREEN RENDERED")

  const [readyToAttackOpponent, setReadyToAttackOpponent] = useState(false);

  const appState = useContext(AppStateContext);
  const setAppState = useContext(SetAppStateContext);
  const roomNumberRef = useRef(null);
  const setPlayerId = useContext(SetPlayerIdContext);
  const playerName = useContext(PlayerNameContext);
  const setPlayerName = useContext(SetPlayerNameContext);
  const socketSend = useSocketSend();
  // const updateServerName = useUpdateServerName();

  
  const onMessageReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);
    console.log(message)

    switch(message.messageType) {

      case MessageTypes.ACCEPTEDJOIN: {
        setAppState(ApplicationState.GAME_INITIALIZED);
        break;
      }

      case MessageTypes.CREDENTIALS: {
        setPlayerId(message.id);
        if (!playerName) setPlayerName(message.name);
        break;
      }

      case MessageTypes.REJECTEDJOIN_ALREADY_IN_GAME: {
        roomNumberRef.current = null;
        break;
      }

      case MessageTypes.REJECTEDJOIN_ROOM_FULL: {
        roomNumberRef.current = null;
        break;
      }

      case MessageTypes.REJECTEDJOIN_GAME_NOT_FOUND: {
        roomNumberRef.current = null;
        break;
      }

      default: {}
    }
  }, [])

  useSubscription("/user/queue/player", onMessageReceived, "private");

  const showLobby = appState === ApplicationState.ROOM_SELECTION;

  return (<>
    {showLobby ? (
      <RoomSelectionContainer roomNumberRef={roomNumberRef} />
    ) : (
      <InGameMessageProvider>
        <GameContainer 
          roomNumberRef={roomNumberRef}
          readyToAttackOpponent={readyToAttackOpponent}
          setReadyToAttackOpponent={setReadyToAttackOpponent}
        />
      </InGameMessageProvider>
    )}
  </>)
}