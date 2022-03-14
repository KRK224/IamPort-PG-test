const { DataTypes, Model } = require("sequelize");

class CustomerInfo extends Model {
  static init(sequelize) {
    return super.init(
      {
        customerId: {
          type: DataTypes.STRING(128),
          allowNullll: false,
          primaryKey: true,
        },
        userName: {
          type: DataTypes.STRING(128),
          allowNull: false,
        },
        userEmail: {
          type: DataTypes.STRING(128),
          allowNull: false,
        },
        userTel: {
          type: DataTypes.STRING(128),
          allowNull: false,
        },
        billingYN: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "CustomerInfo",
        tableName: "customer_info",
        createdAt: "createDate",
        updateAt: "updateDate",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      }
    );
  }

  static associate(db) {
    db.CustomerInfo.hasMany(db.OrderInfo, {
      foreignKey: "customerId",
      sourceKey: "customerId",
      as: "orderList",
    });
  }
};

module.exports = CustomerInfo;
