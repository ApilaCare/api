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

  console.log("In Update checklist");

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

            console.log(thisChecklist);

            thisChecklist.author = req.body.author;
            thisChecklist.checkItems = req.body.checkItems;
            thisChecklist.checkItemsChecked = req.body.checkItemsChecked;
            thisChecklist.checklistName = req.body.checklistName;

            // other update items
            issue.save(function(err, savedIssue) {
              if (err) {
                console.log(err);
                utils.sendJSONresponse(res, 404, err);
              } else {

                const savedChecklist = savedIssue.checklists;

                utils.sendJSONresponse(res, 200, savedChecklist);
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

            let checklist = issue.checklists.id(req.params.checklistid);

            if(checklist) {

              checklist.remove();

              issue.save(function(err) {
                if (err) {
                  console.log(err);
                  utils.sendJSONresponse(res, 404, err);
                } else {
                  utils.sendJSONresponse(res, 204, null);
                }
              });

            } else {
              utils.sendJSONresponse(res, 404, {message: "Checklist not found"});
            }


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
