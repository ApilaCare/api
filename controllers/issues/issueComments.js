const mongoose = require('mongoose');
const utils = require('../../services/utils');
const Iss = mongoose.model('Issue');
const User = mongoose.model('User');

// POST /issues/:issueid/comments/new - Create a new community
module.exports.issueCommentsCreate = (req, res) => {

  if (utils.checkParams(req, res, ['issueid'])) {
    return;
  }

  if (req.params.issueid) {
    Iss
      .findById(req.params.issueid)
      .populate('comments.author', 'email name userImage')
      .exec(
        function(err, issue) {
          if (err) {
            console.log(err);
            utils.sendJSONresponse(res, 400, err);
          } else {
            doAddComment(req, res, issue);
          }
        }
      );
  } else {
    utils.sendJSONresponse(res, 404, {
      "message": "Not found, issueid required"
    });
  }
};

module.exports.issueCommentsUpdate = (req, res)  => {

  let commentId = req.body._id;

  if (utils.checkParams(req, res, ['issueid'])) {
    return;
  }

  let issue = Iss.findById(req.params.issueid).exec();

  issue.then((issue) => {

    let index = issue.comments.indexOf(issue.comments.id(commentId));

    let comment = req.body;

    if(index !== -1) {
      issue.comments.set(index, comment);

      issue.save((err, iss) => {
        if(err) {
          utils.sendJSONresponse(res, 400, err);
        } else {
          utils.sendJSONresponse(res, 200, comment);
        }
      });

    } else {
      utils.sendJSONresponse(res, 400, err);
    }

  }, (err) => {
    utils.sendJSONresponse(res, 404, err);
  });


};

// GET /issues/:issueid/comments - Lists all the comments for an issue
module.exports.issueCommentsList = (req, res) => {

  if (utils.checkParams(req, res, ['issueid'])) {
    return;
  }

  Iss
    .findById(req.params.issueid)
    .populate('comments.author', 'email name userImage')
    .exec(
      function(err, issue) {
        if(err) {
          utils.sendJSONresponse(res, 404, {'message' : err});
        } else {
          console.log(issue.comments);
          utils.sendJSONresponse(res, 200, issue.comments);
        }
      });

};


//////////////////////// HELPER FUNCTIONS ///////////////////////////////

var doAddComment = (req, res, issue) => {

  if (!issue) {
    utils.sendJSONresponse(res, 404, "issueid not found");
  } else {
    issue.comments.push({
      author: req.body.author,
      commentText: req.body.commentText
    });
    issue.save(function(err, issue) {
      var thisComment;
      if (err) {
        console.log(err);
        utils.sendJSONresponse(res, 400, err);
      } else {
        thisComment = issue.comments[issue.comments.length - 1];
        utils.sendJSONresponse(res, 201, thisComment);
      }
    });
  }
};
