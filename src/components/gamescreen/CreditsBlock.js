import { SetAppStateContext } from '../../AppStateProvider';
import { ApplicationState } from '../../enums';
import './creditsblock.css';
import { useContext, useEffect, useState } from 'react';
import { C } from '../../Constants';
import githubLogo from "../../images/github-logo.png"

export default function CreditsBlock({setShowModelCredits}) {

  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);
  const setAppState = useContext(SetAppStateContext);


  /* Hide the quit confirmation after 3 seconds */
  useEffect(() => {
    if (!showQuitConfirmation) return
    
    const timeout = setTimeout(() => {
        setShowQuitConfirmation(false);
      }, 3000);
    
    return () => {
      clearTimeout(timeout);
    }
  }, [showQuitConfirmation])

  return (
    <div className="section-block credits-block">
      <div className='link-container'>
        <a href={C.githubLink} target="_blank" className="created-by-container">
          <span>Created by mgporter</span>
          <img src={githubLogo} alt="Source code hosted on GitHub" />
        </a>
      </div>
      <div className='link-container'>
        <a className="model-credits" onClick={() => setShowModelCredits(true)}>Model credits</a>
      </div>
      <div className='link-container'>
        <p className='exit-link' onClick={() => setShowQuitConfirmation(!showQuitConfirmation)}>✖</p>
        {showQuitConfirmation && 
          <div className='credits-block-confirm-exit' onClick={() => setAppState(ApplicationState.ROOM_SELECTION)}>
            Really leave game?
          </div>}
      </div>
    </div>
  )
}