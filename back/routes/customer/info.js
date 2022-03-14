const { CustomerInfo } = require('../../models');

const info = async (req, res, next) => {
  try {
    const {userName, userEmail} = req.body;

    const customer = await CustomerInfo.findOne({
      where: {
        userName,
        userEmail,
      }
    });

    // console.log(customer);

    if (customer) {
      console.log('customer 이름: ', customer.userName);
      console.log('customer 이메일: ', customer.userEmail);
      console.log('customerId: ', customer.customerId);

      res.status(200).send({ status: 'success', customerId: customer.customerId});
    } else {
      console.log('customer가 존재하지 않습니다!');

      res.status(400).send({status: 'fail', message: 'customer가 존재하지 않습니다!'});
    }
  } catch (err) {
    const error = new Error(err.message);
    next(error);
  }
};

module.exports = info;