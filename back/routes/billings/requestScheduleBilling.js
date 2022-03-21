const { CustomerInfo, OrderInfo } = require("../../models");
const { getToken, requestPayment } = require("../../api");
const notice_url = process.env.NOTICE_URL +'/iamport-webhook/schedule';

const requestScheduleBilling = async (req, res, next) => {
  try {
    const { userName, userEmail, merchant_uid, amount } = req.body;

    /**
    const dt = new Date();
    // console.log(dt);
    let dtMinutes = dt.getMinutes();
    dtMinutes += 1;
    dt.setMinutes(dtMinutes);
    // console.log(dt);
    const dtTimestamp = Math.floor(dt.getTime() / 1000); // 10자리 timestamp로 변환
    // console.log(dtTimestamp);
    const newDt = new Date(dtTimestamp*1000);
    console.log("새로운 예약 시간", newDt);
    */

    // api로 결제 전 db에 정보 저장
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
    }

    const customer = await CustomerInfo.findOne({
      where: {
        userName,
        userEmail,
      },
    });

    const { customerId } = customer;

    // 액세스 토큰(access token) 발급 받기

    const token = await getToken(process.env.IMP_KEY, process.env.IMP_SECRET);

    const { access_token } = token.data.response;

    // 예약 결제 api 함수
    // notice_url 함수 내에서 항상 고정 /iamport-webhook/schedule
    const paymentResult = await requestPayment(
      access_token,
      customerId,
      merchant_uid,
      amount,
      "월간 정기 결제 예약",
      notice_url,
    );

    // 일반 결제 결과 저장.
    const { code, response } = paymentResult.data;

    
    if (code === 0) {
      // 카드사 통신에 성공(실제 승인 성공 여부는 추가 판단이 필요함)
      console.log("카드사 통신 성공");
      if (response.status === "paid") {
        //카드 정상 승인
        console.log("정상 승인 처리");
        if (amount === response.amount) {
          console.log("금액 일치!, DB에 정보 업데이트");
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
          res.send({ status: "success", message: "정상처리되었습니다" });
        } else {
          console.log("금액 위변조 발생");
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
          res.send({
            status: "error",
            message: "정상 금액이 결제 되지않았습니다!",
          });
        }
      } else {
        //카드 승인 실패 (예: 고객 카드 한도초과, 거래정지카드, 잔액부족 등)
        //paymentResult.status : failed 로 수신됨
        res.send({ status: "failed", message: "카드 승인에 실패하였습니다." });
      }
    } else {
      // 카드사 요청에 실패 (paymentResult is null)
      res.send({ status: "failed", message: "카드사 요청에 실패하였습니다." });
    }
  } catch (err) {
    const error = new Error(err.message);
    next(error);
  }
};

module.exports = requestScheduleBilling;
