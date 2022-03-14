const axios = require("axios");
const { OrderInfo } = require("../../models");

const cancelPayment = async (req, res, next) => {
  try {
    console.log(
      "******* 클라이언트에서 결제 취소 요청, cancelPayment 처리 시작"
    );

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

    // 요청 정보 확인
    const { merchant_uid, reason, cancel_request_amount } = req.body;

    console.log(merchant_uid);
    const paymentData = await OrderInfo.findOne({
      where: {
        merchant_uid,
      },
    });
    console.log(Object.keys(paymentData));
    console.log(paymentData);

    const { impUid, paidAmount, cancelAmount } = paymentData;
    console.log("**** DB 추출 정보 확인");
    console.log(impUid, paidAmount, cancelAmount);

    if(!impUid){
      res.send({status: 'error', message: 'DB에 저장 정보 없음!'});
    };

    const cancelableAmount = paidAmount - cancelAmount; // 환불 가능 금액(= 결제금액 - 환불 된 총 금액) 계산
    console.log('환불 가능 금액', cancelableAmount);

    if (cancelableAmount <= 0) {
      // 이미 전액 환불된 경우
      return res.status(400).json({ message: "이미 전액환불된 주문입니다." });
    }
    
    const getCancelData = await axios({
      url: "https://api.iamport.kr/payments/cancel",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: access_token, // 아임포트 서버로부터 발급받은 엑세스 토큰
      },
      data: {
        reason, // 가맹점 클라이언트로부터 받은 환불사유
        imp_uid: impUid, // imp_uid를 환불 `unique key`로 입력
        amount: cancel_request_amount, // 가맹점 클라이언트로부터 받은 환불금액
        checksum: cancelableAmount, // [권장] 환불 가능 금액 입력
      },
    });

    const { response } = getCancelData.data; // 환불 결과

    console.log("*****환불 결과");
    console.log(response);

    const { merchant_uid: merchant_uid_checekd } = response; // 환불 결과에서 주문정보 추출

    await OrderInfo.update(
      {
        // DB에 결제 정보 저장
        // cancelledAt: ???
        cancelAmount: cancel_request_amount,
      },
      {
        where: {
          merchantUid: merchant_uid_checekd,
        },
      }
    );

    res.send({ status: "success", message: "환불이 성공적으로 이뤄졌습니다." });
  } catch (err) {
    const error = new Error(err.message);
    next(error);
  }
};

module.exports = cancelPayment;
