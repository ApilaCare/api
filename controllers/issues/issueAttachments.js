var mongoose = require('mongoose');
var utils = require('../../services/utils');

var Iss = mongoose.model('Issue');
var User = mongoose.model('User');

var fs = require('fs');
var imageUploadService = require('../../services/imageUpload');
const sanitize = require("sanitize-filename");

// POST /issues/:issueid/attachments/new - Create a new attachement
module.exports.issueAttachmentsCreate = function(req, res) {

  if (utils.checkParams(req, res, ['issueid'])) {
    return;
  }

  let issue = Iss.findById(req.params.issueid).exec();

  issue.then((issue) => {
    doAddAttachment(req, res, issue);
  }, (err) => {
    utils.sendJSONresponse(res, 400, err);
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

var doAddAttachment = function(req, res, issue) {

  var file = req.files.file;

  var stream = fs.createReadStream(file.path);

  var params = {
    Key: sanitize(file.originalFilename),
    Body: stream
  };

  imageUploadService.upload(params, file.path, function() {
    var fullUrl = "https://" + imageUploadService.getRegion() + ".amazonaws.com/" +
               imageUploadService.getBucket() + "/" + escape(sanitize(file.originalFilename));

    issue.attachments.push({
      uploader: req.payload._id,
      name: file.originalFilename,
      source: file.path,
      url: fullUrl,
      type: file.type,
    });

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
