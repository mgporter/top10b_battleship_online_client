import { C } from "../../Constants";
import { PacketType, battleStatsActions, playerListActions, shipStatsActions } from "../../enums";

const directions = Object.keys(C.paths);

export function coordinateToDOMCell(cellCoordinates, boardElement) {
  return boardElement.current.querySelector(`.cell[data-row="${cellCoordinates[0]}"][data-column="${cellCoordinates[1]}"]`)
}

export function createBoardCells(boardName) {
  const cellArr = []
  for (let i = 0; i < C.gameboardRows; i++) {
    for (let j = 0; j < C.gameboardColumns; j++) {
      cellArr.push(<div key={i + "_" + j} className={`cell ${boardName}`} data-row={i} data-column={j}></div>)
    }
  }
  return cellArr;
}

export function handleAttackResult(
  boardRef,
  pingRef,
  attackPacket,
  handleMiss,
  handleHit,
  handleSink) {

  if (attackPacket.result === PacketType.ATTACK_MISSED) {
    pingBoard(boardRef, pingRef, attackPacket.row, attackPacket.col, handleMiss);
  } else if (attackPacket.result === PacketType.ATTACK_HITSHIP) {
    pingBoard(boardRef, pingRef, attackPacket.row, attackPacket.col, handleHit);
  } else if (attackPacket.result === PacketType.ATTACK_SUNKSHIP) {
    pingBoard(boardRef, pingRef, attackPacket.row, attackPacket.col, handleSink);
  }
}

function pingBoard(boardRef, pingRef, row, column, callback) {

  const pingElement = pingRef.current;

  const halfRowSpacing = boardRef.current.clientWidth / 20;
  const halfColumnSpacing = boardRef.current.clientHeight / 20;
  const rowOffset = (row * 2 - 10 + 1) * halfRowSpacing;
  const columnOffset = (column * 2 - 10 + 1) * halfColumnSpacing;

  pingElement.style.transform = `translate(${columnOffset}px, ${rowOffset}px)`;
  pingElement.style.display = 'block';
  pingElement.classList.add('boardping');
  pingElement.addEventListener(
    'animationend',
    () => {
      pingElement.classList.remove('boardping');
      pingElement.style.display = 'none';
      const targetCell = coordinateToDOMCell([row, column], boardRef);
      // targetCell.classList.add(resultClassname);
      callback(targetCell);
    },
    { once: true }
  );
}


export function displayShipOnOpponentBoard(boardOverlayRef, attackResult) {

  // Set up variables
  const shipImgUrl = C.ships[attackResult.shipType].topimg;
  const shipSize = C.ships[attackResult.shipType].size;
  const shipDirection = directions[attackResult.direction];
  const shipDirectionOffset = C.paths[shipDirection];
  let row = attackResult.startingRow + 1;
  let column = attackResult.startingCol + 1;
  const overlay = boardOverlayRef.current;

  // Create the elements
  const imgContainer = document.createElement('div');
  imgContainer.classList.add('ship-icon-container');

  const shipimg = document.createElement('img');
  shipimg.classList.add('ship-icon');
  shipimg.src = shipImgUrl;
  shipimg.alt = C.ships[attackResult.shipType].displayName;
  shipimg.style.objectFit = "contain";
  imgContainer.appendChild(shipimg);

  // Set rotation based on the ship's direction
  if (shipDirection === 'left') {
    shipimg.style.rotate = '0deg';
  } else if (shipDirection === 'right') {
    column += 1;
    shipimg.style.rotate = '180deg';
  } else if (shipDirection === 'up') {
    shipimg.style.scale = shipSize;
    shipimg.style.rotate = '90deg';
  } else {
    shipimg.style.scale = shipSize;
    row += 1;
    shipimg.style.rotate = '-90deg';
  }

  // Set position within the overlay's grid
  const endingRow = row + (shipSize * shipDirectionOffset[0]);
  const endingCol = column + (shipSize * shipDirectionOffset[1]);
  imgContainer.style.gridRow = `${Math.min(row, endingRow)} / ${Math.max(row, endingRow)}`;
  imgContainer.style.gridColumn = `${Math.min(column, endingCol)} / ${Math.max(column, endingCol)}`;


  // Append the element and trigger the fade in transition
  overlay.appendChild(imgContainer);
  imgContainer.style.animationDuration = `${1000 * C.gameSpeed}ms`;
  imgContainer.classList.add('fade-in');

}


export function addHitToHealthStatus(board, row, column) {
  const cellObj = board.getCell([row, column]);

  if (!cellObj.getShip()) return;
  const shipType = cellObj.getShip().getType();
  const partNumber = cellObj.getShipPartNumber();

  const healthCell = document.querySelector(
    `.ship-health-container[data-shiptype="${shipType}"] .health-box[data-shipsection="${partNumber}"]`
  );

  if (healthCell) healthCell.classList.add('hit');
}


function calculateScore(newStats, currentScore) {

  let hitStreak = 1
  
  for (let i = newStats.streak.length - 1; i >= newStats.streak.length - 3; i--) {
    hitStreak += newStats.streak[i];
  }

  const newPoints = (500 * newStats.myHitRate) * (hitStreak/3);
  return currentScore + newPoints;
}

export function battleStatsReducer(current, action) {

  switch(action) {
    case battleStatsActions.incrementMyShotsFired: {
      const newStats = {
        myShotsFired: current.myShotsFired + 1, 
        opponentShotsFired: current.opponentShotsFired, 
        myShotsHit: current.myShotsHit, 
        opponentShotsHit: current.opponentShotsHit,
        streak: [...current.streak, 0],
        score: current.score
      };

      newStats.myHitRate = newStats.myShotsHit / newStats.myShotsFired;
      newStats.opponentHitRate = current.opponentHitRate;

      return newStats;
    }

    case battleStatsActions.incrementMyShotsHit: {
      const newStats = {
        myShotsFired: current.myShotsFired + 1, 
        opponentShotsFired: current.opponentShotsFired, 
        myShotsHit: current.myShotsHit + 1, 
        opponentShotsHit: current.opponentShotsHit,
        streak: [...current.streak, 1],
      };

      newStats.myHitRate = newStats.myShotsHit / newStats.myShotsFired;
      newStats.opponentHitRate = current.opponentHitRate;
      newStats.score = calculateScore(newStats, current.score);

      return newStats;
    }

    case battleStatsActions.incrementOpponentShotsFired: {
      const newStats = {
        myShotsFired: current.myShotsFired, 
        opponentShotsFired: current.opponentShotsFired + 1, 
        myShotsHit: current.myShotsHit, 
        opponentShotsHit: current.opponentShotsHit,
        streak: current.streak,
        score: current.score
      };

      newStats.myHitRate = current.myHitRate;
      newStats.opponentHitRate = newStats.opponentShotsHit / newStats.opponentShotsFired;

      return newStats;
    }

    case battleStatsActions.incrementOpponentShotsHit: {
      const newStats = {
        myShotsFired: current.myShotsFired, 
        opponentShotsFired: current.opponentShotsFired + 1, 
        myShotsHit: current.myShotsHit, 
        opponentShotsHit: current.opponentShotsHit + 1,
        streak: current.streak,
        score: current.score
      };

      newStats.myHitRate = current.myHitRate;
      newStats.opponentHitRate = newStats.opponentShotsHit / newStats.opponentShotsFired;

      return newStats;
    }
  }
}


export function playerReducer(current, action) {

  switch(action.type) {

    case playerListActions.UPDATEPLAYERLIST: {

      const observerList = [];
      const idList = {};
    
      for (let player of action.data.playerList) {
        if (player.id !== action.data.playerOneId && player.id !== action.data.playerTwoId) {
          observerList.push(player.id);
        }
        // Also put the player's ID in an object so we can look up their name later
        idList[player.id] = player.name;
      }
      
      return {
        playerOne: action.data.playerOneId,
        playerTwo: action.data.playerTwoId,
        atLeastTwoPlayers: action.data.playerOneId && action.data.playerTwoId,
        observerList: observerList,
        idToNames: idList,
        winner: current.winner,
        room: current.room
      }
    }

    case playerListActions.SETWINNER: {

      return {
        ...current,
        winner: action.data.winner
      }

    }
  }
}

export function shipStatsReducer(current, action) {

  switch(action.type) {

    case shipStatsActions.INCREMENTPLAYERSHIPPLACED: {
      return {
        ...current,
        playerShipsPlaced: current.playerShipsPlaced + 1,
      }
    }

    case shipStatsActions.INCREMENTPLAYERSHIPSUNK: {
      return {
        ...current,
        playerShipsSunk: current.playerShipsSunk + 1,
      }
    }

    case shipStatsActions.SETPLAYERSHIPSPLACED: {
      return {
        ...current,
        playerShipsPlaced: action.data,
      }
    }
    
    case shipStatsActions.SETPLAYERSHIPSSUNK: {
      return {
        ...current,
        playerShipsSunk: action.data,
      }
    }

    case shipStatsActions.INCREMENTOPPONENTSHIPPLACED: {
      return {
        ...current,
        opponentShipsPlaced: current.opponentShipsPlaced + 1,
      }
    }

    case shipStatsActions.INCREMENTOPPONENTSHIPSUNK: {
      return {
        ...current,
        opponentShipsSunk: current.opponentShipsSunk + 1,
      }
    }

    case shipStatsActions.SETOPPONENTSHIPSPLACED: {
      return {
        ...current,
        opponentShipsPlaced: action.data,
      }
    }

    case shipStatsActions.SETOPPONENTSHIPSUNK: {
      return {
        ...current,
        opponentShipsSunk: action.data,
      }
    }

  }

}