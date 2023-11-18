import { C } from "../../Constants"

export default function OpponentShipsPlacedMinidialog({shipStats}) {


  return (
    <div className="opponent-ships-placed-minitext">
      <h3>Opponent has placed {shipStats.opponentShipsPlaced} of {C.totalShips} ships.</h3>
    </div>
  )
}