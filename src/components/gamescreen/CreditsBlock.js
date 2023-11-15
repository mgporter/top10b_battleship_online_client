import { SetAppStateContext } from '../../AppStateProvider';
import { ApplicationState } from '../../enums';
import './creditsblock.css';
import { useContext, useEffect, useRef, useState } from 'react';

export default function CreditsBlock({setShowModelCredits}) {

  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);
  const setAppState = useContext(SetAppStateContext);

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
        <a href="https://github.com/mgporter/top10_battleship" target="_blank" className="created-by-container">
          <span>Created by mgporter</span>
          <img src="https://mgporter.github.io/top10_battleship/5abea1d6dcb1d5aa96a3.png" alt="Source code hosted on GitHub" />
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