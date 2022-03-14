const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const { sequelize } = require('./models');

const paymentsRouter = require('./routes/payments');
const webhookRouter = require('./routes/webhook');
const customerRouter = require('./routes/customer');
const subscriptionsRouter = require('./routes/subscriptions');
const billingsRouter = require('./routes/billings');

dotenv.config();

const app = express();

app.set('port', process.env.PORT || 4000);

(async () =>{
  await sequelize.sync({force: false})
  .then(()=>{
    console.info('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });
})();


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());


app.get('/', (req, res) =>{
  console.info('I am port test sever 입니다!');
  res.send('I am port test sever 입니다!');
});

app.post('/', (req,res) => {
  console.log('hello');
  res.send('hello');
})

app.use('/payments', paymentsRouter);
app.use('/customer', customerRouter);
app.use('/subscriptions', subscriptionsRouter);
app.use('/billings' , billingsRouter);

app.use('/iamport-webhook', webhookRouter);

app.use((err, req, res) =>{
  console.log('에러 발생');
  console.log(err);
  res.send(err.message);
})

app.listen(app.get('port'), ()=>{
  console.log(app.get('port'), '번 포트에서 대기 중...');
});
