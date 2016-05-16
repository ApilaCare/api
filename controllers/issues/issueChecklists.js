var mongoose = require('mongoose');
var Iss = mongoose.model('Issue');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

/* POST a new checklist, providing a issueid */
/* /api/issues/:issueid/checklists/new */
module.exports.issueChecklistsCreate = function(req, res) {
    console.log("Commenting max kek, or checklists lol");
    getAuthor(req, res, function(req, res, userName) {
        if (req.params.issueid) {
            Iss
                .findById(req.params.issueid)
                .select('checklists updateInfo')
                .exec(
                    function(err, issue) {
                        if (err) {
                            sendJSONresponse(res, 400, err);
                        } else {

                            doAddChecklist(req, res, issue, userName);
                        }
                    }
                );
        } else {
            sendJSONresponse(res, 404, {
                "message": "Not found, issueid required"
            });
        }
    });
};


module.exports.issueChecklistAddItem = function(req, res) {
  console.log("Adding item to checklist");

  Iss
      .findById(req.params.issueid)
      .select('title checklists')
      .exec(
          function(err, issue) {
            doAddChecklistItem(req, res, issue);
          });

}

var getAuthor = function(req, res, callback) {
    console.log("Finding author with email " + req.payload.email);
    if (req.payload.email) {
        User
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
                callback(req, res, user.name);
            });

    } else {
        sendJSONresponse(res, 404, {
            "message": "User not found"
        });
        return;
    }
};

var doAddChecklistItem = function(req, res, issue) {

  //find the checklist by it's id and push new item
}

var doAddChecklist = function(req, res, issue, username) {

  console.log("Adding checklist, max kek");

    if (!issue) {
        sendJSONresponse(res, 404, "issueid not found");
    } else {
        issue.checklists.push({
            author: req.payload.name,
            checklistName: req.body.checklistName,
            // needs the checkItems as the mixed mongoose schema
        });

        issue.updateInfo.push(req.body.updateInfo);

        issue.save(function(err, issue) {
            var thisChecklist;
            if (err) {
                sendJSONresponse(res, 400, err);
            } else {
                thisChecklist = issue.checklists[issue.checklists.length - 1];
                sendJSONresponse(res, 201, thisChecklist);
            }
        });
    }
};


module.exports.issueChecklistsUpdateOne = function(req, res) {

//  console.log(req.body);

    if (!req.params.issueid || !req.params.checklistid) {
        sendJSONresponse(res, 404, {
            "message": "Not found, issueid and checklistid are both required"
        });
        return;
    }
    Iss
        .findById(req.params.issueid)
        .select('checklists')
        .exec(
            function(err, issue) {


                var thisChecklist;
                if (!issue) {
                    sendJSONresponse(res, 404, {
                        "message": "issueid not found"
                    });
                    return;
                } else if (err) {
                    sendJSONresponse(res, 400, err);
                    return;
                }
                if (issue.checklists && issue.checklists.length > 0) {
                    thisChecklist = issue.checklists.id(req.params.checklistid);

                    if (!thisChecklist) {
                        sendJSONresponse(res, 404, {
                            "message": "checklistid not found"
                        });
                    } else {

                        thisChecklist.author = req.body.author;
                        thisChecklist.checkItems = req.body.checkItems;
                        thisChecklist.checkItemsChecked = req.body.checkItemsChecked;

                        console.log(req.body);

                        // other update items
                        issue.save(function(err, issue) {
                            if (err) {
                              console.log(err);
                                sendJSONresponse(res, 404, err);
                            } else {
                                sendJSONresponse(res, 200, thisChecklist);
                            }
                        });
                    }
                } else {
                    sendJSONresponse(res, 404, {
                        "message": "No checklist to update"
                    });
                }
            }
        );
};

module.exports.issueChecklistsReadOne = function(req, res) {
    console.log("Getting single checklist");
    if (req.params && req.params.issueid && req.params.checklistid) {
        Iss
            .findById(req.params.issueid)
            .select('title checklists')
            .exec(
                function(err, issue) {
                    console.log(issue);
                    var response, checklist;
                    if (!issue) {
                        sendJSONresponse(res, 404, {
                            "message": "issueid not found"
                        });
                        return;
                    } else if (err) {
                        sendJSONresponse(res, 400, err);
                        return;
                    }
                    if (issue.checklists && issue.checklists.length > 0) {
                        checklist = issue.checklists.id(req.params.checklistid);
                        if (!checklist) {
                            sendJSONresponse(res, 404, {
                                "message": "checklist not found"
                            });
                        } else {
                            response = {
                                issue: {
                                    title: issue.title,
                                    id: req.params.issueid
                                },
                                checklist : checklist
                            };
                            sendJSONresponse(res, 200, response);
                        }
                    } else {
                        sendJSONresponse(res, 404, {
                            "message": "No checklists found"
                        });
                    }
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "Not found, issueid and checklistid are both required"
        });
    }
};

// app.delete('/api/issues/:issueid/checklists/:checklistid'
module.exports.issueChecklistsDeleteOne = function(req, res) {
    if (!req.params.issueid || !req.params.checklistid) {
        sendJSONresponse(res, 404, {
            "message": "Not found, issueid and checklistid are both required"
        });
        return;
    }
    Iss
        .findById(req.params.issueid)
        .select('checklists updateInfo')
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
                if (issue.checklists && issue.checklists.length > 0) {
                    if (!issue.checklists.id(req.params.checklistid)) {
                        sendJSONresponse(res, 404, {
                            "message": "checklistid not found"
                        });
                    } else {

                      var updateInfo = {};

                      updateInfo.updateBy = req.payload.name;
                      updateInfo.updateDate = new Date();
                      updateInfo.updateField = [];
                      updateInfo.updateField.push({
                        "field": "checkitem",
                        "new": "",
                        "old": issue.checklists.id(req.params.checklistid).checklistName
                      });

                      issue.updateInfo.push(updateInfo);


                        issue.checklists.id(req.params.checklistid).remove();
                        issue.save(function(err) {
                            if (err) {
                                sendJSONresponse(res, 404, err);
                            } else {
                                sendJSONresponse(res, 204, null);
                            }
                        });
                    }
                } else {
                    sendJSONresponse(res, 404, {
                        "message": "No checklist to delete"
                    });
                }
            }
        );
};
