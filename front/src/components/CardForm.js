import React, { useState } from "react";
import axios from "axios";

// REST API로 빌링키 등록
const CardForm = () => {
  
  const [userInfo, setUserInfo] = useState({
    userName: '',
    userEmail: '',
  });

  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
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
        console.log(rsp.data.status);
        const {status, customerId} = rsp.data;
        if (status === "success") {
          alert(status);
          setCardInfo({
            ...cardInfo,
            customer_uid: customerId,
          });
        } else {
          setUserInfo({
            userName: '',
            userEmail: '',
          });
          alert(rsp.message);
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

  const handleCardInputChange = (e) =>{
    const { value, name } = e.target;
    setCardInfo({
      ...cardInfo,
      [name] : value,
    })
  }

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
    </>
  );
};

export default CardForm;
