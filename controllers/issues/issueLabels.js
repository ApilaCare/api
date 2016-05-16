var mongoose = require('mongoose');
var Iss = mongoose.model('Issue');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

/* POST a new label, providing a issueid */
/* /api/issues/:issueid/labels/new */
module.exports.issueLabelsCreate = function(req, res) {
    console.log("Commenting max kek, or some labels lol");
    getAuthor(req, res, function(req, res, userName) {
        if (req.params.issueid) {
            Iss
                .findById(req.params.issueid)
                .exec(
                    function(err, issue) {
                        if (err) {
                            sendJSONresponse(res, 400, err);
                        } else {

                            doAddLabel(req, res, issue, userName);
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

var doAddLabel = function(req, res, issue, username) {

    if (!issue) {
        sendJSONresponse(res, 404, "issueid not found");
    } else {
        issue.labels.push({
            author: req.payload.name, // I dont think we need to track which users created a label
            name: req.body.name,
            color: req.body.color
        });

        console.log(req.body.updateInfo);

        issue.updateInfo.push(req.body.updateInfo);

        issue.save(function(err, issue) {
            var thisLabel;
            if (err) {
                sendJSONresponse(res, 400, err);
            } else {
                thisLabel = issue.labels[issue.labels.length - 1];
                sendJSONresponse(res, 201, thisLabel);
            }
        });
    }
};


module.exports.issueLabelsUpdateOne = function(req, res) {
    if (!req.params.issueid || !req.params.labelid) {
        sendJSONresponse(res, 404, {
            "message": "Not found, issueid and labelid are both required"
        });
        return;
    }
    Iss
        .findById(req.params.issueid)
        .select('labels')
        .exec(
            function(err, issue) {
                var thisLabel;

                console.log(issue);

                if (!issue) {
                    sendJSONresponse(res, 404, {
                        "message": "issueid not found"
                    });
                    return;
                } else if (err) {
                    sendJSONresponse(res, 400, err);
                    return;
                }
                if (issue.labels && issue.labels.length > 0) {
                    thisLabel = issue.labels.id(req.params.labelid);
                    if (!thisLabel) {
                        sendJSONresponse(res, 404, {
                            "message": "labelid not found"
                        });
                    } else {
                        thisLabel.author = req.body.author; // probably dont need thisLabel
                        thisLabel.name = req.body.name;
                        thisLabel.color = req.body.color;
                        issue.save(function(err, issue) {
                            if (err) {
                                console.log(err);
                                sendJSONresponse(res, 404, err);
                            } else {
                                sendJSONresponse(res, 200, thisLabel);
                            }
                        });
                    }
                } else {
                    sendJSONresponse(res, 404, {
                        "message": "No label to update"
                    });
                }
            }
        );
};

module.exports.issueLabelsReadOne = function(req, res) {
    console.log("Getting single label");
    if (req.params && req.params.issueid && req.params.labelid) {
        Iss
            .findById(req.params.issueid)
            .select('title labels')
            .exec(
                function(err, issue) {
                    console.log(issue);
                    var response, label;
                    if (!issue) {
                        sendJSONresponse(res, 404, {
                            "message": "issueid not found"
                        });
                        return;
                    } else if (err) {
                        sendJSONresponse(res, 400, err);
                        return;
                    }
                    if (issue.labels && issue.labels.length > 0) {
                        label = issue.labels.id(req.params.labelid);
                        if (!label) {
                            sendJSONresponse(res, 404, {
                                "message": "label not found"
                            });
                        } else {
                            response = {
                                issue: {
                                    title: issue.title,
                                    id: req.params.issueid
                                },
                                label: label
                            };
                            sendJSONresponse(res, 200, response);
                        }
                    } else {
                        sendJSONresponse(res, 404, {
                            "message": "No labels found"
                        });
                    }
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "Not found, issueid and labelid are both required"
        });
    }
};

module.exports.issueLabelsList = function(req, res) {}

// app.delete('/api/issues/:issueid/labels/:labelid'
module.exports.issueLabelsDeleteOne = function(req, res) {

    console.log("deleting labels");

    if (!req.params.issueid || !req.params.labelid) {
        sendJSONresponse(res, 404, {
            "message": "Not found, issueid and labelid are both required"
        });
        return;
    }
    Iss
        .findById(req.params.issueid)
        .select('labels updateInfo')
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
                if (issue.labels && issue.labels.length > 0) {
                    if (!issue.labels.id(req.params.labelid)) {

                        sendJSONresponse(res, 404, {
                            "message": "labelid not found"
                        });
                    } else {
                        var label = issue.labels.id(req.params.labelid);

                        var updateInfo = {};

                        updateInfo.updateBy = req.payload.name;
                        updateInfo.updateDate = new Date();
                        updateInfo.updateField = [];
                        updateInfo.updateField.push({
                          "field": "labels",
                          "new": "",
                          "old": label.name
                        });

                        console.log(issue);
                        console.log(updateInfo);

                        issue.updateInfo.push(updateInfo);

                        issue.labels.id(req.params.labelid).remove();

                        issue.save(function(err) {
                            if (err) {
                               console.log(err);
                                sendJSONresponse(res, 404, err);
                            } else {
                                sendJSONresponse(res, 204, {});
                            }
                        });
                    }
                } else {
                    sendJSONresponse(res, 404, {
                        "message": "No label to delete"
                    });
                }
            }
        );
};
