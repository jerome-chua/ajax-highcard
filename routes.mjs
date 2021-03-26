import db from './models/index.mjs';
import initUsersController from './controllers/usersController.mjs'
import initGamesController from './controllers/gamesController.mjs'

export default function bindRoutes(app) {
  const UsersController = initUsersController(db);
  const GamesController = initGamesController(db);

  app.get('/', UsersController.loginPage);
  app.post('/login', UsersController.loginDetails)
  
  app.post('/games', GamesController.create); 
  app.put('/games/:id/deal', GamesController.deal);
  app.put('/games/:id/:status/refresh', GamesController.refresh);
}