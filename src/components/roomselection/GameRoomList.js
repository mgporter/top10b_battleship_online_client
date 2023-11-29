import { useState, useCallback } from "react";
import GameRow from "./GameRow";
import JoinGameDialog from "./JoinGameDialog";

export default function GameRoomList({joinGame, gameRooms}) {

  const [showJoinGameDialog, setShowJoinGameDialog] = useState({show: false});

  const handleGameSelection = useCallback((e) => {
    const gameroom = gameRooms[e.target.id];
    const gameNumber = gameroom.roomNumber;
    const players = gameroom.playerList.map(player => player.name);
    setShowJoinGameDialog({
      show: true,
      room: gameNumber,
      players: players,
      full: gameroom.playerList.length >= 2,
    });
  }, [gameRooms, setShowJoinGameDialog])


  return (
    <>
      {showJoinGameDialog.show && 
      <JoinGameDialog {...showJoinGameDialog} 
        setShowJoinGameDialog={setShowJoinGameDialog}
        joinGame={joinGame}>
      </JoinGameDialog>}
      <ul id="join-game-box">
        {gameRooms == null && 
          <p className="gamerooms-loading-message">
            Loading Gamerooms... <br />
            <span>This app is on the free tier, so you might need to reload the page the first time if nothing happens</span>
          </p>}
        {gameRooms && (
          gameRooms.length === 0 ? 
          <p className="gamerooms-loading-message">There are no game rooms yet. Try creating one!</p>
          :
          // Display in reverse order, with most recent at top.
          gameRooms.map((_, i) => {
            const idx = gameRooms.length - i - 1;
            const newGameRoom = gameRooms[idx];
            return <GameRow 
              onClick={handleGameSelection}
              idx={idx} 
              key={newGameRoom.roomNumber} 
              row={i + 1}
              {...newGameRoom}
            />
          })
        )}
      </ul>
    </>
  )
}