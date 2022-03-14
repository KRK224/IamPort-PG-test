const { DataTypes, Model } = require("sequelize");

class BuyerInfo extends Model {
  static init(sequelize) {
    return super.init({
      buyerName: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      buyerEmail: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      buyerTel: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      buyerAddr: {
        type: DataTypes.STRING(128),
        allowNull: false,
      }
    }, {
      sequelize,
        timestamps: true,
        underscored: true,
        modelName: "BuyerInfo",
        tableName: "buyer_info",
        createdAt: "createDate",
        updateAt: "updateDate",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
    })
  };

  static associate(db){
    db.BuyerInfo.belongsTo(db.OrderInfo, {
      foreignKey: 'impUid',
      targetKey: 'impUid'
    })
  }
};

module.exports = BuyerInfo;