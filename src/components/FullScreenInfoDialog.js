import { useContext } from "react"
import { AppStateContext, SetAppStateContext } from "../AppStateProvider"
import { ApplicationState } from "../enums";
import { C } from "../Constants";

export default function FullScreenInfoDialog({opponentShipsPlaced, notEnoughPlayers}) {

  const appState = useContext(AppStateContext);
  const setAppState = useContext(SetAppStateContext);

  const waitingForAnotherPlayer = appState === ApplicationState.GAME_INITIALIZED;
  const waitingForPlayerToPressStart = appState === ApplicationState.SHIPS_PLACED_AND_STARTED;


  let message = "";
  if (waitingForAnotherPlayer) {
    message = "Waiting for another player to start the game..."
  } else if (waitingForPlayerToPressStart) {
    
    if (opponentShipsPlaced !== C.totalShips) {
      message = `Waiting for the other player to finish placing their ships. They have placed ${opponentShipsPlaced} of ${C.totalShips} ships.`
    } else {
      message = `The other player has placed ${opponentShipsPlaced} of ${C.totalShips} ships. Waiting on the other player to start the game.`
    }

  } else if (notEnoughPlayers) {
    message = "A player has left. Waiting for another player to continue the game."
  } else {
    return;
  }

  return (
    <div className='backdrop'>
      <div className='confirmation-dialog join-game-dialog'>
        <h2>{message}</h2>
        <button type="button" onClick={() => setAppState(ApplicationState.ROOM_SELECTION)}>Return to the lobby</button>
      </div>
    </div>
  )

}