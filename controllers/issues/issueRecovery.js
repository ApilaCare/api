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

    //before creating check if the recovery for this user is already started
    IssRecovery.findOne({"recoveredMember" : recoveredMember}, function(err, recovery) {
      if(recovery) {
        sendJSONresponse(res, 404, {message: "Already in recovery process"});
      } else {

        IssRecovery.create({
          boss: boss,
          chosenMember: chosenMember,
          recoveredMember: recoveredMember

        }, function(err, issueRecovery) {
          if(issueRecovery) {

            setRecoveryToUser(res, recoveredMember, chosenMember, function() {
              var data = {};
              data.chosenMemberName = chosenMember.name;
              data.recoveryid = issueRecovery._id;

              sendJSONresponse(res, 200, data);
            });


          } else {
            sendJSONresponse(res, 404, {"message": "Error while creating issue recovery"});
          }
        });
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

  if(!req.body.password) {
    sendJSONresponse(res, 404, {"message": "No password sent"});
    return;
  }

  var password = req.body.password;

  //find the user and chek to see if the password matches
  User.findOne({"_id" : req.params.userid}, function(err, user) {
    if(user) {
      if(user.validPassword(password)) {

        IssRecovery.findOne({"_id" : req.body.recoveryid}, function(err, recovery) {
          if(recovery) {
            if(req.body.type === "boss") {
              recovery.bossPasswordConfirmed = true;

              recovery.save(function() {
                sendJSONresponse(res, 200, {"message" : true});
              });
            } else {

            }
          } else {
            sendJSONresponse(res, 404, {"message" : false});
          }
        });


      } else {
        sendJSONresponse(res, 404, {"message" : false});
      }
    } else {
      sendJSONresponse(res, 404, {"message" : "User not found for password verification"});
    }
  });

}

//transfer confidential issues from 1 user to another, when the user is recovered
function switchOverIssues() {

}

// given a user id and the chosenUser, it set's the user with a reference to it's chosenUser
function setRecoveryToUser(res, userid, chosenMember, callback) {
  User.findOne({"_id" : userid}, function(err, user) {
    if(user) {
      user.recovery = chosenMember._id;

      user.save(function(err) {
        if(err) {
          sendJSONresponse(res, 404, {message: "Unable to save user"});
        } else {
          callback();
        }
      })
    } else {
      sendJSONresponse(res, 404, {message: "Unable to find the user"});
    }
  })
}
