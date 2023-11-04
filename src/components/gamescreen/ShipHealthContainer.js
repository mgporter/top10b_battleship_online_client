import { C } from "../../Constants";

export default function ShipHealthContainer({ship}) {

  const length = ship.getLength();
  const shipType = ship.getType();

  const healthBoxes = ship.getLocation().map((_, i) => {
    return <div key={i} className="health-box" data-shipsection={i+1}></div>
  })

  return (
    <div className="ship-health-container" style={{width: `${length * 20}%`, gridTemplateColumns: `repeat(${length}, 1fr)`}}>
        {healthBoxes}
      <img src={C.ships[shipType].sideimg} alt={C.ships[shipType].displayName} />
    </div>
  )
}