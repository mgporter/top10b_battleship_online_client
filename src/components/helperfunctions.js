import { PlayerType } from "../enums";

export function updatePlayerList(setPlayerList, message, playersIDtoName, currentPlayerId) {

  /* Create the objects needed to update the room panel's player list.
  Returns true if there is both a player one and two, or false if not. */

  const newList = {};
  const newIdList = {};
  const observerList = [];

  for (let player of message.playerList) {

    const p1 = player.id === message.playerOneId ? player.id : null;
    const p2 = player.id === message.playerTwoId ? player.id : null;
    const isCurrentPlayer = player.id === currentPlayerId ? player.id : null;
    
    if (p1) {
      newList['playerOne'] = p1;
    } else if (p2) {
      newList['playerTwo'] = p2;
    } else {
      observerList.push(player.id);
    }

    if (isCurrentPlayer) newList['currentPlayer'] = player.id;

    // Also put the player's ID in an object so we can look up their name later
    newIdList[player.id] = player.name;

  }

  newList['observerList'] = observerList;

  playersIDtoName.current = newIdList;
  setPlayerList(newList);

  return Boolean(newList['playerOne']) && Boolean(newList['playerTwo']);
}