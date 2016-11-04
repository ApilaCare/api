var mongoose = require('mongoose');
var utils = require('../../services/utils');

var Iss = mongoose.model('Issue');
var User = mongoose.model('User');

//POST /issues/:issueid/checklists/new - creates a new checklist, providing a issueid
module.exports.issueChecklistsCreate = function(req, res) {

  if (utils.checkParams(req, res, ['issueid'])) {
    return;
  }

  let issue = Iss.findById(req.params.issueid)
     .select('checklists updateInfo')
     .exec();

  issue.then((issue) => {
    doAddChecklist(req, res, issue);

  }, (err) => {
    utils.sendJSONresponse(res, 400, err);
  });
};

// PUT /issues/:issueid/checklists/:checklistid - Update a checklist
module.exports.issueChecklistsUpdateOne = function(req, res) {

  if (utils.checkParams(req, res, ['issueid', 'checklistid'])) {
    return;
  }

  Iss
    .findById(req.params.issueid)
    .exec(
      function(err, issue) {

        var thisChecklist;

        if(issueHasError(res, err, issue)){
          return;
        }

        if (issue.checklists && issue.checklists.length > 0) {
          thisChecklist = issue.checklists.id(req.params.checklistid);

          if (!thisChecklist) {
            utils.sendJSONresponse(res, 404, {
              "message": "checklistid not found"
            });
          } else {

            thisChecklist.author = req.body.author;
            thisChecklist.checkItems = req.body.checkItems;
            thisChecklist.checkItemsChecked = req.body.checkItemsChecked;


            if (req.body.updateInfo) {
              issue.updateInfo.push(req.body.updateInfo);
            }

            // other update items
            issue.save(function(err, issue) {
              if (err) {
                console.log(err);
                utils.sendJSONresponse(res, 404, err);
              } else {
                utils.sendJSONresponse(res, 200, thisChecklist);
              }
            });
          }
        } else {
          utils.sendJSONresponse(res, 404, {
            "message": "No checklist to update"
          });
        }
      }
    );
};

//DELETE /issues/:issueid/labels/:labelid - Delete an checklist
module.exports.issueChecklistsDeleteOne = function(req, res) {

  if (utils.checkParams(req, res, ['issueid', 'checklistid'])) {
    return;
  }

  Iss
    .findById(req.params.issueid)
    .select('checklists updateInfo')
    .exec(
      function(err, issue) {

        if(issueHasError(res, err, issue)){
          return;
        }

        if (issue.checklists && issue.checklists.length > 0) {
          if (!issue.checklists.id(req.params.checklistid)) {
            utils.sendJSONresponse(res, 404, {
              "message": "checklistid not found"
            });
          } else {

            var updateInfo = formatUpdateInfo(req, issue);
            issue.updateInfo.push(updateInfo);

            issue.checklists.id(req.params.checklistid).remove();
            issue.save(function(err) {
              if (err) {
                utils.sendJSONresponse(res, 404, err);
              } else {
                utils.sendJSONresponse(res, 204, null);
              }
            });
          }
        } else {
          utils.sendJSONresponse(res, 404, {
            "message": "No checklist to delete"
          });
        }
      }
    );
};

//////////////////////// HELPER FUNCTIONS //////////////////////////////

var doAddChecklist = function(req, res, issue) {

  if (!issue) {
    utils.sendJSONresponse(res, 404, "issueid not found");
  } else {
    issue.checklists.push({
      author: req.payload._id,
      checklistName: req.body.checklistName,
      // needs the checkItems as the mixed mongoose schema
    });

    issue.updateInfo.push(req.body.updateInfo);

    issue.save(function(err, issue) {
      var thisChecklist;
      if (err) {
        utils.sendJSONresponse(res, 400, err);
      } else {
        thisChecklist = issue.checklists[issue.checklists.length - 1];
        utils.sendJSONresponse(res, 201, thisChecklist);
      }
    });
  }
};

function issueHasError(res, err, issue) {

  if (!issue) {
    utils.sendJSONresponse(res, 404, {
      "message": "issueid not found"
    });
    return true;
  } else if (err) {
    utils.sendJSONresponse(res, 400, err);
    return true;
  }

  return false;
}

function formatUpdateInfo(req, issue) {
  var updateInfo = {};

  updateInfo.updateBy = req.payload.name;
  updateInfo.updateDate = new Date();
  updateInfo.updateField = [];
  updateInfo.updateField.push({
    "field": "checkitem",
    "new": "",
    "old": issue.checklists.id(req.params.checklistid).checklistName
  });

  return updateInfo;
}
