import { useContext, useState } from 'react';
import RoomSelectionContainer from './components/roomselection/RoomSelectionContainer';
import GameContainer from './components/GameContainer';
import { ApplicationState } from './enums';
import { AppStateContext } from './AppStateProvider';


export default function SetScreen() {

  const appState = useContext(AppStateContext);
  const [roomNum, setRoomNum] = useState();

  return (<>
    {appState === ApplicationState.ROOM_SELECTION ? (
      <RoomSelectionContainer setRoomNum={setRoomNum} />
    ) : (
      <GameContainer roomNum={roomNum} />
    )}
  </>
  )
}