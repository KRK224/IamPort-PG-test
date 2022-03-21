import React, {useState} from 'react';
import { Link } from "react-router-dom";
import Error from './Error';
import moment from 'moment-timezone';
import axios from 'axios';

const RequestPay = () =>{

  const [count, setCount] = useState(0);

  const requestPay = () => {
    const { IMP }= window;
    IMP.init('imp93717611');

    const merchant_uid = moment().tz("Asia/Seoul").format(`YYYYMMDD_HHmmss_${count}`);
    
    IMP.request_pay({ // param
      pg: "nice",
      pay_method: "card",
      merchant_uid: merchant_uid,
      name: "노르웨이 회전 의자",
      amount: 500
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
        alert(rsp.data.message);
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