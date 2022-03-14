import { Link } from 'react-router-dom';

const Home = () =>{
  return (
    <div>
      <h1>홈</h1>
      <div><Link to='/payments'>일반 결제</Link></div>
      <div><Link to='/cancel'>결제 취소</Link></div>
      <div><Link to='/customer'>고객 등록</Link></div>
      <div><Link to='/card'>RestAPI 카드 등록</Link></div>
      <div><Link to='/billing'>일반 카드 등록</Link></div>
      <div><Link to='/billing/payment'>빌링 결제</Link></div>
      <div><Link to='/billing/schedule'>예약 결제</Link></div>
    </div>
  )
}

export default Home;