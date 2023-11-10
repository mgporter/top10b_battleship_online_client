import { useState, useEffect } from "react";
import useFetch from "../../useFetch";
import GameRow from "./GameRow";
import JoinGameDialog from "./JoinGameDialog";

export default function GameRoomList({joinGame, gameRooms, setGameRooms}) {

  const [showJoinGameDialog, setShowJoinGameDialog] = useState({show: false});

  const getGameRooms = useFetch("/getGameRooms", gameRooms, setGameRooms);

  const pStyle = {marginTop: "48px", fontSize: "1.6rem", alignSelf: "center"};

  useEffect(() => {
    getGameRooms.request();
  }, []);

  function handleGameSelection(gameroom) {
    const gameNumber = gameroom.roomNumber;
    const players = gameroom.playerList.map(player => player.name);
    setShowJoinGameDialog({
      show: true,
      room: gameNumber,
      players: players,
      connecting: false,
    });
  }

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
        {getGameRooms.data?.map((gameroom, i) => (
          <GameRow onClick={() => handleGameSelection(gameroom)} key={gameroom.roomNumber} {...gameroom} row={i + 1} />
        ))}
      </ul>
    </>
  )
}