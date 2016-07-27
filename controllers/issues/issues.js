var mongoose = require('mongoose');
var Iss = mongoose.model('Issue');
var User = mongoose.model('User');

// constants time in minutes
var DAY = 24*60;
var THREE_DAYS = 72*60;
var THREE_WEEKS = 504*60;
var THREE_MONTHS = 2160*60;

var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.hour = 1;

schedule.scheduleJob(rule, function() {

  // get all shelved issues
  Iss.find({status: "Shelved"}, function(err, issues) {
    if(issues) {
      var currTime = new Date();

      // for each issue check if it has expiered back to Open
      for(var i = 0; i < issues.length; ++i) {

        if(issues[i].shelvedDate) {
          var shelvedTime = new Date(issues[i].shelvedDate);

          var timeDiffInMin = (currTime.getTime() - shelvedTime.getTime()) / 60 / 1000;

          if(issues[i].resolutionTimeframe === "Hours" && timeDiffInMin >= DAY) {
            changeIssueStatus(issues[i]._id);
          }
          else if(issues[i].resolutionTimeframe === "Days" && timeDiffInMin >= THREE_DAYS) {
            changeIssueStatus(issues[i]._id);
          }
          else if(issues[i].resolutionTimeframe === "Weeks" && timeDiffInMin >= THREE_WEEKS) {
            changeIssueStatus(issues[i]._id);
          }
          else if(issues[i].resolutionTimeframe === "Months" && timeDiffInMin >= THREE_MONTHS) {
            changeIssueStatus(issues[i]._id);
          }

        }
      }

    } else {
      console.log("Issues not found while updatin shelved issues");
    }
  });

});

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

//given an issues Id it changes its status to Open
function changeIssueStatus(id) {
  Iss.findById(id).exec(function(err, issue) {
    if(issue) {
      issue.status = "Open";
      issue.save();
    } else {
      console.log("issue not found");
    }
  });
}

// api/issues/new
module.exports.issuesCreate = function(req, res) {

    //create issue from the inputed data
    Iss.create({
        title: req.body.title,
        responsibleParty: req.body.responsibleParty,
        resolutionTimeframe: req.body.resolutionTimeframe,
        description: req.body.description,
        confidential: req.body.confidential,
        submitBy: req.payload.name,
        community : req.body.community._id
    }, function(err, issue) {
        if (err) {
            console.log(err);
            sendJSONresponse(res, 400, err);
        } else {
            console.log(issue);
            sendJSONresponse(res, 200, issue);
        }
    });
};

module.exports.issuesOpenCount = function(req, res) {

  var username = req.params.username;
  var community =  req.params.communityid;

  if(community == undefined){
    sendJSONresponse(res, 404, 0);
  }

  Iss.find({status: "Open", responsibleParty: username, community: community}, function(err, issues) {
      if(issues){
        sendJSONresponse(res, 200, issues.length)
      } else {
        sendJSONresponse(res, 404, 0);
      }

  });
}

module.exports.issuesCount = function(req, res) {

  console.log("issuesCount");
  var c =  req.params.communityid;

  if(c== undefined){
    sendJSONresponse(res, 404, 0);
  }

  Iss.find({status: "Open", community: c}, function(err, issues) {
      console.log(issues.length);
      sendJSONresponse(res, 200, issues.length)
  });
}

/* GET list of issues */
module.exports.issuesList = function(req, res) {

    console.log("list issue with ID: " + req.params.communityid);

    var id = req.params.communityid;

    var issueTemplate = {
                 "title" : "$title",
                 "responsibleParty" : "$responsibleParty",
                 "resolutionTimeframe" : "$resolutionTimeframe",
                 "description" : "$description",
                 "submitBy" : "$submitBy",
                 "submitDate": "$submitDate",
                 "comments" : "$comments",
                 "updateInfo" : "$updateInfo",
                 "status"  : "$status",
                 "idMembers": "$idMembers",
                 "idLabels" : "$idLabels",
                 "idAttachmentCover" : "$idAttachmentCover",
                 "attachments" : "$attachments",
                 "labels"    : "$labels",
                 "checklists": "$checklists",
                 "_id" : "$_id",
                 "community" : "$community",
                 "due" : "$due",
                 "confidential" : "$confidential"
               }

    Iss.aggregate([{'$match' : {community : new mongoose.Types.ObjectId(id),
                                status : req.params.status}},

      {'$group' : {"_id": "$responsibleParty",
                  count: {"$sum" : 1},
                  issues: {$push : issueTemplate}}},
                  {'$sort' : {"count" : -1}}],
     function(err, issues) {
        console.log(issues);
        sendJSONresponse(res, 200, issues)
    });
};

module.exports.issuesListByUsername = function(req, res) {

  //var username = req.params.username;
  var s = req.params.status;
  var c =  req.params.communityid;

  Iss.find({status: s, community: c}, function(err, issues) {
      console.log(issues);
      sendJSONresponse(res, 200, issues)
  });
}

module.exports.dueIssuesList = function(req, res) {
  Iss.find({"due" : {$exists: true}, community: req.params.communityid},
  function(err, issues) {
    if(issues) {
      sendJSONresponse(res, 200, issues);
    } else {
      sendJSONresponse(res, 404, {
        "message": "Issues with due date not found"
      });
    }
  });
}

module.exports.issuesReadOne = function(req, res) {
    console.log('Finding issue details', req.params);
    if (req.params && req.params.issueid) {
        Iss
            .findById(req.params.issueid)
            .exec(function(err, issue) {
                if (!issue) {
                    sendJSONresponse(res, 404, {
                        "message": "issueid not found"
                    });
                    return;
                } else if (err) {
                    console.log(err);
                    sendJSONresponse(res, 404, err);
                    return;
                }
                console.log(issue);
                sendJSONresponse(res, 200, issue);
            });
    } else {
        console.log('No issueid specified');
        sendJSONresponse(res, 404, {
            "message": "No issueid in request"
        });
    }
};

/* PUT /api/issue/:issueid */
module.exports.issuesUpdateOne = function(req, res) {

    if (!req.params.issueid) {
        sendJSONresponse(res, 404, {
            "message": "Not found, issueid is required"
        });
        return;
    }

    console.log("UPDATE");

    var updateInfo = {
        "updateBy": req.body.modifiedBy,
        "updateDate": req.body.modifiedDate,
        "updateField": req.body.updateField
    };

    Iss
        .findById(req.params.issueid)
        .exec(
            function(err, issue) {
                if (!issue) {
                    sendJSONresponse(res, 404, {
                        "message": "issueid not found"
                    });
                    return;
                } else if (err) {
                    sendJSONresponse(res, 400, err);
                    return;
                }

                issue.title = req.body.title;
                issue.responsibleParty = req.body.responsibleParty;
                issue.resolutionTimeframe = req.body.resolutionTimeframe;
                issue.submitBy = req.body.submitBy;
                issue.description = req.body.description;
                issue.status = req.body.status;
                issue.due = req.body.due;

                issue.checklists = req.body.checklists;
                issue.labels = req.body.labels;
                issue.updateInfo = req.body.updateInfo;
                issue.shelvedDate = req.body.shelvedDate;

                console.log(req.body);
                if(req.body.deletedMember !== undefined) {
                  issue.idMembers.splice(issue.idMembers.map
                    (function(d){return d.name;}).indexOf(req.body.deletedMember), 1);
                } else {
                    issue.idMembers = req.body.idMembers;
                }



                console.log(issue.idMembers);

                if(updateInfo.updateField !== undefined) {
                  if(updateInfo.updateField.length > 0) {
                    issue.updateInfo.push(updateInfo);
                  }

                }

                issue.save(function(err, issue) {
                    if (err) {
                        sendJSONresponse(res, 404, err);
                    } else {
                        sendJSONresponse(res, 200, issue);
                    }
                });
            }
        );
};

/* DELETE /api/issue/:issueid */
module.exports.issuesDeleteOne = function(req, res) {
    var issueid = req.params.issueid;
    if (issueid) {
        Iss
            .findByIdAndRemove(issueid)
            .exec(
                function(err, issue) {
                    if (err) {
                        console.log(err);
                        sendJSONresponse(res, 404, err);
                        return;
                    }
                    console.log("issue id " + issueid + " deleted");
                    sendJSONresponse(res, 204, null);
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "No issueid"
        });
    }
};

var getAuthor = function(req, res, callback) {
    console.log("Finding author with email " + req.payload.email);
    // validate that JWT information is on request object
    if (req.payload.email) {
        User
        // user email address to find user
            .findOne({
                email: req.payload.email
            })
            .exec(function(err, user) {
                if (!user) {
                    sendJSONresponse(res, 404, {
                        "message": "User not found"
                    });
                    return;
                } else if (err) {
                    console.log(err);
                    sendJSONresponse(res, 404, err);
                    return;
                }
                console.log(user);
                // run callback, passing user's name
                callback(req, res, user.name);
            });

    } else {
        sendJSONresponse(res, 404, {
            "message": "User not found"
        });
        return;
    }
};


/* adding documents to mongodb
db.issues.save({
  title: 'It fell down, hard',
  responsibleParty: 'Carol Riggen',
  resolutionTimeframe: 'Weeks',
  description: 'One more silly issue to never ever resolve',
})
*/
