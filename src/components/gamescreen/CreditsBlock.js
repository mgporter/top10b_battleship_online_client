import './creditsblock.css';

export default function CreditsBlock() {


  return (
    <div className="section-block credits-block">
      <a href="https://github.com/mgporter/top10_battleship" target="_blank" className="created-by-container">
        <span>Created by mgporter</span>
        <img src="https://mgporter.github.io/top10_battleship/5abea1d6dcb1d5aa96a3.png" alt="Source code hosted on GitHub" />
      </a>
      <a className="model-credits">Model credits</a>
    </div>
  )
}