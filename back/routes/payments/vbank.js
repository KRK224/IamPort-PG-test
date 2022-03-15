const axios = require('axios');
const { OrderInfo } = require('../../models');

const vbankPayment = async (req, res, next) => {
  try {
    console.log('********** 클라이언트에서 가상결제 시도');
    const { imp_uid, merchant_uid, req_amount, vbank_num, vbank_name, vbank_date } = req.body;

    // 레코드 존재 유무 확인 및 생성

    const [existedOrder, created] = await OrderInfo.findOrCreate({
      where: {
        impUid: imp_uid,
      },
      defaults: {
        impUid: imp_uid,
        merchantUid: merchant_uid,
        amount: req_amount
      },
    });

    if (created) {
      console.log('new order: ', existedOrder.dataValues);
    } else {
      console.log('old order: ', existedOrder.dataValues);
    }

  } catch (err) {
    const error = new Error(err.message);
    next(error);
  }
}