import { useContext, useEffect, useState, useRef } from 'react';
import RoomSelectionContainer from './components/roomselection/RoomSelectionContainer';
import GameContainer from './components/GameContainer';
import { ApplicationState, MessageTypes } from './enums';
import { AppStateContext, SetAppStateContext } from './AppStateProvider';
import useSubscription from './useSubscription';
import { PlayerNameContext, SetPlayerIdContext, SetPlayerNameContext } from './PlayerProvider';
import useSocketSend from './useSocketSend';

export default function SetScreen() {

  const [readyToAttackOpponent, setReadyToAttackOpponent] = useState(false);

  const appState = useContext(AppStateContext);
  const setAppState = useContext(SetAppStateContext);
  const roomNumberRef = useRef(null);
  const setPlayerId = useContext(SetPlayerIdContext);
  const playerName = useContext(PlayerNameContext);
  const setPlayerName = useContext(SetPlayerNameContext);

  const socketSend = useSocketSend();

  const showLobby = appState === ApplicationState.ROOM_SELECTION;

  const playerSubscription = useSubscription("/user/queue/player", onMessageReceived);
  // const publicGameSub = useSubscription(`/game/${roomNumberRef.current}`, console.log);

  function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);
    console.log(message)

    switch(message.messageType) {

      case MessageTypes.ACCEPTEDJOIN: {
        setAppState(ApplicationState.GAME_INITIALIZED);
        break;
      }

      case MessageTypes.GOFIRST: {
        setReadyToAttackOpponent(true);
      }

      case MessageTypes.CREDENTIALS: {
        setPlayerId(message.id);
  
        if (playerName) {
          updateNameOnServer();
        } else {
          setPlayerName(message.name);
        }
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
    }
  }

  function updateNameOnServer() {
    socketSend.send("/app/changeName", playerName);
  }

  return (<>
    {showLobby ? (
      <RoomSelectionContainer roomNumberRef={roomNumberRef} updateNameOnServer={updateNameOnServer} />
    ) : (
      <GameContainer 
        roomNumberRef={roomNumberRef}
        readyToAttackOpponent={readyToAttackOpponent}
        setReadyToAttackOpponent={setReadyToAttackOpponent} />
    )}
  </>)
}