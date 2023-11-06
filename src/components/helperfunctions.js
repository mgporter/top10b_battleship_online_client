import { PlayerType } from "../enums";

export function updatePlayerList(setPlayerList, message, playersIDtoName, currentPlayerId) {

  /* Create the objects needed to update the room panel's player list.
  Returns true if there is both a player one and two, or false if not. */

  const newList = {
    playerOne: message.playerOneId,
    playerTwo: message.playerTwoId
  };
  const newIdList = {};
  const observerList = [];

  for (let player of message.playerList) {

    if (player.id !== message.playerOneId && player.id !== message.playerTwoId) {
      observerList.push(player.id);
    }

    if (player.id === currentPlayerId) newList['currentPlayer'] = player.id;

    // Also put the player's ID in an object so we can look up their name later
    newIdList[player.id] = player.name;

  }

  newList['observerList'] = observerList;

  playersIDtoName.current = newIdList;
  setPlayerList(newList);

  return Boolean(newList['playerOne']) && Boolean(newList['playerTwo']);
}