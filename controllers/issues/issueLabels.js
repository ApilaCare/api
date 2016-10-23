var mongoose = require('mongoose');
var utils = require('../../services/utils');

var Iss = mongoose.model('Issue');
var User = mongoose.model('User');

// POST /issues/:issueid/labels/new - Creates a new label
module.exports.issueLabelsCreate = function(req, res) {

    if(utils.checkParams(req, res, ['issueid'])) {
      return;
    }

    getAuthor(req, res, function(req, res, userName) {
        if (req.params.issueid) {
            Iss
                .findById(req.params.issueid)
                .exec(
                    function(err, issue) {
                        if (err) {
                            utils.sendJSONresponse(res, 400, err);
                        } else {
                            doAddLabel(req, res, issue, userName);
                        }
                    }
                );
        } else {
            utils.sendJSONresponse(res, 404, {
                "message": "Not found, issueid required"
            });
        }
    });
};

// PUT /issues/:issueid/labels/:labelid - Updates the label
module.exports.issueLabelsUpdateOne = function(req, res) {

    if(utils.checkParams(req, res, ['issueid', 'labelid'])) {
      return;
    }

    Iss
        .findById(req.params.issueid)
        .select('labels')
        .exec(
            function(err, issue) {
                var thisLabel;

                if (!issue) {
                    utils.sendJSONresponse(res, 404, {
                        "message": "issueid not found"
                    });
                    return;
                } else if (err) {
                    utils.sendJSONresponse(res, 400, err);
                    return;
                }
                if (issue.labels && issue.labels.length > 0) {
                    thisLabel = issue.labels.id(req.params.labelid);
                    if (!thisLabel) {
                        utils.sendJSONresponse(res, 404, {
                            "message": "labelid not found"
                        });
                    } else {
                        thisLabel.author = req.body.author;
                        thisLabel.name = req.body.name;
                        thisLabel.color = req.body.color;
                        issue.save(function(err, issue) {
                            if (err) {
                                console.log(err);
                                utils.sendJSONresponse(res, 404, err);
                            } else {
                                utils.sendJSONresponse(res, 200, thisLabel);
                            }
                        });
                    }
                } else {
                    utils.sendJSONresponse(res, 404, {
                        "message": "No label to update"
                    });
                }
            }
        );
};

// DELETE /issues/:issueid/labels/:labelid - Removes a label by id
module.exports.issueLabelsDeleteOne = function(req, res) {

  if(utils.checkParams(req, res, ['issueid', 'labelid'])) {
    return;
  }

  Iss
    .findById(req.params.issueid)
    .select('labels updateInfo')
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
            if (issue.labels && issue.labels.length > 0) {
                if (!issue.labels.id(req.params.labelid)) {

                    utils.sendJSONresponse(res, 404, {
                        "message": "labelid not found"
                    });
                } else {
                    var label = issue.labels.id(req.params.labelid);

                    var updateInfo = formatUpdateInfo(req, label);
                    issue.updateInfo.push(updateInfo);

                    issue.labels.id(req.params.labelid).remove();

                    issue.save(function(err) {
                        if (err) {
                           console.log(err);
                            utils.sendJSONresponse(res, 404, err);
                        } else {
                            utils.sendJSONresponse(res, 204, {});
                        }
                    });
                }
            } else {
                utils.sendJSONresponse(res, 404, {
                    "message": "No label to delete"
                });
            }
        }
      );
};

//////////////////////////// HELPER FUNCTIONS /////////////////////////////
var getAuthor = function(req, res, callback) {

    if (req.payload.email) {
        User
            .findOne({
                email: req.payload.email
            })
            .exec(function(err, user) {
                if (!user) {
                    utils.sendJSONresponse(res, 404, {
                        "message": "User not found"
                    });
                    return;
                } else if (err) {
                    console.log(err);
                    utils.sendJSONresponse(res, 404, err);
                    return;
                }

                callback(req, res, user.name);
            });

    } else {
        utils.sendJSONresponse(res, 404, {
            "message": "User not found"
        });
        return;
    }
};

function formatUpdateInfo(req, label) {
  var updateInfo = {};

  updateInfo.updateBy = req.payload._id;
  updateInfo.updateDate = new Date();
  updateInfo.updateField = [];
  updateInfo.updateField.push({
    "field": "labels",
    "new": "",
    "old": label.name
  });

  return updateInfo;

}

var doAddLabel = function(req, res, issue, username) {

    if (!issue) {
        utils.sendJSONresponse(res, 404, "issueid not found");
    } else {
        issue.labels.push({
            author: req.payload.name, // I dont think we need to track which users created a label
            name: req.body.name,
            color: req.body.color
        });

        issue.updateInfo.push(req.body.updateInfo);

        issue.save(function(err, issue) {
            var thisLabel;
            if (err) {
                utils.sendJSONresponse(res, 400, err);
                console.log(err);
            } else {
                thisLabel = issue.labels[issue.labels.length - 1];
                utils.sendJSONresponse(res, 201, thisLabel);
            }
        });
    }
};
