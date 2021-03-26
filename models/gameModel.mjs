export default function initGameModel(sequelize, DataTypes) {
  return sequelize.define(
  'Game', 
    {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      gameState: {
        type: DataTypes.JSON,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      underscored: true,
    }
  );
};