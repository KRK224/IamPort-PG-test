const axios = require('axios');

const getPaymentsInfo = (access_token, imp_uid) => {
  return axios({
    url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
    method: "get", // GET method
    headers: { Authorization: access_token }, // 인증 토큰 Authorization header에 추가
  });
};

module.exports = getPaymentsInfo;
