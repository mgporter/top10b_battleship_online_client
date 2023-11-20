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
  const setAppState = useContext(SetAppStateContext);
  const { playerName, setPlayerName, playerId, setPlayerId } = useContext(PlayerContext);
  const roomNumberRef = useRef(null);
  const setInGameMessages = useContext(setInGameMessagesContext);

  const [gameStateData, setGameStateData] = useState(null);
  const socket = getSocket();

  useEffect(() => {
    if (appState === ApplicationState.ROOM_SELECTION) {
      setGameStateData(null);
      // setShowOpponentPanels(false);
      // setReadyToAttackOpponent(false);
    }
  }, [appState])

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
  }, [playerId, setPlayerName, setPlayerId, socket])

  // const onMessageReceived = useCallback((payload) => {
  //   const message = JSON.parse(payload.body);
  //   console.log(message)

  //   switch(message.type) {

  //     case MessageTypes.LOAD_ALL_DATA: {
  //       window.addEventListener("all_models_loaded", () => {
  //         console.log("All models loaded event received")
  //         changeToAttackMode(message);
  //       }, {once: true})
  //       break;
  //     }

  //     case MessageTypes.REJECTEDJOIN_ALREADY_IN_GAME: {
  //       roomNumberRef.current = null;
  //       break;
  //     }

  //     case MessageTypes.REJECTEDJOIN_ROOM_FULL: {
  //       roomNumberRef.current = null;
  //       break;
  //     }

  //     case MessageTypes.REJECTEDJOIN_GAME_NOT_FOUND: {
  //       roomNumberRef.current = null;
  //       break;
  //     }
  //   }
  // }, [])

  // function changeToAttackMode(message) {
  //   setGameStateData(message);
  //   setAppState(ApplicationState.ATTACK_PHASE);
  //   if (message.goFirst) {
  //     setReadyToAttackOpponent(true);
  //     setInGameMessages(inGameMessages.STARTGAMEFIRSTATTACK);
  //   } else {
  //     setReadyToAttackOpponent(false);
  //     setInGameMessages(inGameMessages.STARTGAMESECONDATTACK);
  //   }
  //   setShowOpponentPanels(true);
  // }

  // useSubscription("/user/queue/player", onMessageReceived, "private");

  const showLobby = appState === ApplicationState.ROOM_SELECTION;

  return (<>
    {showLobby ? (
      <RoomSelectionContainer roomNumberRef={roomNumberRef} />
    ) : (
      <GameContainer 
        roomNumberRef={roomNumberRef}
        gameStateData={gameStateData}
        setGameStateData={setGameStateData}
      />
    )}
  </>)
}