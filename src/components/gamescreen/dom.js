function DomManager(player1, player2) {
  // let shipPlacement;
  // let winner;
  // let endGameReportOpen = false;

  // const playTimeBegin = Date.now();

  // const p1board = player1.getBoard();
  // const p2board = player2.getBoard();

  buildPageStructure();

  const model = Model();
  model.resizeCanvasToDisplaySize();

  const messageBox = MessageBox();
  messageBox.write('Loading models...');

  // Start the game with the mainElement in the middle
  movePlayerboardToCenter(true);
  buildProgressBar();

  // disableZoom();

  function movePlayerboardToCenter(move) {
    const mainElement = document.querySelector('main');
    const mb = messageBox.getElement();

    const offsetX = window.innerWidth * 0.14;
    let transitionDone = false;

    if (move) {
      mainElement.style.transition = 'none';
      mb.style.transition = 'opacity 200ms';
      mainElement.style.transform = `translate(${offsetX}px, 0)`;
      mb.style.transform = `translate(${offsetX}px, 0)`;
    } else {
      mainElement.style.transition = 'transform 400ms';
      mb.style.transition = 'opacity 200ms, transform 400ms';
      mainElement.style.transform = `translate(0px, 0)`;
      mb.style.transform = `translate(0px, 0)`;
      animateCanvasTranslation();
      mainElement.addEventListener('transitionend', () => {
        mainElement.style.transition = 'none';
        mb.style.transition = 'opacity 200ms';
        transitionDone = true;
      });
    }

    function animateCanvasTranslation() {
      const animation = requestAnimationFrame(animateCanvasTranslation);
      model.resizeCanvasToDisplaySize();
      if (transitionDone) {
        cancelAnimationFrame(animation);
      }
    }
  }


  // function createCreditsModal() {
  //   const backdrop = document.createElement('div');
  //   backdrop.id = 'credits-container-backdrop';
  //   backdrop.classList.add('backdrop');

  //   const creditsContainer = document.createElement('div');
  //   creditsContainer.id = 'credits-container';

  //   const header = document.createElement('h1');
  //   header.textContent =
  //     'A special thanks to these creators for their awesome work';
  //   creditsContainer.appendChild(header);

  //   const table = document.createElement('table');
  //   const rowHead = document.createElement('tr');
  //   const th1 = document.createElement('th');
  //   th1.textContent = '';
  //   const th2 = document.createElement('th');
  //   th2.textContent = 'author';
  //   const th3 = document.createElement('th');
  //   th3.textContent = 'webpage';

  //   rowHead.append(th1, th2, th3);
  //   table.append(rowHead);

  //   const credits = [
  //     {
  //       name: 'Patrol Boat model',
  //       author: 'Pixel',
  //       urlDisplay: 'https://sketchfab.com/...',
  //       url: 'https://sketchfab.com/3d-models/warship-736cca123b3e469996489c8c6d2cd4c0',
  //     },
  //     {
  //       name: 'Destroyer model',
  //       author: 'Peter Primini',
  //       urlDisplay: 'https://sketchfab.com/...',
  //       url: 'https://sketchfab.com/3d-models/bengaluru-class-destroyer-d67-27a867360a1645208e689dd0b3538261',
  //     },
  //     {
  //       name: 'Submarine model',
  //       author: 'Yakudami',
  //       urlDisplay: 'https://sketchfab.com/...',
  //       url: 'https://sketchfab.com/3d-models/the-project-941-akula-typhoon-submarine-b7aef99dcf9f4252887a02a7afb3b75e',
  //     },
  //     {
  //       name: 'Battleship model',
  //       author: 'printable_models',
  //       urlDisplay: 'https://free3d.com/...',
  //       url: 'https://free3d.com/3d-model/wwii-ship-uk-king-george-v-class-battleship-v1--185381.html',
  //     },
  //     {
  //       name: 'Carrier model',
  //       author: 'Pixel',
  //       urlDisplay: 'https://sketchfab.com/...',
  //       url: 'https://sketchfab.com/3d-models/low-poly-aircraft-carrier-with-mini-jets-3d5047d68f064cdca0db39354b567241',
  //     },
  //     {
  //       name: 'Image assets',
  //       author: 'Canva',
  //       urlDisplay: 'https://www.canva.com/...',
  //       url: 'https://www.canva.com/',
  //     },
  //   ];

  //   for (let asset of credits) {
  //     const row = document.createElement('tr');

  //     const td1 = document.createElement('td');
  //     td1.textContent = asset.name;
  //     const td2 = document.createElement('td');
  //     td2.textContent = asset.author;
  //     const td3 = document.createElement('td');
  //     td3.innerHTML = `<a href="${asset.url}" target="_blank">${asset.urlDisplay}</a>`;

  //     row.append(td1, td2, td3);
  //     table.append(row);
  //   }

  //   creditsContainer.appendChild(table);

  //   const clickDescription = document.createElement('p');
  //   clickDescription.textContent = 'click anywhere outside the table to close';
  //   creditsContainer.appendChild(clickDescription);

  //   backdrop.appendChild(creditsContainer);

  //   return backdrop;
  // }

  // function buildPageStructure() {
  //   const gameContainer = document.createElement('div');
  //   gameContainer.id = 'game-container';

  //   const playerHeader = document.createElement('header');
  //   playerHeader.id = 'player';

  //   const opponentHeader = document.createElement('header');
  //   opponentHeader.id = 'opponent';

  //   const topLeftContainer = document.createElement('div');

  //   const createdByContainer = document.createElement('a');
  //   createdByContainer.setAttribute(
  //     'href',
  //     'https://github.com/mgporter/top10_battleship'
  //   );
  //   createdByContainer.setAttribute('target', '_blank');
  //   createdByContainer.id = 'created-by-container';
  //   const createdBy = document.createElement('span');
  //   createdBy.textContent = 'Created by mgporter';
  //   const gitHubIcon = document.createElement('img');
  //   gitHubIcon.src = gitHubIconPic;
  //   gitHubIcon.alt = 'Source code hosted on GitHub';
  //   createdByContainer.append(createdBy, gitHubIcon);

  //   const credits = document.createElement('a');
  //   credits.textContent = 'Model credits';
  //   credits.id = 'model-credits';

  //   topLeftContainer.append(createdByContainer, credits);
  //   opponentHeader.appendChild(topLeftContainer);

  //   const healthContainer = document.createElement('aside');
  //   healthContainer.id = 'health-container';

  //   const main = document.createElement('main');

  //   const playerBoard = createPlayerboard();
  //   main.appendChild(playerBoard);

  //   const section = document.createElement('section');

  //   const statsContainer = document.createElement('aside');
  //   statsContainer.id = 'stats-container';

  //   gameContainer.append(
  //     playerHeader,
  //     opponentHeader,
  //     healthContainer,
  //     main,
  //     section,
  //     statsContainer
  //   );

  //   document.body.appendChild(gameContainer);

  //   const creditDialogBox = createCreditsModal();
  //   document.body.appendChild(creditDialogBox);

  //   credits.addEventListener('click', () => {
  //     pauseAnimations();
  //     showCredits();
  //   });

  //   const creditsBackdrop = document.getElementById(
  //     'credits-container-backdrop'
  //   );
  //   creditsBackdrop.addEventListener('click', (e) => {
  //     const isInside = e.target.closest('table');

  //     if (!isInside) {
  //       resumeAnimations();
  //       hideCredits();
  //     }
  //   });
  // }

  function buildProgressBar() {
    const progress = document.createElement('progress');
    const mb = messageBox.getElement();

    progress.id = 'model-load-progress-bar';
    progress.setAttribute('max', C.numberOfModelsToLoad);
    progress.value = 0;

    mb.appendChild(progress);

    window.addEventListener('model_loaded', () => {
      // Update user about how many models have loaded
      progress.value = progress.value + 1;
      if (progress.value >= C.numberOfModelsToLoad) {
        // Writing to the message box also deletes it's children elements, like the progress bar
        messageBox.write(
          'All models loaded. Click on a ship to begin placement.'
        );
      }
    });
  }

  // function createPlayerboard() {
  //   const playerBoard = document.createElement('div');
  //   playerBoard.id = 'playerboard';

  //   for (let i = 0; i < 10; i++) {
  //     for (let j = 0; j < 10; j++) {
  //       const cell = document.createElement('div');
  //       cell.className = 'cell playerboard';
  //       cell.setAttribute('data-row', i);
  //       cell.setAttribute('data-column', j);
  //       playerBoard.appendChild(cell);
  //     }
  //   }

  //   const ping = createPingRing();
  //   playerBoard.appendChild(ping);

  //   return playerBoard;
  // }

  function createOpponentboard() {
    const opponentBoard = document.createElement('div');
    opponentBoard.id = 'opponentboard';

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell opponentboard';
        cell.setAttribute('data-row', i);
        cell.setAttribute('data-column', j);
        opponentBoard.appendChild(cell);
      }
    }

    const ping = createPingRing();
    opponentBoard.appendChild(ping);

    return opponentBoard;
  }

  // function createPingRing() {
  //   const pingContainer = document.createElement('div');
  //   pingContainer.classList.add('ping-container');
  //   const pingRing = document.createElement('div');
  //   pingRing.classList.add('ping-ring');
  //   pingContainer.appendChild(pingRing);
  //   return pingContainer;
  // }

  function createStatsAside() {
    const statsAside = document.createElement('aside');
    statsAside.id = 'stats';

    const battleStatsLink = document.createElement('button');
    battleStatsLink.textContent = 'Display battle stats';

    statsAside.appendChild(battleStatsLink);

    const controls = createGameSpeedControls();
    statsAside.appendChild(controls);

    return statsAside;
  }

  function startAddShipPhase() {
    // Create the add ship menu
    const healthPanel = document.createElement('aside');
    healthPanel.id = 'health';

    const addShipHeader = document.createElement('h3');
    addShipHeader.textContent = 'Add your ships';

    const addShipDescription = document.createElement('p');
    addShipDescription.textContent =
      'Select a ship, then click on a cell to add it to your board. Use the mousewheel to rotate.';

    healthPanel.append(addShipHeader, addShipDescription);

    const addShipSelection = document.createElement('fieldset');
    addShipSelection.id = 'addShipSelection';

    Object.values(C.ships).forEach((ship) => {
      const containerLabel = document.createElement('label');
      containerLabel.setAttribute('for', ship.name);
      containerLabel.setAttribute('data-ship', ship.name);

      const container = document.createElement('input');
      container.setAttribute('type', 'radio');
      container.setAttribute('id', ship.name);
      container.setAttribute('name', 'addship');
      container.setAttribute('value', ship.name);

      const img = document.createElement('img');
      img.src = ship.sideimg;
      img.alt = ship.displayName;
      img.setAttribute('data-ship', ship.name);
      img.style.transform = 'scaleX(-1)';
      img.style.width = `${20 * ship.size}%`;

      containerLabel.append(container, img);
      addShipSelection.appendChild(containerLabel);
    });

    healthPanel.appendChild(addShipSelection);
    document.getElementById('health-container').appendChild(healthPanel);

    const startButton = document.createElement('button');
    startButton.classList.add('start-game-button');
    startButton.textContent = 'Start!';
    startButton.style.visibility = 'hidden';
    healthPanel.appendChild(startButton);

    // Retrieve the ship placement module
    shipPlacement = ShipPlacement(p1board, model.addModelToScene);

    document.getElementById('health-container').classList.add('boardflash');
    document.getElementById('playerboard').classList.add('disable-hover');

    addShipSelection.addEventListener(
      'click',
      function handleShipSelection(event) {
        // Check to make sure selection is valid
        if (!event.target.matches('input')) return;
        const target = addShipSelection.querySelector(
          'input[type="radio"]:checked'
        );
        if (!target) return;

        // Handle the click
        shipPlacement.showPlayerBoardHoverPlacements(target.value);
      }
    );

    window.addEventListener('all_ships_added', showStartGameButton, {
      once: true,
    });
  }

  function showStartGameButton() {
    const startButton = document.querySelector('.start-game-button');
    startButton.style.visibility = 'visible';
    startButton.addEventListener(
      'click',
      () => {
        window.dispatchEvent(new Event('start_game'));
        messageBox.clear();
      },
      { once: true }
    );
  }

  function createGameSpeedControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'gamespeed-container';

    const label = document.createElement('label');
    label.textContent = 'Gamespeed:';
    label.setAttribute('for', 'gamespeed');

    const slider = document.createElement('input');
    slider.id = 'gamespeed-slider';
    slider.setAttribute('type', 'range');
    slider.setAttribute('name', 'gamespeed');
    slider.setAttribute('list', 'gamespeed-values');
    slider.setAttribute('min', '0.2');
    slider.setAttribute('max', '1.4');
    slider.setAttribute('step', '0.4');
    slider.setAttribute('value', '1');

    const datalist = document.createElement('datalist');
    datalist.id = 'gamespeed-values';

    const option1 = document.createElement('option');
    option1.value = 0.2;
    option1.setAttribute('label', 'rapid');

    const option2 = document.createElement('option');
    option2.value = 0.6;
    option2.setAttribute('label', 'quick');

    const option3 = document.createElement('option');
    option3.value = 1;
    option3.setAttribute('label', 'normal');

    const option4 = document.createElement('option');
    option4.value = 1.4;
    option4.setAttribute('label', 'slow');

    datalist.append(option1, option2, option3, option4);

    controlsContainer.append(label, slider, datalist);

    slider.addEventListener('click', () => {
      window.dispatchEvent(
        new CustomEvent('gamespeed_change', { detail: { value: slider.value } })
      );
    });

    return controlsContainer;
  }

  function initiateDomForGameLoop() {
    console.log('initiateDomForGameLoop');
    shipPlacement.clearPlacementEventListeners();

    const flashingElements = document.querySelectorAll('.boardflash');
    flashingElements.forEach((element) =>
      element.classList.remove('boardflash')
    );

    const healthPanel = document.getElementById('health');
    healthPanel.style.transition = 'opacity 600ms linear';
    healthPanel.style.opacity = 0;
    healthPanel.addEventListener(
      'transitionend',
      () => {
        displayShipHealthPanel();
      },
      { once: true }
    );

    const opponentSection = document.querySelector('section');
    const opponentBoard = createOpponentboard();

    const statsContainer = document.getElementById('stats-container');
    const statsAside = createStatsAside();

    opponentBoard.style.transform = `translate(${
      window.innerWidth * 0.4
    }px, 0)`;
    statsAside.style.transform = `translate(${window.innerWidth * 0.4}px, 0)`;

    opponentSection.appendChild(opponentBoard);
    statsContainer.appendChild(statsAside);

    // Create battle stats menu structure, which will be generated and displayed when
    // user clicks the battle stats button
    const backdrop = document.createElement('div');
    backdrop.id = 'end-game-report-backdrop';
    backdrop.classList.add('backdrop');

    const endGameReportContainer = document.createElement('div');
    endGameReportContainer.id = 'end-game-report-container';

    backdrop.appendChild(endGameReportContainer);
    document.body.appendChild(backdrop);

    const battleStatsButton = document.querySelector('#stats button');
    battleStatsButton.addEventListener('click', (e) => {
      const endGameDialogBox = document.getElementById(
        'end-game-report-container'
      );
      endGameDialogBox.textContent = '';
      const battleReport = generateEndOfGameReport();
      endGameDialogBox.appendChild(battleReport);

      pauseAnimations();
      showBattleStats();
    });

    backdrop.addEventListener('click', (e) => {
      const isInside = e.target.closest('#end-game-report-container');
      const closeButton = document.querySelector('#end-game-close-button');

      if (!isInside || e.target === closeButton) {
        hideBattleStats();
        resumeAnimations();
      }
    });

    const opponentHeading = document.createElement('div');
    opponentHeading.style.opacity = 0;
    opponentHeading.textContent = 'Opponent board';
    opponentHeading.id = 'opponent-board-heading';
    document.querySelector('header#opponent').appendChild(opponentHeading);

    opponentBoard.style.transition = `transform 800ms cubic-bezier(0,.33,.31,1) 400ms`;
    statsAside.style.transition = `transform 800ms cubic-bezier(0,.63,.31,1) 600ms`;

    movePlayerboardToCenter(false);

    setTimeout(() => {
      opponentBoard.style.transform = `translate(0px, 0)`;
      statsAside.style.transform = `translate(0px, 0)`;
      opponentBoard.addEventListener(
        'transitionend',
        () => {
          opponentHeading.style.opacity = 1;
          createGameSpeedControls();
          window.dispatchEvent(new Event('dom_ready_for_game_loop'));
        },
        { once: true }
      );
    }, 5);
  }

  function displayShipHealthPanel() {
    const healthPanel = document.getElementById('health');
    healthPanel.textContent = '';

    const header = document.createElement('h3');
    header.textContent = 'Damage Report';

    const shipsAlive = document.createElement('p');
    const shipsTotal = p1board.getShipReport().shipsTotal;
    shipsAlive.innerHTML = `<span class="ships-sunk">0</span> of <span class="ships-total">${shipsTotal}</span> ships sunk.`;
    healthPanel.append(header, shipsAlive);

    const healthBoxContainer = document.createElement('div');
    healthBoxContainer.id = 'health-box-container';

    player1.getShips().forEach((ship) => {
      const shipName = ship.getName();

      const container = document.createElement('div');
      container.classList.add('ship-health-container');
      container.setAttribute('data-ship', shipName);
      container.style.width = `${20 * ship.getLength()}%`;

      const shipLength = ship.getLength();
      container.style.gridTemplateColumns = `repeat(${shipLength}, 1fr)`;

      for (let i = shipLength; i > 0; i--) {
        const healthBox = document.createElement('div');
        healthBox.classList.add('health-box');
        healthBox.setAttribute('data-shipsection', i);
        container.appendChild(healthBox);
      }

      const img = document.createElement('img');
      img.src = C.ships[shipName].sideimg;
      img.alt = C.ships[shipName].displayName;
      img.style.transform = 'scaleX(-1)';
      img.style.width = 'calc(100% - 12px)';

      container.appendChild(img);

      healthBoxContainer.appendChild(container);
    });

    healthPanel.appendChild(healthBoxContainer);

    healthPanel.style.opacity = 1;
  }

  function playerSelectAttack() {
    const playerBoard = document.getElementById('playerboard');
    const opponentBoard = document.getElementById('opponentboard');
    console.log('playerselectattack');
    opponentBoard.classList.remove('disable-hover');
    messageBox.write('Sir, where should we target?');

    playerBoard.classList.add('disable-hover');
    opponentBoard.style.boxShadow = '0 0 4px blue';
    opponentBoard.classList.add('boardflash');

    const controller = new AbortController();

    opponentBoard.addEventListener(
      'click',
      (e) => {
        console.log(e);
        console.log('clicked for attack to opponent');
        if (!e.target.matches('div.cell')) return;
        const row = e.target.dataset.row;
        const column = e.target.dataset.column;
        const cell = getCellFromCoordinates('opponent', row, column);

        if (cell.className.includes('miss') || cell.className.includes('hit')) {
          messageBox.write(
            "We can't target a space that has already received fire, sir."
          );
          return;
        }

        opponentBoard.classList.remove('boardflash');
        playerBoard.classList.remove('disable-hover');

        opponentBoard.classList.add('disable-hover');
        pingBoard('opponent', row, column, () => {
          window.dispatchEvent(
            new CustomEvent('player_target_selected', {
              detail: { row, column },
            })
          );
        });
        controller.abort(); // If the user selects a valid cell, signal that this event listener is done and can be removed
      },
      { signal: controller.signal }
    );
  }

  function getCellFromCoordinates(who, row, column) {
    let board;
    if (who === 'player') {
      board = document.getElementById('playerboard');
    } else if (who === 'opponent') {
      board = document.getElementById('opponentboard');
    }

    return board.querySelector(
      `.cell[data-row="${row}"][data-column="${column}"]`
    );
  }

  function pingBoard(who, row, column, executeAfterPing = null) {
    let board;
    if (who === 'player') {
      board = document.getElementById('playerboard');
    } else if (who === 'opponent') {
      board = document.getElementById('opponentboard');
    }

    const halfRowSpacing = board.clientWidth / 20;
    const halfColumnSpacing = board.clientHeight / 20;

    const pingElement = board.querySelector('.ping-container');

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
        if (executeAfterPing) executeAfterPing();
      },
      { once: true }
    );
  }

  function displayPlayerHit(row, column) {
    console.log(`cell from dh`);
    messageBox.write('Excellent sir! We got a hit.');
    const cell = getCellFromCoordinates('opponent', row, column);
    cell.classList.add('hit');
  }

  function displayPlayerMiss(row, column) {
    console.log('player miss');
    messageBox.write('Looks like we missed this time.');
    const cell = getCellFromCoordinates('opponent', row, column);
    cell.classList.add('miss');
  }

  function displayPlayerHitAfterSink(row, column, ship) {
    console.log('player sunk ship');
    messageBox.write(
      `Congratulations, sir! We sunk their <span class="ship">${
        C.ships[ship.getName()].displayName
      }</span>.`
    );
    const cell = getCellFromCoordinates('opponent', row, column);
    displayShipOnOpponentBoard(ship);
    cell.classList.add('hit');
  }

  function displayShipOnOpponentBoard(ship) {
    const shipImgUrl = C.ships[ship.getName()].topimg;
    const shipSize = ship.getLength();
    const shipDirection = ship.direction;
    const row = ship.startingCoordinates[0];
    const column = ship.startingCoordinates[1];

    const opponentBoard = document.getElementById('opponentboard');
    const imgContainer = document.createElement('div');
    imgContainer.classList.add('ship-icon-container');

    function setImagePosition() {
      const opponentBoardRect = opponentBoard.getBoundingClientRect();
      const cell = getCellFromCoordinates('opponent', row, column);
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
      } else if (shipDirection === 'down') {
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
    shipimg.alt = C.ships[ship.getName()].displayName;
    imgContainer.appendChild(shipimg);

    opponentBoard.appendChild(imgContainer);

    // Trigger the fade in transition
    imgContainer.style.animationDuration = `${1000 * C.gameSpeed}ms`;
    imgContainer.classList.add('fade-in');

    // Make sure that this element resizes properly when the window is changed
    window.addEventListener('resize', () => {
      setImagePosition();
    });
  }

  function displayOpponentResult(row, column, ship = null) {
    console.log('inside opponent result');

    // First the enemy fires, and a message is displayed
    messageBox.write('Enemy fire commencing...');
    const cell = getCellFromCoordinates('player', row, column);
    const board = document.getElementById('playerboard');
    board.classList.add('boardflash');

    // We wait to let the pingBoard animation play, then display result
    setTimeout(() => {
      pingBoard('player', row, column, () => {
        // If there was a hit...
        if (ship) {
          cell.classList.add('hit');
          addHitToHealthStatus(row, column);
          // ...and if they sunk our ship
          if (ship.isSunk()) {
            messageBox.write(
              `I'm sorry sir, our <span class="ship">${
                C.ships[ship.getName()].displayName
              }</span> has been sunk!`
            );
            model.sinkShip(ship.getName());
            updateShipsSunkReport();
            // ...but if they didn't sink it yet
          } else {
            messageBox.write(
              `Ahh! Our <span class="ship">${
                C.ships[ship.getName()].displayName
              }</span> has been damaged!`
            );
          }
          // And if they didn't get a hit at all
        } else {
          cell.classList.add('miss');
          messageBox.write('They missed. We were lucky.');
        }
        // finally, in any case, do this
        board.classList.remove('boardflash');
        setTimeout(() => {
          window.dispatchEvent(new Event('ready_for_player_attack'));
        }, 1500 * C.gameSpeed);
      });
    }, 1000 * C.gameSpeed);
  }

  function addHitToHealthStatus(row, column) {
    const cellObj = p1board.getCell([row, column]);
    const shipName = cellObj.getShip().getName();
    const partNumber = cellObj.getShipPartNumber();

    const healthCell = document.querySelector(
      `.ship-health-container[data-ship="${shipName}"] .health-box[data-shipsection="${partNumber}"]`
    );

    if (!healthCell) return;

    healthCell.classList.add('hit');
  }

  function updateShipsSunkReport() {
    const shipsSunkSpan = document.querySelector(
      'aside#health span.ships-sunk'
    );
    const shipsSunk = p1board.getShipReport().shipsSunk;

    shipsSunkSpan.textContent = shipsSunk;
  }

  function generateEndOfGameReport(winningPlayer = null) {
    // The function is called when somebody wins the game. In that case, an argument will
    // be passed and we will make some changes to the board. This function is also called
    // when a player clicks on the battle stats button, in which case no argument is
    // passed.

    if (winningPlayer) {
      winner = winningPlayer;
      const battleStatsButton = document.querySelector('#stats button');
      battleStatsButton.textContent = 'Open endgame screen';
      battleStatsButton.classList.add('boardflash');
    }

    const endGameTextContainer = document.createElement('div');
    endGameTextContainer.id = 'end-game-text-container';

    const header = document.createElement('h1');
    const header2 = document.createElement('h2');

    if (winner === 'player') {
      header.textContent =
        'May our victory today echo through history. It was an honor, sir.';
      header2.textContent = 'You have won!';
      header2.style.color = 'rgb(75, 255, 75)';
      endGameTextContainer.append(header, header2);
    } else if (winner === 'opponent') {
      header.textContent =
        'Although now we flee, from the ashes we shall rise another day...';
      header2.textContent = 'You have lost.';
      header2.style.color = 'rgb(255, 65, 65)';
      endGameTextContainer.append(header, header2);
    } else {
      header.textContent = 'The battle rages on...';
      endGameTextContainer.append(header);
    }

    const stats = document.createElement('h2');
    stats.textContent = 'Battle Report';

    const statsContainer = document.createElement('div');
    statsContainer.id = 'end-game-stats-container';

    const playerLog = p1board.getLog();
    const opponentLog = p2board.getLog();

    const playerReceivedHitsNumber = playerLog.reduce((acc, shot) => {
      if (shot.hit === true) {
        return (acc += 1);
      } else {
        return acc;
      }
    }, 0);

    const playerReceivedShotsNumber = playerLog.length;
    const playerReceivedShotsPercentHit = !playerReceivedShotsNumber
      ? '0.0%'
      : `${(
          (playerReceivedHitsNumber / playerReceivedShotsNumber) *
          100
        ).toFixed(1)}%`;
    const playerBoatsSunkNumber = p1board.getShipReport().shipsSunk;

    const opponentReceivedHitsNumber = opponentLog.reduce((acc, shot) => {
      if (shot.hit === true) {
        return (acc += 1);
      } else {
        return acc;
      }
    }, 0);

    const opponentReceivedShotsNumber = opponentLog.length;

    // If the opponentReceivedShotsNumber is 0, we can't divide by 0, so just write 0%
    const opponentReceivedShotsPercentHit = !opponentReceivedShotsNumber
      ? '0.0%'
      : `${(
          (opponentReceivedHitsNumber / opponentReceivedShotsNumber) *
          100
        ).toFixed(1)}%`;
    const opponentBoatsSunkNumber = p2board.getShipReport().shipsSunk;

    const gridHeaderPlayer = document.createElement('p');
    gridHeaderPlayer.textContent = 'YOU';
    const playerShotsFired = document.createElement('p');
    playerShotsFired.innerHTML = `Shots fired: ${opponentReceivedShotsNumber}`;
    const playerShotsHit = document.createElement('p');
    playerShotsHit.innerHTML = `Shots hit: ${opponentReceivedHitsNumber}`;
    const playerShotsHitPercent = document.createElement('p');
    playerShotsHitPercent.innerHTML = `Hit rate: ${opponentReceivedShotsPercentHit}`;
    const playerBoatsSunk = document.createElement('p');
    playerBoatsSunk.innerHTML = `Boats sunk: ${opponentBoatsSunkNumber}`;

    const gridHeaderOpponent = document.createElement('p');
    gridHeaderOpponent.textContent = 'THE COMPUTER';
    const opponentShotsFired = document.createElement('p');
    opponentShotsFired.innerHTML = `Shots fired: ${playerReceivedShotsNumber}`;
    const opponentShotsHit = document.createElement('p');
    opponentShotsHit.innerHTML = `Shots hit: ${playerReceivedHitsNumber}`;
    const opponentShotsHitPercent = document.createElement('p');
    opponentShotsHitPercent.innerHTML = `Hit rate: ${playerReceivedShotsPercentHit}`;
    const opponentBoatsSunk = document.createElement('p');
    opponentBoatsSunk.innerHTML = `Boats sunk: ${playerBoatsSunkNumber}`;

    statsContainer.append(
      gridHeaderPlayer,
      playerShotsFired,
      playerShotsHit,
      playerShotsHitPercent,
      playerBoatsSunk,
      gridHeaderOpponent,
      opponentShotsFired,
      opponentShotsHit,
      opponentShotsHitPercent,
      opponentBoatsSunk
    );

    const playTime = document.createElement('p');
    playTime.id = 'play-time';

    const playTimeEnd = Date.now();
    const playTimeMS = playTimeEnd - playTimeBegin;
    const playTimeHours = Math.floor(playTimeMS / 3600000);
    const playTimeMinutes = Math.floor((playTimeMS % 3600000) / 60000);
    const playTimeSeconds = Math.floor((playTimeMS % 60000) / 1000);
    playTime.textContent = `Total play time: ${String(playTimeHours).padStart(
      2,
      '0'
    )}:${String(playTimeMinutes).padStart(2, '0')}:${String(
      playTimeSeconds
    ).padStart(2, '0')}`;

    const buttonRow = document.createElement('div');
    const restartButton = document.createElement('button');

    restartButton.addEventListener('click', () => {
      window.dispatchEvent(new Event('restart_game'));
    });

    restartButton.textContent = 'Restart game';
    const closeDialog = document.createElement('button');
    closeDialog.textContent = 'Close window and go back to board';
    closeDialog.id = 'end-game-close-button';

    buttonRow.append(restartButton, closeDialog);

    endGameTextContainer.append(stats, statsContainer, playTime, buttonRow);

    return endGameTextContainer;
  }

  function pauseAnimations() {
    const flashingElements = document.querySelectorAll('.boardflash');
    flashingElements.forEach(
      (element) => (element.style.animationPlayState = 'paused')
    );
  }

  function resumeAnimations() {
    const flashingElements = document.querySelectorAll('.boardflash');
    flashingElements.forEach(
      (element) => (element.style.animationPlayState = 'running')
    );
  }

  function disableInteractivity() {
    messageBox.clear();
    const flashingElements = document.querySelectorAll('.boardflash');
    flashingElements.forEach((element) =>
      element.classList.remove('boardflash')
    );

    document.getElementById('playerboard').classList.add('disable-hover');
    document.getElementById('opponentboard').classList.add('disable-hover');
  }

  return {
    startAddShipPhase,
    initiateDomForGameLoop,
    playerSelectAttack,
    displayPlayerHit,
    displayPlayerMiss,
    displayPlayerHitAfterSink,
    displayOpponentResult,
    displayShipOnOpponentBoard,
    getCellFromCoordinates,
    updateShipsSunkReport,
    generateEndOfGameReport,
    disableInteractivity,
  };
}
