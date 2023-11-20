import { useCallback, useContext, useEffect } from "react";
import { ApplicationState, PacketType, playerListActions, dialogBoxTypes, shipStatsActions, Events } from "../../enums";
import './roompanel.css';
import { PlayerContext } from "../../PlayerProvider";
import { AppStateContext, SetAppStateContext } from "../../AppStateProvider";
import useSubscription from "../../useSubscription";
import EventEmitter from "../../EventEmitter";

export default function RoomPanel({
  players,
  dispatchPlayers
}) {

  const { playerId } = useContext(PlayerContext);

  const currentPlayerMarker = "(You)";

  const onPlayerListReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);

    // dispatchPlayers({
    //   type: playerListActions.UPDATEPLAYERLIST,
    //   data: message
    // })

    EventEmitter.dispatch(Events.PLAYERLISTCHANGE, message);

    // if (!message.playerOneId || !message.playerTwoId) {
    //   EventEmitter.dispatch(Events.NOTENOUGHPLAYERS);
    // } else {
    //   EventEmitter.dispatch(Events.PLAYERLISTCHANGE);
    // }

  }, []);

  useSubscription(`/game/playerlist/${players.room}`, onPlayerListReceived, `game${players.room}-playerlist`);


  return (
    <div className="section-block room-panel">
      <h1 className="game-title">BATTLESHIP!</h1>
      <h2 className="room-num">Room#: {players.room}</h2>
      <ul className="room-list">
        <li>Player 1: {players.playerOne ? players.idToNames[players.playerOne] : "Waiting for another player..."} {players.playerOne === playerId && currentPlayerMarker}</li>
        <li>Player 2: {players.playerTwo ? players.idToNames[players.playerTwo] : "Waiting for another player..."} {players.playerTwo === playerId && currentPlayerMarker}</li>
        {players.observerList.length > 0 && players.observerList.map((player, i) => (
          <li key={i}>observer: {players.idToNames[player]} {player === playerId && currentPlayerMarker}</li>
        ))}
      </ul>
    </div>
  )
}