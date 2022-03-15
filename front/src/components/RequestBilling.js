import React, {useState} from 'react';
import { Link } from "react-router-dom";
import Error from './Error';
import moment from 'moment-timezone';
import axios from 'axios';

// 일반결제 창에서 빌링키 발급 및 결제 연동.
const RequestPay = () =>{

  const [count, setCount] = useState(0);

  const requestPay = () => {
    const { IMP }= window;
    IMP.init('imp93717611');

    const merchant_uid = moment().tz("Asia/Seoul").format(`YYYYMMDD_HHmmss_${count}`);
    
    IMP.request_pay({ // param
      pg: "kcp_billing",
      pay_method: "card",
      merchant_uid: merchant_uid,
      name: "최초인증결제",
      amount: 0,
      customer_uid: 'cs-b9815101-8f88-42d1-bdcd-b438f5dfb02f',
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
          url: "http://127.0.0.1:4000/billings",
          method: "post",
          header: { "Content-Type": "application/json"},
          data: {
            customer_uid: 'cs-b9815101-8f88-42d1-bdcd-b438f5dfb02f',
            merchant_uid: rsp.merchant_uid,
            amount: rsp.paid_amount
          }
        }).then((data)=>{
          alert(data.message);
        });

        
        
      } else {
        
        alert(rsp.error_code);
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
      <button onClick={requestPay}>일반 결제하기</button>
      <br />
      <Link to="/">홈</Link>
    </>
  );
}

export default RequestPay;