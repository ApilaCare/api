var mongoose = require('mongoose');

var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.usersList = function(req, res) {
  console.log("In usersList");

  User.find({}, function(err, users) {
      console.log(users);
      sendJSONresponse(res, 200, users);
  });

}
