import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// REST API로 빌링키 등록
const CardForm = () => {
  const [userInfo, setUserInfo] = useState({
    userName: "",
    userEmail: "",
  });

  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    expiry: "",
    birth: "",
    pwd2Digit: "",
    customer_uid: "",
  });

  const checkCustomerInfo = async (e) => {
    e.preventDefault();
    try {
      const { userName, userEmail } = userInfo;

      await axios({
        url: "http://127.0.0.1:4000/customer/info",
        method: "post",
        data: {
          userName,
          userEmail,
        },
      }).then((rsp) => {
        const { status, customerId, message } = rsp.data;
        console.log(status, customerId, message);
        if (status === "found") {
          alert(message);
          setCardInfo({
            ...cardInfo,
            customer_uid: customerId,
          });
        } else {
          setUserInfo({
            userName: "",
            userEmail: "",
          });
          alert(message);
        }
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUserInputChange = (e) => {
    const { value, name } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value,
    });
  };

  const handleCardInputChange = (e) => {
    const { value, name } = e.target;
    setCardInfo({
      ...cardInfo,
      [name]: value,
    });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const { cardNumber, expiry, birth, pwd2Digit, customer_uid } = cardInfo;
    axios({
      url: "http://127.0.0.1:4000/subscriptions/issue-billing", // 예: https://www.myservice.com/subscription/issue-billing
      method: "post",
      data: {
        cardNumber,
        expiry,
        birth,
        pwd2Digit,
        customer_uid,
      },
    }).then((rsp) => {
      alert(rsp.data.message);
    });
  };

  return (
    <>
      <form onSubmit={checkCustomerInfo}>
        <label>
          고객 이름
          <input
            type="text"
            name="userName"
            value={userInfo.userName}
            onChange={handleUserInputChange}
          />
        </label>
        <br />
        <label>
          고객 이메일
          <input
            type="text"
            name="userEmail"
            value={userInfo.userEmail}
            onChange={handleUserInputChange}
          />
        </label>
        <br />
        <input type="submit" value="고객 정보 확인" />
      </form>

      <form onSubmit={handleFormSubmit}>
        <label>
          카드 번호
          <input
            type="password"
            name="cardNumber"
            value={cardInfo.cardNumber}
            onChange={handleCardInputChange}
            placeholder='- 없이 입력'
          />
        </label>
        <br />
        <label>
          카드 유효기간
          <input
            type="text"
            name="expiry"
            value={cardInfo.expiry}
            onChange={handleCardInputChange}
            placeholder='YYYY-MM'
          />
        </label>
        <br />
        <label>
          생년월일
          <input
            type="text"
            name="birth"
            value={cardInfo.birth}
            onChange={handleCardInputChange}
            placeholder='yymmdd'
          />
        </label>
        <br />
        <label>
          카드 비밀번호 앞 두자리
          <input
            type="password"
            name="pwd2Digit"
            value={cardInfo.pwd2Digit}
            onChange={handleCardInputChange}
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

export default CardForm;
