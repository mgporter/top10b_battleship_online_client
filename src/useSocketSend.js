import { useCallback } from "react";
import getSocket from "./getSocket";
import useWebSocketStatus from "./useWebSocketStatus";
import { MessageTypes, PacketType } from "./enums";
import { endpoints } from "./Endpoints";
import { C } from "./Constants";


export default function useSocketSend() {

  const socket = getSocket();
  const wsStatus = useWebSocketStatus();

  const sendTo = useCallback((destination, payload) => {
    if (C.debugMode) console.log("Sending message to " + destination);
    const stringifiedPayload = typeof payload === "string" ? payload : JSON.stringify(payload);
    if (wsStatus) socket.send(destination, {}, stringifiedPayload);
    else {
      if (C.debugMode)
        console.error(`Message to ${destination} could not be sent.`);
    }
  }, [socket, wsStatus])

  const sendPacket = useCallback((type, data = null) => {

    const packet = {
      type: type
    }

    switch(type) {

      case PacketType.PLACED_SHIP: {
        packet["shipsPlacedCount"] = data;
        sendTo("/app/game/placeShip", packet);
        break;
      }

      case PacketType.PLACED_COMPLETE: {
        const packetizedShips = data.map((ship) => {
          const coordinates = ship.getLocation().map((coord) => {
            return {row: coord[0], col: coord[1]}
          })

          return {
            shipId: ship.getId(),
            type: ship.getType(),
            location: coordinates,
            direction: ship.getDirection()
          }
        })

        packet["placementList"] = packetizedShips;
        sendTo("/app/game/placementComplete", packet);
        break;
      }

      case PacketType.ATTACK: {
        packet["row"] = data[0];
        packet["col"] = data[1];
        sendTo("/app/game/attack", packet);
        break;
      }

      case PacketType.LOAD_ALL_DATA: {
        sendTo("/app/game/loadGameData", packet);
        break;
      }

      case PacketType.SAVESTATE: {
        sendTo("/app/game/saveState", packet);
        break;
      }

      case MessageTypes.JOINGAME: {
        sendTo(endpoints.joinGame, data);
        break;
      }

      case MessageTypes.JOINLOBBY: {
        sendTo("/app/joinLobby");
        break;
      }

      case MessageTypes.CHANGENAME: {
        sendTo("/app/changeName", data);
        break;
      }

      case PacketType.GAMEROOMLOADED: {
        sendTo("/app/gameloaded");
        break;
      }
      
    }
  }, [sendTo]);


  return sendPacket;

}