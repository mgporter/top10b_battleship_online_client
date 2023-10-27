// import logo from './logo.svg';
import './css/basestyle.css';
import './css/app.css';
import { useState } from 'react';
import RoomSelectionContainer from './components/roomselection/RoomSelectionContainer';
// import WebSocketConnection from "./websocketconnection";
import { ApplicationState } from './enums';
import { SocketProvider } from './SocketProvider';
import { PlayerProvider } from './PlayerProvider';

// Connect to the server via websockets
// const websocketconnection = WebSocketConnection();
// websocketconnection.connect();

function App() {

  const [appState, setAppState] = useState(ApplicationState.ROOM_SELECTION);

  // document.addEventListener("wsConnected", () => {
  //   setWsState(WebSocketState.CONNECTED);
  // });

  // document.addEventListener("wsDisconnected", () => {
  //   setWsState(WebSocketState.DISCONNECTED);
  // });



  if (appState === ApplicationState.ROOM_SELECTION) {
    return (
      <SocketProvider>
        <PlayerProvider>
          <RoomSelectionContainer />
        </PlayerProvider>
      </SocketProvider>
    );
  } else if (appState === ApplicationState.SHIP_PLACEMENT) {
    return (
      <div id="game-container">
        <p>Ship placement state</p>
      </div>
    );
  }


}

export default App;
