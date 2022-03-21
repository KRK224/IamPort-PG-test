const axios = require("axios");

const requestPayment = (access_token, customer_uid, merchant_uid, amount, name, notice_url) => {
  console.log('requestPayment noticeURL', notice_url);

  return axios({
    url: `https://api.iamport.kr/subscribe/payments/again`,
    method: "post",
    headers: { Authorization: access_token }, // 인증 토큰을 Authorization header에 추가
    data: {
      customer_uid,
      merchant_uid, // 새로 생성한 결제(재결제)용 주문 번호
      amount,
      name,
      notice_url,
    },
  });
};

module.exports = requestPayment;
