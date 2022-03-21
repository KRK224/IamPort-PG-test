const axios = require('axios');

const getToken = (imp_key, imp_secret) => {
  return axios({
    url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      data: {
        imp_key, // 아임포트 REST API 키
        imp_secret, // 아임포트 REST API Secret 키
      },
  })
};

module.exports = getToken;
