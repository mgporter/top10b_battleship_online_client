import './css/basestyle.css';
import './css/app.css';
import './css/animations.css';
import './css/ping.css';
import './css/messagecolors.css'
import { PlayerProvider } from './PlayerProvider';
import { AppStateProvider } from './AppStateProvider';
import SetScreen from './SetScreen';

export default function App() {

  return (
      <AppStateProvider>
        <PlayerProvider>
          <SetScreen />
        </PlayerProvider>
      </AppStateProvider>
  )
}