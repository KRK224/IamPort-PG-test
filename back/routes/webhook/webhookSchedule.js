const { OrderInfo } = require("../../models");
const { getToken, getPaymentsInfo, schedulePayment } = require("../../api");
const moment = require('moment-timezone');
const chalk = require('chalk');

moment.tz.setDefault('Asia/Seoul');

const notice_url = process.env.NOTICE_URL +'/iamport-webhook/schedule';

const webhookSchedule = async (req, res, next) => {
  try {
    console.log("******** webhookSchedule 받음");
    // 결제 완료된 건에 대해서만 wehbook 발생
    // 예약 api에 대한 webhook은 발생하지 않음

    const { imp_uid, merchant_uid } = req.body;

    // 액세스 토큰(access token) 발급 받기

    const token = await getToken(process.env.IMP_KEY, process.env.IMP_SECRET);
    const { access_token } = token.data.response; // 인증 토큰 발급 완료

    const getPaymentData = await getPaymentsInfo(access_token, imp_uid);
    const paymentData = getPaymentData.data.response;

    const { amount, status, customer_uid: customerId, pg_tid, paid_at  } = paymentData;
    

    // 조회한 결제 정보
    console.info(
      "***** webhook 내에서 imp_uid로 아임포트 서버에서 결제 정보 조회"
    );
    console.info(chalk.red("axios 반환값(getPaymentData): "), Object.keys(getPaymentData));
    console.info(
      chalk.red("Object.keys(getPaymentData.data): "),
      Object.keys(getPaymentData.data)
    );
    console.info(chalk.red("getPayment.data.response"));
    console.info(paymentData);
    
    // DB에서 결제되어야 하는 금액 조회
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
      console.log("webhook new order: ", existedOrder.dataValues);
    } else {
      console.log("wehbook old order: ", existedOrder.dataValues);
    }

    if (!existedOrder.paidAmount) {
      // 결제 완료 전
      const amountToBePaid = existedOrder.amount;
      console.log(chalk.green("amountToBePaid: "), amountToBePaid);

      // 결제 검증하기
      
      if (amount === amountToBePaid) {
        switch (status) {
          case "paid":
            await OrderInfo.update(
              {
                // DB에 결제 정보 저장
                pgTid: pg_tid,
                paidAmount: amount,
                paidAt: paid_at*1000,
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
        }
      } else {
        await OrderInfo.update(
          {
            paidAmount: amount,
            paidAt: paid_at*1000,
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
      console.info(
        "서버 check: 주문 번호 ",
        existedOrder.merchantUid,
        "는 완료된 주문입니다."
      );
    }

    // 새로운 결제 예약

    const dt = moment.unix(paymentData.paid_at); // 현재 결제 시간 저장
    console.log(dt.format('현제 결제 시간: YYYYMMDD_HHmmss'));

    dt.minute(dt.minute() +1); // 3분 뒤에 재 결제 예약
    dt.second(0);
    console.log(dt.format('다음 결제 시간: YYYYMMDD_HHmmss'));

    const merchant_uid_new = dt.format('YYYYMMDD_HHmmss') + '_billing';

    const dtTimestamp = dt.unix();

    /**
    const dt = new Date(paymentData.paid_at * 1000);
    console.log("현재 결제 시간 ", dt.toString());
    let dtMin = dt.getMinutes();

    dtMin += 2;
    dt.setMinutes(dtMin);
    console.log("다음 결제 예약시간: ", dt.toString());

    const dtTimestamp = Math.floor(dt.getTime() / 1000)
    console.log("다음 dtTimestamp", dtTimestamp);
    const merchant_uid_new = merchant_uid.substr(0,17) + '_' + dt;
    */


    const schedulingResult = await schedulePayment(
      access_token,
      customerId,
      merchant_uid_new,
      dtTimestamp,
      amount,
      "월간 정기 결제 예약",
      notice_url,
    );

    const { code, response } = schedulingResult.data;
    
    console.log('예약 결제 response', response);
    console.log('예약 리스트 길이', response.length );

    if (response[0].schedule_status === "scheduled") {
      console.log('다음 결제가 ', dt,'에 예약되었습니다.');
    } else {
      console.log('다음 예약 결제가 실패하였습니다.');
    };
    
  } catch (err) {
    const error = new Error(err.message);
    next(error);
  }
};

module.exports = webhookSchedule;
