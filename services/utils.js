const crypto = require('crypto');

module.exports.sendJSONresponse = (res, status, content) => {
    res.status(status);
    res.json(content);
};

module.exports.generateToken = (email) => {
  return crypto.createHash('md5').update(email + process.env.JWT_SECRET).digest('hex');
}

module.exports.checkParams = (req, res,  paramsToCheck) => {

  let i;
  for(i = 0; i < paramsToCheck.length; ++i) {

    if(!req.params[paramsToCheck[i]]) {
      res.status(404);
      res.json({'message' : 'Parametar ' + paramsToCheck[i] + " is not defined!"});
      console.log("Parametar " + paramsToCheck[i] + " is not defined!");
      return true;
    }
  }

  return false;

};
