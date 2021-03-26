/* ------------------------------------------------------- */
/* --------------------- 1st Phase ----------------------- */ 
/* ------------------------------------------------------- */
let currentGame = null;
let gameStatus =  0;

// Create DOM elements.
const loginFormDiv = document.createElement('div');
const emailInput = document.createElement('input');
const passwordInput = document.createElement('input');
const submitBtn = document.createElement('input');
const startBtn = document.createElement('button');

// Add attributes/classes to DOM elements.
// 1st Phase: Container for login form.
loginFormDiv.classList.add('container', 'w-75')

// 1st Phase: Email input.
emailInput.setAttribute('name', 'email');
emailInput.setAttribute('placeholder', 'jerome@test.com');
emailInput.classList.add('form-control', 'mt-5', 'mx-4')

// 1st Phase: Password input.
passwordInput.setAttribute('name', 'password');
passwordInput.setAttribute('placeholder', 'jerome');
passwordInput.classList.add('form-control', 'mx-4', 'mt-1')

// 1st Phase: Logging In.
submitBtn.setAttribute('type', 'submit');
submitBtn.setAttribute('value', 'Login');
submitBtn.classList.add('btn', 'btn-dark', 'm-4','px-5');

// 2nd Phase: Start Game.
startBtn.classList.add('btn', 'btn-success', 'btn-lg','m-5','px-5')
startBtn.style.display = 'none';
startBtn.innerText = 'Start Game!';


/* ------------------------------------------------------- */
/* --------------------- 2nd Phase ----------------------- */ 
/* ------------------------------------------------------- */

/* ------------------- Helper Functions ------------------ */ 

// Make a request to the server to change the deck. 
// Set 2 new cards into the player hand.
const dealCards = async () => {
  try { 
    const updateHand = await axios.put(`/games/${currentGame.id}/deal`)
    const playerOneResult = document.querySelector('#player-one-result');
    const playerTwoResult = document.querySelector('#player-two-result');
    
    console.log("Updated Hand info (after clicking DealBtn):", updateHand);

    currentGame = updateHand.data;
    gameStatus += 1
    displayCards(currentGame)
    displayGameResult(currentGame);

    if (currentGame.gameResult === 'PLAYER_ONE') {
      playerOneResult.style.visibility = 'visible';

      setTimeout(() => {
        playerOneResult.style.visibility = 'hidden';
      }, 2000);

    } else if (currentGame.gameResult === 'PLAYER_TWO') {
      playerTwoResult.style.visibility = 'visible';

      setTimeout(() => {
        playerTwoResult.style.visibility = 'hidden';
      }, 2000);
    }

  } catch (err) {
    console.log('err', err);
  }
}


const updateGameStatus = async () => {
  try {
    const updateGameStatus = await axios.put(`/games/${currentGame.id}/${gameStatus}/refresh`);

    // Create a DOM element to display who turn it is.
    const gameStatusMsg = document.createElement('h3');
    gameStatusMsg.classList.add('lead','text-center', 'mt-4');
    gameStatusMsg.innerText = `Current Turn: ${updateGameStatus.data.gameStatus}`;
    document.body.appendChild(gameStatusMsg);

    // Make gameStatus message disappear.
    setTimeout(() => {
      gameStatusMsg.remove();
    }, 2000)

  } catch (err) {
    console.log("errror:", err);
  }
}

// Helper function for game play container.
const initGameDiv = () => {
  // 1st Section (where Deal & Refresh Btns are displayed).
  const gamesDiv = document.createElement('div');
  gamesDiv.setAttribute('id', 'game-div')

  const dealBtn = document.createElement('button');
  dealBtn.classList.add('btn', 'btn-lg', 'btn-success', 'ml-4', 'my-5','px-3')
  dealBtn.addEventListener('click', dealCards);
  dealBtn.innerText = 'Deal';

  const refreshBtn = document.createElement('button');
  refreshBtn.classList.add('btn', 'btn-lg', 'btn-warning', 'ml-2', 'my-5')
  refreshBtn.addEventListener('click', updateGameStatus);
  refreshBtn.innerText = 'Refresh';

  // 2nd Section (where P1 & P2 cards are displayed).
  const dealListDiv = document.createElement('div');
  dealListDiv.classList.add('container')

  const singleDealDiv = document.createElement('div');
  singleDealDiv.classList.add('row', 'mt-1');

  const singleDealHeader = document.createElement('h4');
  singleDealHeader.innerText = 'Single Deal';
  singleDealHeader.classList.add('col-12', 'text-center');

  const playerOneWinner = document.createElement('div');
  playerOneWinner.classList.add('col-6', 'text-center');
  playerOneWinner.setAttribute('id', 'player-one-result');

  const playerTwoWinner = document.createElement('div');
  playerTwoWinner.classList.add('col-6', 'text-center');
  playerTwoWinner.setAttribute('id', 'player-two-result');

  const playerOneDiv = document.createElement('div');
  playerOneDiv.classList.add('col-6', 'text-center');
  playerOneDiv.setAttribute('id', 'player-one');

  const playerTwoDiv = document.createElement('div');
  playerTwoDiv.classList.add('col-6', 'text-center');
  playerTwoDiv.setAttribute('id', 'player-two');


  // gameResultRow.append(gameResultP1, gameResultP2);
  singleDealDiv.append(singleDealHeader, playerOneWinner, playerTwoWinner, playerOneDiv, playerTwoDiv);
  dealListDiv.appendChild(singleDealDiv);
  gamesDiv.append(dealBtn, refreshBtn, dealListDiv);
  document.body.appendChild(gamesDiv);
}

// 2nd Phase: DOM Manipulation to display player curent card.
const displayCards = ( { playerOneHand, playerTwoHand } ) => {
  const playerOneDiv = document.querySelector('#player-one')
  const playerTwoDiv = document.querySelector('#player-two')

  playerOneDiv.innerText = `
    Player 1 Hand:
    ====
    ${playerOneHand[0].name}
    of
    ${playerOneHand[0].suit}
    ====
  `;

  playerTwoDiv.innerText = `
    Player 2 Hand:
    ====
    ${playerTwoHand[0].name}
    of
    ${playerTwoHand[0].suit}
    ====
  `;
};

const displayGameResult = ({ gameResult }) => {
  const playerOneWinner = document.querySelector('#player-one-result');
  const playerTwoWinner = document.querySelector('#player-two-result');

  gameResult === "PLAYER_ONE" ? playerOneWinner.innerText = "WINNER!" : playerTwoWinner.innerText = "WINNER!"
}


/* ------------------- Start the Game -------------------- */ 

const createGameRecord = () => {
  // Make POST request to create a new game.
  axios
    .post('/games')
    .then((res) => {
      console.log("Game data sent to /games: ", res.data);
      currentGame = res.data;   // Set global value to the new game.
    })
    .catch(err => console.log("error : ", err));
}

// Callback function to Start Game & Add Game Record.
const startBtnCb = () => {
  startBtn.remove();
  initGameDiv()
  createGameRecord()  
}

// 1st Phase & start of 2nd Phase
submitBtn.addEventListener('click', async () => {
  try {
    const logInData = {
      email: emailInput.value,
      password: passwordInput.value,
    }

    const logIn = await axios.post('/login', logInData);
    // If user successfully logs in, remove "Login Form".
    if (logIn.data === "SUCCESS") {
      loginFormDiv.remove();
      startBtn.style.display = 'block';
      startBtn.addEventListener('click', startBtnCb)
    }
  } catch (err) {
    console.log(err);
  }
});

// Append create elements to DOM.
loginFormDiv.append(emailInput, passwordInput, submitBtn);
document.body.appendChild(loginFormDiv);
document.body.appendChild(startBtn);




