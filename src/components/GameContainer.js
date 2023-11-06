import { useState, useEffect, useContext, useRef } from "react";
import { ApplicationState, connectionStatus, PacketType, Avatars, MessageTypes } from '../enums';
import { PlayerIdContext, PlayerNameContext } from "../PlayerProvider";
import { PrivateMessageContext, SocketContext, wsStatusContext } from "../SocketProvider";
import "./gamecontainer.css";
import FullScreenInfoDialog from "./FullScreenInfoDialog.js";
import { updatePlayerList } from "./helperfunctions.js";
import BottomRightPanel from "./gamescreen/BottomRightPanel";
import CreditsBlock from "./gamescreen/CreditsBlock";
import MessageArea from "./gamescreen/MessageArea";
import OpponentBoard from "./gamescreen/OpponentBoard";
import RoomPanel from "./gamescreen/RoomPanel";
import MainboardAndPanel from "./gamescreen/MainboardAndPanel";
import { AppStateContext, SetAppStateContext } from "../AppStateProvider.js"


export default function GameContainer({roomNum}) {

  const [playerList, setPlayerList] = useState({playerOne: null, playerTwo: null, observerList: []});
  const [mainMessages, setMainMessages] = useState([
    {
      avatar: Avatars.PLAYERCAPTAIN,
      sender: "Player#92732",
      color: "yellow",
      text: "Welcome to Battleship, sir!"
    }
  ])
  const [opponentShipsPlaced, setOpponentShipsPlaced] = useState(0);
  const [showOpponentPanels, setShowOpponentPanels] = useState(false);
  const [notEnoughPlayers, setNotEnoughPlayers] = useState(false);
  const [playerShipsSunk, setPlayerShipsSunk] = useState(0);
  const [opponentShipsSunk, setOpponentShipsSunk] = useState(0);
  const [readyToAttackOpponent, setReadyToAttackOpponent] = useState(false);
  const [attackResultPlayer, setAttackResultPlayer] = useState(null);
  const [attackResultOpponent, setAttackResultOpponent] = useState(null);

  // load contexts
  const playerName = useContext(PlayerNameContext);
  const playerId = useContext(PlayerIdContext);
  const socket = useContext(SocketContext);
  const wsStatus = useContext(wsStatusContext);
  const appState = useContext(AppStateContext);
  const setAppState = useContext(SetAppStateContext);
  const privateMessage = useContext(PrivateMessageContext);

  const playersIDtoName = useRef({});
  // const playerOneIdRef = useRef(playerList.playerOne);

  useEffect(() => {

    if (wsStatus !== connectionStatus.OPEN) return
    console.log("subscribing to /gameroom")
    const subscription = socket.subscribe(`/game/${roomNum}`, onMessageReceived);

    // If the player is not yet in the game, send a message to tell the server that the 
    // player has joined the room
    socket.send("/app/joinGame", {}, JSON.stringify({
      sender: {id: playerId, name: playerName}, 
      messageType: MessageTypes.JOINGAME,
      roomNumber: roomNum
    }));
    
    
    return () => {
      if (subscription) subscription.unsubscribe();
    }
  }, [wsStatus]);

  useEffect(() => {
    if (privateMessage && privateMessage.type == PacketType.ATTACK) {
      setReadyToAttackOpponent(true);
    }
  }, [privateMessage])

  function getPlayerOneId() {
    return playerList.playerOne;
  }

  function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);
    let playerOneId = null;
    const fromCurrentPlayer = message.playerId === playerId;
    
    console.log(message);

    switch(message.type) {

      case PacketType.ATTACK: {
        if (fromCurrentPlayer) {
          setAttackResultPlayer(message);
        } else {
          setAttackResultOpponent(message);
          setReadyToAttackOpponent(true);
        }
        break;
      }

      case PacketType.PLACED_SHIP: {
        if (!fromCurrentPlayer) setOpponentShipsPlaced((prev) => prev + 1);
        break;
      }

      case PacketType.GAME_START: {
        setAppState(ApplicationState.SHIP_PLACEMENT);
        break;
      }

      case PacketType.PLAYERLIST_UPDATE: {
        playerOneId = getPlayerOneId();
        const atLeastTwoPlayers = updatePlayerList(setPlayerList, message, playersIDtoName, playerId);
        if (atLeastTwoPlayers) {
          setNotEnoughPlayers(false);
        } else {
          setNotEnoughPlayers(true);
        }
        break;
      }

      case PacketType.PLACED_COMPLETE: {
        sendPacket(PacketType.LOAD_ALL_DATA);
      }

      case PacketType.GAME_ATTACK_PHASE_START: {
        console.log("RECEIVED GAME_ATTACK_PHASE_START PACKET")
        console.log(playerOneId)
        // console.log(playerList.playerOne)
        console.log(playerId)
        
        if (playerOneId === playerId) {
          console.log("RECEIVED GAME_ATTACK_PHASE_START PACKET and setting readytoattackopponent to true")
          setReadyToAttackOpponent(true);
        }
        setAppState(ApplicationState.ATTACK_PHASE);
        break;
      }


    }

  }

  function sendPacket(type, data = null) {

    const packet = {
      playerId: playerId,
      roomNumber: roomNum,
      type: type,
    }

    switch(type) {

      case PacketType.PLACED_SHIP: {
        // Type is PlacementPacket
        socket.send("/app/game/placeShip", {}, JSON.stringify(packet));
        break;
      }

      case PacketType.PLACED_COMPLETE: {
        // Type is PlacementPacket
        
        const packetizedShips = data.map((ship) => {

          const coordinates = ship.getLocation().map((coord) => {
            return {row: coord[0], col: coord[1]}
          })

          return {
            shipId: ship.getId(),
            type: ship.getType(),
            location: coordinates,
          }
        })

        packet["placementList"] = packetizedShips;
        socket.send("/app/game/placementComplete", {}, JSON.stringify(packet));
        break;
      }

      case PacketType.ATTACK: {
        packet["row"] = data[0];
        packet["col"] = data[1];
        socket.send("/app/game/attack", {}, JSON.stringify(packet));
        break;
      }

      case PacketType.LOAD_ALL_DATA: {
        socket.send("/app/game/loadGameData", {}, JSON.stringify(packet));
      }
      
    }

  }

  /* Once the attack phase starts, show the opponent board and bottom right panel. After being set to true,
  this will not be set back to false. */
  if (showOpponentPanels === false && appState === ApplicationState.ATTACK_PHASE) {
    /* MOVE THIS TO WHEN WE RECEIVE THE PACKET LATER */
    setShowOpponentPanels(true);
  }

  return (
    <div id="game-container">
      <RoomPanel roomNum={roomNum} playerList={playerList} playersIDtoName={playersIDtoName} playerId={playerId} />
    <FullScreenInfoDialog opponentShipsPlaced={opponentShipsPlaced} notEnoughPlayers={notEnoughPlayers} />    
      <>
        <MessageArea mainMessages={mainMessages} setMainMessages={setMainMessages} />
        <MainboardAndPanel 
          setMainMessages={setMainMessages} 
          sendPacket={sendPacket} 
          playerShipsSunk={playerShipsSunk}
          attackResultOpponent={attackResultOpponent}
          readyToAttackOpponent={readyToAttackOpponent}
        />
        <CreditsBlock />
        {showOpponentPanels && (
          <>
            <OpponentBoard 
              opponentShipsSunk={opponentShipsSunk}
              readyToAttackOpponent={readyToAttackOpponent}
              setReadyToAttackOpponent={setReadyToAttackOpponent}
              sendPacket={sendPacket}
              attackResultPlayer={attackResultPlayer}
            />
            <BottomRightPanel />
          </>
        )}
      </>
    </div>
  )

}