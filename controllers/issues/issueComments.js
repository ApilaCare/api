var mongoose = require('mongoose');
var utils = require('../../services/utils');
var Iss = mongoose.model('Issue');
var User = mongoose.model('User');

/* POST a new comment, providing a issueid */
/* /api/issues/:issueid/comments */
module.exports.issueCommentsCreate = function(req, res) {

  if (utils.checkParams(req, res, ['issueid'])) {
    return;
  }

  getAuthor(req, res, function(req, res, userName) {
    if (req.params.issueid) {
      Iss
        .findById(req.params.issueid)
        .select('comments')
        .exec(
          function(err, issue) {
            if (err) {
              utils.sendJSONresponse(res, 400, err);
            } else {

              doAddComment(req, res, issue, userName);
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

var getAuthor = function(req, res, callback) {
  console.log("Finding author with email " + req.payload.email);
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

var doAddComment = function(req, res, issue, username) {

  if (!issue) {
    utils.sendJSONresponse(res, 404, "issueid not found");
  } else {
    issue.comments.push({
      author: req.payload.name,
      commentText: req.body.commentText
    });
    issue.save(function(err, issue) {
      var thisComment;
      if (err) {
        utils.sendJSONresponse(res, 400, err);
      } else {
        thisComment = issue.comments[issue.comments.length - 1];
        utils.sendJSONresponse(res, 201, thisComment);
      }
    });
  }
};


module.exports.issueCommentsUpdateOne = function(req, res) {

  if (utils.checkParams(req, res, ['issueid', 'commentid'])) {
    return;
  }

  Iss
    .findById(req.params.issueid)
    .select('comments')
    .exec(
      function(err, issue) {
        var thisComment;
        if (!issue) {
          utils.sendJSONresponse(res, 404, {
            "message": "issueid not found"
          });
          return;
        } else if (err) {
          utils.sendJSONresponse(res, 400, err);
          return;
        }
        if (issue.comments && issue.comments.length > 0) {
          thisComment = issue.comments.id(req.params.commentid);
          if (!thisComment) {
            utils.sendJSONresponse(res, 404, {
              "message": "commentid not found"
            });
          } else {
            thisComment.author = req.body.author;
            thisComment.commentText = req.body.commentText;
            issue.save(function(err, issue) {
              if (err) {
                utils.sendJSONresponse(res, 404, err);
              } else {
                utils.sendJSONresponse(res, 200, thisComment);
              }
            });
          }
        } else {
          utils.sendJSONresponse(res, 404, {
            "message": "No comment to update"
          });
        }
      }
    );
};

module.exports.issueCommentsReadOne = function(req, res) {

  if (req.params && req.params.issueid && req.params.commentid) {
    Iss
      .findById(req.params.issueid)
      .select('title comments')
      .exec(
        function(err, issue) {
          console.log(issue);
          var response, comment;
          if (!issue) {
            utils.sendJSONresponse(res, 404, {
              "message": "issueid not found"
            });
            return;
          } else if (err) {
            utils.sendJSONresponse(res, 400, err);
            return;
          }
          if (issue.comments && issue.comments.length > 0) {
            comment = issue.comments.id(req.params.commentid);
            if (!comment) {
              utils.sendJSONresponse(res, 404, {
                "message": "comment not found"
              });
            } else {
              response = {
                issue: {
                  title: issue.title,
                  id: req.params.issueid
                },
                comment: comment
              };
              utils.sendJSONresponse(res, 200, response);
            }
          } else {
            utils.sendJSONresponse(res, 404, {
              "message": "No comments found"
            });
          }
        }
      );
  } else {
    utils.sendJSONresponse(res, 404, {
      "message": "Not found, issueid and commentid are both required"
    });
  }
};

// app.delete('/api/issues/:issueid/comments/:commentid'
module.exports.issueCommentsDeleteOne = function(req, res) {

  if (utils.checkParams(req, res, ['issueid', 'commentid'])) {
    return;
  }

  Iss
    .findById(req.params.issueid)
    .select('comments')
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
        if (issue.comments && issue.comments.length > 0) {
          if (!issue.comments.id(req.params.commentid)) {
            utils.sendJSONresponse(res, 404, {
              "message": "commentid not found"
            });
          } else {
            issue.comments.id(req.params.commentid).remove();
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
            "message": "No comment to delete"
          });
        }
      }
    );
};
