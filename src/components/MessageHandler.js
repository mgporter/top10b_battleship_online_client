import { useContext } from "react";

export default function MessageHandler({}) {

  const playerName = useContext(PlayerNameContext);
  const playerId = useContext(PlayerIdContext);
  const setPlayerName = useContext(SetPlayerNameContext);
  const setPlayerId = useContext(SetPlayerIdContext);
  const setAppState = useContext(SetAppStateContext);


  function handleCredentialsMessage(message, setPlayerId, setPlayerName) {

  }

  function parseLobbyMessage(message, setMessages, playerId, playerName) {

  }

  function handleGameCreated(setGameRooms) {

  }

  return {
    
  }

}