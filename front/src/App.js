import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import RequestPay from "./components/RequestPay";
import CustomerForm from './components/CustomerForm';
import CardForm from './components/CardForm';
import RequestBilling from './components/RequestBilling';
import RequestPayBilling from './components/RequestPayBilling';
import RequestScheduleBilling from './components/RequestScheduleBilling';
import CancelPay from './components/CancelPay';

const App = () =>{
  
  return (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/payments" element={<RequestPay />} />
    <Route path="/cancel" element={<CancelPay />} />
    <Route path="/customer" element={<CustomerForm />} />
    <Route path='/card' element={<CardForm />} />
    <Route path='/billing' element={<RequestBilling />} />
    <Route path='/billing/payment' element={<RequestPayBilling />} />
    <Route path='/billing/schedule' element={<RequestScheduleBilling />} />    
  </Routes>
  );
};

export default App;
