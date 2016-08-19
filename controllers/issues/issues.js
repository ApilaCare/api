var mongoose = require('mongoose');
var Iss = mongoose.model('Issue');
var User = mongoose.model('User');
var utils = require('../../services/utils');

//TODO: careful when populating user info exclude hash and stuff

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

      User.populate(issue, {
        path: 'responsibleParty'
      }, function(err, populatedIssue) {
        utils.sendJSONresponse(res, 200, populatedIssue);
      });


    }
  });
};


//GET /issues/count/:userid/id/:communityid - Number of open issues asigned to an user
module.exports.issuesOpenCount = function(req, res) {

  var userid = req.params.userid;
  var community = req.params.communityid;

  if (!community || !userid) {
    utils.sendJSONresponse(res, 404, 0);
    return;
  }

  Iss.find({
    status: "Open",
    responsibleParty: userid,
    community: community
  }, function(err, issues) {
    if (issues) {
      utils.sendJSONresponse(res, 200, issues.length);
    } else {
      utils.sendJSONresponse(res, 404, 0);
    }

  });
};

// GET /issues/issuescount/:communityid - Number of open isues for a community
module.exports.issuesCount = function(req, res) {

  var communityid = req.params.communityid;

  if (!communityid) {
    utils.sendJSONresponse(res, 404, 0);
    return;
  }

  Iss.find({
    status: "Open",
    community: communityid
  }, function(err, issues) {
    if(err) {
      utils.sendJSONresponse(res, 404, {'message' : err});
    } else {
      utils.sendJSONresponse(res, 200, issues.length);
    }

  });
};

// GET /issues/list/:status/id/:communityid - Gets a list of issues grouped by responsibleParty
// and sorted by users issue number
module.exports.issuesList = function(req, res) {

  var id = req.params.communityid;
  var status = req.params.status;

  if(!id || !status) {
    utils.sendJSONresponse(res, 404, {'message' : "params not specified"});
    return;
  }

  var issueTemplate = {
    "title": "$title",
    "responsibleParty": "$responsibleParty",
    "resolutionTimeframe": "$resolutionTimeframe",
    "description": "$description",
    "submitBy": "$submitBy",
    "submitDate": "$submitDate",
    "comments": "$comments",
    "updateInfo": "$updateInfo",
    "status": "$status",
    "idMembers": "$idMembers",
    "idLabels": "$idLabels",
    "idAttachmentCover": "$idAttachmentCover",
    "attachments": "$attachments",
    "labels": "$labels",
    "checklists": "$checklists",
    "_id": "$_id",
    "community": "$community",
    "due": "$due",
    "confidential": "$confidential"
  };

  Iss.aggregate([{
        '$match': {
          community: new mongoose.Types.ObjectId(id),
          status: req.params.status
        }
      },
      {
        '$group': {
          "_id": "$responsibleParty",
          count: {
            "$sum": 1
          },
          issues: {
            $push: issueTemplate
          }
        }
      }, {
        '$sort': {
          "count": -1
        }
      }
    ],
    function(err, issues) {

      //Populate user model so we have responsibleParty name and not just the _id
      User.populate(issues, {
        path: '_id',
        model: 'User'
      }, function(err) {
        if(err) {
          utils.sendJSONresponse(res, 404, {'message' : err});
        } else {
          utils.sendJSONresponse(res, 200, issues);
        }

      });

    });
};

// GET /issues/:username/s/:status/id/:communityid - List issues in a community by status
module.exports.issuesListByStatus = function(req, res) {

  var status = req.params.status;
  var communityid = req.params.communityid;

  if(!status || !communityid) {
    utils.sendJSONresponse(res, 404, {'message' : 'Params are not specified'});
    return;
  }

  Iss.find({
    status: status,
    community: communityid
  }, function(err, issues) {
    if(err) {
      utils.sendJSONresponse(res, 404, {'message' : err});
    } else {
      utils.sendJSONresponse(res, 200, issues);
    }
  });
};

// GET /issues/due/:communityid - List of issues that are due in a community
module.exports.dueIssuesList = function(req, res) {

  var communityid = req.params.communityid;

  if(!communityid) {
    utils.sendJSONresponse(res, 404, {'message': 'Params not specified'});
  }

  Iss.find({
      "due": {
        $exists: true
      },
      community: communityid
    },
    function(err, issues) {
      if (issues) {
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

// PUT issues/:issueid - Updates issue by its id
module.exports.issuesUpdateOne = function(req, res) {

  if (!req.params.issueid) {
    utils.sendJSONresponse(res, 404, {
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

        if (req.body.deletedMember !== undefined) {
          issue.idMembers.splice(issue.idMembers.map(function(d) {
            return d.name;
          }).indexOf(req.body.deletedMember), 1);
        } else {
          issue.idMembers = req.body.idMembers;
        }


        if (updateInfo.updateField !== undefined) {
          if (updateInfo.updateField.length > 0) {
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

// DELETE /issues/:issueid - Delte an issue by id
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
          utils.sendJSONresponse(res, 204, null);
        }
      );
  } else {
    sendJSONresponse(res, 404, {
      "message": "No issueid"
    });
  }
};
