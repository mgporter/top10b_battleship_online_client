import './css/basestyle.css';
import './css/app.css';
import { useState } from 'react';
import RoomSelectionContainer from './components/roomselection/RoomSelectionContainer';
import GameContainer from './components/GameContainer';
import { ApplicationState } from './enums';


export default function App() {

  const [appState, setAppState] = useState(ApplicationState.ROOM_SELECTION);
  const [roomNum, setRoomNum] = useState();

  return (<>

        {appState === ApplicationState.ROOM_SELECTION ? (
          <RoomSelectionContainer appState={appState} setAppState={setAppState} setRoomNum={setRoomNum} />
        ) : (
          <GameContainer appState={appState} setAppState={setAppState} roomNum={roomNum} />
        )}

  </>)
}