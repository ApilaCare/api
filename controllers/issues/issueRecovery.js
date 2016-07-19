var mongoose = require('mongoose');

var IssRecovery = mongoose.model('MemberRecover');
var User = mongoose.model('User');
var passport = require('passport');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

// can the user creator be selected?
// what if we have only 2 users in a community?
// username's must be unique

module.exports.createMemberRecovery = function(req, res) {

  selectRandomUser(req.body.boss, function(chosenMember) {

    if(chosenMember === null) {
      sendJSONresponse(res, 404, {message: {"Random member could not be selected"}});
    }

    IssRecovery.create({
      boss: req.body.boss,
      chosenMember: chosenMember,
      recoveredMember: req.body.recoveredMember
    }, function(err, issueRecovery) {
      if(issueRecovery) {
        sendJSONresponse(res, 200, IssRecovery);
      } else {
        sendJSONresponse(res, 404, {message: {"Error while creating issue recovery"}});
      }
    });
  });
}

// this will select a random user except the one who submited the request
function selectRandomUser(boss, callback) {
  User.find({}, function(err, users) {
    if(users) {

      var randomUser = null;

      while(randomUser === null || randomUser._id === boss) {
        randomUser = users[Math.floor(Math.random() * users.length)];
      }

      callback(randomUser);

    } else {
      console.log("Error while finding users");
    }
  });
}


module.exports.confirmPassword = function(req, res) {

  if(req.body.password) {
    sendJSONresponse(res, 404, {message: "No password sent"});
  }

  var password = req.body.password;

  //find the user and chek to see if the password matches
  //User.fineOne({})

}

//transfer confidential issues from 1 user to another, when the user is recovered
function switchOverIssues() {

}
