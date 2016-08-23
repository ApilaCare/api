
module.exports.sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.checkParams = function(req, res,  paramsToCheck) {

  var i;
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
