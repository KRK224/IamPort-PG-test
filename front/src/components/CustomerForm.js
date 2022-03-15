import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const CustomerForm = () => {
  const [customerInfo, setCustomerInfo] = useState({
    customerId: "",
    userName: "",
    userEmail: "",
    userTel: "",
  });

  const handleInputChange = (e) => {
    const { value, name } = e.target;
    setCustomerInfo({
      ...customerInfo,
      [name]: value,
    });
  };

  const setCustomerId = (e) => {
    e.preventDefault();
    const { userName, userEmail } = customerInfo;

    if (userName && userEmail) {
      axios({
        url: "http://127.0.0.1:4000/customer/info",
        method: "post",
        data: {
          userName,
          userEmail,
        },
      }).then((rsp) => {
        console.log(rsp.data.message);
        alert(rsp.data.message);

        if (rsp.data.status === "not found") {
          console.log('not found');
          const id = "cs-" + uuidv4();
          console.log("customerId: ", id);

          setCustomerInfo({
            ...customerInfo,
            customerId: id,
          });
        } else {
          setCustomerInfo({
            customerId: "",
            userName: "",
            userEmail: "",
            userTel: "",
          });
        }
      });
    } else {
      alert("이름과 이메일을 입력하세요!");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const { customerId, userName, userEmail, userTel } = customerInfo;
    if(!customerId) {
      alert('등록 여부를 확인하지 않았습니다!');
    } else {
      axios({
        url: "http://127.0.0.1:4000/customer/register",
        method: "post",
        data: {
          customerId,
          userName,
          userEmail,
          userTel,
        },
      }).then((rsp) => {
        console.log(rsp.data.message);
        alert(rsp.data.message);
      });
    }    
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          handleFormSubmit(e);
        }}
      >
        <label>
          고객 이름
          <input
            type="text"
            name="userName"
            value={customerInfo.userName}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          이메일
          <input
            type="text"
            name="userEmail"
            value={customerInfo.userEmail}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          연락처
          <input
            type="text"
            name="userTel"
            value={customerInfo.userTel}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <div>
        <button onClick={setCustomerId}>등록 여부 확인</button>
        </div>
        <input type="submit" value="가입하기" />
      </form>
        <br />
      <Link to="/">홈</Link>
    </>
  );
};

export default CustomerForm;
