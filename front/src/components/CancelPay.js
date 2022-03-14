import React, { useState } from "react";
import axios from "axios";

const CancelPay = () =>{

  const [cancelInfo, setCancelInfo] = useState({
        merchant_uid: "", // 주문번호
        cancel_request_amount: 0, // 환불금액
        reason: "", // 환불사유
  });

  const handleInputChange = (event) => {
    const { value, name } = event.target;
    setCancelInfo({
      ...cancelInfo,
      [name]: value,
    });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    
    const {merchant_uid, cancel_request_amount, reason} = cancelInfo

    axios({
      url: "http://127.0.0.1:4000/payments/cancel", // 예: https://www.myservice.com/subscription/issue-billing
      method: "post",
      data: {
        merchant_uid, // 주문번호
        cancel_request_amount, // 환불금액
        reason // 환불사유
      }
    }).then(rsp => {
      console.log(rsp.data);
      console.log(rsp.data.message);
      alert(rsp.data.message);
    });
  };

  return(
    <form onSubmit={handleFormSubmit}>
    <label>
      결제 주문번호
      <input
        type="text"
        name="merchant_uid"
        value={cancelInfo.merchant_uid}
        onChange={handleInputChange}
      />
    </label>
    <br />
    <label>
      취소 금액
      <input
        type="text"
        name="cancel_request_amount"
        value={cancelInfo.cancel_request_amount}
        onChange={handleInputChange}
      />
    </label>
    <br />
    <label>
      환불 이유
      <input
        type="text"
        name="reason"
        value={cancelInfo.reason}
        onChange={handleInputChange}
      />
    </label>
    <br />
    <input type="submit" value="환불하기" />
    </form>
  )
}

export default CancelPay;