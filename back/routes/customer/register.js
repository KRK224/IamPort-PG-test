const { CustomerInfo } = require('../../models');

const register = async (req, res, next) => {
  try {
    const { customerId, userName, userEmail, userTel } = req.body;

    const [customer, created] = await CustomerInfo.findOrCreate({
      where: {
        customerId
      },
      defaults: {
        customerId,
        userName,
        userEmail,
        userTel
      }
    })
    
    if (created) {
      console.log('new customer: ', customer.dataValues);
      res.send({status: "success", message: "고객 정보가 등록되었습니다."});
    } else {
      console.log('old customer: ', customer.dataValues);
      res.send({status: "overwrite", message: '이미 존재하는 회원입니다.'});
    }
    

  } catch (err) {
    const error = new Error(err.message);
    next(error);
  };
}

module.exports = register;