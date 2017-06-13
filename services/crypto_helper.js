const crypto = require('crypto');
const aes = 'aes-256-ctr';

module.exports.encrypt = (text) => {
  const cipher = crypto.createCipher(aes, process.env.SSN_SECRET);

  let crypted = cipher.update(text.toString() , 'utf8','hex');
  crypted += cipher.final('hex');

  return crypted;
}
 
module.exports.decrypt = (text) => {
  try {
      const decipher = crypto.createDecipher(aes, process.env.SSN_SECRET);

      let dec = decipher.update(text.toString() ,'hex','utf8');
      dec += decipher.final('utf8');

      return dec;

  } catch(err) {
    console.log(err);
    return text;
  }

}