import { C } from "../../Constants"

export default function OpponentShipsPlacedMinidialog({shipStats}) {

  const message = shipStats.opponentPlacementComplete ?
    <h3>Opponent has completed placements. Waiting on you to place ships and start the game.</h3> :
    <h3>Opponent has placed {shipStats.opponentShipsPlaced} of {C.totalShips} ships.</h3>;

  return (
    <div className="opponent-ships-placed-minitext">
      {message}
    </div>
  )
}