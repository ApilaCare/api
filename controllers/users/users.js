var mongoose = require('mongoose');

var User = mongoose.model('User');
var Community = mongoose.model('Community');

var emailService = require('../../services/email');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

//emailService.sendMail("nesa993@gmail.com", "nesa993@gmail.com", "talking to myself", "Hi");

module.exports.usersList = function(req, res) {
  console.log("In usersList");

  User.find({}, 'name',  function(err, users) {
      console.log(users);
      sendJSONresponse(res, 200, users);
  });

}

module.exports.userCommunity = function(req, res) {

  var username = req.params.username;

  console.log("userCommunity " + username);

  User.findOne({"name" : username})
      .exec(function(err, user) {

        if(user.community)
        {
          Community.findById(user.community)
          .populate("communityMembers pendingMembers")
          .exec( function(err, community) {
            if(err) {
              sendJSONresponse(res, 400, {});
            } else {
              console.log(user);
              sendJSONresponse(res, 200, community);
            }
          });
        }


      });
    }
