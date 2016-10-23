var mongoose = require('mongoose');
var utils = require('../../services/utils');

var Iss = mongoose.model('Issue');
var User = mongoose.model('User');

var fs = require('fs');
var imageUploadService = require('../../services/imageUpload');

// POST /issues/:issueid/attachments/new - Create a new attachement
module.exports.issueAttachmentsCreate = function(req, res) {

  if (utils.checkParams(req, res, ['issueid'])) {
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

              doAddAttachment(req, res, issue, userName);
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

var doAddAttachment = function(req, res, issue, username) {

  var file = req.files.file;

  var stream = fs.createReadStream(file.path);

  var params = {
    Key: file.originalFilename,
    Body: stream
  };

  imageUploadService.upload(params, file.path, function() {
    var fullUrl = "https://" + imageUploadService.getRegion() + ".amazonaws.com/" +
               imageUploadService.getBucket() + "/" + escape(file.originalFilename);

    issue.attachments.push({
      uploader: req.payload.name,
      name: file.originalFilename,
      source: file.path,
      url: fullUrl,
      type: file.type,
    });

    issue.updateInfo.push(req.body.updateInfo);

    fs.unlinkSync(file.path);

    issue.save(function(err, issue) {
      var thisAttachment;
      if (err) {
        utils.sendJSONresponse(res, 400, err);
      } else {
        thisAttachment = issue.attachments[issue.attachments.length - 1];
        utils.sendJSONresponse(res, 201, thisAttachment);
      }
    });
  });

};


// DELETE /issues/:issueid/attachments/:attachmentid - Delte and attachment by issueid
module.exports.issueAttachmentsDeleteOne = function(req, res) {

  if (utils.checkParams(req, res, ['issueid', 'attachmentid'])) {
    return;
  }

  Iss
    .findById(req.params.issueid)
    .exec(
      function(err, issue) {

        if(issueHasError(res, err, issue)) {
          return;
        }

        if (issue.attachments && issue.attachments.length > 0) {
          if (!issue.attachments.id(req.params.attachmentid)) {
            utils.sendJSONresponse(res, 404, {
              "message": "attachmentid not found"
            });
          } else {

            var attch = issue.attachments.id(req.params.attachmentid);

            var updateInfo = formatUpdateIssue(req, attch);
            issue.updateInfo.push(updateInfo);

            issue.attachments.id(req.params.attachmentid).remove();

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
            "message": "No attachment to delete"
          });
        }
      }
    );
};

/////////////////////////// HELPER FUNCTIONS ////////////////////////////
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
        console.log(user);
        callback(req, res, user.name);
      });

  } else {
    utils.sendJSONresponse(res, 404, {
      "message": "User not found"
    });
    return;
  }
};

function formatUpdateIssue(req, attch) {

  var updateInfo = {};

  updateInfo.updateBy = req.payload.name;
  updateInfo.updateDate = new Date();
  updateInfo.updateField = [];
  updateInfo.updateField.push({
    "field": "attachments",
    "new": "",
    "old": attch.name
  });
}

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
