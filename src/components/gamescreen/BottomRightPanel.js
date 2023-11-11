import { useContext, useEffect } from 'react';
import { AppStateContext } from '../../AppStateProvider';
import { ApplicationState } from '../../enums';
import './bottomrightpanel.css';

export default function BottomRightPanel({
  battleStats, 
  gameTimeSeconds, 
  setGameTimeSeconds,
  rightSideMenusTransitionStatus}) {

  const appState = useContext(AppStateContext);

  useEffect(() => {

    const interval = setInterval(() => {
      setGameTimeSeconds((prev) => prev + 1);
    }, 1000);

    if (appState === ApplicationState.GAME_END) {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    }
  }, [appState])

  const gameSeconds = gameTimeSeconds % 60;
  const gameMinutes = Math.floor((gameTimeSeconds / 60) % 60);

  const myHitRate = battleStats.myShotsFired === 0 ? 0 : battleStats.myShotsHit / battleStats.myShotsFired;
  const opponentHitRate = battleStats.opponentShotsFired === 0 ? 0 : battleStats.opponentShotsHit / battleStats.opponentShotsFired;

  return (
    <div className={`section-block bottom-right-panel ${rightSideMenusTransitionStatus}`}>
      <div className='scoretext'>Score: <span className='scorenumber'>1234</span><span className='timer'>{gameMinutes}:{String(gameSeconds).padStart(2, "0")}</span></div>
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

        <p>{(myHitRate * 100).toFixed(1)}%</p>
        <p>Hit Rate</p>
        <p>{(opponentHitRate * 100).toFixed(1)}%</p>
      </div>
      
    </div>
  )
}