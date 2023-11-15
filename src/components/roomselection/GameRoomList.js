import { useState, useCallback } from "react";
import GameRow from "./GameRow";
import JoinGameDialog from "./JoinGameDialog";

export default function GameRoomList({joinGame, getGameRooms}) {

  const [showJoinGameDialog, setShowJoinGameDialog] = useState({show: false});

  const pStyle = {marginTop: "48px", fontSize: "1.6rem", alignSelf: "center"};
  const gameRooms = getGameRooms.data;

  const handleGameSelection = useCallback((e) => {
    const gameroom = gameRooms[e.target.id - 1];
    const gameNumber = gameroom.roomNumber;
    const players = gameroom.playerList.map(player => player.name);
    setShowJoinGameDialog({
      show: true,
      room: gameNumber,
      players: players,
      full: gameroom.playerList.length >= 2,
    });
  }, [gameRooms, setShowJoinGameDialog])

  // function handleGameSelection(gameroom) {
  //   const gameNumber = gameroom.roomNumber;
  //   const players = gameroom.playerList.map(player => player.name);
  //   setShowJoinGameDialog({
  //     show: true,
  //     room: gameNumber,
  //     players: players,
  //     full: gameroom.playerList.length >= 2,
  //   });
  // }

  return (
    <>
      {showJoinGameDialog.show && 
      <JoinGameDialog {...showJoinGameDialog} 
        setShowJoinGameDialog={setShowJoinGameDialog}
        joinGame={joinGame}>
      </JoinGameDialog>}
      {getGameRooms.loading && <p style={pStyle}>Loading Gamerooms...</p>}
      {getGameRooms.error && <p style={pStyle}>{getGameRooms.error}</p>}
      <ul id="join-game-box">
        {gameRooms?.map((gameroom, i) => (
          <GameRow onClick={handleGameSelection} key={gameroom.roomNumber} {...gameroom} row={i + 1} />
        ))}
      </ul>
    </>
  )
}