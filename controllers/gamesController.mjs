/* ---------------------------------------------------- */  
/* ---------------- Card Deck Functions --------------- */
/* ---------------------------------------------------- */  
import sequelizeOperator from 'sequelize';
const { Op } = sequelizeOperator;

const getRandomIndex = (size) => Math.floor(Math.random() * size);

const shuffleCards = (cards) => {
  let currentIndex = 0;

  // Loop over entire cards array.
  while (currentIndex < cards.length) {
    const randomIndex = getRandomIndex(cards.length); // Pick random position from deck.
    const currentItem = cards[currentIndex]; // Get current card in the loop.
    const randomItem = cards[randomIndex]; // Get the random card.

    // Swap the current card with the random card & vice-versa.
    cards[currentIndex] = randomItem;
    cards[randomIndex] = currentItem;

    currentIndex += 1;
  }
  return cards;
};

const makeDeck = () => {
  // Create empty deck.
  const deck = [];
  const suits = ['❤️', '♦️', '♣️', '♠️'];

  let suitIndex = 0;
  while (suitIndex < suits.length) {
    const currentSuit = suits[suitIndex];

    // Loop to create all 13x cards within current suit.
    let rankCounter = 1;
    while (rankCounter <= 13) {
      let cardName = rankCounter;

      // Ace, J, Q, K
      if (cardName === 1) {
        cardName = 'ace';
      } else if (cardName === 11) {
        cardName = 'jack';
      } else if (cardName === 12) {
        cardName = 'queen';
      } else if (cardName === 13) {
        cardName = 'king';
      }

      const card = {
        name: cardName,
        suit: currentSuit,
        rank: rankCounter,
      };

      // Add card to the deck.
      deck.push(card);

      rankCounter += 1;
    }
    suitIndex += 1;
  }
  return deck;
}

/* ---------------------------------------------------- */  
/* ---------------- Controller Functions -------------- */
/* ---------------------------------------------------- */  
export default function initGamesControler(db) {
  // Clicking on StartBtn (in script.js), adds a new game record row to db.Game
  // Also creates/shuffles a new deck & saves it into the game record.
  const create = async (req, res) => {
    const cardDeck = shuffleCards(makeDeck());
    const playerOneHand = [cardDeck.pop(), cardDeck.pop()];
    const playerTwoHand = [cardDeck.pop(), cardDeck.pop()];
    const gameStatus = 'PLAYER_ONE';

    const newGame = {
      gameState: {
        cardDeck,
        playerOneHand,
        playerTwoHand,
        gameStatus,
      },
    };

    const { userId } = req.cookies;

    try {
      // Create game in 'games' table.
      const game = await db.Game.create(newGame);

      const user = await db.User.findOne({
        where: { 
          id: Number(userId),
        },
      });

      const otherUser = await db.User.findAll({
        where: {
          id: {  
            [Op.gt]: userId 
          },
        },
      });
      
      // Create association between game & users;
      const players = await db.User.findAll({
        where: {
          [Op.or]: [ { id: Number(userId) }, { id: otherUser[0].id } ]
        },
      });

      const createdGame = await db.Game.findOne({
        where: {
          id: game.id,
        },
      });

      // console.log(Object.getOwnPropertyNames(createdGame.__proto__));
      // Create a row in 'game_users' table (associate users & their game).
     await createdGame.addUsers(players);

      // Send the New game back to the user (deck is not send back to prevent cheating)
      res.send({
        id: game.id,
        playerOneHand: game.gameState.playerOneHand,
        playerTwoHand: game.gameState.playerTwoHand,
      });

    } catch (err) {
      res.status(500).send(err);
    }
  }

  const deal = async (req, res) => {
    try {
      // Get the game by the ID passed in the PUT request.
      const game = await db.Game.findByPk(req.params.id);

      // Make changes to the cardHand object.
      const playerOneHand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];
      const playerTwoHand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];

      // Check for a winner, loser, draw.
      const winner = playerOneHand[0].rank > playerTwoHand[0].rank ? "PLAYER_ONE" 
                    : playerTwoHand[0].rank > playerOneHand[0].rank ? "PLAYER_TWO"
                    : "DRAW";

      // Update game with new info.
      await game.update({
        gameState: {
          cardDeck: game.gameState.cardDeck,
          playerOneHand,
          playerTwoHand,
          gameResult: winner,
        }
      });

      // Send the updated game back to the user (deck is not send back to prevent cheating)
      res.send({
        id: game.id,
        playerOneHand: game.gameState.playerOneHand,
        playerTwoHand: game.gameState.playerTwoHand,
        gameResult: winner,
      });

    } catch (err) {
      console.log('Error:', err);
    }
  }

  const refresh = async(req, res) => {
    try {
      const game = await db.Game.findByPk(req.params.id);
      const nextPlayer = req.params.status % 2 === 0 ? "PLAYER_ONE" : "PLAYER_TWO"

      await game.update({
              gameState: {
                cardDeck: game.gameState.cardDeck,
                gameStatus: nextPlayer,
              }
            });

      res.send({
            id: game.id,
            gameStatus: nextPlayer,
          });
    } catch (err) {
      console.log("error", err);
    }
  }
  
  return { create, deal, refresh }
}