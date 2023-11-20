import { credits } from '../../modelcreditslist';

export default function ModelCredits({setShowModelCredits}) {

  function handleClick(e) {
    const linkClicked = e.target.classList.contains("asset-links");

    if (!linkClicked) {
      setShowModelCredits(false);
    } 
  }

  const assets = credits.map((asset) => {
    return (
      <tr key={asset.name} onClick={() => window.open(asset.url, "_blank", "noreferrer")}>
        <td>{asset.name}</td>
        <td>{asset.author}</td>
        <td className="asset-links"><a href={asset.url} rel="noreferrer" target="_blank">{asset.urlDisplay}</a></td>
      </tr>
    )
  })

  return (
    <div id="credits-container-backdrop" className="backdrop" onClick={handleClick}>
      <div id="credits-container">
        <h1>A special thanks to these creators for the use of their work</h1>
        <table>
          <tr>
            <th></th>
            <th>author</th>
            <th>webpage</th>
          </tr>
          {assets}
        </table>
        <p>click anywhere to close</p>
      </div>
    </div>
  )
}