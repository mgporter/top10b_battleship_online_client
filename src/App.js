import './css/basestyle.css';
import './css/app.css';
import './css/animations.css'
import { PlayerProvider } from './PlayerProvider';
import { AppStateProvider } from './AppStateProvider';
import { SocketProvider } from './SocketProvider';
import SetScreen from './SetScreen';

export default function App() {

  return (
    <SocketProvider>
      <AppStateProvider>
        <PlayerProvider>
          <SetScreen />
        </PlayerProvider>
      </AppStateProvider>
    </SocketProvider>
  )
}