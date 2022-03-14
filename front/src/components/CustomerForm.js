import React, {useState} from 'react';
import axios from 'axios';
import { v4 as uuidv4 }  from 'uuid';

const CustomerForm = () => {
  
  const [customerInfo, setCustomerInfo] = useState({
    customerId: '',
    userName: '',
    userEmail: '',
    userTel: ''
  });

  const handleInputChange = (e) =>{
    const {value, name} = e.target;
    setCustomerInfo({
      ...customerInfo,
      [name]: value,
    });
  };

  const setCustomerId = () => {
    const id = 'cs-' + uuidv4();
    console.log('customerId: ', id);

    setCustomerInfo({
      ...customerInfo,
      customerId: id,
    });
  };

  const handleFormSubmit = e =>{
    e.preventDefault();

    const {customerId, userName, userEmail, userTel} = customerInfo;
    
    axios({
      url: "http://127.0.0.1:4000/customer/register",
      method: 'post',
      data: {
        customerId,
        userName,
        userEmail,
        userTel
      }
    }).then ((rsp)=>{
      console.log(rsp.data.message);
      alert(rsp.data.message);
    });
  }

  return (
    <form onSubmit={(e)=>{setCustomerId(); handleFormSubmit(e);}}>
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
          <label>
            연락처
            <input type="text" name="userTel" value={customerInfo.userTel} onChange={handleInputChange} />
          </label>
          <br />
          <input type="submit" value="가입하기" />
        </form>
  )
}

export default CustomerForm;