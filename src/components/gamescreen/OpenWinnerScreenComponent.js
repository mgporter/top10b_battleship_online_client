import { useContext } from "react"
import { PlayerContext } from "../../PlayerProvider";
import { SetAppStateContext } from "../../AppStateProvider";
import { ApplicationState } from "../../enums";

export default function OpenWinnerScreenComponent({winner, setShowEndGameDialog}) {

  const {playerId} = useContext(PlayerContext);
  const setAppState = useContext(SetAppStateContext);

  const message = playerId === winner ? "Congratulations!" : "";

  return (
    <div className="winner-screen-mini">
      {message && <h3>{message}</h3>}
      <div className="button-row">
        <button onClick={() => setShowEndGameDialog(true)}>Open End-game Battle Report</button>
        <button onClick={() => setAppState(ApplicationState.ROOM_SELECTION)}>Return to the Lobby</button>
      </div>
    </div>
  )
}