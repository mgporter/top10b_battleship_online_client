import { useContext, useEffect, useState, useRef } from 'react';
import RoomSelectionContainer from './components/roomselection/RoomSelectionContainer';
import GameContainer from './components/GameContainer';
import { ApplicationState, MessageTypes } from './enums';
import { AppStateContext } from './AppStateProvider';
import { PrivateMessageContext, SetPrivateMessageContext } from './SocketProvider';
import { PlayerIdContext, PlayerNameContext, SetPlayerIdContext, SetPlayerNameContext } from './PlayerProvider';

export default function SetScreen() {

  const appState = useContext(AppStateContext);
  // const [roomNum, setRoomNum] = useState();
  
  const roomNumberRef = useRef(null);

  // const playerId = useContext(PlayerIdContext);
  // const playerName = useContext(PlayerNameContext);

  // useEffect(() => {
  //   console.log("setting credentials in local storage")
  //   localStorage.setItem("playerId", playerId);
  //   localStorage.setItem("playerName", playerName);
  // }, [playerId, playerName])

  return (<>
    {appState === ApplicationState.ROOM_SELECTION ? (
      <RoomSelectionContainer roomNumberRef={roomNumberRef} />
    ) : (
      <GameContainer roomNumberRef={roomNumberRef} />
    )}
  </>
  )
}