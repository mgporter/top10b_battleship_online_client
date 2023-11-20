import { C } from "../../Constants";

export default function ShipPlacement(board) {

  let playerboardElement = null;

  function setPlayerboardElement(element) {
    playerboardElement = element.current;
  }

  function removeHighlightedCells(targetCells = null) {
    if (!playerboardElement) return

    let domCells;

    if (!targetCells) {
      domCells = playerboardElement.querySelectorAll('.canplace, .cannotplace')
    } else {
      domCells = coordinatesToDOMCells(targetCells)
    }

    domCells.forEach((cell) =>
      cell.classList.remove('canplace', 'cannotplace')
    );
  }
  
  
  function highlightCells(mouseOverCell, shipToPlace, direction) {
  
    /* First, use the starting position, shiplength, and direction to get a list of coordinates,
    then find if this is a valid placement. If so, add the class 'canplace' to each cell and return
    the coordinate list. If not, add 'cannotplace' to each cell and return null */
    
    const cellCoordinatesToHighlight = directionToCoordinates(
      mouseOverCell,
      shipToPlace.current.getLength(),
      direction
    );
  
    const cellDomElements = coordinatesToDOMCells(cellCoordinatesToHighlight, playerboardElement);
    const isValidPlacement = board.canPlace(shipToPlace.current, cellCoordinatesToHighlight);
  
  
    if (isValidPlacement) {
      cellDomElements.forEach((cell) => {
        // if (cell) cell.classList.add('canplace')
        cell.classList.add('canplace')
      });
      return cellCoordinatesToHighlight;
    } else {
      cellDomElements.forEach((cell) => {
        cell.classList.add('cannotplace')
      });
      return null;
    }
  
  }
  
  function directionToCoordinates(startCoordinates, size, direction = 'left') {
    // Returns an array of coordinates given the ship size, starting cell, and a direction
    const cellCoordinates = [];
  
    for (let i = 0; i < size; i++) {
      const newRow = startCoordinates[0] + i * C.paths[direction][0];
      const newColumn = startCoordinates[1] + i * C.paths[direction][1];
      cellCoordinates.push([newRow, newColumn]);
    }
  
    return cellCoordinates;
  }
  
  function coordinatesToDOMCells(cellCoordinates) {
    return cellCoordinates.filter(coord => board.isInBounds(coord)).map(
      coord => playerboardElement.querySelector(`.cell[data-row="${coord[0]}"][data-column="${coord[1]}"]`)
    )
  }

  function placeShip(ship, cells) {
    board.placeShip(ship, cells);
  }

  return {
    removeHighlightedCells,
    highlightCells,
    placeShip,
    setPlayerboardElement
  }
}