const axios = require('axios');
const { CustomerInfo, OrderInfo } = require("../../models");


// Rest API로 빌링키 발급 후에 일반 결제
// 테스트 목적: 일반 결제 양식과 다른데 잘 되는지.
const requestPayBilling = async (req, res, next) => {
  try {
    const { userName, userEmail, merchant_uid, amount } = req.body;

    const customer = await CustomerInfo.findOne({
      where: {
        userName,
        userEmail,
      },
    });

    const customer_uid = customer.customerId;
    console.log(customer_uid);

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

    console.log('진입');

    const [existedOrder, created] = await OrderInfo.findOrCreate({
      where: {
        merchantUid: merchant_uid,
      },
      defaults: {
        amount,
      },
    });

    if (created) {
      console.log("new order: ", existedOrder.dataValues);
    } else {
      console.log("old order: ", existedOrder.dataValues);
    };

    // 결제(재결제) 요청
    const paymentResult = await axios({
      url: `https://api.iamport.kr/subscribe/payments/again`,
      method: "post",
      headers: { Authorization: access_token }, // 인증 토큰을 Authorization header에 추가
      data: {
        customer_uid,
        merchant_uid, // 새로 생성한 결제(재결제)용 주문 번호
        amount,
        name: "월간 이용권 정기결제",
      },
    });

    console.log('**********빌링키로 결제 진행');
    // console.log('paymentResult',paymentResult);
    console.log('Object.keys(paymentResult)', Object.keys(paymentResult));
    console.log('paymentResult.data', paymentResult.data);


    const { code, message, response } = paymentResult.data;

    if (code === 0) { // 카드사 통신에 성공(실제 승인 성공 여부는 추가 판단이 필요함)
      console.log('정상 처리');
      if ( response.status === "paid" ) { //카드 정상 승인
        console.log('정상 승인 처리');
        if(amount === response.amount) {
          console.log('DB에 정보 업데이트');
          await OrderInfo.update(
            {
              // DB에 결제 정보 저장
              pgTid: response.pg_tid,
              paidAmount: response.amount,
              errorYN: false,
            },
            {
              where: {
                merchantUid: response.merchant_uid,
              },
            }
          );
        } else {
          console.log('금액 위변조 발생');
          await OrderInfo.update(
            {
              // DB에 결제 정보 저장
              pgTid: response.pg_tid,
              paidAmount: response.amount,
              errorYN: true,
            },
            {
              where: {
                merchantUid: response.merchant_uid,
              },
            }
          )
        }
      } else { //카드 승인 실패 (예: 고객 카드 한도초과, 거래정지카드, 잔액부족 등)
        //paymentResult.status : failed 로 수신됨
      }
    } else { // 카드사 요청에 실패 (paymentResult is null)
    }
    
    
  } catch (err) {
    const error = new Error(err.message);
    next(error);
  }
  res.send({status: 'success' , message: '정상처리되었습니다'});
};

module.exports = requestPayBilling;
