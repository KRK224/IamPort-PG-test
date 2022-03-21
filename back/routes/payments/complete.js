const axios = require("axios");
const { OrderInfo } = require("../../models");
const { getToken, getPaymentsInfo } = require("../../api");
const chalk = require('chalk');

// dotenv.config();

const completePayment = async (req, res, next) => {
  try {
    console.log("******* 클라이언트에서 결제 정보 전달");
    const { imp_uid, merchant_uid, req_amount } = req.body;

    // 레코드 존재 유무 확인 및 생성 (webhook 고려)
    const [existedOrder, created] = await OrderInfo.findOrCreate({
      where: {
        impUid: imp_uid,
      },
      defaults: {
        merchantUid: merchant_uid,
        amount: req_amount,
      },
    });

    if (created) {
      console.log("new order: ", existedOrder.dataValues);
    } else {
      console.log("old order: ", existedOrder.dataValues);
    };

    const token = await getToken(process.env.IMP_KEY, process.env.IMP_SECRET);

    const { access_token } = token.data.response; // access_token 추출

    // imp_uid로 아임포트 서버에서 결제 정보 조회
    const paymentResult = await getPaymentsInfo(access_token, imp_uid);
    // console.log(chalk.red('paymentResult 값'), paymentResult);

    // 조회한 결제 정보
    const paymentData = paymentResult.data.response;
    const { amount, status, pg_tid, paid_at } = paymentData;

    // console.log(chalk.red('paymentResult.data.response: '), paymentData);

    // DB에서 결제되어야 하는 금액 조회

    console.info(
      "************* 클라이언트에서 받아온 정보로 DB 데이터 읽어옴."
    );
    // console.log(order);
    // console.log(Object.keys(order));

    if (!existedOrder.paidAmount) {
      // 결제 완료 전
      console.log("****** 클라이언트에서 받아온 정보로 DB 데이터 결제 완료 전");
      const amountToBePaid = existedOrder.amount;
      console.log("amountToBePaid: ", amountToBePaid);

      // 결제 검증하기
      

      console.log("paymentData.amount: ", amount);

      if (amount === amountToBePaid) {
        switch (status) {
          case "paid":
            await OrderInfo.update(
              {
                // DB에 결제 정보 저장
                pgTid: pg_tid,
                paidAmount: amount,
                paidAt: paid_at*1000,
                errorYN: false,
              },
              {
                where: {
                  merchantUid: paymentData.merchant_uid,
                },
              }
            );
            res.send({ status: "success", message: "일반 결제 성공" });
            break;
          case "ready":
            res.send({
              status: "vbankIssued",
              message: "가상 계좌 결제를 처리하지 않습니다!",
            });
            break;
        }
      } else { // 결제 금액 위변조
        await OrderInfo.update(
          {
            paidAmount: amount,
            paidAt: paid_at*1000,
            pgTid: pg_tid,
            errorYN: true,
          },
          {
            where: {
              merchantUid: paymentData.merchant_uid,
            },
          }
        );
        throw { status: "foregery", message: "위조된 결제 시도" };
      }
    } else {
      // 결제 완료된 주문
      console.info(
        "서버 check: 주문 번호 ",
        existedOrder.merchantUid,
        "는 완료된 주문입니다."
      );
    }
  } catch (err) {
    const error = new Error(err.message);
    next(error);
  }
};

module.exports = completePayment;
