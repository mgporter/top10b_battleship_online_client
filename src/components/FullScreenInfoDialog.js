import { useContext, useEffect, useState } from "react"
import { SetAppStateContext } from "../AppStateProvider"
import { ApplicationState, dialogBoxTypes } from "../enums";
import { C } from "../Constants";

export default function FullScreenInfoDialog({fullScreenDialog, shipStats}) {

  const setAppState = useContext(SetAppStateContext);
  const [modelsLoadedCount, setModelsLoadedCount] = useState(0);

  useEffect(() => {
    console.log("model-loaded listener added")
    window.addEventListener("model_loaded", incrementCounter);

    return () => {
      window.removeEventListener("model_loaded", incrementCounter);
    }
  }, [])

  function incrementCounter() {
    setModelsLoadedCount((prev) => prev + 1);
  }

  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (modelsLoadedCount == process.env.REACT_APP_MODELLOADCOUNT) {
      window.dispatchEvent(new Event("all_models_loaded"));
    }
  }, [modelsLoadedCount])

  const allModelsLoaded = modelsLoadedCount >= C.numberOfModelsToLoad;

  let messageBlock = null;
  
  switch(fullScreenDialog.type) {

    case dialogBoxTypes.WAITINGFORJOIN: {
      messageBlock = 
        <>
          <h2>Waiting for another player to start the game...</h2>
          <div className="models-progress-bar-container">
            <h4>{allModelsLoaded ? "All models loaded!" : "Loading 3D models:"}</h4>
            <progress className="model-load-progress-bar" max={C.numberOfModelsToLoad} value={modelsLoadedCount}></progress>
            <h3>{modelsLoadedCount}</h3>
          </div>
        </>
      break;
    }

    case dialogBoxTypes.PLAYERLEFT: {
      messageBlock = <h2>A player has left. Waiting for another player to continue the game.</h2>
      break;
    }

    case dialogBoxTypes.WAITINGFORPLACEMENT: {

      if (Number(fullScreenDialog.data) !== C.totalShips) messageBlock = 
        <h2>Waiting for the other player to finish placing their ships. They have placed {fullScreenDialog.data} of {C.totalShips} ships.</h2>
      else 
        messageBlock = <h2>The other player has placed all {C.totalShips} of their ships. Just waiting for them to start the game.</h2>

      break;
    }

  }


  // <div className="opponent-ships-placed-minitext">
  //   <h3>Opponent has placed {opponentShipsPlaced} of {C.totalShips} ships.</h3>
  // </div>

  return (
    <div className='backdrop'>
      <div className='confirmation-dialog join-game-dialog'>
        {messageBlock}
        <button type="button" onClick={() => setAppState(ApplicationState.ROOM_SELECTION)}>Return to the lobby</button>
      </div>
    </div>
  )

}