export function createPlayerboardCells() {
  const cellArr = []
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      cellArr.push(<div key={i + "_" + j} className='cell playerboard' data-row={i} data-column={j}></div>)
    }
  }
  return cellArr;
}