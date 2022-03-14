const axios = require("axios");
const { OrderInfo } = require("../../models");

// dotenv.config();

const completePayment = async (req, res, next) => {
  try {
    console.log('******* 클라이언트에서 결제 정보 전달');
    const { imp_uid, merchant_uid, req_amount } = req.body;

    // 레코드 존재 유무 확인 및 생성
    const [existedOrder, created] = await OrderInfo.findOrCreate({
      where: {
        impUid: imp_uid,
      },
      defaults: {
        merchantUid: merchant_uid,
        amount: req_amount,
      },
    })
    
    if (created) {
      console.log("new order: ", existedOrder.dataValues);
    } else {
      console.log("old order: ", existedOrder.dataValues);
    }
    

    // 액세스 토큰(access token) 발급 받기
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      data: {
        imp_key: process.env.IMP_KEY, // REST API 키
        imp_secret: process.env.IMP_SECRET, // REST API Secret
      },
    });
    const { access_token } = getToken.data.response; // 인증 토큰

    // imp_uid로 아임포트 서버에서 결제 정보 조회
    const paymentResult = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
      method: "get", // GET method
      headers: { Authorization: access_token }, // 인증 토큰 Authorization header에 추가
    });

    // 조회한 결제 정보
    const paymentData = paymentResult.data.response;

    // DB에서 결제되어야 하는 금액 조회
    const order = await OrderInfo.findOne({
      where: {
        merchantUid: paymentData.merchant_uid,
      },
    });

    console.info('************* 클라이언트에서 받아온 정보로 DB 데이터 읽어옴.');
    console.log(order);
    console.log(Object.keys(order));

    if (!order.paidAmount) {
      // 결제 완료 전
      console.log('****** 클라이언트에서 받아온 정보로 DB 데이터 결제 완료 전');
      const amountToBePaid = order.amount;
      console.log("amountToBePaid: ", amountToBePaid);

      // 결제 검증하기
      const { amount, status } = paymentData;

      console.log("paymentData.amount: ", amount);

      if (amount === amountToBePaid) {
        switch (status) {
          case "paid":
            await OrderInfo.update(
              {
                // DB에 결제 정보 저장
                pgTid: paymentData.pg_tid,
                paidAmount: paymentData.amount,
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
      } else {
        await OrderInfo.update(
          {
            paidAmount: paymentData.amount,
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
      console.info("서버 check: 주문 번호 ", order.merchantUid, "는 완료된 주문입니다.");
    }
  } catch (err) {
    const error = new Error(err.message);
    next(error);
  }
};

module.exports = completePayment;
