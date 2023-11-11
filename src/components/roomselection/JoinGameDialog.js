import '../confirmationdialog.css';

export default function JoinGameDialog({room, full, players, setShowJoinGameDialog, joinGame}) {

  function goBackToLobby() {
    setShowJoinGameDialog({show: false});
  }

  if (full) {
    return (
      <div className='backdrop'>
        <div className='confirmation-dialog join-game-dialog'>
            <h3 style={{color: 'rgb(255, 155, 155)'}}>You cannot join this game because it is already full.</h3>
            <div className='button-row'>
              <button type="button" onClick={goBackToLobby}>Go back to lobby</button>
            </div>
        </div>
      </div>
    )
  }

  return (
    <div className='backdrop'>
      <div className='confirmation-dialog join-game-dialog'>
          <h3>
            Are you sure you want to join game number
            <span className='emphasis-text yellow'>&nbsp;{room}&nbsp;</span> 
            with {players.length > 1 ? "players" : "player"} 
            <span className='emphasis-text yellow'>&nbsp;{players}</span>?
          </h3>
          <div className='button-row'>
            <button type="button" onClick={() => joinGame(room)}>Join game</button>
            <button type="button" onClick={goBackToLobby}>Go back to lobby</button>
          </div>
      </div>
    </div>
  )
}