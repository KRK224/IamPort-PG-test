import React, {useState} from 'react';
import { Link } from "react-router-dom";
import Error from './Error';
import moment from 'moment-timezone';
import axios from 'axios';

const TransPay = () =>{

  const [count, setCount] = useState(0);

  const requestPay = () => {
    const { IMP }= window;
    IMP.init('imp93717611');

    const merchant_uid = moment().tz("Asia/Seoul").format(`YYYYMMDD_HHmmss_${count}`);
    
    IMP.request_pay({ // param
      pg: "kcp",
      pay_method: "trans",
      merchant_uid: merchant_uid,
      name: "노르웨이 회전 의자",
      amount: 200,
      buyer_email: "gildong@gmail.com",
      buyer_name: "홍길동",
      buyer_tel: "010-4242-4242",
      buyer_addr: "서울특별시 강남구 신사동",
      buyer_postcode: "01181"
    }, rsp => { // callback
      if (rsp.success) {
        
        // 결제 성공 시 로직,
        console.log('설정한 merchant_uid: ', merchant_uid);
        console.log('response merchant_uid: ', rsp.merchant_uid);
        console.log('response imp_uid: ', rsp.imp_uid);

        axios({
          url: "http://127.0.0.1:4000/payments/complete",
          method: "post",
          header: { "Content-Type": "application/json"},
          data: {
            imp_uid: rsp.imp_uid,
            merchant_uid: rsp.merchant_uid,
            req_amount: rsp.paid_amount
          }
        }).then((rsp)=>{
          alert(rsp.data.message);
        });
        
        
      } else {
        console.log(rsp);
        console.log(Object.keys(rsp));
        alert(rsp.error_msg);
        // 결제 실패 시 로직,
        return <Error merchant_uid={merchant_uid} />;
        
      }
    });

    setCount(count + 1);
  }

  return (
    <>
      <div>
        상품 주문 수: {count}
      </div>
      <button onClick={requestPay}>실시간 계좌이체</button>
      <br />
      <Link to="/">홈</Link>
    </>
  );
}

export default TransPay;