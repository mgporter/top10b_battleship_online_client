import { useContext, useEffect, useState } from "react"
import { AppStateContext, SetAppStateContext } from "../AppStateProvider"
import { ApplicationState, Events, dialogBoxTypes } from "../enums";
import { C } from "../Constants";
import EventEmitter from "../EventEmitter";

export default function FullScreenInfoDialog({fullScreenDialog, setGameLoaded, shipStats}) {

  const appState = useContext(AppStateContext);
  const setAppState = useContext(SetAppStateContext);
  const [modelsLoaded, setModelsLoaded] = useState(0);

  // eslint-disable-next-line no-undef
  // const allModelsLoaded = modelsLoaded === Number(process.env.REACT_APP_MODELLOADCOUNT);
  const allModelsLoaded = modelsLoaded === C.numberOfModelsToLoad;

  // useEffect(() => {
  //   if (appState != ApplicationState.GAME_INITIALIZED) return;
  //   console.log("FullScreenDialog -> UseEffect -> incrementModelsLoaded")
  //   function incrementModelsLoaded() {
  //     setModelsLoaded(prev => prev + 1);
  //   }

  //   window.addEventListener("model_loaded", incrementModelsLoaded);

  //   return () => {
  //     window.removeEventListener("model_loaded", incrementModelsLoaded);
  //   }
  // }, [appState]);


  useEffect(() => {
    EventEmitter.subscribe(Events.MODELLOADED, "FSDialog", (data) => setModelsLoaded(data));
    return () => {
      EventEmitter.unsubscribe(Events.MODELLOADED, "FSDialog")
    }
  }, [])

  useEffect(() => {
    if (allModelsLoaded) EventEmitter.dispatch(Events.GAMEROOMLOADED)
  }, [allModelsLoaded])



  let messageBlock = null;
  
  switch(fullScreenDialog.type) {
    
    case dialogBoxTypes.LOADINGMODELS: {

      messageBlock = 
        <>
          {allModelsLoaded && <h2>Waiting for another player to start the game...</h2>}
          <div className="models-progress-bar-container">
            <h4>{allModelsLoaded ? "All models loaded!" : "Loading 3D models:"}</h4>
            <progress className="model-load-progress-bar" max={C.numberOfModelsToLoad} value={modelsLoaded}></progress>
            <h3>{modelsLoaded}</h3>
          </div>      
        </>
      break;
    }

    case dialogBoxTypes.WAITINGFORJOIN: {
      messageBlock = 
          <h2>Waiting for another player to start the game...</h2>
      break;
    }

    case dialogBoxTypes.PLAYERLEFT: {
      messageBlock = <h2>A player has left. Waiting for another player to continue the game.</h2>
      break;
    }

    case dialogBoxTypes.WAITINGFORPLACEMENT: {

      if (Number(fullScreenDialog.data) !== C.totalShips) messageBlock = 
        <h2>Waiting for the other player to finish placing their ships. They have placed {shipStats.opponentShipsPlaced} of {C.totalShips} ships.</h2>
      else 
        messageBlock = <h2>The other player has placed all {C.totalShips} of their ships. Just waiting for them to start the game.</h2>

      break;
    }

  }


  return (
    <div className='backdrop'>
      <div className='confirmation-dialog join-game-dialog'>
        {messageBlock}
        <button type="button" onClick={() => setAppState(ApplicationState.ROOM_SELECTION)}>Return to the lobby</button>
      </div>
    </div>
  )

}