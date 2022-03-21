import React, { useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment-timezone";
import axios from "axios";

const RequestPayBilling = () => {
  const [count, setCount] = useState(0);
  const [schedulePay, setschedulePay] = useState({
    userName: "",
    userEmail: ""
  });

  const handleInputChange = (e) => {
    const { value, name } = e.target;
    setschedulePay({
      ...schedulePay,
      [name]: value,
    });
  };

  const requestPay = (e) => {
    e.preventDefault();

    const merchant_uid = moment()
      .tz("Asia/Seoul")
      .format(`YYYYMMDD_HHmmss_${count}`);
    console.log(merchant_uid);
    axios({
      url: "http://127.0.0.1:4000/billings/schedule",
      method: "post",
      header: { "Content-Type": "application/json" },
      data: {
        userName: schedulePay.userName,
        userEmail: schedulePay.userEmail,
        date: schedulePay.schedule,
        merchant_uid,
        amount: 500,
      },
    }).then((rsp) => {
      alert(rsp.data.message);
    });

    setCount(count + 1);
  };

  return (
    <>
      <form onSubmit={requestPay}>
        <label>
          고객 이름
          <input
            type="text"
            name="userName"
            value={schedulePay.userName}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          이메일
          <input
            type="text"
            name="userEmail"
            value={schedulePay.userEmail}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <input type="submit" value="결제하기" />
      </form>
      <br />
      <Link to="/">홈</Link>
    </>
  );
};

export default RequestPayBilling;
