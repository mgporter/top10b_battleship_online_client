import { MessageTypes, LobbyColors } from "../../enums";

export function parseLobbyMessage(message, playerId, playerName) {
  let lobbyMessage;
  const isCurrentPlayer = message.sender.id === playerId;

  switch (message.messageType) {

    case MessageTypes.JOINLOBBY: {
      if (isCurrentPlayer) {
        lobbyMessage = {
          message: `You have joined the lobby!`,
          color: LobbyColors.playerJoin,
        }
      } else {
        lobbyMessage = {
          message: `${message.sender.name} has joined the lobby!`,
          color: LobbyColors.playerJoin,
        }
      }
      break;
    }

    case MessageTypes.CREATEDGAME: {
      lobbyMessage = {
        message: `${message.sender.name} has created a new game.`,
        color: LobbyColors.standard,
      }
      break;
    }

    case MessageTypes.EXITEDLOBBY: {
      lobbyMessage = {
        message: `${message.sender.name} has left the lobby.`,
        color: LobbyColors.playerLeave,
      }
      break;
    }

    case MessageTypes.JOINGAME: {
      lobbyMessage = {
        message: `${message.sender.name} has joined game ${message.roomNumber}.`,
        color: LobbyColors.standard,
      }
      break;
    }

    case MessageTypes.EXITEDGAME: {
      lobbyMessage = {
        message: `${message.sender.name} has left a game.`,
        color: LobbyColors.playerLeave,
      }
      break;
    }

    case MessageTypes.GAMEREMOVED: {
      lobbyMessage = {
        message: `${message.sender.name} has left a game.`,
        color: LobbyColors.playerLeave,
      }
      break;
    }

  }

  return lobbyMessage;
  
}

export async function getGameRoomList() {
  let data;
  let dataArr;
  let response;

  try {
    response = await fetch("http://localhost:8080/gamerooms");
    data = await response.json();
    dataArr = Object.values(data);
  } catch(e) {
    console.log(e);
    console.log("We are in the getGameRoomList block")
  }

  return dataArr;
}

export async function postGameRoom(playerObj) {
  let response;
  const data = JSON.stringify(playerObj);

  try {
    response = await fetch("http://localhost:8080/gamerooms", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: data,
    });
  } catch(e) {
    console.log(e);
  }

  return response.json();
}