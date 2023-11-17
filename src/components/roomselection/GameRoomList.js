import { useState, useCallback } from "react";
import GameRow from "./GameRow";
import JoinGameDialog from "./JoinGameDialog";

export default function GameRoomList({joinGame, gameRooms}) {

  const [showJoinGameDialog, setShowJoinGameDialog] = useState({show: false});

  const messageStyle = {marginTop: "48px", fontSize: "1.6rem", alignSelf: "center"};
  const gameRoomsList = gameRooms.data;

  const handleGameSelection = useCallback((e) => {
    const gameroom = gameRoomsList[e.target.id - 1];
    const gameNumber = gameroom.roomNumber;
    const players = gameroom.playerList.map(player => player.name);
    setShowJoinGameDialog({
      show: true,
      room: gameNumber,
      players: players,
      full: gameroom.playerList.length >= 2,
    });
  }, [gameRoomsList, setShowJoinGameDialog])


  return (
    <>
      {showJoinGameDialog.show && 
      <JoinGameDialog {...showJoinGameDialog} 
        setShowJoinGameDialog={setShowJoinGameDialog}
        joinGame={joinGame}>
      </JoinGameDialog>}
      {gameRooms.loading && <p style={messageStyle}>Loading Gamerooms...</p>}
      {gameRooms.error && <p style={messageStyle}>{gameRooms.error}</p>}
      <ul id="join-game-box">
        {gameRooms.data && (
          gameRooms.data.length === 0 ? 
          <p style={messageStyle}>There are no game rooms yet. Try creating one!</p>
          :
          gameRooms.data.map((gameroom, i) => (
            <GameRow onClick={handleGameSelection} key={gameroom.roomNumber} {...gameroom} row={i + 1} />
          ))
        )}
      </ul>
    </>
  )
}