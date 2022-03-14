import React, { useState } from "react";
import moment from "moment-timezone";
import axios from "axios";

const RequestPayBilling = () => {
  
  const [count, setCount] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    userName: '',
    userEmail: '',
  });

  const handleInputChange = (e) =>{
    const {value, name} = e.target;
    setCustomerInfo({
      ...customerInfo,
      [name]: value,
    });
  };

  const requestPay = () => {
    
    const merchant_uid = moment()
      .tz("Asia/Seoul")
      .format(`YYYYMMDD_HHmmss_${count}`);
    console.log(merchant_uid);
    axios({
      url: "http://127.0.0.1:4000/billings/payment",
      method: "post",
      header: { "Content-Type": "application/json" },
      data: {
        userName: customerInfo.userName,
        userEmail: customerInfo.userEmail,
        merchant_uid,
        amount: 5000
      },
    }).then((rsp) => {
      alert(rsp.data.message);
    });

    setCount(count + 1);
  };

  return (
      <form onSubmit={requestPay}>
          <label>
            고객 이름
            <input type="text" name="userName" value={customerInfo.userName} onChange={handleInputChange} />
          </label>
          <br />
          <label>
            이메일
            <input type="text" name="userEmail" value={customerInfo.userEmail} onChange={handleInputChange} />
          </label>
          <br />
          <input type="submit" value="결제하기" />
        </form>
  );
};

export default RequestPayBilling;