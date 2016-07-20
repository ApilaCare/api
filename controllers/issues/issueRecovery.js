var mongoose = require('mongoose');

var IssRecovery = mongoose.model('MemberRecover');
var User = mongoose.model('User');
var Community = mongoose.model('Community');
var _ = require('lodash');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.createMemberRecovery = function(req, res) {

  var recoveredMember = req.body.recoveredMember;
  var boss = req.body.boss;

  selectRandomUser(res, boss, recoveredMember, req.params.communityid,  function(chosenMember) {

    if(chosenMember === null) {
      sendJSONresponse(res, 404, {"message": "Random member could not be selected"});
    }

    IssRecovery.create({
      boss: boss,
      chosenMember: chosenMember,
      recoveredMember: recoveredMember

    }, function(err, issueRecovery) {
      if(issueRecovery) {
        sendJSONresponse(res, 200, chosenMember.name);
      } else {
        sendJSONresponse(res, 404, {"message": "Error while creating issue recovery"});
      }
    });
  });
}

// this will select a random user except the one who submited the request
function selectRandomUser(res, boss, recoveredMember, communityid, callback) {
  Community.findOne({_id: communityid})
      .populate("communityMembers")
      .exec(function(err, community) {
    if(community) {

      var users = community.communityMembers;

      //if there are 2 or less in a community recovery is not possible
      if(users.length <= 2) {
        sendJSONresponse(res, 500, {message: "To be able to recover a member there has to be two or more members in a community"});
        return;
      }

      var randomUser = null;

      // filtering out the user we are recovering and the user who started it, so we don't pick them
      users = _.filter(users, function(o) {
        if(o === null) {
          return false;
        }
        return o._id != boss && o._id != recoveredMember;
      });


      randomUser = _.sample(users);

      callback(randomUser);

    } else {
      console.log("Error while finding users");
    }
  });
}


module.exports.confirmPassword = function(req, res) {

  if(req.body.password) {
    sendJSONresponse(res, 404, {"message": "No password sent"});
  }

  var password = req.body.password;

  //find the user and chek to see if the password matches
  //User.fineOne({})

}

//transfer confidential issues from 1 user to another, when the user is recovered
function switchOverIssues() {

}
