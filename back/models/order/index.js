const { DataTypes, Model } = require('sequelize');

class OrderInfo extends Model {
  static init(sequelize) {
    return super.init(
      {
        impUid : {
          type: DataTypes.STRING(128),
          allowNull: true,
          comment: '아임포트 고유 결제번호',
        },
        merchantUid: {
          type: DataTypes.STRING(128),
          allowNull: false,
          primaryKey: true,
          comment: '가맹점에서 생성/관리하는 고유 주문번호',
        },
        amount: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          comment: '결제 요청 금액'
        },
        pgTid: {
          type: DataTypes.STRING(128),
          allowNull: true,
          comment: 'PG사 거래고유번호'
        },
        cancelAmount: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          defaultValue: 0,
          comment: '환불된 금액'
        },
        paidAt: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '결제일'
        },
        cancelledAt: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '환불일'
        },
        paidAmount: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          defaultValue: 0, 
          comment: '실제 결제 금액'
        },
        errorYN: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          comment: '에러 유무'
        }
      }, {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: 'OrderInfo',
        tableName: 'order_info',
        createdAt: 'createDate',
        updatedAt: 'updateDate',
        paranoid: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      }
    )
  }

  static associate(db) {
    db.OrderInfo.belongsTo(db.CustomerInfo, {
      foreignKey: 'customerId',
      targetKey: 'customerId',
      as: 'customer'
    });
/*
    db.OrderInfo.hasOne(db.BuyerInfo, {
      foreignKey: 'impUid',
      sourceKey: 'impUid',
      as: 'buyer'
    })
*/
  }

};

module.exports = OrderInfo;
