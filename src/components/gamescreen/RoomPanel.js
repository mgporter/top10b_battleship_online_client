import { useCallback, useContext, useEffect } from "react";
import { ApplicationState, PacketType, playerListActions, dialogBoxTypes, shipStatsActions } from "../../enums";
import './roompanel.css';
import { PlayerContext } from "../../PlayerProvider";
import { AppStateContext } from "../../AppStateProvider";
import useSubscription from "../../useSubscription";

export default function RoomPanel({
  fullScreenDialog, 
  sendPacket,
  players,
  dispatchPlayers,
  dispatchShipStats
}) {

  const {playerId} = useContext(PlayerContext);
  const appState = useContext(AppStateContext);

  const currentPlayerMarker = "(You)";

  const onPlayerListReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);

    dispatchPlayers({
      type: playerListActions.UPDATEPLAYERLIST,
      data: message
    })


    /**
     * If there are two players in the room, then hide any dialogs.
     * If there are not yet two players, we have two cases. If the appState is
     * INITIALIZED, it means we just entered and are waiting for a second player.
     * If the appState is anythign else, it means that we had previously progressed to
     * a further appState, but the opponent left. In this case, we reset the opponent's
     * shipplaced counter and send a message to save the gamestate, so that another
     * player who joins can pick up where we left off.
     *  */

    if (message.playerOneId && message.playerTwoId) {
      fullScreenDialog.hide();
    } else {
      console.log(appState)
      if (appState === ApplicationState.GAME_INITIALIZED) {
        fullScreenDialog.show(dialogBoxTypes.WAITINGFORJOIN);
      } else if (appState === ApplicationState.GAME_END) {
        // Do nothing
      } else {
        dispatchShipStats({type: shipStatsActions.SETOPPONENTSHIPSUNK});
        fullScreenDialog.show(dialogBoxTypes.PLAYERLEFT);
        sendPacket(PacketType.SAVESTATE);
      }
      
    }

  }, [appState, fullScreenDialog, sendPacket, dispatchPlayers, dispatchShipStats]);


  const updateCallback = useSubscription(`/game/playerlist/${players.room}`, onPlayerListReceived, `game${players.room}-playerlist`);

  useEffect(() => {
    updateCallback(onPlayerListReceived)
  }, [updateCallback, onPlayerListReceived])



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