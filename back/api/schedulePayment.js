const axios = require('axios');

const schedulePayment = (access_token, customerId, merchant_uid, schedule_at, amount, name, notice_url) =>{
  return axios({
    url: `https://api.iamport.kr/subscribe/payments/schedule`,
      method: "post",
      headers: { Authorization: access_token }, // 인증 토큰 Authorization header에 추가
      data: {
        customer_uid: customerId, // 카드(빌링키)와 1:1로 대응하는 값
        schedules: [
          {
            merchant_uid, // 주문 번호
            schedule_at, // 결제 시도 시각 in Unix Time Stamp. 예: 다음 달 1일
            amount,
            name,
            notice_url, // 예약 webhook url 설정.
          },
        ],
      },
  });
}

module.exports = schedulePayment;