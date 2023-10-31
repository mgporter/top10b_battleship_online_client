import { PlayerType } from "../enums";

export function updatePlayerList(setPlayerList, message, playersIDtoName, currentPlayerId) {

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

    // let playerType;
    // if (player.id === message.playerOneId) playerType = PlayerType.PLAYER1;
    // else if (player.id === message.playerTwoId) playerType = PlayerType.PLAYER2;
    // else playerType = PlayerType.OBSERVER;

    // const isCurrentPlayer = player.id === currentPlayerId;

    // const newPlayer = {
    //   name: player.name,
    //   type: playerType,
    //   isCurrentPlayer: isCurrentPlayer
    // };

    // // Add the player object to the list of players
    // newList.push(newPlayer);
  }

  newList['observerList'] = observerList;

  playersIDtoName.current = newIdList;
  setPlayerList(newList);
}