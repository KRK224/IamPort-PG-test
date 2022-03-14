const axios = require('axios');
const { CustomerInfo, OrderInfo } = require("../../models");

const requestScheduleBilling = async (req, res, next) => {0
  
  const { userName, userEmail, merchant_uid, amount } = req.body;
  
  const dt = new Date();
  console.log(dt);
  let dtMinutes = dt.getMinutes();
  dtMinutes += 10;
  dt.setMinutes(dtMinutes);
  console.log(dt);
  const dtTimestamp = Math.floor(dt.getTime()/ 1000);
  console.log(dtTimestamp);
  const newDt = new Date(dtTimestamp);
  console.log('새로운 예약 시간', newDt);

  // res.send({status: 'test', message: 'testing 중'});


  const [existedOrder, created] = await OrderInfo.findOrCreate({
    where: {
      merchantUid: merchant_uid,
    },
    defaults: {
      merchantUid: merchant_uid,
      amount,
    },
  });

  if (created) {
    console.log("new order: ", existedOrder.dataValues);
  } else {
    console.log("old order: ", existedOrder.dataValues);
  }

  /*
  dt.setFullYear(); // year 설정
  dt.setMonth(); // 0 - 1월 설정
  dt.setDate(); // 일 설정
  const timestamp = new Date().getTime();
  */

  try{
    const customer = await CustomerInfo.findOne({
      where: {
        userName,
        userEmail,
      },
    });

    const { customerId, userTel }= customer;
    console.log(customerId);

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
    console.log('토큰 발급 완료');

    await axios({
      url: `https://api.iamport.kr/subscribe/payments/schedule`,
      method: "post",
      headers: { "Authorization": access_token }, // 인증 토큰 Authorization header에 추가
      data: {
        customer_uid: customerId, // 카드(빌링키)와 1:1로 대응하는 값
        schedules: [
          {
            merchant_uid, // 주문 번호
            schedule_at: dtTimestamp, // 결제 시도 시각 in Unix Time Stamp. 예: 다음 달 1일
            amount,
            name: "월간 이용권 정기결제",
            buyer_name: userName,
            buyer_tel: userTel,
            buyer_email: userEmail
          }
        ]
      }
    }).then(rsp => {
      console.log(rsp.data);
      console.log(rsp.data.message);

    });

  } catch (err) {
    const error = new Error(err.message);
    next(error);
  }

}

module.exports = requestScheduleBilling;