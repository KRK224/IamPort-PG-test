const axios = require("axios");
const {OrderInfo} = require('axios');

const webhookSchedule = async (req, res, next) => {
  try{

    console.log('webhookSchedule 받음');
    const { imp_uid, merchant_uid } = req.body;

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

    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
      method: "get", // GET method
      headers: { "Authorization": access_token } // 인증 토큰 Authorization header에 추가
    });
    
    const paymentData = getPaymentData.data.response; // 조회한 결제 정보

    // DB에서 결제되어야 하는 금액 조회
    const order = await OrderInfo.findOne({
      where: {
        merchantUid: paymentData.merchant_uid,
      },
    });

    if (!order.paidAmount) {
      // 결제 완료 전
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

    // 새로운 결제 예약

    const dt = new Date(paymentData.paid_at);
    console.log('현재 결제 예약시간: ', dt);
    let dtMin = dt.getMinutes();

    dtMin += 3;
    dt.setMinutes(dtMin);
    console.log('다음 결제 예약시간: ', dt);
    
    console.log()
    const dtTimestamp = dt.getTime();
    console.log('dtTimestamp');

    axios({ 
      url: `https://api.iamport.kr/subscribe/payments/schedule`,
      method: "post",
      headers: { "Authorization": access_token }, // 인증 토큰 Authorization header에 추가
      data: {
        customer_uid, // 카드(빌링키)와 1:1로 대응하는 값
        schedules: [
          {
            merchant_uid: merchant_uid + dt, // 주문 번호
            schedule_at: dtTimestamp, // 결제 시도 시각 in Unix Time Stamp. 예: 다음 달 1일
            amount,
            name: "월간 이용권 정기결제",
            buyer_name: userName,
            buyer_tel: userTel,
            buyer_email: userEmail
          }
        ]
      }
    });

  } catch(err) {
    const error = new Error(err.message);
    next(error);
  }
}

module.exports = webhookSchedule;