import { useContext, useEffect, useState } from 'react';
import RoomSelectionContainer from './components/roomselection/RoomSelectionContainer';
import GameContainer from './components/GameContainer';
import { ApplicationState, MessageTypes } from './enums';
import { AppStateContext } from './AppStateProvider';
import { PrivateMessageContext, SetPrivateMessageContext } from './SocketProvider';
import { SetPlayerIdContext, SetPlayerNameContext } from './PlayerProvider';

export default function SetScreen() {

  const appState = useContext(AppStateContext);
  const [roomNum, setRoomNum] = useState();

  const privateMessage = useContext(PrivateMessageContext);
  const setPlayerId = useContext(SetPlayerIdContext);
  const setPlayerName = useContext(SetPlayerNameContext);

  useEffect(() => {
    if (privateMessage && privateMessage.type === MessageTypes.CREDENTIALS) {
      setPlayerId(privateMessage.id);
      setPlayerName(privateMessage.name);
    }
  }, [privateMessage])

  return (<>
    {appState === ApplicationState.ROOM_SELECTION ? (
      <RoomSelectionContainer setRoomNum={setRoomNum} />
    ) : (
      <GameContainer roomNum={roomNum} />
    )}
  </>
  )
}