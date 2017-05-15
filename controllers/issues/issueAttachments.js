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

  console.log(req.body);

  let issue = Iss.findById(req.params.issueid).exec();

  issue.then((issue) => {
    doAddAttachment(req, res, issue, req.body.communityName, req.body.test);
  }, (err) => {
    utils.sendJSONresponse(res, 400, err);
  });

};

// PUT /issues/:issueid/attachments/restore - Restores an attachment for an issue
module.exports.restoreAttachment = async (req, res) => {
  try {

    const issue = await Iss.findById(req.params.issueid).exec();

    issue.attachments.push(req.body);

    await issue.save();

    utils.sendJSONresponse(res, 200, req.body);

  } catch(err) {
    utils.sendJSONresponse(res, 400, err);
  }
};

// DELETE /issues/:issueid/attachments/:attachmentid - Delete and attachment by issueid
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

const doAddAttachment = async (req, res, issue, communityName, testCommunity) => {

  const file = req.files.file;

  const stream = fs.createReadStream(file.path);

  const folderName = (testCommunity == true) ? communityName + '-test' : communityName;

  const fileKey = `${folderName}/issues/${issue.title}/${sanitize(file.originalFilename)}`;

  const params = {
    Key: fileKey,
    Body: stream
  };

  try {

    await imageUploadService.uploadFile(params, file.path);

    const fullUrl = `https://${imageUploadService.getRegion()}.amazonaws.com/${imageUploadService.getBucket()}/${fileKey}`;

    issue.attachments.push({
      uploader: req.payload._id,
      name: file.originalFilename,
      source: file.path,
      url: fullUrl,
      type: file.type,
    });

    fs.unlinkSync(file.path);

    await issue.save();

    utils.sendJSONresponse(res, 201, issue.attachments[issue.attachments.length - 1]);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
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
