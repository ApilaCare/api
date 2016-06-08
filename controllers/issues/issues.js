var mongoose = require('mongoose');
var Iss = mongoose.model('Issue');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

// api/issues/new
module.exports.issuesCreate = function(req, res) {

    console.log("IN ISSUE CREATE");

    console.log(req);

    if(req.payload === undefined) {
      console.log("fuk");
    }

    console.log(req.payload.name);

    //create issue from the inputed data
    Iss.create({
        title: req.body.title,
        responsibleParty: req.body.responsibleParty,
        resolutionTimeframe: req.body.resolutionTimeframe,
        description: req.body.description,
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
      console.log(issues.length);
      sendJSONresponse(res, 200, issues.length)
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
                 "community" : "$community"
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

                console.log(req.body);
                if(req.body.deletedMember !== undefined) {
                  issue.idMembers.splice(issue.idMembers.map
                    (function(d){return d.name;}).indexOf(req.body.deletedMember), 1);
                } else {
                    issue.idMembers = req.body.idMembers;
                }



                console.log(issue.idMembers);

                issue.updateInfo.push(updateInfo);
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
