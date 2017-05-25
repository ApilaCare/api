const crypto = require('crypto');
const aes = 'aes-256-ctr';

module.exports.encrypt = (text) => {
  const cipher = crypto.createCipher(aes, process.env.SSN_SECRET);

  let crypted = cipher.update(text, 'utf8','hex');
  crypted += cipher.final('hex');

  return crypted;
}
 
module.exports.decrypt = (text) => {
  const decipher = crypto.createDecipher(aes, process.env.SSN_SECRET);

  console.log(text);

  let dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');

  return dec;
}