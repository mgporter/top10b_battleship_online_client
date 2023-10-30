import '../../css/confirmationdialog.css';

export default function JoinGameDialog({ connecting, room, players, setShowJoinGameDialog, joinGame}) {

  const pNum = players.length;

  function goBackToLobby() {
    setShowJoinGameDialog({show: false});
  }

   // {pNum > 1 && <h2>Because there are already {pNum} players here, you will be joining as an observer. This means you will be able to watch the game, but unable to participate.</h2>}

  return (
    <div className='backdrop'>
      <div className='confirmation-dialog join-game-dialog'>
        {connecting ? (
          <>
            <h3>Connecting to <span className='emphasis-text yellow'>{room}</span>...</h3>
            <button type="button" onClick={goBackToLobby}>Go back to lobby</button>
          </>
        ) : (
          <>
            <h3>Are you sure you want to join game number <span className='emphasis-text yellow'>{room}</span> with {pNum > 1 ? "players" : "player"} <span className='emphasis-text yellow'>{players}</span>?</h3>
            <div className='button-row'>
              <button type="button" onClick={() => joinGame(room)}>Join game</button>
              <button type="button" onClick={goBackToLobby}>Go back to lobby</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}