var mongoose = require('mongoose');
var utils = require('../../services/utils');

var IssRecovery = mongoose.model('MemberRecover');
var User = mongoose.model('User');
var emailService = require('../../services/email');
var Iss = mongoose.model('Issue');
var Community = mongoose.model('Community');
var issueExport = require('./../../services/exports/issueRecovery');

var _ = require('lodash');

//TODO: Split this up so we dont have callback hell

//POST /issues/recovery/:communityid - create a new memer recovery process
module.exports.createMemberRecovery = function(req, res) {

  var recoveredMember = req.body.recoveredMember;
  var boss = req.body.boss;

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  selectRandomUser(res, boss, recoveredMember, req.params.communityid, function(chosenMember) {

    if (chosenMember === null) {
      utils.sendJSONresponse(res, 404, {
        "message": "Random member could not be selected"
      });
    }

    //before creating check if the recovery for this user is already started
    IssRecovery.findOne({
      "recoveredMember": recoveredMember,
      active: true
    }, function(err, recovery) {
      if (recovery) {
        utils.sendJSONresponse(res, 404, {
          message: "Already in recovery process"
        });
      } else {

        IssRecovery.create({
          boss: boss,
          chosenMember: chosenMember,
          recoveredMember: recoveredMember

        }, function(err, issueRecovery) {
          if (issueRecovery) {

            setRecoveryToUser(res, recoveredMember, chosenMember, function() {
              var data = {};
              data.chosenMemberName = chosenMember.name;
              data.recoveryid = issueRecovery._id;

              utils.sendJSONresponse(res, 200, data);
            });


          } else {
            utils.sendJSONresponse(res, 404, {
              "message": "Error while creating issue recovery"
            });
          }
        });
      }
    });

  });
};

//POST /issues/recovery/verify/:userid - Confirm the password
module.exports.confirmPassword = function(req, res) {

  if (utils.checkParams(req, res, ['userid'])) {
    return;
  }

  if (!req.body.password) {
    utils.sendJSONresponse(res, 404, {
      "message": "No password sent"
    });
    return;
  }

  var password = req.body.password;

  //find the user and check to see if the password matches
  User.findOne({
    "_id": req.params.userid
  }, function(err, user) {
    if (user) {
      if (user.validPassword(password)) {

        if (req.body.type === "boss") {
          bossConfirmedPassword(res, req.body.recoveryid);
        } else {

          findRecoveryByUser(res, req.params.userid, function(recovery) {
            recovery.chosenMemberPasswordConfirmed = true;
            recovery.save(function() {

              // both of the users have verified password
              if (recovery.bossPasswordConfirmed === true) {
                unlockCondifentialIssues(recovery);
              }


              utils.sendJSONresponse(res, 200, {
                "message": true
              });
            });
          });
        }


      } else {
        utils.sendJSONresponse(res, 404, {
          "message": false
        });
      }
    } else {
      utils.sendJSONresponse(res, 404, {
        "message": "User not found for password verification"
      });
    }
  });

};


///////////////////////////// HELPER FUNCTIONS /////////////////////////////

// this will select a random user except the one who submited the request
function selectRandomUser(res, boss, recoveredMember, communityid, callback) {
  Community.findOne({
      _id: communityid
    })
    .populate("communityMembers", "_id name email userImage")
    .exec(function(err, community) {
      if (community) {

        var users = community.communityMembers;

        //if there are 2 or less in a community recovery is not possible
        if (users.length <= 2) {
          utils.sendJSONresponse(res, 500, {
            message: "To be able to recover a member there has to be two or more members in a community"
          });
          return;
        }

        var randomUser = null;

        // filtering out the user we are recovering and the user who started it, so we don't pick them
        users = _.filter(users, function(o) {
          if (o === null) {
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

// given a user id and the chosenUser, it set's the user with a reference to it's chosenUser
function setRecoveryToUser(res, userid, chosenMember, callback) {
  User.findOne({
    "_id": userid
  }, function(err, user) {
    if (user) {
      user.recovery = chosenMember._id;

      user.save(function(err) {
        if (err) {
          utils.sendJSONresponse(res, 404, {
            message: "Unable to save user"
          });
        } else {
          callback();
        }
      });
    } else {
      utils.sendJSONresponse(res, 404, {
        message: "Unable to find the user"
      });
    }
  });
}

function findRecoveryByUser(res, userid, callback) {
  IssRecovery.findOne({
      "chosenMember": userid
    })
    .populate("recoveredMember", "_id name userImage email")
    .exec(function(err, recovery) {
      if (recovery) {
        callback(recovery);
      } else {
        utils.sendJSONresponse(res, 404, {
          message: "Recovery not found"
        });
      }
    });
}

function getConfidentialIssues(recoveredMember, callback) {

  Iss.find({
      "confidential": true,
      "submitBy": recoveredMember.name
    },
    function(err, issues) {
      if (issues) {
        callback(issues);
      } else {
        console.log("Error while finding issues");
      }

    });
}

function bossConfirmedPassword(res, recoveryid) {

  IssRecovery.findOne({
    "_id": recoveryid
  }, function(err, recovery) {
    if (recovery) {

      recovery.bossPasswordConfirmed = true;
      recovery.active = true;

      recovery.save(function() {
        utils.sendJSONresponse(res, 200, {
          "message": true
        });
      });

    } else {
      utils.sendJSONresponse(res, 404, {
        "message": false
      });
    }
  });

}

// getting confidentials issues from the recovoredUser and convert it to pdf and send with email to boss
function unlockCondifentialIssues(recovery) {
  console.log("In unlocking process");

  //getting issues
  getConfidentialIssues(recovery.recoveredMember, function(issues) {

    var attachement = issueExport(issues, 'confidential.pdf');

    /*
    emailService.sendConfidentialIssues("support@apila.care", recovery.recoveredMember.email,
    recovery.recoveredMember.name, issues, function(err, info) {

      if(err) {
        console.log("Unable to send confidential issue recovery email");
      }

      console.log("email sent");

    });
    */

  });
}
