import { C } from "../../Constants";
import { PacketType, battleStatsActions } from "../../enums";

const directions = Object.keys(C.paths);

export function coordinateToDOMCell(cellCoordinates, boardElement) {
  return boardElement.current.querySelector(`.cell[data-row="${cellCoordinates[0]}"][data-column="${cellCoordinates[1]}"]`)
};

export function createBoardCells(boardName) {
  const cellArr = []
  for (let i = 0; i < C.gameboardRows; i++) {
    for (let j = 0; j < C.gameboardColumns; j++) {
      cellArr.push(<div key={i + "_" + j} className={`cell ${boardName}`} data-row={i} data-column={j}></div>)
    }
  }
  return cellArr;
};


export function pingBoard(boardRef, pingRef, row, column, attackResult) {
  // const board = boardRef.current;
  // const pingElement = board.querySelector('.ping-container');
  const pingElement = pingRef.current;

  const halfRowSpacing = boardRef.current.clientWidth / 20;
  const halfColumnSpacing = boardRef.current.clientHeight / 20;
  const rowOffset = (row * 2 - 10 + 1) * halfRowSpacing;
  const columnOffset = (column * 2 - 10 + 1) * halfColumnSpacing;

  console.log(boardRef)
  pingElement.style.transform = `translate(${columnOffset}px, ${rowOffset}px)`;
  // pingElement.style.translate = `${columnOffset}px, ${rowOffset}px`;
  pingElement.style.display = 'block';
  pingElement.classList.add('boardping');
  pingElement.addEventListener(
    'animationend',
    () => {
      pingElement.classList.remove('boardping');
      pingElement.style.display = 'none';
      const targetCell = coordinateToDOMCell([row, column], boardRef);
      if (attackResult === PacketType.ATTACK_MISSED) {
        targetCell.classList.add('miss');
      } else {
        targetCell.classList.add('hit');
      }
    },
    { once: true }
  );
}


export function displayShipOnOpponentBoard(boardRef, attackResult) {

  const shipImgUrl = C.ships[attackResult.shipType].topimg;
  const shipSize = C.ships[attackResult.shipType].size;
  const shipDirection = directions[attackResult.direction];
  const row = attackResult.startingRow;
  const column = attackResult.startingCol;

  const opponentBoard = boardRef.current;
  const imgContainer = document.createElement('div');
  imgContainer.classList.add('ship-icon-container');

  function setImagePosition() {
    const opponentBoardRect = opponentBoard.getBoundingClientRect();
    const cell = coordinateToDOMCell([row, column], boardRef);
    const cellRect = cell.getBoundingClientRect();

    // We need to adjust the translation of the img based on its direction
    let offsetLeft = 0;
    let offsetTop = 0;
    if (shipDirection === 'left') {
      imgContainer.style.rotate = '0deg';
    } else if (shipDirection === 'right') {
      imgContainer.style.rotate = '180deg';
      offsetLeft = (shipSize - 1) * cellRect.width * -1;
    } else if (shipDirection === 'up') {
      imgContainer.style.rotate = '90deg';
      offsetLeft = Math.floor(shipSize / 2) * cellRect.width * -1;
      offsetTop = Math.floor(shipSize / 2) * cellRect.height;
      // For ships of length 2, 4, 6, etc, we have to make another adjustment
      if (shipSize % 2 === 0) {
        offsetLeft += cellRect.width / 2;
        offsetTop -= cellRect.height / 2;
      }
    } else {
      imgContainer.style.rotate = '-90deg';
      offsetLeft = Math.floor(shipSize / 2) * cellRect.width * -1;
      offsetTop = Math.floor(shipSize / 2) * cellRect.height * -1;
      // For ships of length 2, 4, 6, etc, we have to make another adjustment
      if (shipSize % 2 === 0) {
        offsetLeft += cellRect.width / 2;
        offsetTop += cellRect.height / 2;
      }
    }

    imgContainer.style.width = `${cellRect.width * shipSize}px`;
    imgContainer.style.height = `${cellRect.height}px`;
    imgContainer.style.left = `${
      cellRect.left - opponentBoardRect.left + offsetLeft
    }px`;
    imgContainer.style.top = `${
      cellRect.top - opponentBoardRect.top + offsetTop
    }px`;
  }

  setImagePosition();

  const shipimg = document.createElement('img');
  shipimg.classList.add('ship-icon');
  shipimg.src = shipImgUrl;
  shipimg.alt = C.ships[attackResult.shipType].displayName;
  imgContainer.appendChild(shipimg);

  opponentBoard.appendChild(imgContainer);

  // Trigger the fade in transition
  imgContainer.style.animationDuration = `${1000 * C.gameSpeed}ms`;
  imgContainer.classList.add('fade-in');

  // Make sure that this element resizes properly when the window is changed


  return setImagePosition;
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


export function battleCounterReducer(current, action) {

  switch(action) {
    case battleStatsActions.incrementMyShotsFired: {
      return {
        myShotsFired: current.myShotsFired + 1, 
        opponentShotsFired: current.opponentShotsFired, 
        myShotsHit: current.myShotsHit, 
        opponentShotsHit: current.opponentShotsHit
      };
    }

    case battleStatsActions.incrementMyShotsHit: {
      return {
        myShotsFired: current.myShotsFired + 1, 
        opponentShotsFired: current.opponentShotsFired, 
        myShotsHit: current.myShotsHit + 1, 
        opponentShotsHit: current.opponentShotsHit
      };
    }

    case battleStatsActions.incrementOpponentShotsFired: {
      return {
        myShotsFired: current.myShotsFired, 
        opponentShotsFired: current.opponentShotsFired + 1, 
        myShotsHit: current.myShotsHit, 
        opponentShotsHit: current.opponentShotsHit
      };
    }

    case battleStatsActions.incrementOpponentShotsHit: {
      return {
        myShotsFired: current.myShotsFired, 
        opponentShotsFired: current.opponentShotsFired + 1, 
        myShotsHit: current.myShotsHit, 
        opponentShotsHit: current.opponentShotsHit + 1
      };
    }
  }
}