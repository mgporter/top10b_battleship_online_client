import { MessageTypes, LobbyColors } from "../../enums";
import { C } from "../../Constants";

export function parseLobbyMessage(message, playerId) {
  let lobbyMessage;
  const isMe = message.sender.id === playerId;

  switch (message.type) {

    case MessageTypes.JOINLOBBY: {
        lobbyMessage = {
          message: `${isMe ? "You have" : message.sender.name + " has"} joined the lobby!`,
          color: LobbyColors.playerJoin,
        }
      break;
    }

    case MessageTypes.CREATEDGAME: {
      lobbyMessage = {
        message: `${isMe ? "You have" : message.sender.name + " has"} created a new game.`,
        color: LobbyColors.standard,
      }
      break;
    }

    case MessageTypes.EXITEDLOBBY: {
      lobbyMessage = {
        message: `${isMe ? "You have" : message.sender.name + " has"} left the lobby.`,
        color: LobbyColors.playerLeave,
      }
      break;
    }

    case MessageTypes.JOINGAME: {
      lobbyMessage = {
        message: `${isMe ? "You have" : message.sender.name + " has"} joined game ${message.roomNumber}.`,
        color: LobbyColors.standard,
      }
      break;
    }

    case MessageTypes.EXITEDGAME: {
      lobbyMessage = {
        message: `${isMe ? "You have" : message.sender.name + " has"} left a game.`,
        color: LobbyColors.playerLeave,
      }
      break;
    }

    case MessageTypes.GAMEREMOVED: {
      lobbyMessage = {
        message: `Game ${message.roomNumber} has been removed.`,
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
    response = await fetch(C.serverPrefix + "/gamerooms");
    data = await response.json();
    dataArr = Object.values(data);
  } catch(e) {
    console.log(e);
  }

  return dataArr;
}

export async function postGameRoom(playerObj) {
  let response;
  const data = JSON.stringify(playerObj);

  try {
    response = await fetch(C.serverPrefix + "/createGameRoom", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: data,
    });
  } catch(e) {
    console.log(e);
  }

  return response.json();
}