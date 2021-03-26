import { Sequelize } from 'sequelize';
import allConfig from '../config/config.js';

import initGameModel from './gameModel.mjs';
import initUserModel from './userModel.mjs';

const env = process.env.NODE_ENV || 'development';
const config = allConfig[env];

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.User = initUserModel(sequelize, Sequelize.DataTypes);
db.Game = initGameModel(sequelize, Sequelize.DataTypes);

db.Game.belongsToMany(db.User, { through: 'game_users'});
db.User.belongsToMany(db.Game, { through: 'game_users'});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
export default db;