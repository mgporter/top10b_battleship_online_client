import { useState, useEffect, useContext, useRef, useReducer, useCallback, useMemo } from "react";
import { ApplicationState, PacketType, Avatars, inGameMessages } from '../enums';
import { PlayerIdContext } from "../PlayerProvider";
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
import ModelCredits from "./gamescreen/ModelCredits.js";
import { AppStateContext, SetAppStateContext } from "../AppStateProvider";
import { battleCounterReducer } from './logic/boardhelperfunctions';
import useSocketSend from "../useSocketSend.js";
import useSubscription from "../useSubscription.js";
import { setInGameMessagesContext } from "../InGameMessageProvider.js";

/**
 * GAME CONTAINER LAYOUT
 * 
 * |-----------------------------GAME CONTAINER ------------------------------|
 * |----ROOM CONTAINER------|------MESSAGE AREA--------|---CREDITS BLOCK-----||
 * ||                       |                          |                     ||
 * ||                       |                          |                     ||
 * ||-----------------------|--------------------------|---------------------||
 * |----------------MAINBOARD AND PANEL----------------|---OPPONENT BOARD----||
 * ||                                                  |                     ||
 * ||---SHIP PLACEMENT---||-------MAINBOARD-----------||                     ||  
 * |||       PANEL       ||                           ||                     ||
 * |||     ** OR **      ||                           ||                     ||
 * |||   SHIP HEALTH     ||  Note: Model Container    ||                     ||
 * |||       PANEL       ||  creates a canvas that    ||                     ||
 * |||                   || is absolutely positioned  ||--BOTTOMRIGHT PANEL--||
 * |||                   ||   above the mainboard     ||                     ||
 * |||                   ||                           ||                     ||
 * |||                   ||                           ||                     ||
 * |||-------------------||---------------------------||                     ||
 * |---------------------------------------------------|---------------------||
 * |--------------------------------------------------------------------------|
 *  
 * */



export default function GameContainer({roomNumberRef, readyToAttackOpponent, setReadyToAttackOpponent}) {

  const [playerList, setPlayerList] = useState({playerOne: null, playerTwo: null, observerList: []});
  const [opponentShipsPlaced, setOpponentShipsPlaced] = useState(0);
  const [showOpponentPanels, setShowOpponentPanels] = useState(false);
  const [notEnoughPlayers, setNotEnoughPlayers] = useState(false);
  const [playerShipsSunk, setPlayerShipsSunk] = useState(0);
  const [opponentShipsSunk, setOpponentShipsSunk] = useState(0);
  const [attackResultPlayer, setAttackResultPlayer] = useState(null);
  const [attackResultOpponent, setAttackResultOpponent] = useState(null);
  const [winner, setWinner] = useState(null);
  const [showEndGameDialog, setShowEndGameDialog] = useState(true);
  const [showModelCredits, setShowModelCredits] = useState(false);

  const [battleStats, dispatchBattleStats] = useReducer(battleCounterReducer, {
    myShotsFired: 0, 
    opponentShotsFired: 0, 
    myShotsHit: 0, 
    opponentShotsHit: 0});

  // load contexts
  const playerId = useContext(PlayerIdContext);
  const appState = useContext(AppStateContext);
  const setAppState = useContext(SetAppStateContext);
  const setInGameMessages = useContext(setInGameMessagesContext);

  const playersIDtoName = useRef({});
  const gameTimeSecondsFinal = useRef(0);
  const gameContainerRef = useRef(null);
  const shipHealthPanelRef = useRef(null);
  const shipPlacementPanelRef = useRef(null);

  const socketSend = useSocketSend();

  const sendPacket = useCallback((type, data = null) => {

    const packet = {
      type: type
    }

    switch(type) {

      case PacketType.PLACED_SHIP: {
        packet["shipsPlacedCount"] = data;
        socketSend.send("/app/game/placeShip", packet);
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
        socketSend.send("/app/game/placementComplete", packet);
        break;
      }

      case PacketType.ATTACK: {
        packet["row"] = data[0];
        packet["col"] = data[1];
        socketSend.send("/app/game/attack", packet);
        break;
      }

      case PacketType.LOAD_ALL_DATA: {
        socketSend.send("/app/game/loadGameData", packet);
        break;
      }

      case PacketType.SAVESTATE: {
        socketSend.send("/app/game/saveState", packet);
        break;
      }

      default: {}
      
    }
  }, [socketSend]);
  
  const onPublicMessageReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);
    const fromCurrentPlayer = message.playerId === playerId;
    
    console.log(message);
    console.log(playerId)

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
        if (!fromCurrentPlayer) setOpponentShipsPlaced(message.shipsPlacedCount);
        break;
      }

      case PacketType.GAME_START: {
        setAppState(ApplicationState.SHIP_PLACEMENT);
        setInGameMessages(inGameMessages.WELCOME);
        break;
      }

      case PacketType.PLAYERLIST_UPDATE: {
        const atLeastTwoPlayers = updatePlayerList(setPlayerList, message, playersIDtoName, playerId);
        if (atLeastTwoPlayers) {
          setNotEnoughPlayers(false);
        } else {
          setNotEnoughPlayers(true);

          // If playerOne or playerTwo is missing, we send a saveState packet to save our game
          // That way, if someone new joins, they can pick up where we left off
          
          sendPacket(PacketType.SAVESTATE);
        }
        break;
      }

      case PacketType.PLACED_COMPLETE: {
        sendPacket(PacketType.LOAD_ALL_DATA);
        break;
      }

      case PacketType.GAME_ATTACK_PHASE_START: {
        setAppState(ApplicationState.ATTACK_PHASE);
        if (playerList.playerOne === playerId) {
          setInGameMessages(inGameMessages.STARTGAMEFIRSTATTACK);
          setReadyToAttackOpponent(true);
        } else {
          setInGameMessages(inGameMessages.STARTGAMESECONDATTACK);
        }
        setTimeout(() => {
          setShowOpponentPanels(true);
        }, 400)
        break;
      }

      case PacketType.ATTACK_ALLSUNK: {
        setWinner(message.playerId);
        setReadyToAttackOpponent(false);
        setTimeout(() => {        // Give a slight delay in order to let the final boardping animation play
          setAppState(ApplicationState.GAME_END);
        }, 1200)
        break;
      }

      default: {}
    }
  }, [playerList, sendPacket, playerId]);

  const publicGameSub = useSubscription(`/game/${roomNumberRef.current}`, onPublicMessageReceived, `game${roomNumberRef.current}`);

  useEffect(() => {
    if (publicGameSub) socketSend.send("/app/gameloaded", {roomNumber: roomNumberRef.current});
  }, [publicGameSub])



  const showWinnerScreen = appState === ApplicationState.GAME_END ? true : false;

  return (
    <div id="game-container" ref={gameContainerRef}>
      <RoomPanel roomNum={roomNumberRef.current} playerList={playerList} playersIDtoName={playersIDtoName} playerId={playerId} />
      <FullScreenInfoDialog opponentShipsPlaced={opponentShipsPlaced} notEnoughPlayers={notEnoughPlayers} />    
      <MessageArea 
        showEndGameButtons={!showEndGameDialog && showWinnerScreen}
        winner={winner}
        setShowEndGameDialog={setShowEndGameDialog} />
      <MainboardAndPanel 
        sendPacket={sendPacket} 
        dispatchBattleStats={dispatchBattleStats}
        attackResultOpponent={attackResultOpponent}
        readyToAttackOpponent={readyToAttackOpponent}
        playerShipsSunk={playerShipsSunk}
        setPlayerShipsSunk={setPlayerShipsSunk}
        shipPlacementPanelRef={shipPlacementPanelRef}
        shipHealthPanelRef={shipHealthPanelRef}
        gameContainerRef={gameContainerRef}
      />
      <CreditsBlock setShowModelCredits={setShowModelCredits} />
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
            gameTimeSecondsFinal={gameTimeSecondsFinal}
            />
        </>
      )}
      {(showWinnerScreen && showEndGameDialog) && <WinnerScreen 
        winner={winner} 
        battleStats={battleStats}
        playerShipsSunk={playerShipsSunk}
        opponentShipsSunk={opponentShipsSunk}
        gameTimeSecondsFinal={gameTimeSecondsFinal}
        setShowEndGameDialog={setShowEndGameDialog} />}
      {showModelCredits && <ModelCredits setShowModelCredits={setShowModelCredits} />}
    </div>
  ) 

}