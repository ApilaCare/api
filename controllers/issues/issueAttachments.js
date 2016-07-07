var mongoose = require('mongoose');
var Iss = mongoose.model('Issue');
var User = mongoose.model('User');

var fs = require('fs');
var AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});

var region = "s3-us-west-2";
var bucket = "apilatest2";

var s3bucket = new AWS.S3({
    params: {
        Bucket: bucket
    }
});

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

/* POST a new attachment, providing a issueid */
/* /api/issues/:issueid/attachments/new */
module.exports.issueAttachmentsCreate = function(req, res) {
    getAuthor(req, res, function(req, res, userName) {
        if (req.params.issueid) {
            Iss
                .findById(req.params.issueid)
                .exec(
                    function(err, issue) {
                        if (err) {
                            sendJSONresponse(res, 400, err);
                        } else {

                            doAddAttachment(req, res, issue, userName);
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

//testing method for file upload
module.exports.issueAttachmentsUpload = function(req, res) {
    var file = req.files.file;
    console.log(file);
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

var doAddAttachment = function(req, res, issue, username) {

    var file = req.files.file;

    console.log(file.path);

    var stream = fs.createReadStream(file.path);

    var params = {
        Key: file.originalFilename,
        Body: stream
    };
    s3bucket.upload(params, function(err, data) {
        fs.unlinkSync(file.path);
        if (err) {
            console.log("Error uploading data: ", err);
        } else {
            console.log("Successfully uploaded data aws");

            if (!issue) {
                sendJSONresponse(res, 404, "issueid not found");
            } else {


                var fullUrl = "https://" + region + ".amazonaws.com/" + bucket + "/" +
                    escape(file.originalFilename);

                console.log(fullUrl);

                issue.attachments.push({
                    uploader: req.payload.name,
                    name: file.originalFilename,
                    source: file.path,
                    url: fullUrl,
                    type: file.type,
                });

                issue.updateInfo.push(req.body.updateInfo);

                issue.save(function(err, issue) {
                    var thisAttachment;
                    if (err) {
                        sendJSONresponse(res, 400, err);
                    } else {
                        thisAttachment = issue.attachments[issue.attachments.length - 1];
                        sendJSONresponse(res, 201, thisAttachment);
                    }
                });
            }
        }
    });
};


module.exports.issueAttachmentsUpdateOne = function(req, res) {
    if (!req.params.issueid || !req.params.attachmentid) {
        sendJSONresponse(res, 404, {
            "message": "Not found, issueid and attachmentid are both required"
        });
        return;
    }
    Iss
        .findById(req.params.issueid)
        .select('attachments')
        .exec(
            function(err, issue) {
                var thisAttachment;
                if (!issue) {
                    sendJSONresponse(res, 404, {
                        "message": "issueid not found"
                    });
                    return;
                } else if (err) {
                    sendJSONresponse(res, 400, err);
                    return;
                }
                if (issue.attachments && issue.attachments.length > 0) {
                    thisAttachment = issue.attachments.id(req.params.attachmentid);
                    if (!thisAttachment) {
                        sendJSONresponse(res, 404, {
                            "message": "attachmentid not found"
                        });
                    } else {
                        thisAttachment.uploader = req.body.uploader;
                        thisAttachment.name = req.body.name;
                        thisAttachment.source = req.body.source;
                        thisAttachment.url = req.body.url;
                        thisAttachment.type = req.body.type;
                        issue.save(function(err, issue) {
                            if (err) {
                                sendJSONresponse(res, 404, err);
                            } else {
                                sendJSONresponse(res, 200, thisAttachment);
                            }
                        });
                    }
                } else {
                    sendJSONresponse(res, 404, {
                        "message": "No attachment to update"
                    });
                }
            }
        );
};

module.exports.issueAttachmentsReadOne = function(req, res) {
    console.log("Getting single attachment");
    if (req.params && req.params.issueid && req.params.attachmentid) {
        Iss
            .findById(req.params.issueid)
            .select('title attachments')
            .exec(
                function(err, issue) {
                    console.log(issue);
                    var response, attachment;
                    if (!issue) {
                        sendJSONresponse(res, 404, {
                            "message": "issueid not found"
                        });
                        return;
                    } else if (err) {
                        sendJSONresponse(res, 400, err);
                        return;
                    }
                    if (issue.attachments && issue.attachments.length > 0) {
                        attachment = issue.attachments.id(req.params.attachmentid);
                        if (!attachment) {
                            sendJSONresponse(res, 404, {
                                "message": "attachment not found"
                            });
                        } else {
                            response = {
                                issue: {
                                    title: issue.title,
                                    id: req.params.issueid
                                },
                                attachment: attachment
                            };
                            sendJSONresponse(res, 200, response);
                        }
                    } else {
                        sendJSONresponse(res, 404, {
                            "message": "No comments found"
                        });
                    }
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "Not found, issueid and attachmentid are both required"
        });
    }
};

// app.delete('/api/issues/:issueid/attachments/:attachmentid'
module.exports.issueAttachmentsDeleteOne = function(req, res) {
    if (!req.params.issueid || !req.params.attachmentid) {
        sendJSONresponse(res, 404, {
            "message": "Not found, issueid and attachmentid are both required"
        });
        return;
    }
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
                if (issue.attachments && issue.attachments.length > 0) {
                    if (!issue.attachments.id(req.params.attachmentid)) {
                        sendJSONresponse(res, 404, {
                            "message": "attachmentid not found"
                        });
                    } else {

                        var updateInfo = {};

                        var attch = issue.attachments.id(req.params.attachmentid);

                        updateInfo.updateBy = req.payload.name;
                        updateInfo.updateDate = new Date();
                        updateInfo.updateField = [];
                        updateInfo.updateField.push({
                            "field": "attachments",
                            "new": "",
                            "old": attch.name
                        });

                        issue.updateInfo.push(updateInfo);

                        issue.attachments.id(req.params.attachmentid).remove();

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
                        "message": "No attachment to delete"
                    });
                }
            }
        );
};
