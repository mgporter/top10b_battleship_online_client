import { useContext, useEffect, useState } from "react"
import { AppStateContext, SetAppStateContext } from "../AppStateProvider"
import { ApplicationState } from "../enums";
import { C } from "../Constants";

export default function FullScreenInfoDialog({opponentShipsPlaced, notEnoughPlayers}) {

  const appState = useContext(AppStateContext);
  const setAppState = useContext(SetAppStateContext);
  const [modelsLoadedCount, setModelsLoadedCount] = useState(0);

  useEffect(() => {
    window.addEventListener("model_loaded", incrementCounter);

    return () => {
      window.removeEventListener("model_loaded", incrementCounter);
    }
  }, [])

  function incrementCounter() {
    setModelsLoadedCount((prev) => prev + 1);
  }

  const allModelsLoaded = modelsLoadedCount >= C.numberOfModelsToLoad;
  const waitingForAnotherPlayer = appState === ApplicationState.GAME_INITIALIZED;
  const waitingForPlayerToPressStart = appState === ApplicationState.SHIPS_PLACED_AND_STARTED;
  const showOpponentShipsPlacedMinitext = appState === ApplicationState.SHIP_PLACEMENT;

  if (appState === ApplicationState.GAME_END) return;

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
  } else if (showOpponentShipsPlacedMinitext) {
    return (
      <div className="opponent-ships-placed-minitext">
        <h3>Opponent has placed {opponentShipsPlaced} of {C.totalShips} ships.</h3>
      </div>
    )
  } else {
    return;
  }

  return (
    <div className='backdrop'>
      <div className='confirmation-dialog join-game-dialog'>
        <h2>{message}</h2>
        {waitingForAnotherPlayer &&
          <div className="models-progress-bar-container">
            <h4>{allModelsLoaded ? "All models loaded!" : "Loading 3D models:"}</h4>
            <progress className="model-load-progress-bar" max={C.numberOfModelsToLoad} value={modelsLoadedCount}></progress>
            <h3>{modelsLoadedCount}</h3>
          </div>}
        <button type="button" onClick={() => setAppState(ApplicationState.ROOM_SELECTION)}>Return to the lobby</button>
      </div>
    </div>
  )

}