import './css/basestyle.css';
import './css/app.css';
import './css/animations.css';
import './css/ping.css';
import { PlayerProvider } from './PlayerProvider';
import { AppStateProvider } from './AppStateProvider';
import SocketConnector from './getSocket';
import SetScreen from './SetScreen';
import useWebSocketStatus from './useWebSocketStatus';

const socket = SocketConnector();

export default function App() {

  const isWsConnected = useWebSocketStatus();

  return (
      <AppStateProvider>
        <PlayerProvider>
          <SetScreen />
        </PlayerProvider>
      </AppStateProvider>
  )
}