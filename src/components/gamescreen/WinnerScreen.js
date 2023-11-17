import { useContext } from 'react';
import { PlayerIdContext } from '../../PlayerProvider';
import { SetAppStateContext } from '../../AppStateProvider';
import { ApplicationState } from '../../enums';

export default function WinnerScreen({
  winner, 
  battleStats, 
  playerShipsSunk, 
  opponentShipsSunk, 
  gameTimeSecondsFinal,
  setShowEndGameDialog}) {

  const playerId = useContext(PlayerIdContext);
  const setAppState = useContext(SetAppStateContext);

  const winnerWasMe = winner === playerId;

  const myHitRate = battleStats.myShotsFired === 0 ? 0 : battleStats.myShotsHit / battleStats.myShotsFired;
  const opponentHitRate = battleStats.opponentShotsFired === 0 ? 0 : battleStats.opponentShotsHit / battleStats.opponentShotsFired;

  const gameSeconds = gameTimeSecondsFinal.current % 60;
  const gameMinutes = Math.floor((gameTimeSecondsFinal.current / 60) % 60);
  const gameHours = Math.floor(gameTimeSecondsFinal.current / 3600);

  function handleClick(e) {
    const buttonClicked = e.target.classList.contains("return-to-lobby");

    if (buttonClicked) {
      setAppState(ApplicationState.ROOM_SELECTION);
      return;
    } else {
      setShowEndGameDialog(false);
    } 
  }

  return (
    <div className='backdrop' onClick={handleClick}>
      <div id="end-game-report-container">
        <div id="end-game-text-container">
          {winnerWasMe ? <>
            <h1>May our victory today echo through history. It was an honor, sir.</h1>
            <h2 style={{color: 'rgb(75, 255, 75)'}}>You have won!</h2>
          </> : <>
            <h1>Though now we flee, from the ashes we shall rise another day...</h1>
            <h2 style={{color: 'rgb(255, 65, 65)'}}>You have lost.</h2>
          </>}
          <h2>Final score: {Math.round(battleStats.score)}</h2>
          <div id="end-game-stats-container">
            <p>You</p>
            <p>Shots fired: {battleStats.myShotsFired}</p>
            <p>Shots hit: {battleStats.myShotsHit}</p>
            <p>Hit rate: {(myHitRate * 100).toFixed(2)}%</p>
            <p>Boats sunk: {opponentShipsSunk}</p>
            <p>Your opponent</p>
            <p>Shots fired: {battleStats.opponentShotsFired}</p>
            <p>Shots hit: {battleStats.opponentShotsHit}</p>
            <p>Hit rate: {(opponentHitRate * 100).toFixed(2)}%</p>
            <p>Boats sunk: {playerShipsSunk}</p>
          </div>
          <p id="play-time">Total time: {gameHours}:{String(gameMinutes).padStart(2, "0")}:{String(gameSeconds).padStart(2, "0")}</p>
          <div className='button-row'>
            <p>Click anywhere to close, or </p>
            <button className='return-to-lobby boardflash'>go back to the lobby</button>
          </div>
        </div>
      </div>
    </div>
  )
}