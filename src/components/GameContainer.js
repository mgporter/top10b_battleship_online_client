import { useState, useEffect, useContext, useRef, useReducer } from "react";
import { ApplicationState, connectionStatus, PacketType, Avatars, MessageTypes } from '../enums';
import { PlayerIdContext, PlayerNameContext } from "../PlayerProvider";
import { PrivateMessageContext, SocketContext, wsStatusContext } from "../SocketProvider";
import "./gamecontainer.css";
import './gamescreen/winnerscreen.css';
import FullScreenInfoDialog from "./FullScreenInfoDialog.js";
import { updatePlayerList } from "./helperfunctions.js";
import BottomRightPanel from "./gamescreen/BottomRightPanel";
import CreditsBlock from "./gamescreen/CreditsBlock";
import MessageArea from "./gamescreen/MessageArea";
import OpponentBoard from "./gamescreen/OpponentBoard";
import RoomPanel from "./gamescreen/RoomPanel";
import MainboardAndPanel from "./gamescreen/MainboardAndPanel";
import WinnerScreen from "./gamescreen/WinnerScreen.js";
import OpenWinnerScreenComponent from "./gamescreen/OpenWinnerScreenComponent.js";
import { AppStateContext, SetAppStateContext } from "../AppStateProvider";
import { battleCounterReducer } from './gamescreen/boardhelperfunctions';

export default function GameContainer({roomNumberRef}) {

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
  const [winner, setWinner] = useState(null);
  const [showEndGameDialog, setShowEndGameDialog] = useState(true);
  const [gameTimeSeconds, setGameTimeSeconds] = useState(0);

  const [battleStats, dispatchBattleStats] = useReducer(battleCounterReducer, {
    myShotsFired: 0, 
    opponentShotsFired: 0, 
    myShotsHit: 0, 
    opponentShotsHit: 0});

  // load contexts
  const playerName = useContext(PlayerNameContext);
  const playerId = useContext(PlayerIdContext);
  const socket = useContext(SocketContext);
  const wsStatus = useContext(wsStatusContext);
  const appState = useContext(AppStateContext);
  const setAppState = useContext(SetAppStateContext);
  const privateMessage = useContext(PrivateMessageContext);

  const playersIDtoName = useRef({});

  useEffect(() => {

    if (wsStatus !== connectionStatus.OPEN) return
    console.log("subscribing to /gameroom")
    const subscription = socket.subscribe(`/game/${roomNumberRef.current}`, onMessageReceived);
    const subscription2 = socket.subscribe("/user/queue/gameroom", onPrivateMessageReceived);

    socket.send("/app/gameloaded", {}, JSON.stringify({roomNumber: roomNumberRef.current}));
    
    return () => {
      if (subscription) subscription.unsubscribe();
      if (subscription2) subscription2.unsubscribe();
    }
  }, [wsStatus]);


  function onPrivateMessageReceived(payload) {
    const message = JSON.parse(payload.body);
    console.log("Private Message: " + payload.body);

    if (message.type == PacketType.ATTACK) {
      setReadyToAttackOpponent(true);
    }
  }


  function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);
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
        console.log(message);
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
        break;
      }

      case PacketType.GAME_ATTACK_PHASE_START: {
        console.log("RECEIVED GAME_ATTACK_PHASE_START PACKET")
        // if (playerOneId === playerId) {
        //   console.log("RECEIVED GAME_ATTACK_PHASE_START PACKET and setting readytoattackopponent to true")
        //   setReadyToAttackOpponent(true);
        // }
        setAppState(ApplicationState.ATTACK_PHASE);
        setShowOpponentPanels(true);
        break;
      }

      case PacketType.ATTACK_ALLSUNK: {
        setWinner(message.playerId);
        setReadyToAttackOpponent(false);
        setTimeout(() => {          // Give a slight delay in order to let the final boardping animation play
          setAppState(ApplicationState.GAME_END);
        }, 1200)
        break;
      }


    }

  }

  function sendPacket(type, data = null) {

    const packet = {
      playerId: playerId,
      roomNumber: roomNumberRef.current,
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
            direction: ship.getDirection()
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
        break;
      }
      
    }
  }

  const showWinnerScreen = appState === ApplicationState.GAME_END ? true : false;

  return (
    <div id="game-container">
      <RoomPanel roomNum={roomNumberRef.current} playerList={playerList} playersIDtoName={playersIDtoName} playerId={playerId} />
      <FullScreenInfoDialog opponentShipsPlaced={opponentShipsPlaced} notEnoughPlayers={notEnoughPlayers} />    
      <>
        <MessageArea 
          mainMessages={mainMessages} 
          setMainMessages={setMainMessages} 
          showEndGameButtons={!showEndGameDialog && showWinnerScreen}
          winner={winner}
          setShowEndGameDialog={setShowEndGameDialog} />
        <MainboardAndPanel 
          setMainMessages={setMainMessages} 
          sendPacket={sendPacket} 
          dispatchBattleStats={dispatchBattleStats}
          attackResultOpponent={attackResultOpponent}
          readyToAttackOpponent={readyToAttackOpponent}
          playerShipsSunk={playerShipsSunk}
          setPlayerShipsSunk={setPlayerShipsSunk}
        />
        <CreditsBlock />
        {showOpponentPanels && (
          <>
            <OpponentBoard 
              dispatchBattleStats={dispatchBattleStats}
              readyToAttackOpponent={readyToAttackOpponent}
              setReadyToAttackOpponent={setReadyToAttackOpponent}
              sendPacket={sendPacket}
              attackResultPlayer={attackResultPlayer}
              opponentShipsSunk={opponentShipsSunk}
              setOpponentShipsSunk={setOpponentShipsSunk}
            />
            <BottomRightPanel 
              battleStats={battleStats} 
              setGameTimeSeconds={setGameTimeSeconds}
              gameTimeSeconds={gameTimeSeconds} />
          </>
        )}
      </>
      {(showWinnerScreen && showEndGameDialog) && <WinnerScreen 
        winner={winner} 
        battleStats={battleStats}
        playerShipsSunk={playerShipsSunk}
        opponentShipsSunk={opponentShipsSunk}
        gameTimeSeconds={gameTimeSeconds}
        setShowEndGameDialog={setShowEndGameDialog} />}
    </div>
  )

}