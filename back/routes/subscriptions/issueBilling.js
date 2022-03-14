const axios =require('axios');
const { CustomerInfo } = require('../../models');

const issueBilling = async (req, res, next) => {
  try {
    console.log('issueBilling 진입');
    
    const {
      cardNumber, // 카드 번호
      expiry, // 카드 유효기간
      birth, // 생년월일
      pwd2Digit, // 카드 비밀번호 앞 두자리,
      customer_uid, // 카드(빌링키)와 1:1로 대응하는 값
    } = req.body; // req의 body에서 카드정보 추출
    console.log('issueBilling request 확인');

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

    console.log('인증토큰 발급 완료');

    const issueBilling = await axios({
      url: `https://api.iamport.kr/subscribe/customers/${customer_uid}`,
      method: "post",
      headers: { "Authorization": access_token }, // 인증 토큰 Authorization header에 추가
      data: {
        card_number: cardNumber, // 카드 번호
        expiry, // 카드 유효기간
        birth, // 생년월일
        pwd_2digit: pwd2Digit, // 카드 비밀번호 앞 두자리
      }
    });

    const { code, message } = issueBilling.data;
    console.log(code);
    console.log(message);

    if (code === 0) { // 빌링키 발급 성공
      CustomerInfo.update({
        billingYN: true
      }, {
        where: {
          customerId: customer_uid
        }
      })
      res.send({ status: "success", message: "Billing has successfully issued" });
    } else { // 빌링키 발급 실패
      res.send({ status: "failed", message });
    }

  } catch (err) {
    const error = new Error(err.message);
    next(error);
  }
}

module.exports = issueBilling;