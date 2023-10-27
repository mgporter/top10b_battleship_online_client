import './css/basestyle.css';
import './css/app.css';
import { useState } from 'react';
import RoomSelectionContainer from './components/roomselection/RoomSelectionContainer';
import GameContainer from './components/GameContainer';
import { ApplicationState } from './enums';
import { SocketProvider } from './SocketProvider';
import { PlayerProvider } from './PlayerProvider';


export default function App() {

  const [appState, setAppState] = useState(ApplicationState.ROOM_SELECTION);

  if (appState === ApplicationState.ROOM_SELECTION) {
    return (
      <SocketProvider>
        <PlayerProvider>
          <RoomSelectionContainer appState={appState} setAppState={setAppState} />
        </PlayerProvider>
      </SocketProvider>
    );
  } else {
    return (
      <SocketProvider>
        <PlayerProvider>
          <GameContainer appState={appState} setAppState={setAppState} />
        </PlayerProvider>
      </SocketProvider>
    );
  }


}