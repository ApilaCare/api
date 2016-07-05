var mongoose = require('mongoose');

var User = mongoose.model('User');
var Community = mongoose.model('Community');

var emailService = require('../../services/email');
var async = require('async');
var crypto = require('crypto');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.forgotPassword = function(req, res) {

      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');

        User.findOne({"email": req.params.email}, function(err, user) {

          if(user) {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            user.save(function(err) {
              doSendPasswordForget(req, res, token);
            });
          } else {
            sendJSONresponse(res, 404, null);
          }


        });

        });

}

module.exports.resetPassword = function(req, res) {

  console.log(req.params.token);

  User.findOne({"resetPasswordToken": req.params.token, "resetPasswordExpires": {$gt: Date.now()}},
       function(err, user) {

         if(user) {
           user.setPassword(req.body.password);
           user.resetPasswordToken = undefined;
           user.resetPasswordExpires = undefined;

           user.save(function(err) {
             sendJSONresponse(res, 200, null);
           });
         } else {
           sendJSONresponse(res, 403, null);
         }

  });
}

function doSendPasswordForget(req, res, token) {
  emailService.sendForgotPassword("supprot@apila.com", req.params.email, token, req.headers.host,
  function(error, info) {
    if(error){
        sendJSONresponse(res, 404, null);
    }
    console.log('Message sent: ' + info.response);
    sendJSONresponse(res, 200, null);
  });
}

module.exports.usersList = function(req, res) {
  console.log("In usersList");

  User.find({}, 'name',  function(err, users) {
      console.log(users);
      sendJSONresponse(res, 200, users);
  });

}

module.exports.usersInCommunity = function(req, res) {

  User.find({community: req.params.communityid}, 'name',  function(err, users) {
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
