const { OrderInfo } = require("../../models");
const { getToken, getPaymentsInfo } = require('../../api');

const webhookPayment = async (req, res, next) =>{
  try {

    console.log('************** webhookPayement 받음');
    
    const { imp_uid, merchant_uid } = req.body; // req의 body에서 imp_uid, merchant_uid 추출


    // 액세스 토큰(access token) 발급 받기

    const token = await getToken(process.env.IMP_KEY, process.env.IMP_SECRET);

    const { access_token } = token.data.response; // 인증 토큰 발급 완료
    
    // imp_uid로 아임포트 서버에서 결제 정보 조회

    const getPaymentData = await getPaymentsInfo(access_token, imp_uid);

    // 조회한 결제 정보
    console.info('***** webhook 내에서 imp_uid로 아임포트 서버에서 결제 정보 조회');
    console.info('axios 반환값(getPaymentData): ', Object.keys(getPaymentData));
    console.info('Object.keys(getPaymentData.data): ', Object.keys(getPaymentData.data));
    console.info('getPayment.data.response', getPaymentData.data.response);    
    
    // response 안의 status: cancelled일 경우 분기 마련

    const paymentData = getPaymentData.data.response; 

        
    // 레코드 존재 유무 확인 및 생성
    const [order, created] = await OrderInfo.findOrCreate({
      where: {
        merchantUid: merchant_uid,
      },
      defaults: {
        impUid: imp_uid,
        amount: paymentData.amount,
      }
    });
    
    if(created) {
      console.log('new order: ', order.dataValues);
    }else {
      console.log('old order: ', order.dataValues);
    };

    // 결제 상태 확인 후 로직 처리 추가

    if (!order.paidAmount) {
      // 결제 완료 전
      console.log('****** webhook DB 데이터 결제 완료 전');
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
          case "cancelled":
            // 취소 처리 하기
            console.log('관리자에서 취소 처리됨!');
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
      console.info("webhook check: 주문 번호 ", order.merchantUid, "는 완료된 주문입니다.");
    }
  } catch (err) {
    const error = new Error(err.message);
    next(error);
  }
};

module.exports = webhookPayment;