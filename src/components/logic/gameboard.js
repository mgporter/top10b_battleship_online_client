import Cell from './cell';
import { C } from '../../Constants';
import { PacketType } from '../../enums';

export default class Gameboard {

  #board;
  #ships;
  rows = C.gameboardRows;
  columns = C.gameboardColumns;

  constructor() {
    this.#board = this.#generateBoard();
    this.#ships = [];
  }
  
  #generateBoard() {
    const board = [];
    for (let i = 0; i < this.rows; i++) {
      const row = [];
      for (let j = 0; j < this.columns; j++) {
        const cell = Cell();
        row.push(cell);
      }
      board.push(row);
    }

    return board;
  }

  getCell(coordinates) {
    return this.#board[coordinates[0]][coordinates[1]];
  }

  getCellByNumber(num) {
    const row = Math.floor(num / this.columns);
    const column = num % this.columns;
    return this.#board[row][column];
  }

  isInBounds(coordinates) {
    const [row, column] = coordinates;
    return row < this.rows && column < this.columns && row >= 0 && column >= 0;
  }

  #isEmpty(coordinates) {
    return !this.getCell(coordinates).hasShip();
  }

  canPlace(ship, coordinateList) {
    /* Returns true if a ship is placeable at the given coordinates, otherwise return false */

    if (ship.getLength() != coordinateList.length) return false;
    
    for (let coordinates of coordinateList) {
      if (!this.isInBounds(coordinates)) return false;
      if (!this.#isEmpty(coordinates) && this.getCell(coordinates).getShip() !== ship) return false;
    }

    return true;
  }

  placeShip(ship, coordinateList) {

    if (ship.getLength() !== coordinateList.length)
      throw new Error("Ship's length does not match coordinates passed");

    // If the ship is already on the board, we need to remove it first
    if (ship.isPlaced() === true) {
      for (let coordinates of ship.getLocation()) {
        this.getCell(coordinates).removeShip();
      }
      this.#ships.splice([this.#ships.indexOf(ship)], 1);
    }

    // Add the ship
    for (let i = 0, n = coordinateList.length; i < n; i++) {
      this.getCell(coordinateList[i]).addShip(ship, i+1);
    }

    ship.setLocation(coordinateList);
    this.#ships.push(ship);
  }

  receiveAttack(coordinates) {

    const cell = this.#board.getCell(coordinates);

    if (cell.hasBeenAttacked()) throw new Error("This cell has already been attacked");

    const resultPacket = {
      row: coordinates[0],
      col: coordinates[1]
    }

    if (!cell.hasShip()) {

      resultPacket["type"] = PacketType.ATTACK_MISSED;

    } else {

      let ship = cell.getShip();
      ship.receiveHit();
      resultPacket["shipType"] = ship.getType();
      const allSunk = this.shipsRemainingCount() === 0;

      if (allSunk) {
        resultPacket["type"] = PacketType.ATTACK_ALLSUNK;
      } else if (ship.isSunk()) {
        resultPacket["type"] = PacketType.ATTACK_SUNKSHIP;
      } else {
        resultPacket["type"] = PacketType.ATTACK_HITSHIP;
      }

    }

    return resultPacket;
  }

  shipsRemainingCount() {
    let count = 0;
    for (let ship of this.#ships) {
      if (ship.isSunk() === false) count++;
    }
    return count;
  }

  shipsSunkCount() {
    return this.#ships.length - this.shipsRemainingCount();
  }

  shipsTotalCount() {
    return this.#ships.length;
  }

}

// function Gameboard(rows, columns) {
// /* Not implemented yet */
//   function getCells() {
//     return board;
//   }

//   function getCell(coordinates) {
//     return board[coordinates[0]][coordinates[1]];
//   }

//   function getCoordinatesByNumber(num) {
//     const row = Math.floor(num / columns);
//     const column = num % columns;
//     return [row, column];
//   }

  

//   function getShipAtCell(coordinates) {
//     return board[coordinates[0]][coordinates[1]].getShip();
//   }


//   function logShots(coordinates, ship) {
//     receivedAttacksHistory.push({
//       coordinates,
//       ship,
//       hit: ship ? true : false,
//     });
//   }

//   function getLog(n = 0) {
//     // returns the last n shots, or all shots if n is omitted
//     return receivedAttacksHistory.slice(n * -1);
//   }


//   function getNumberOfShipsByName(shipName) {
//     let counter = 0;
//     board.forEach((row) => {
//       row.forEach((cell) => {
//         if (cell.getShip() && cell.getShip().getName() === shipName) {
//           counter++;
//         }
//       });
//     });
//     return counter;
//   }

//   return {
//     getRows,
//     getColumns,
//     getCells,
//     getCell,
//     getCellByNumber,
//     getCoordinatesByNumber,
//     isInBounds,
//     canPlace,
//     placeShip,
//     getShipAtCell,
//     receiveAttack,
//     getLog,
//     getShipReport,
//     getNumberOfShipsByName,
//   };
// }
