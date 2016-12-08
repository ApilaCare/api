var mongoose = require('mongoose');
var Iss = mongoose.model('Issue');
var User = mongoose.model('User');
var utils = require('../../services/utils');
const activitiesService = require('../../services/activities.service');
const ToDo = mongoose.model('ToDo');

// POST /issues/new - Creates a new issue
module.exports.issuesCreate = function(req, res) {

  Iss.create({
    title: req.body.title,
    responsibleParty: req.body.responsibleParty,
    resolutionTimeframe: req.body.resolutionTimeframe,
    description: req.body.description,
    confidential: req.body.confidential,
    submitBy: req.payload._id,
    community: req.body.community._id
  }, function(err, issue) {
    if (err) {
      console.log(err);
      utils.sendJSONresponse(res, 400, err);
    } else {

      User.populate(issue, {
        path: 'responsibleParty submitBy'
      }, function(err, populatedIssue) {

        activitiesService.addActivity(" created issue " + req.body.title, req.body.responsibleParty,
                                        "issue-create", req.body.community._id);

        utils.sendJSONresponse(res, 200, populatedIssue);
      });


    }
  });
};

//PUT /issues/:issueid/finalplan - Adds a final plan item to an issue
module.exports.addFinalPlan = function(req, res) {

  let issueid = req.params.issueid;
  let todoId = req.body.todoid;

  if (utils.checkParams(req, res, ['issueid'])) {
    return;
  }

  if(!req.body.checklist) {

    let todo = ToDo.findById(todoId).exec();

    todo
    .then((todo) => {

      todo.tasks.push({
        "text" : req.body.text,
        "occurrence" : 1,
        "state" : "current",
        "activeDays" : [true, true, true, true, true, false, false],
        "activeWeeks": [false, false, false, false, false],
        "activeMonths": [false, false, false, false, false,false, false, false, false, false,false, false, false, false, false],
        "cycleDate" : new Date(),
        "issueName": req.body.issueName
      });

      return todo;
    })
    .then((todo) => {
      todo.save((err, todo) => {
          return todo.tasks[todo.tasks.length-1]._id;
      });
    })
    .then((taskId) => {
      finalPlan(req, res, taskId);
    });

  } else {
    finalPlan(req, res);
  }


};

//GET /issues/count/:userid/id/:communityid - Number of open issues asigned to an user
module.exports.issuesOpenCount = function(req, res) {

  var userid = req.params.userid;
  var community = req.params.communityid;

  if (utils.checkParams(req, res, ['userid', 'communityid'])) {
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

// GET /issues/:issueid/updateinfo - Returns all updateInfo populated for an issue
module.exports.issueUpdateInfo = function(req, res) {
  var issueid = req.params.issueid;

  if (utils.checkParams(req, res, ['issueid'])) {
    return;
  }

  Iss.findById(issueid)
     .populate('updateInfo.updateBy', 'email name userImage')
     .exec(function(err, issue) {
       if(err) {
         utils.sendJSONresponse(res, 404, {'message' : err});
       } else {
           utils.sendJSONresponse(res, 200, issue.updateInfo);
       }
     });

};

// GET /issues/issuescount/:communityid - Number of open isues for a community
module.exports.issuesCount = function(req, res) {

  var communityid = req.params.communityid;

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  Iss.find({
    status: "Open",
    community: communityid
  }, function(err, issues) {
    if (err) {
      utils.sendJSONresponse(res, 404, {
        'message': err
      });
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

  if (utils.checkParams(req, res, ['status', 'communityid'])) {
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
    "finalPlan": "$finalPlan",
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
    }, {
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
    }],
    function(err, issues) {

      //Populate user model so we have responsibleParty name and not just the _id
      User.populate(issues, [{
        path: '_id',
        model: 'User'
      },{
        path: 'updateInfo.updateBy',
        model: 'User'
      },{
        path: 'submitBy',
        model: 'User'
      },{
        path: 'responsibleParty',
        model: 'User'
      }], function(err) {
        if (err) {
          utils.sendJSONresponse(res, 404, {
            'message': err
          });
        } else {
          console.log(issues);
          utils.sendJSONresponse(res, 200, issues);
        }

      });

    });
};

// GET /issues/:username/s/:status/id/:communityid - List issues in a community by status
module.exports.issuesListByStatus = function(req, res) {

  var status = req.params.status;
  var communityid = req.params.communityid;

  if (utils.checkParams(req, res, ['status', 'communityid'])) {
    return;
  }

  Iss.find({status: status, community: communityid})
      .populate("submitBy", "name _id")
      .populate("responsibleParty", "name _id")
      .exec(function(err, issues) {
    if (err) {
      utils.sendJSONresponse(res, 404, {
        'message': err
      });
    } else {
      utils.sendJSONresponse(res, 200, issues);
    }
  });
};

// GET /issues/due/:communityid - List of issues that are due in a community
module.exports.dueIssuesList = function(req, res) {

  var communityid = req.params.communityid;

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
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

module.exports.issuesPopulateOne = (req, res) => {

  Iss.findById(req.params.issueid)
      .populate("checklists.author", "name _id")
      .populate("finalPlan.author", "name _id")
      .populate("responsibleParty", "name _id")
      .exec((err, issue) => {

        if(!err) {
          console.log(issue);

          utils.sendJSONresponse(res, 200, issue);
        } else {
          utils.sendJSONresponse(res, 404, err);
        }

      });

};

// GET /issues/:issueid - Reads issue info by id
module.exports.issuesReadOne = function(req, res) {

  if (utils.checkParams(req, res, ['issueid'])) {
    return;
  }

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

  if (utils.checkParams(req, res, ['issueid'])) {
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

        if(req.body.responsibleParty) {
          issue.responsibleParty = req.body.responsibleParty._id || req.body.responsibleParty;
        }

        if(req.body.submitBy._id) {
          issue.submitBy = req.body.submitBy._id;
        }

        issue.title = req.body.title;
        issue.resolutionTimeframe = req.body.resolutionTimeframe;

        issue.description = req.body.description;
        issue.status = req.body.status;
        issue.due = req.body.due;

        issue.checklists = req.body.checklists;
        issue.labels = req.body.labels;

        issue.shelvedDate = req.body.shelvedDate;

        if (req.body.deletedMember) {
          issue.idMembers.splice(issue.idMembers.map(function(d) {
            return d.name;
          }).indexOf(req.body.deletedMember), 1);
        } else {
          issue.idMembers = req.body.idMembers;
          console.log(issue.idMembers);
        }


        if (updateInfo.updateField !== undefined) {
          if (updateInfo.updateField.length > 0) {
            issue.updateInfo.push(updateInfo);
          }

        }

        issue.save(function(err, issue) {
          if (err) {
            console.log(err);
            utils.sendJSONresponse(res, 404, err);
          } else {
            Iss.populate(issue.updateField, [{'path' : 'updateBy'}, {'path' : 'submitBy'}, {'path' : 'checklists.author'}],
            function(err, iss) {
                    utils.sendJSONresponse(res, 200, iss);
            });
          }
        });
      }
    );
};

// DELETE /issues/:issueid - Delte an issue by id
module.exports.issuesDeleteOne = function(req, res) {
  var issueid = req.params.issueid;

  if (utils.checkParams(req, res, ['issueid'])) {
    return;
  }

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

//////////////////////// HELPER FUNCTIONS ////////////////////////////
function finalPlan(req, res, taskid) {
  Iss.findById(req.params.issueid)
     .exec(function(err, issue) {

       if(err) {
         utils.sendJSONresponse(res, 404, {'message' : 'Issue not found to add a final plan'});
       } else {

         let finalPlan = {
           "text" : req.body.text,
           "checklist" : req.body.checklist,
           "author" : req.body.author
         };

         if(taskid) {
           finalPlan.task = taskid;
         }

         issue.finalPlan.push(finalPlan);

         issue.save(function(err, issue) {
           if(err) {
             utils.sendJSONresponse(res, 404,
               {'message' : 'Unable to save issue while adding final plan'});
           } else {
             utils.sendJSONresponse(res, 200, finalPlan);
           }
         });
       }

     });
}
