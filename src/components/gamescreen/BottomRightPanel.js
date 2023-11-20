import { useContext, useEffect, useRef, useState } from 'react';
import { AppStateContext } from '../../AppStateProvider';
import { ApplicationState } from '../../enums';
import './bottomrightpanel.css';

export default function BottomRightPanel({
  battleStats, 
  gameTimeSecondsFinal,
  showOpponentPanels
}) {

  const appState = useContext(AppStateContext);
  const bottomRightPanelRef = useRef(null);
  const [gameTimeSeconds, setGameTimeSeconds] = useState(0);

  useEffect(() => {
    if (showOpponentPanels)
      bottomRightPanelRef.current.classList.add('slidein');
  }, [showOpponentPanels])

  useEffect(() => {

    const interval = setInterval(() => {
      setGameTimeSeconds((prev) => prev + 1);
    }, 1000);

    if (appState === ApplicationState.GAME_END) {
      clearInterval(interval);
      gameTimeSecondsFinal.current = gameTimeSeconds;
    }

    return () => {
      clearInterval(interval);
    }
  }, [appState])

  const gameSeconds = gameTimeSeconds % 60;
  const gameMinutes = Math.floor((gameTimeSeconds / 60) % 60);

  // const myHitRate = battleStats.myShotsFired === 0 ? 0 : battleStats.myShotsHit / battleStats.myShotsFired;
  // const opponentHitRate = battleStats.opponentShotsFired === 0 ? 0 : battleStats.opponentShotsHit / battleStats.opponentShotsFired;

  return (
    <div ref={bottomRightPanelRef} className="section-block bottom-right-panel">
      <div className='scoretext'>Score: <span className='scorenumber'>{Math.round(battleStats.score)}</span><span className='timer'>{gameMinutes}:{String(gameSeconds).padStart(2, "0")}</span></div>
      <div className='battle-stats-container'>
        <p className='header you'>You</p>
        <p></p>
        <p className='header opponent'>Opponent</p>

        <p>{battleStats.myShotsFired}</p>
        <p>Shots Fired</p>
        <p>{battleStats.opponentShotsFired}</p>

        <p>{battleStats.myShotsHit}</p>
        <p>Shots Hit</p>
        <p>{battleStats.opponentShotsHit}</p>

        <p>{(battleStats.myHitRate * 100).toFixed(1)}%</p>
        <p>Hit Rate</p>
        <p>{(battleStats.opponentHitRate * 100).toFixed(1)}%</p>
      </div>
      
    </div>
  )
}