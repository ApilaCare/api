var mongoose = require('mongoose');
var Iss = mongoose.model('Issue');
var User = mongoose.model('User');
var utils = require('../../services/utils');


// POST /issues/new - Creates a new issue
module.exports.issuesCreate = function(req, res) {

  Iss.create({
    title: req.body.title,
    responsibleParty: req.body.responsibleParty,
    resolutionTimeframe: req.body.resolutionTimeframe,
    description: req.body.description,
    confidential: req.body.confidential,
    submitBy: req.payload.name,
    community: req.body.community._id
  }, function(err, issue) {
    if (err) {
      console.log(err);
      utils.sendJSONresponseresponse(res, 400, err);
    } else {
      utils.sendJSONresponse(res, 200, issue);
    }
  });
};


//GET /issues/count/:username/id/:communityid - Number of open issues asigned to an user
module.exports.issuesOpenCount = function(req, res) {

  var username = req.params.username;
  var community = req.params.communityid;

  if (!community || !username) {
    utils.sendJSONresponse(res, 404, 0);
  }

  Iss.find({
    status: "Open",
    responsibleParty: username,
    community: community
  }, function(err, issues) {
    if (issues) {
      utils.sendJSONresponse(res, 200, issues.length);
    } else {
      utils.sendJSONresponse(res, 404, 0);
    }

  });
};

module.exports.issuesCount = function(req, res) {

  console.log("issuesCount");
  var c =  req.params.communityid;

  if(c === undefined){
    utils.sendJSONresponse(res, 404, 0);
  }

  Iss.find({status: "Open", community: c}, function(err, issues) {
      console.log(issues.length);
      utils.sendJSONresponse(res, 200, issues.length);
  });
};

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
               };

    Iss.aggregate([{'$match' : {community : new mongoose.Types.ObjectId(id),
                                status : req.params.status}},

      {'$group' : {"_id": "$responsibleParty",
                  count: {"$sum" : 1},
                  issues: {$push : issueTemplate}}},
                  {'$sort' : {"count" : -1}}],
     function(err, issues) {
        console.log(issues);
        utils.sendJSONresponse(res, 200, issues);
    });
};

module.exports.issuesListByUsername = function(req, res) {

  //var username = req.params.username;
  var s = req.params.status;
  var c =  req.params.communityid;

  Iss.find({status: s, community: c}, function(err, issues) {
      console.log(issues);
      utils.sendJSONresponse(res, 200, issues);
  });
};

module.exports.dueIssuesList = function(req, res) {
  Iss.find({"due" : {$exists: true}, community: req.params.communityid},
  function(err, issues) {
    if(issues) {
      utils.sendJSONresponse(res, 200, issues);
    } else {
      utils.sendJSONresponse(res, 404, {
        "message": "Issues with due date not found"
      });
    }
  });
};

// GET /issues/:issueid - Reads issue info by id
module.exports.issuesReadOne = function(req, res) {

  if (req.params && req.params.issueid) {
    Iss
      .findById(req.params.issueid)
      .exec(function(err, issue) {
        if (!issue) {
          utils.sendJSONresponse(res, 404, {
            "message": "issueid not found"
          });
          return;
        } else if (err) {
          console.log(err);
          utils.sendJSONresponse(res, 404, err);
          return;
        }

        utils.sendJSONresponse(res, 200, issue);
      });
  } else {
    console.log('No issueid specified');
    utils.sendJSONresponse(res, 404, {
      "message": "No issueid in request"
    });
  }
};

/* PUT /api/issue/:issueid */
module.exports.issuesUpdateOne = function(req, res) {

    if (!req.params.issueid) {
        utils.sendJSONresponse(res, 404, {
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
                    utils.sendJSONresponse(res, 404, {
                        "message": "issueid not found"
                    });
                    return;
                } else if (err) {
                    utils.sendJSONresponse(res, 400, err);
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
                        utils.sendJSONresponse(res, 404, err);
                    } else {
                        utils.sendJSONresponse(res, 200, issue);
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
                        utils.sendJSONresponse(res, 404, err);
                        return;
                    }
                    console.log("issue id " + issueid + " deleted");
                    utils.sendJSONresponse(res, 204, null);
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "No issueid"
        });
    }
};
