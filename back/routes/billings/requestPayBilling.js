const { CustomerInfo, OrderInfo } = require("../../models");
const { getToken, requestPayment } = require('../../api');


// Rest API로 빌링키 발급 후에 일반 결제
// 테스트 목적: 일반 결제 양식과 다른데 잘 되는지.

const requestPayBilling = async (req, res, next) => {
  try {
    console.log('*********** 빌링키 결제 시작');
    const { userName, userEmail, merchant_uid, amount } = req.body;

    const customer = await CustomerInfo.findOne({
      where: {
        userName,
        userEmail,
      },
    });

    const customer_uid = customer.customerId;

    // 액세스 토큰(access token) 발급 받기

    const token = await getToken(process.env.IMP_KEY, process.env.IMP_SECRET);

    const { access_token } = token.data.response; // 인증 토큰

    // Rest API로 구매 요청 전 미리 DB에 업데이트.
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
      // 결제 완료 상태 check 후 로직 작성
    };

    // 결제(재결제) 요청
    const paymentResult = await requestPayment(access_token, customer_uid, merchant_uid, amount, '정기 월간 결제');

    console.log('**********빌링키로 결제 진행');
    console.log('Object.keys(paymentResult)', Object.keys(paymentResult));
    console.log('paymentResult.data', paymentResult.data);

    const { code, response } = paymentResult.data;

    if (code === 0) { // 카드사 통신에 성공(실제 승인 성공 여부는 추가 판단이 필요함)
      console.log('카드사 통신 성공');
      if ( response.status === "paid" ) { //카드 정상 승인
        console.log('정상 승인 처리');
        if(amount === response.amount) {
          console.log('금액 일치!, DB에 정보 업데이트');
          await OrderInfo.update(
            {
              // DB에 결제 정보 저장
              impUid: response.imp_uid,
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
          res.send({status: 'success' , message: '정상처리되었습니다'});
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
          );
          res.send({status: 'error', message: '정상 금액이 결제 되지않았습니다!'});
        }
      } else { //카드 승인 실패 (예: 고객 카드 한도초과, 거래정지카드, 잔액부족 등)
        //paymentResult.status : failed 로 수신됨
        res.send({status: 'failed', message: '카드 승인에 실패하였습니다.'});
      }
    } else { // 카드사 요청에 실패 (paymentResult is null)
      res.send({status: 'failed', message: '카드사 요청에 실패하였습니다.'});
    }
    
    
  } catch (err) {
    const error = new Error(err.message);
    next(error);
  }
};

module.exports = requestPayBilling;
