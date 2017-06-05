const mongoose = require('mongoose');
const Iss = mongoose.model('Issue');
const User = mongoose.model('User');
const utils = require('../../services/utils');
const activitiesService = require('../../services/activities');
const ToDo = mongoose.model('ToDo');

const Labels = mongoose.model('Labels');

const APILA_EMAIL = require('../../services/constants').APILA_EMAIL;

const sendIssueMemberEmail = require('../../services/emails/emailControllers/issueMember').sendIssueMemberEmail;
const sendResponsibleMemberEmail = require('../../services/emails/emailControllers/issueResParty').sendResponsibleMemberEmail;

// POST /issues/new - Creates a new issue
module.exports.issuesCreate = async (req, res) => {

  Iss.create({
    title: req.body.title,
    responsibleParty: req.body.responsibleParty,
    resolutionTimeframe: req.body.resolutionTimeframe,
    description: req.body.description,
    confidential: req.body.confidential,
    submitBy: req.payload._id,
    community: req.body.community._id
  }, async (err, issue) => {
    if (err) {
      console.log(err);
      utils.sendJSONresponse(res, 400, err);
    } else {

      User.populate(issue, {
        path: 'responsibleParty submitBy',
        select: '_id name userImage'
      }, async (err, populatedIssue) => {

        if(req.body.notifyUser) {
          await responsibleEmail(populatedIssue, populatedIssue.responsibleParty._id);
        }

        activitiesService.addActivity(" created issue " + req.body.title, req.body.responsibleParty,
                                        "issue-create", req.body.community._id, 'community');

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

  if(req.body.checklist) {

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
module.exports.issuesCount = async (req, res) => {

  var communityid = req.params.communityid;

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  try {

    let searchQuery = { status: "Open", community: communityid };

    let issueCount = await Iss.find(searchQuery).count().exec();

    utils.sendJSONresponse(res, 200, issueCount);
  } catch(err) {
    utils.sendJSONresponse(res, 500, err);
  }

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
        model: 'User',
        select: '_id name userImage'
      },{
        path: 'issues.responsibleParty',
        model: 'User',
        select: '_id name userImage'
      }], function(err, populated) {
        if (err) {
          utils.sendJSONresponse(res, 404, {
            'message': err
          });
        } else {
          utils.sendJSONresponse(res, 200, populated);
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
      //.select("_id title description resolutionTimeframe submitBy responsibleParty updateInfo attachments")
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
module.exports.dueIssuesList = async (req, res) => {

  const communityid = req.params.communityid;

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  try {

    const issues = await Iss.find({
        "due": {
          $exists: true
        },
        community: communityid
      }).select("title due _id").exec();

    utils.sendJSONresponse(res, 200, issues);
  } catch(err) {
    utils.sendJSONresponse(res, 400, err);
  }

};

module.exports.issuesPopulateOne = (req, res) => {

  Iss.findById(req.params.issueid)
      .populate("checklists.author", "name _id")
      .populate("finalPlan.author", "name _id userImage")
      .populate("responsibleParty", "name _id userImage")
      .populate("submitBy", "name _id")
    //  .populate("labels", "color name")
      .exec((err, issue) => {

        if(!err) {

          Labels.populate(issue, {path: "labels", model:"Labels"}, function(err, d) {
            console.log(d);
            utils.sendJSONresponse(res, 200, issue);
          });


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

//POST issues/:issueid/member_notification - Send email notification when the user is added to the issue
module.exports.sendMemberNotification = async (req, res) => {

  if (utils.checkParams(req, res, ['issueid'])) {
    return;
  }

  try {

    const issue = req.body.issue;

    const memberEmail = req.body.memberEmail;
    const memberName = req.body.memberName;
    const memberId = req.body.memberId;

    const issuesOfMember = [];
    const currIssue = await Iss.findById(req.params.issueid).exec();

    if(currIssue.emailsSentTo.indexOf(memberEmail) === -1) {

      currIssue.emailsSentTo.push(memberEmail);
      await sendIssueMemberEmail(APILA_EMAIL, memberEmail, issue, memberName, issuesOfMember);

      await currIssue.save();

      utils.sendJSONresponse(res, 200, true);
    } else {
        utils.sendJSONresponse(res, 200, true);
    }


  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};


//POST issues/:issueid/responsible_party_notification - Send email notification when the user assigned as a responsible party
module.exports.sendResponsiblePartyNotification = async (req, res) => {

   if (utils.checkParams(req, res, ['issueid'])) {
    return;
  }

  try {

    const responsiblePartyId = req.body.responsibleParty;
    const issue = req.body.issue;

    await responsibleEmail(issue, responsiblePartyId);

    utils.sendJSONresponse(res, 200, true);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};

// PUT issues/:issueid - Updates issue by its id
module.exports.issuesUpdateOne = function(req, res) {

  if (utils.checkParams(req, res, ['issueid'])) {
    return;
  }

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
          let newResponsibleUser = req.body.responsibleParty._id || req.body.responsibleParty;

          //user getting switched
          if(newResponsibleUser !== issue.responsibleParty) {
            activitiesService.updateIssueCount(newResponsibleUser, 'increment');
            activitiesService.updateIssueCount(issue.responsibleParty, 'decrement');
          }

          issue.responsibleParty = newResponsibleUser;
        }

        if(req.body.submitBy && req.body.submitBy._id) {
          issue.submitBy = req.body.submitBy._id;
        }

        issue.title = req.body.title;
        issue.resolutionTimeframe = req.body.resolutionTimeframe;

        issue.description = req.body.description;

        //if status changed
        if(issue.status !== req.body.status) {
          if(req.body.status === 'Open') {
            activitiesService.updateIssueCount(req.payload._id, 'increment');
          } else {
            activitiesService.updateIssueCount(req.payload._id, 'decrement');
          }

        }

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
        }

        issue.save(function(err, issue) {
          if (err) {
            console.log(err);
            utils.sendJSONresponse(res, 404, err);
          } else {

              if(req.body.addedMember) {
                console.log("added a member");
                activitiesService.addActivity(" added member " + req.body.addedMember.name + " to issue " + issue.title, req.payload._id,
                                                "issue-update", issue.community, 'user', req.body.addedMember._id);
              } else if(req.body.oldResponsibleParty) {
                activitiesService.addActivity(" changed responsible party in issue " + issue.title, req.payload._id,
                                                "issue-update", issue.community, 'user');
              } else {
                activitiesService.addActivity(" updated issue " + req.body.title, req.payload._id,
                                                "issue-update", issue.community, 'community');
              }

              utils.sendJSONresponse(res, 200, issue);
          }


        });
      });
};

//PUT /issues/:issueid/confidential 
module.exports.updateConfidential = async (req, res) => {
  try {

    const issue = await Iss.update(
        {_id: req.params.issueid}, 
        {$set: { confidential: req.body.confidential}}).exec();

    utils.sendJSONresponse(res, 200, {});

  } catch(err) {
    utils.sendJSONresponse(res, 404, err);
  }
};

//PUT /issues/:issueid/updateinfo - Adding a new update info entry
module.exports.addUpdateInfo = async (req, res) => {

  try {

    if(!req.body) {
      throw "UpdateInfo is empty";
    }

    let issue = await Iss.findById(req.params.issueid).exec();

    req.body.ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    issue.updateInfo.push(req.body);

    let savedIssue = await issue.save();

    utils.sendJSONresponse(res, 200, req.body);

  } catch(err) {
    utils.sendJSONresponse(res, 500, err);
  }
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

//PUT /issues/:issueid/plan/:planid
module.exports.updateFinalPlan = async (req, res) => {

  let planId = req.params.planid;

  if (utils.checkParams(req, res, ['issueid', 'planid'])) {
    return;
  }

  try {
    let issue = await Iss.findById(req.params.issueid).exec();

    let index = issue.finalPlan.indexOf(issue.finalPlan.id(planId));
    let plan = req.body;

    if(index === -1) {
      throw "No final Plan found";
    }

    issue.finalPlan.set(index, plan);

    const savedIssue = await issue.save();

    utils.sendJSONresponse(res, 200, savedIssue);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
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
             utils.sendJSONresponse(res, 200, issue.finalPlan.pop());
           }
         });
       }

     });
}

async function responsibleEmail(issue, responsiblePartyId) {
  
  try {
    const responsibleParty = await User.findById(responsiblePartyId).exec();

    const issuesOfMember = await Iss.find({responsibleParty: responsiblePartyId}).
                                 select('_id title').exec();

    await sendResponsibleMemberEmail(APILA_EMAIL, responsibleParty.email, issue, responsibleParty.name, issuesOfMember);

  } catch(err) {
    console.log(err);
    throw err;
  }
}

