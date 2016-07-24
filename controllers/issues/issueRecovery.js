var mongoose = require('mongoose');

var IssRecovery = mongoose.model('MemberRecover');
var User = mongoose.model('User');
var emailService = require('../../services/email');
var Iss = mongoose.model('Issue');
var Community = mongoose.model('Community');
var pdf = require('pdfkit');
var fs = require('fs');

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

        if(req.body.type === "boss") {
          IssRecovery.findOne({"_id" : req.body.recoveryid}, function(err, recovery) {
            if(recovery) {

                recovery.bossPasswordConfirmed = true;
                recovery.save(function() {
                  sendJSONresponse(res, 200, {"message" : true});
                });


            } else {
              sendJSONresponse(res, 404, {"message" : false});
            }
          });
        } else {

          findRecoveryByUser(res, req.params.userid, function(recovery) {
            recovery.chosenMemberPasswordConfirmed = true;
            recovery.save(function() {

              // both of the users have verified password
              if(recovery.bossPasswordConfirmed === true) {
                unlockCondifentialIssues(recovery);
              }


              sendJSONresponse(res, 200, {"message" : true});
            });
          });
        }


      } else {
        sendJSONresponse(res, 404, {"message" : false});
      }
    } else {
      sendJSONresponse(res, 404, {"message" : "User not found for password verification"});
    }
  });

}

function findRecoveryByUser(res, userid, callback) {
  IssRecovery.findOne({"chosenMember" : userid})
   .populate("recoveredMember")
   .exec(function(err, recovery) {
    if(recovery) {
      callback(recovery);
    } else {
      sendJSONresponse(res, 404, {message: "Recovery not found"});
    }
  });
}

function createPdf(issues) {
  var doc = new pdf;

  doc.pipe(fs.createWriteStream('confidential.pdf'));


  doc.text("Confidential issues", 50, 50);

 for(var i = 0; i < issues.length; ++i) {
   doc.text(issues[i].title, 50, 80 + (i*15));
 }

  doc.end();

  return doc;
}

// getting confidentials issues from the recovoredUser and convert it to pdf and send with email to boss
function unlockCondifentialIssues(recovery) {
  console.log("In unlocking process");

  //getting issues
  getConfidentialIssues(recovery.recoveredMember, function(issues) {

    var attachement = createPdf(issues);

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

function getConfidentialIssues(recoveredMember, callback) {

 console.log(recoveredMember.name);

  Iss.find({"confidential" : true, "submitBy" : recoveredMember.name},
      function(err, issues) {
        if(issues) {
          callback(issues);
        } else {
          console.log("Error while finding issues");
        }

      });
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
