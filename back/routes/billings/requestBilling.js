const { CustomerInfo } = require("../../models");
const { getToken, requestPayment } = require("../../api");

// 일반 결제 창 billing 키 요구.
// 테스트 목적: 아임포트 메뉴얼 그대로 따라감

const requestBilling = async (req, res, next) => {
  try {
    const { amount, merchant_uid, customer_uid } = req.body; // req body에서 customer_uid 추출

    await CustomerInfo.update(
      {
        billingYN: true,
      },
      {
        where: {
          customerId: customer_uid,
        },
      }
    );

    // 액세스 토큰(access token) 발급 받기

    const token = await getToken(process.env.IMP_KEY, process.env.IMP_SECRET);

    const { access_token } = token.data.response;

    // 결제(재결제) 요청
    const paymentResult = await requestPayment(
      access_token,
      customer_uid,
      merchant_uid,
      amount,
      "정기 결제"
    );
    const { code, message, response } = paymentResult.data;

    if (code === 0) {
      // 카드사 통신에 성공(실제 승인 성공 여부는 추가 판단이 필요함)
      if (response.status === "paid") {
        //카드 정상 승인
        res.send({ status: "paid", message: "카드 정상 승인" });
      } else {
        //카드 승인 실패 (예: 고객 카드 한도초과, 거래정지카드, 잔액부족 등)
        //paymentResult.status : failed 로 수신됨
        res.send({ status: "failed", message });
      }
    } else {
      // 카드사 요청에 실패 (paymentResult is null)
      res.send({ status: "connection failed", message: "카드사 요청에 실패" });
    }
  } catch (err) {
    const error = new Error(err.message);
    next(error);
  }
};

module.exports = requestBilling;
